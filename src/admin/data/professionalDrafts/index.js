import { SCOTT_WALDMAN_DRAFT } from './scott-waldman-roman-k';

export const PROFESSIONAL_DRAFTS = [SCOTT_WALDMAN_DRAFT];

export function getProfessionalDraftsForPartner(partnerSlug) {
  if (!partnerSlug) return [];
  return PROFESSIONAL_DRAFTS.filter((d) => d.partnerSlug === partnerSlug);
}
