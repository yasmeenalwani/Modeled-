import { defineAuth } from '@aws-amplify/backend';

/**
 * Modeled Management Auth Configuration
 * 3 User Types: Model, Professional, Partner
 * Email/SMS verification: Cognito sends codes via SES (email) and SNS (SMS).
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 * @see docs/SES_SMS_VERIFICATION_SETUP.md for SES and SMS setup steps.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // SES for verification emails. Set AMPLIFY_SES_FROM_EMAIL to your SES-verified address, or replace below. See docs/SES_SMS_VERIFICATION_SETUP.md
  senders: {
    email: {
      fromEmail: process.env.AMPLIFY_SES_FROM_EMAIL || 'noreply@modeledmgmt.com',
      fromName: 'Modeled',
    },
  },
  // Define user groups for role-based access
  groups: ['Model', 'Professional', 'Partner', 'Admin'],
  
  // Custom attributes for user profiles
  userAttributes: {
    // Standard attributes
    givenName: {
      required: true,
      mutable: true,
    },
    familyName: {
      required: true,
      mutable: true,
    },
    phoneNumber: {
      required: false,
      mutable: true,
    },
    // Custom attribute to track user type
    'custom:userType': {
      dataType: 'String',
      mutable: true,
    },
  },
});
