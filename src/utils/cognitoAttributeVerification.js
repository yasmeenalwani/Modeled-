import {
  fetchUserAttributes,
  updateUserAttribute,
  sendUserAttributeVerificationCode,
  confirmUserAttribute,
} from 'aws-amplify/auth';

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

export function formatVerificationError(err) {
  const name = err?.name || '';
  const message = err?.message || 'Something went wrong';
  if (name === 'LimitExceededException') {
    return 'Too many requests. Wait a few minutes and try again.';
  }
  if (name === 'AliasExistsException') {
    return 'That email is already used on another account. Sign in with that account or use a different email.';
  }
  if (/already.*verified/i.test(message)) {
    return 'Your email is already verified. You can continue.';
  }
  if (/no registered.*alias/i.test(message)) {
    return 'No email on your account yet. Use the same email you signed up with in Basic Info.';
  }
  return message;
}

export async function getCognitoEmailState() {
  const attrs = await fetchUserAttributes();
  return {
    email: attrs.email,
    emailVerified: attrs.email_verified === true || attrs.email_verified === 'true',
  };
}

/**
 * Sync onboarding email to Cognito if needed, then send a verification code.
 * Returns { status: 'code_sent' | 'already_verified', email }.
 */
export async function ensureEmailVerificationCodeSent(formEmail) {
  const attrs = await fetchUserAttributes();
  const cognitoEmail = attrs.email;
  const verified = attrs.email_verified === true || attrs.email_verified === 'true';
  const target = normalizeEmail(formEmail) || normalizeEmail(cognitoEmail);

  if (!target) {
    throw new Error('Enter your email in Basic Info first, then return here.');
  }

  if (verified && normalizeEmail(cognitoEmail) === target) {
    return { status: 'already_verified', email: cognitoEmail || target };
  }

  const cognitoNorm = normalizeEmail(cognitoEmail);
  if (cognitoNorm && cognitoNorm !== target) {
    await updateUserAttribute({
      userAttribute: { attributeKey: 'email', value: target },
    });
    try {
      await sendUserAttributeVerificationCode({ userAttributeKey: 'email' });
    } catch (err) {
      if (/already.*verified/i.test(err?.message || '')) {
        return { status: 'already_verified', email: target };
      }
      throw err;
    }
    return { status: 'code_sent', email: target, method: 'update' };
  }

  if (!verified) {
    try {
      await sendUserAttributeVerificationCode({ userAttributeKey: 'email' });
    } catch (err) {
      if (/already.*verified/i.test(err?.message || '')) {
        return { status: 'already_verified', email: cognitoEmail || target };
      }
      throw err;
    }
    return { status: 'code_sent', email: target, method: 'resend' };
  }

  return { status: 'already_verified', email: cognitoEmail || target };
}

export async function confirmEmailVerificationCode(code) {
  await confirmUserAttribute({
    userAttributeKey: 'email',
    confirmationCode: code.trim(),
  });
}
