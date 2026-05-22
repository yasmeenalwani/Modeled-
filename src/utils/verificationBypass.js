import { shouldUseMockData } from './mockDataService';

/**
 * Skip Cognito email/SMS codes in onboarding (demo mode only).
 * Set VITE_BYPASS_ONBOARDING_VERIFICATION=true in .env.local to skip on localhost.
 * Omit or false to exercise real SES/SNS verification codes.
 */
export function allowOnboardingVerificationBypass() {
  const override = import.meta?.env?.VITE_BYPASS_ONBOARDING_VERIFICATION;
  if (typeof override === 'string') {
    return override.toLowerCase() === 'true';
  }
  return shouldUseMockData();
}
