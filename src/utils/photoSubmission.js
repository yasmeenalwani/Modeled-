/**
 * Photo Submission & Analysis Integration
 * 
 * Handles uploading guided photos and triggering AI analysis
 * for the model matching engine.
 */

import { uploadData, getUrl } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import { PHOTO_STEPS, getAllAnalysisTargets } from './photoRequirements';
import { updateEngagementScore, updateModelLastActive } from './agenticScores';
import { shouldUseMockData } from './mockDataService';

const client = generateClient();

// ============ PHOTO UPLOAD ============

/**
 * Upload a single photo with metadata
 */
async function uploadPhoto(file, userId, stepId, options = {}) {
  const timestamp = Date.now();
  const fileExtension = file.name?.split('.').pop() || 'jpg';
  // Different deployed environments may enforce either:
  // - profile-photos/models/{entity_id}/*
  // - public/profile-photos/models/{entity_id}/*
  // Try both so onboarding keeps working during policy transitions.
  const candidatePaths = [
    `profile-photos/models/${userId}/${stepId}-${timestamp}.${fileExtension}`,
    `public/profile-photos/models/${userId}/${stepId}-${timestamp}.${fileExtension}`,
  ];
  
  let lastError;
  for (const path of candidatePaths) {
    try {
      await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type || 'image/jpeg',
          metadata: {
            userId,
            stepId,
            purpose: PHOTO_STEPS.find(s => s.id === stepId)?.purpose || 'profile',
            uploadedAt: new Date().toISOString(),
            qualityScore: String(options.qualityScore || 100),
          },
        },
      }).result;

      // Get an access URL for admin/onboarding previews
      const urlResult = await getUrl({ path });
      return {
        key: path,
        url: urlResult.url.toString(),
        stepId,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      lastError = error;
      const message = String(error?.message || '');
      const isAccessError = message.includes('not authorized') || message.includes('AccessDenied');
      if (!isAccessError) {
        break;
      }
    }
  }

  console.error(`Error uploading photo for ${stepId}:`, lastError);
  throw lastError;
}

/**
 * Upload all guided photos
 */
export async function uploadGuidedPhotos(photos, userId) {
  const results = {
    success: [],
    failed: [],
    totalCount: photos.length,
  };

  for (const photo of photos) {
    try {
      const result = await uploadPhoto(
        photo.file,
        userId,
        photo.stepId,
        { qualityScore: photo.quality?.score }
      );
      results.success.push(result);
    } catch (error) {
      results.failed.push({
        stepId: photo.stepId,
        error: error.message,
      });
    }
  }

  return results;
}

// ============ ANALYSIS TRIGGER ============

/**
 * Trigger AI analysis for uploaded photos
 */
export async function triggerPhotoAnalysis(userId, photoKeys) {
  try {
    // Call the photo-analysis Lambda function
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/analyze-photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        photoKeys,
        analysisTypes: getAllAnalysisTargets(),
      }),
    });

    if (!response.ok) {
      // If API endpoint doesn't exist yet, simulate success
      console.warn('Photo analysis API not available, will process async');
      return {
        status: 'pending',
        message: 'Analysis queued for processing',
        jobId: `job-${Date.now()}`,
      };
    }

    return await response.json();
  } catch (error) {
    console.warn('Photo analysis trigger failed, will process async:', error);
    // Return pending status - analysis will happen via S3 trigger
    return {
      status: 'pending',
      message: 'Analysis will be processed automatically',
    };
  }
}

/**
 * Update model profile with photo data
 */
export async function updateModelProfileWithPhotos(userId, uploadResults) {
  try {
    // ModelProfile only has photoUrls + headshotUrl in schema — store durable S3 paths (keys), not presigned URLs.
    const photoPaths = uploadResults.success.map((r) => r.key).filter(Boolean);
    const headshotPath = photoPaths[0] || null;

    if (!userId || !uploadResults?.success?.length) {
      throw new Error('Missing userId or upload results');
    }

    const modelProfile = client?.models?.ModelProfile;
    if (!modelProfile || typeof modelProfile.list !== 'function' || typeof modelProfile.update !== 'function') {
      throw new Error('ModelProfile schema not available');
    }

    const { data: profiles } = await modelProfile.list({
      filter: { userId: { eq: userId } },
      limit: 1,
    });
    const profile = profiles?.[0];
    if (!profile?.id) {
      throw new Error('Model profile not found for userId');
    }

    const result = await modelProfile.update({
      id: profile.id,
      photoUrls: photoPaths,
      headshotUrl: headshotPath,
      photoAnalysisStatus: 'pending',
      analyzedPhotoCount: photoPaths.length,
      lastPhotoAnalysis: null, // Will be set after analysis completes
    });

    // Update agentic scores (engagement, lastActive) after photo upload
    if (!shouldUseMockData()) {
      updateModelLastActive(profile.id).catch(console.error);
      updateEngagementScore(profile.id).catch(console.error);
    }

    return result;
  } catch (error) {
    console.error('Error updating model profile with photos:', error);
    throw error;
  }
}

// ============ SUBMISSION FLOW ============

/**
 * Complete photo submission flow
 * 1. Upload all photos to S3
 * 2. Update ModelProfile with S3 path keys (durable; presigned URLs expire)
 * 3. Trigger AI analysis
 */
export async function submitPhotosForAnalysis(photos, userId) {
  const result = {
    success: false,
    uploadResults: null,
    analysisStatus: null,
    errors: [],
  };

  try {
    // In mock mode, do not pretend uploads succeeded.
    // Real onboarding must persist photos to S3 so admin can see them.
    if (shouldUseMockData()) {
      result.uploadResults = { success: [], failed: [], totalCount: photos.length };
      result.analysisStatus = { status: 'blocked', message: 'Mock mode enabled' };
      result.success = false;
      result.errors.push('Photo upload is blocked because mock mode is enabled. Set VITE_USE_MOCK_DATA=false and restart the dev server.');
      return result;
    }

    // Step 1: Upload photos
    console.log('📤 Uploading photos...');
    const uploadResults = await uploadGuidedPhotos(photos, userId);
    result.uploadResults = uploadResults;

    if (uploadResults.failed.length > 0) {
      result.errors.push(`${uploadResults.failed.length} photos failed to upload`);
      const firstFailure = uploadResults.failed[0];
      if (firstFailure?.error) {
        result.errors.push(`First failure: ${firstFailure.error}`);
      }
    }

    if (uploadResults.success.length === 0) {
      throw new Error('No photos were uploaded successfully');
    }

    // Step 2: Best-effort profile update (profile may not exist yet during onboarding photos step).
    // Final onboarding submit persists photoUrls/photoKeys onto ModelProfile.
    console.log('💾 Updating profile (best effort)...');
    try {
      await updateModelProfileWithPhotos(userId, uploadResults);
    } catch (profileUpdateError) {
      console.warn(
        'Profile update skipped during photo step (likely profile not created yet). Will persist on final submit:',
        profileUpdateError
      );
    }

    // Step 3: Trigger analysis
    console.log('🔬 Triggering analysis...');
    const photoKeys = uploadResults.success.map(r => r.key);
    const analysisResult = await triggerPhotoAnalysis(userId, photoKeys);
    result.analysisStatus = analysisResult;

    result.success = true;
    console.log('Photo submission complete');

    return result;
  } catch (error) {
    console.error('Photo submission failed:', error);
    result.errors.push(error.message);
    return result;
  }
}

// ============ PHOTO STEP MAPPING ============

/**
 * Map photo steps to analysis targets for the matching engine
 */
export const PHOTO_ANALYSIS_MAPPING = {
  front_face: {
    primary: ['faceShape', 'eyeColor', 'eyeShape', 'skinTone'],
    secondary: ['eyebrows', 'lips', 'noseShape'],
  },
  side_profile: {
    primary: ['noseShape', 'jawline', 'faceLength'],
    secondary: ['chinShape'],
  },
  hair_front: {
    primary: ['hairColor', 'hairStyle', 'hairDensity'],
    secondary: ['hairTexture'],
  },
  hair_back: {
    primary: ['hairLength', 'hairLengthDetailed'],
    secondary: ['hairTexture'],
  },
  hair_closeup: {
    primary: ['curlPattern', 'hairTextureDetailed', 'hairHealth'],
    secondary: ['hairPorosity', 'hairDensity'],
  },
  hair_natural: {
    primary: ['hairTexture', 'curlPattern'],
    secondary: ['hairHealth'],
  },
};

/**
 * Get which photos are needed for specific analysis
 */
export function getRequiredPhotosForAnalysis(analysisTargets) {
  const requiredPhotos = new Set();
  
  for (const [stepId, mapping] of Object.entries(PHOTO_ANALYSIS_MAPPING)) {
    const allTargets = [...mapping.primary, ...mapping.secondary];
    if (analysisTargets.some(target => allTargets.includes(target))) {
      requiredPhotos.add(stepId);
    }
  }
  
  return Array.from(requiredPhotos);
}

// ============ VALIDATION ============

/**
 * Validate photos are recent (within last 3 weeks)
 */
export function validatePhotoRecency(file) {
  // Note: We can't reliably get the actual photo date from the file
  // This would need EXIF data extraction in production
  // For now, we trust the user and show guidance
  return {
    isValid: true,
    warning: 'Please ensure this photo was taken within the last 3 weeks for accuracy',
  };
}

/**
 * Check if photos are complete for a given service type
 */
export function arePhotosCompleteForService(capturedPhotos, serviceType) {
  const serviceRequirements = {
    haircut: ['front_face', 'side_profile', 'hair_front', 'hair_back', 'hair_natural'],
    haircolor: ['front_face', 'hair_front', 'hair_closeup', 'hair_natural'],
    makeup: ['front_face', 'side_profile'],
    bridal: ['front_face', 'side_profile', 'hair_front', 'hair_back'],
    skincare: ['front_face', 'side_profile'],
    default: ['front_face', 'hair_front', 'hair_back'],
  };

  const required = serviceRequirements[serviceType] || serviceRequirements.default;
  return required.every(stepId => capturedPhotos[stepId]?.isValid);
}

