import { getPartnerDraftBySlug } from '../admin/data/partnerDrafts';
import { normalizeDeployedProfileStatus } from './deployedApiEnums';

/** Map DB Professional → admin gallery card */
export function mapProfessionalToCard(pro) {
  if (!pro) return null;
  const fallbackNameFromEmail = pro.email ? pro.email.split('@')[0] : '';
  const name = `${pro.firstName || ''} ${pro.lastName || ''}`.trim() || fallbackNameFromEmail || 'Unknown';
  const salonDisplay =
    pro.salonName ||
    [pro.salonCity, pro.salonState].filter(Boolean).join(', ') ||
    pro.locationZip ||
    '—';
  const levelDisplay = (() => {
    const raw = (pro.experienceLevel || pro.title || '').toLowerCase();
    if (!raw) return '—';
    if (raw === 'student') return 'Student';
    if (raw === 'apprentice') return 'Apprentice';
    if (raw === 'junior') return 'Junior';
    if (raw === 'senior') return 'Senior';
    if (raw.includes('senior')) return 'Senior';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();
  return {
    id: pro.id,
    slug: pro.slug || null,
    name,
    salon: pro.salonLocationSuffix ? `${salonDisplay} · ${pro.salonLocationSuffix}` : salonDisplay,
    specialties: pro.specialties || [],
    level: levelDisplay,
    status: pro.status || 'pending',
    partnerSlug: pro.partnerSlug || null,
    requests: 0,
    bookings: 0,
    rating: null,
    trainingProgress: {},
    isDraft: false,
    _db: pro,
  };
}

/** Map import draft → admin gallery card */
export function mapProfessionalDraftToCard(draft) {
  if (!draft) return null;
  const partner = getPartnerDraftBySlug(draft.partnerSlug);
  const card = mapProfessionalToCard({
    ...draft,
    id: `draft:${draft.slug}`,
    isDraft: true,
  });
  return {
    ...card,
    isDraft: true,
    _draft: draft,
    _db: null,
    salon: draft.salonLocationSuffix
      ? `${draft.salonName} · ${draft.salonLocationSuffix}`
      : draft.salonName,
    partnerName: partner?.businessName || draft.salonName,
  };
}

export function resolveProfessionalForModal(cardOrRecord) {
  if (!cardOrRecord) return null;
  if (cardOrRecord._db) return cardOrRecord._db;
  if (cardOrRecord._draft) return { ...cardOrRecord._draft, id: cardOrRecord.id, isDraft: true };
  return cardOrRecord;
}

/** Build Professional.create payload from admin draft */
export function draftToProfessionalCreatePayload(draft, { userId = 'admin-pro-import', partnerId = null } = {}) {
  return {
    userId,
    email: draft.email,
    firstName: draft.firstName,
    lastName: draft.lastName,
    phone: draft.phone,
    experienceLevel: draft.experienceLevel || 'senior',
    specialties: draft.specialties || [],
    salonName: draft.salonName || null,
    salonLocationSuffix: draft.salonLocationSuffix || null,
    salonStreet: draft.salonStreet || null,
    salonCity: draft.salonCity || null,
    salonState: draft.salonState || null,
    salonAddress: draft.salonAddress || null,
    locationZip: draft.locationZip || null,
    partnerId: partnerId || draft.partnerId || null,
    yearsWorking: draft.yearsWorking ?? null,
    yearsInSalon: draft.yearsInSalon ?? null,
    signatureService: draft.signatureService || null,
    serviceWantToTry: draft.serviceWantToTry || null,
    somethingFun: draft.somethingFun || null,
    whatYouCareAbout: draft.whatYouCareAbout || null,
    instagramHandle: draft.instagramHandle || null,
    portfolioItems: draft.portfolioItems || [],
    portfolioUrls: draft.portfolioUrls || [],
    selfPhotoUrls: draft.selfPhotoUrls || [],
    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),
    status: normalizeDeployedProfileStatus(draft.status, 'approved'),
    identityVerificationStatus: 'pending',
    adminNotes: draft.adminNotes || null,
  };
}

export function mapDraftRowForTeam(draft) {
  return {
    id: `draft:${draft.slug}`,
    name: `${draft.firstName} ${draft.lastName}`.trim(),
    email: draft.email,
    phone: draft.phone,
    branch: draft.salonLocationSuffix || draft.salonCity || '—',
    level: draft.title || (draft.experienceLevel === 'senior' ? 'Senior' : draft.experienceLevel) || '—',
    status: draft.status || 'approved',
    specialties: draft.specialties || [],
    isDraft: true,
  };
}
