import { getMockProfessional } from './mockDataService';
import { PROFESSIONAL_DRAFTS } from '../admin/data/professionalDrafts';

export function draftProfessionalId(slug) {
  return `draft:${slug}`;
}

/** Profile for matching/intake (DB row or admin draft). */
export function getAdminProfessionalProfile(professionalId, profilesById = {}) {
  if (!professionalId) return null;
  if (profilesById[professionalId]) return profilesById[professionalId];

  const draft = PROFESSIONAL_DRAFTS.find((d) => draftProfessionalId(d.slug) === professionalId);
  if (draft) {
    return {
      ...draft,
      id: draftProfessionalId(draft.slug),
      isDraft: true,
      salonZip: draft.locationZip,
    };
  }

  return getMockProfessional(professionalId);
}
