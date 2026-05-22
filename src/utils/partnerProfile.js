/**
 * Partner profile helpers — multi-location sites, cards, and display labels.
 */

import { normalizeDeployedProfileStatus } from './deployedApiEnums';

export function parseLocationSites(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function getPrimaryLocation(sites) {
  const list = parseLocationSites(sites);
  return list.find((s) => s.isPrimary) || list[0] || null;
}

export function formatLocationLine(site) {
  if (!site) return '';
  const parts = [site.address, site.city, site.state, site.zip].filter(Boolean);
  return parts.join(', ');
}

export function formatLocationCountLabel(sites) {
  const list = parseLocationSites(sites);
  const active = list.filter((s) => !s.seasonal);
  const seasonal = list.filter((s) => s.seasonal);
  if (active.length === 0) return 'Location TBD';
  let label = `${active.length} location${active.length === 1 ? '' : 's'}`;
  if (seasonal.length) label += ` + ${seasonal.length} seasonal`;
  return label;
}

export function formatHoursSummary(hours) {
  if (!hours || typeof hours !== 'object') return null;
  return Object.entries(hours)
    .map(([day, time]) => `${day.charAt(0).toUpperCase()}${day.slice(1)}: ${time}`)
    .join(' · ');
}

/** Map Amplify Partner record → admin gallery card */
export function mapPartnerToCard(partner) {
  if (!partner) return null;
  const locationSites = parseLocationSites(partner.locationSites);
  const primary = getPrimaryLocation(locationSites);
  const address =
    primary
      ? formatLocationLine(primary)
      : [partner.address, partner.city, partner.state, partner.zip].filter(Boolean).join(', ') ||
        'Not provided';

  return {
    id: partner.id,
    slug: partner.slug || null,
    name: partner.businessName || 'Unknown Business',
    type: partner.businessType || 'partner',
    address,
    locationSites,
    locationCount: locationSites.length || parseInt(partner.numberOfLocations, 10) || 1,
    locationLabel: formatLocationCountLabel(locationSites),
    stylists: partner.numberOfProfessionals || 0,
    bookings: 0,
    rating: null,
    status: partner.status || 'pending',
    tags: partner.tags || [],
    website: partner.website,
    phone: partner.phone,
    email: partner.email,
    isDraft: false,
    sourceUrl: partner.sourceUrl,
    _db: partner,
  };
}

/** Map website-import draft → admin gallery card */
export function mapDraftToCard(draft) {
  if (!draft) return null;
  const locationSites = parseLocationSites(draft.locationSites);
  const primary = getPrimaryLocation(locationSites);
  return {
    id: `draft:${draft.slug}`,
    slug: draft.slug,
    name: draft.businessName,
    type: draft.businessType || 'salon',
    address: primary ? formatLocationLine(primary) : draft.address || 'Not provided',
    locationSites,
    locationCount: locationSites.length,
    locationLabel: formatLocationCountLabel(locationSites),
    stylists: draft.numberOfProfessionals || 0,
    bookings: 0,
    rating: null,
    status: draft.status || 'manual_review',
    tags: draft.tags || [],
    website: draft.website,
    phone: draft.phone,
    email: draft.email,
    isDraft: true,
    sourceUrl: draft.sourceUrl,
    _draft: draft,
    _db: null,
  };
}

/** Full partner object for detail modal (DB or draft) */
export function resolvePartnerForModal(cardOrRecord) {
  if (!cardOrRecord) return null;
  if (cardOrRecord._db) return cardOrRecord._db;
  if (cardOrRecord._draft) return { ...cardOrRecord._draft, id: cardOrRecord.id, isDraft: true };
  return cardOrRecord;
}

export const PARTNER_EXTENDED_MARKER = '__partnerExtended__=';

/** Fields accepted by deployed CreatePartnerInput (pre–multi-location deploy) */
const PARTNER_CREATE_SAFE_KEYS = [
  'userId', 'email', 'businessName', 'contactName', 'phone',
  'address', 'city', 'state', 'zip', 'businessType', 'website',
  'instagramHandle', 'yearsInBusiness', 'numberOfLocations', 'numberOfProfessionals',
  'servicesList', 'salonPhotoUrls', 'selfPhotoUrls', 'somethingFun',
  'whatYouCareAbout', 'businessGrowthGoals', 'communityInterests', 'communityInterestsOther',
  'termsAccepted', 'termsAcceptedAt', 'status', 'identityVerificationStatus', 'adminNotes',
  // Included when backend is deployed with multi-location schema:
  'slug', 'tags', 'locationSites', 'sourceUrl', 'brandSummary', 'pricingNote',
];

function pickPartnerCreateFields(payload) {
  const out = {};
  for (const key of PARTNER_CREATE_SAFE_KEYS) {
    if (payload[key] !== undefined) out[key] = payload[key];
  }
  return out;
}

export function parsePartnerExtended(adminNotes) {
  if (!adminNotes || typeof adminNotes !== 'string') return {};
  const idx = adminNotes.indexOf(PARTNER_EXTENDED_MARKER);
  if (idx === -1) return {};
  const jsonPart = adminNotes.slice(idx + PARTNER_EXTENDED_MARKER.length).split('\n')[0].trim();
  try {
    return JSON.parse(jsonPart);
  } catch {
    return {};
  }
}

/** Match published partner to draft slug (DB slug field or adminNotes blob). */
export function findPartnerForDraft(partners, draft) {
  if (!draft || !Array.isArray(partners)) return null;
  const slug = draft.slug;
  return partners.find((p) => {
    if (slug && p.slug === slug) return true;
    const ext = parsePartnerExtended(p.adminNotes);
    if (slug && ext.slug === slug) return true;
    if (draft.businessName && p.businessName === draft.businessName) return true;
    return false;
  }) || null;
}

/**
 * Payload for Partner.create — omits fields the live API may not have yet.
 * Extended draft data (locations, slug, tags) is stored in adminNotes until schema deploy.
 */
export function draftToPartnerCreatePayload(draft, userId = 'admin-partner-import') {
  const extended = {
    slug: draft.slug || null,
    tags: draft.tags || [],
    locationSites: draft.locationSites || [],
    sourceUrl: draft.sourceUrl || null,
    brandSummary: draft.brandSummary || null,
    pricingNote: draft.pricingNote || null,
    servicesList: draft.servicesList || null,
  };
  const extendedLine = `${PARTNER_EXTENDED_MARKER}${JSON.stringify(extended)}`;
  const adminNotes = [draft.adminNotes, extendedLine].filter(Boolean).join('\n');

  const siteCount = parseLocationSites(draft.locationSites).length;
  const full = {
    userId,
    email: draft.email,
    businessName: draft.businessName,
    contactName: draft.contactName,
    phone: draft.phone,
    address: draft.address || null,
    city: draft.city || null,
    state: draft.state || null,
    zip: draft.zip || null,
    businessType: draft.businessType || 'salon',
    website: draft.website || null,
    instagramHandle: draft.instagramHandle || null,
    yearsInBusiness: draft.yearsInBusiness ?? null,
    numberOfLocations: String(draft.numberOfLocations || siteCount || '1'),
    numberOfProfessionals: draft.numberOfProfessionals ?? null,
    servicesList: null,
    salonPhotoUrls: draft.salonPhotoUrls || [],
    selfPhotoUrls: draft.selfPhotoUrls || [],
    somethingFun: draft.brandSummary || draft.somethingFun || null,
    whatYouCareAbout: draft.whatYouCareAbout || null,
    businessGrowthGoals: draft.businessGrowthGoals || null,
    communityInterests: draft.communityInterests || [],
    communityInterestsOther: draft.communityInterestsOther || null,
    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),
    status: normalizeDeployedProfileStatus(draft.status, 'approved'),
    identityVerificationStatus: 'pending',
    adminNotes,
  };

  // Safe subset for older deployed APIs (no slug / locationSites / tags / etc.)
  return pickPartnerCreateFields(full);
}

/**
 * Strip fields rejected by the live CreatePartnerInput, retrying without extended columns.
 */
export function partnerCreatePayloadForDeployedApi(draft, userId = 'admin-partner-import') {
  const full = draftToPartnerCreatePayload(draft, userId);
  const legacyOnly = pickPartnerCreateFields({
    ...full,
    slug: undefined,
    tags: undefined,
    locationSites: undefined,
    sourceUrl: undefined,
    brandSummary: undefined,
    pricingNote: undefined,
  });
  delete legacyOnly.slug;
  delete legacyOnly.tags;
  delete legacyOnly.locationSites;
  delete legacyOnly.sourceUrl;
  delete legacyOnly.brandSummary;
  delete legacyOnly.pricingNote;
  return legacyOnly;
}
