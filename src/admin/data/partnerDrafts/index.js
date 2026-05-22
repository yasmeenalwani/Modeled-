import { ROMAN_K_SALON_DRAFT } from './roman-k-salon';

/** Website-imported partner drafts shown in admin until published to the database. */
export const PARTNER_DRAFTS = [ROMAN_K_SALON_DRAFT];

export function getPartnerDraftBySlug(slug) {
  return PARTNER_DRAFTS.find((d) => d.slug === slug) || null;
}
