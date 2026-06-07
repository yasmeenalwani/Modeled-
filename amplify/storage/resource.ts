import { defineStorage } from '@aws-amplify/backend';
import { photoAnalysisFunction } from '../functions/photo-analysis/resource';
import { identityVerificationFunction } from '../functions/identity-verification/resource';

/**
 * MODELED MANAGEMENT - S3 Storage Configuration
 * 
 * Bucket Structure:
 * ├── profile-photos/
 * │   ├── models/{userId}/
 * │   ├── professionals/{userId}/
 * │   └── partners/{userId}/
 * ├── session-photos/
 * │   ├── before/{bookingId}/
 * │   └── after/{bookingId}/
 * ├── portfolios/
 * │   └── {professionalId}/
 * ├── documents/
 * │   ├── licenses/
 * │   └── insurance/
 * └── marketing/
 *     └── admin-only/
 */

export const storage = defineStorage({
  name: 'modeledStorage',
  
  access: (allow) => ({
    // ============ PROFILE PHOTOS ============
    // Models can upload their own photos. Path: profile-photos/models/{userId}/{filename}
    'profile-photos/models/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']), // Others can view approved photos
      allow.resource(photoAnalysisFunction).to(['read', 'delete']), // S3 trigger: analyze + delete on moderation reject
    ],
    
    // Professionals can upload their own photos
    'profile-photos/professionals/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    
    // Partners can upload their own photos
    'profile-photos/partners/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    
    // ============ SESSION PHOTOS ============
    // Before photos - uploaded by models before sessions
    'session-photos/before/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
    ],
    
    // After photos - uploaded by professionals after sessions
    'session-photos/after/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
    ],
    
    // ============ PORTFOLIOS ============
    // Professional portfolio images
    'portfolios/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    
    // ============ DOCUMENTS ============
    // License documents (professionals)
    'documents/licenses/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
    ],
    
    // Insurance documents (partners)
    'documents/insurance/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
    ],
    
    // ============ MARKETING (ADMIN ONLY) ============
    // Marketing assets - only admin can manage
    'marketing/*': [
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    
    // ============ VIDEOS ============
    // Profile videos - models, professionals, partners
    'videos/profile/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    
    // Portfolio videos - professionals only
    'videos/portfolio/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    
    // Inspiration board videos - all user types
    'videos/inspiration/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    
    // Training videos - admin uploads only
    'videos/training/*': [
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    
    // ============ INSPIRATION BOARD ============
    // Inspiration photos - all user types
    'inspiration/photos/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],

    // ============ IDENTITY VERIFICATION ============
    // ID documents and selfies - upload by users, read by verification Lambda
    'identity-verification/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.resource(identityVerificationFunction).to(['read']),
    ],
    'public/identity-verification/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.resource(identityVerificationFunction).to(['read']),
    ],
  }),
  
  // ============ S3 TRIGGERS ============
  // Trigger photo analysis on any upload (handler filters by path: profile-photos, session-photos, portfolios)
  triggers: {
    onUpload: photoAnalysisFunction,
  },
});

