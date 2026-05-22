import { normalizeDeployedProfileStatus } from './deployedApiEnums';

/** Minimal Professional.create payload — matches deployed API (see ProfessionalWaitlist). */
export function professionalCreatePayloadForDeployedApi(
  draft,
  { userId = 'admin-pro-import', partnerId = null } = {}
) {
  const adminNotes = [
    draft.adminNotes,
    draft.slug ? `__proSlug__=${draft.slug}` : null,
    draft.partnerSlug ? `partnerSlug:${draft.partnerSlug}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const payload = {
    userId,
    email: draft.email,
    firstName: draft.firstName,
    lastName: draft.lastName,
    phone: draft.phone,
    experienceLevel: draft.experienceLevel || 'senior',
    specialties: draft.specialties?.length ? draft.specialties : undefined,
    salonName: draft.salonName || undefined,
    salonAddress: draft.salonAddress || undefined,
    salonCity: draft.salonCity || undefined,
    salonState: draft.salonState || undefined,
    locationZip: draft.locationZip || undefined,
    partnerId: partnerId || undefined,
    somethingFun: draft.somethingFun || undefined,
    whatYouCareAbout: draft.whatYouCareAbout || undefined,
    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),
    status: normalizeDeployedProfileStatus(draft.status, 'approved'),
    identityVerificationStatus: 'pending',
    adminNotes: adminNotes || undefined,
  };

  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k];
  });
  return payload;
}
