import { uploadData, getUrl } from 'aws-amplify/storage';

/**
 * Upload ID or selfie for identity verification. Returns stable S3 key + preview URL.
 */
export async function uploadIdentityVerificationFile(file, { userType, userId, kind }) {
  const timestamp = Date.now();
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const candidatePaths = [
    `identity-verification/${userType}s/${userId}/${kind}-${timestamp}.${ext}`,
    `public/identity-verification/${userType}s/${userId}/${kind}-${timestamp}.${ext}`,
  ];

  let lastError;
  for (const path of candidatePaths) {
    try {
      await uploadData({
        path,
        data: file,
        options: { contentType: file.type || 'image/jpeg' },
      }).result;
      const urlResult = await getUrl({ path });
      return { key: path, url: urlResult.url.toString() };
    } catch (error) {
      lastError = error;
      const message = String(error?.message || '');
      const isAccessError = message.includes('not authorized') || message.includes('AccessDenied');
      if (!isAccessError) break;
    }
  }
  throw lastError || new Error('Upload failed');
}
