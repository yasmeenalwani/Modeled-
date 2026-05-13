import { Stack } from 'aws-cdk-lib';
import { CfnBucket, Bucket, IntelligentTieringConfiguration, Filter } from 'aws-cdk-lib/aws-s3';
import type { Backend } from '@aws-amplify/backend';

/**
 * S3 Intelligent Tiering Configuration
 * 
 * Automatically moves objects between access tiers based on access patterns
 * to optimize storage costs without performance impact.
 * 
 * Tiers:
 * - Frequent Access (default)
 * - Infrequent Access (after 30 days of no access)
 * - Archive Instant Access (after 90 days of no access)
 * - Archive Access (after 90 days, for objects > 128KB)
 * - Deep Archive Access (after 180 days, for objects > 128KB)
 */
export function configureIntelligentTiering(
  stack: Stack,
  storageBucket: Bucket,
  backend: Backend
) {
  // Enable Intelligent Tiering for the entire bucket
  // This will automatically optimize storage costs based on access patterns
  
  new IntelligentTieringConfiguration(stack, 'StorageIntelligentTiering', {
    bucket: storageBucket,
    name: 'EntireBucket',
    // Optional: Filter specific prefixes if needed
    // For now, apply to entire bucket
  });

  // Optional: Configure additional intelligent tiering for specific prefixes
  // This allows different optimization strategies for different content types
  
  // Profile photos - frequently accessed, keep in frequent access
  new IntelligentTieringConfiguration(stack, 'ProfilePhotosIntelligentTiering', {
    bucket: storageBucket,
    name: 'ProfilePhotos',
    prefix: 'profile-photos/',
  });

  // Session photos - accessed less frequently after initial upload
  new IntelligentTieringConfiguration(stack, 'SessionPhotosIntelligentTiering', {
    bucket: storageBucket,
    name: 'SessionPhotos',
    prefix: 'session-photos/',
  });

  // Portfolios - accessed occasionally
  new IntelligentTieringConfiguration(stack, 'PortfoliosIntelligentTiering', {
    bucket: storageBucket,
    name: 'Portfolios',
    prefix: 'portfolios/',
  });

  // Documents - rarely accessed after upload
  new IntelligentTieringConfiguration(stack, 'DocumentsIntelligentTiering', {
    bucket: storageBucket,
    name: 'Documents',
    prefix: 'documents/',
  });

  // Videos - large files, benefit most from intelligent tiering
  new IntelligentTieringConfiguration(stack, 'VideosIntelligentTiering', {
    bucket: storageBucket,
    name: 'Videos',
    prefix: 'videos/',
  });

  // Marketing assets - rarely accessed
  new IntelligentTieringConfiguration(stack, 'MarketingIntelligentTiering', {
    bucket: storageBucket,
    name: 'Marketing',
    prefix: 'marketing/',
  });
}

