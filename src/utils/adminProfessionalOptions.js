import { generateClient } from 'aws-amplify/data';
import { shouldUseMockData } from './mockDataService';
import { getMockProfessional } from './mockDataService';
import { PROFESSIONAL_DRAFTS } from '../admin/data/professionalDrafts';
import { draftProfessionalId, getAdminProfessionalProfile } from './adminProfessionalLookup';
import { resolveProfessionalIdForIntake } from './resolveIntakeProfessional';

export { draftProfessionalId, getAdminProfessionalProfile };

let client;
try {
  if (!shouldUseMockData()) client = generateClient();
} catch {
  client = null;
}

/**
 * Load dropdown options + lookup map (DB professionals + unpublished drafts).
 */
export async function loadAdminProfessionalOptions() {
  const byId = {};
  const options = [];

  PROFESSIONAL_DRAFTS.forEach((draft) => {
    const id = draftProfessionalId(draft.slug);
    const profile = {
      ...draft,
      id,
      isDraft: true,
      salonZip: draft.locationZip,
    };
    byId[id] = profile;
    const branch = draft.salonLocationSuffix ? ` · ${draft.salonLocationSuffix}` : '';
    options.push({
      id,
      label: `${draft.firstName} ${draft.lastName} — ${draft.salonName || 'Partner'}${branch} (draft)`,
      group: 'draft',
      isDraft: true,
    });
  });

  try {
    if (!shouldUseMockData() && client?.models?.Professional) {
      const { data, errors } = await client.models.Professional.list({ limit: 200 });
      if (!errors?.length && data?.length) {
        data.forEach((p) => {
          byId[p.id] = p;
          const branch = p.salonLocationSuffix ? ` · ${p.salonLocationSuffix}` : '';
          options.push({
            id: p.id,
            label: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || p.id,
            sublabel: `${p.salonName || '—'}${branch}`,
            group: 'published',
            isDraft: false,
          });
        });
      }
    }
  } catch (e) {
    console.warn('Could not load DB professionals:', e);
  }

  if (options.filter((o) => o.group === 'published').length === 0) {
    const mockPro = getMockProfessional('mock-pro-1');
    if (mockPro?.id) {
      byId[mockPro.id] = mockPro;
      options.push({
        id: mockPro.id,
        label: `${mockPro.firstName} ${mockPro.lastName} (demo)`,
        group: 'demo',
        isDraft: false,
      });
    }
  }

  return { options, byId };
}

/** Resolve draft:* to a real Professional.id (publish on demand for admin intake). */
export async function resolveProfessionalIdForRequest(professionalId, profilesById = {}) {
  const { professionalId: id } = await resolveProfessionalIdForIntake(
    professionalId,
    profilesById
  );
  return id;
}

export function resolveProfessionalIdFromSearchParams(searchParams) {
  const id = searchParams.get('professionalId');
  if (id) return id;
  const slug = searchParams.get('professionalSlug');
  if (slug) return draftProfessionalId(slug);
  return '';
}
