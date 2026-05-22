import { generateClient } from 'aws-amplify/data';
import { shouldUseMockData, getMockProfessional } from './mockDataService';
import { getPartnerDraftBySlug } from '../admin/data/partnerDrafts';
import { findPartnerForDraft, partnerCreatePayloadForDeployedApi } from './partnerProfile';
import { professionalCreatePayloadForDeployedApi } from './professionalCreatePayload';
import { getAdminProfessionalProfile } from './adminProfessionalLookup';

let client;
try {
  if (!shouldUseMockData()) client = generateClient();
} catch {
  client = null;
}

async function listProfessionals(limit = 200) {
  if (!client?.models?.Professional?.list) return [];
  const { data, errors } = await client.models.Professional.list({ limit });
  if (errors?.length) {
    console.warn('Professional.list errors:', errors);
    return [];
  }
  return data || [];
}

export async function findExistingProfessionalId(profile) {
  if (!profile || !client?.models?.Professional) return null;

  const all = await listProfessionals();

  if (profile.email) {
    const byEmail = all.find(
      (p) => p.email?.toLowerCase() === profile.email?.toLowerCase()
    );
    if (byEmail?.id) return byEmail.id;
  }

  if (profile.slug) {
    const slugMarker = `__proSlug__=${profile.slug}`;
    const bySlug = all.find((p) => p.adminNotes?.includes(slugMarker));
    if (bySlug?.id) return bySlug.id;
  }

  if (profile.firstName && profile.lastName) {
    const fn = profile.firstName.toLowerCase();
    const ln = profile.lastName.toLowerCase();
    const byName = all.find(
      (p) => p.firstName?.toLowerCase() === fn && p.lastName?.toLowerCase() === ln
    );
    if (byName?.id) return byName.id;
  }

  return null;
}

async function ensurePartnerId(partnerSlug) {
  if (!partnerSlug || !client?.models?.Partner) return null;
  const partnerDraft = getPartnerDraftBySlug(partnerSlug);
  if (!partnerDraft) return null;

  const { data: partners } = await client.models.Partner.list({ limit: 200 });
  const existing = findPartnerForDraft(partners, partnerDraft);
  if (existing?.id) return existing.id;

  const payload = partnerCreatePayloadForDeployedApi(partnerDraft);
  const { data: partnerRow, errors } = await client.models.Partner.create(payload);
  if (errors?.length) {
    console.warn('Partner.create skipped:', errors.map((e) => e.message).join('; '));
    return null;
  }
  return partnerRow?.id || null;
}

export async function fallbackProfessionalId(profile) {
  const existing = profile ? await findExistingProfessionalId(profile) : null;
  if (existing) return existing;

  const all = await listProfessionals(10);
  if (all[0]?.id) return all[0].id;

  const mock = getMockProfessional('mock-pro-1');
  if (mock?.id) return mock.id;

  return profile?.id || 'mock-pro-1';
}

/**
 * Resolve draft:* → real Professional.id. Never throws — always returns an id for intake.
 * @returns {{ professionalId: string, publishWarning?: string }}
 */
export async function resolveProfessionalIdForIntake(professionalId, profilesById = {}) {
  if (!professionalId || !String(professionalId).startsWith('draft:')) {
    return { professionalId };
  }

  if (shouldUseMockData() || !client?.models?.Professional) {
    return { professionalId };
  }

  const profile =
    profilesById[professionalId] ||
    getAdminProfessionalProfile(professionalId, profilesById);
  if (!profile) {
    const id = await fallbackProfessionalId(null);
    return {
      professionalId: id,
      publishWarning: 'Stylist draft not found; using fallback professional.',
    };
  }

  const existingId = await findExistingProfessionalId(profile);
  if (existingId) {
    return { professionalId: existingId };
  }

  let partnerId = profile.partnerId || null;
  const warnings = [];

  if (!partnerId && profile.partnerSlug) {
    try {
      partnerId = await ensurePartnerId(profile.partnerSlug);
    } catch (e) {
      warnings.push(`Salon publish skipped: ${e?.message || e}`);
    }
  }

  try {
    const payload = professionalCreatePayloadForDeployedApi(profile, { partnerId });
    const { data: created, errors } = await client.models.Professional.create(payload);
    if (errors?.length) {
      throw new Error(errors.map((e) => e.message).join('; '));
    }
    if (created?.id) {
      return { professionalId: created.id, publishWarning: warnings.join(' ') || undefined };
    }
  } catch (e) {
    warnings.push(`Stylist publish failed: ${e?.message || e}`);
    console.warn('Professional.create failed, using fallback:', e);
  }

  const fallbackId = await fallbackProfessionalId(profile);
  return {
    professionalId: fallbackId,
    publishWarning:
      warnings.join(' ') ||
      'Using an existing stylist record so you can continue matching.',
  };
}
