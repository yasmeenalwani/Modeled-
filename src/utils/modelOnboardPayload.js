/**
 * Map onboard service preference keys → ModelProfile openTo* booleans.
 */
export function mapServicePreferencesToOpenFlags(servicePreferences = []) {
  const set = new Set(servicePreferences);
  const hair = [...set].some((p) => String(p).startsWith('hair_'));
  return {
    openToHaircut:
      hair &&
      (set.has('hair_cut') ||
        set.has('hair_braids') ||
        set.has('hair_extensions') ||
        set.has('hair_transformation')),
    openToColor:
      set.has('hair_color') ||
      set.has('hair_transformation') ||
      set.has('hair_treatment'),
    openToStyling:
      set.has('hair_style') ||
      set.has('hair_braids') ||
      set.has('hair_extensions') ||
      set.has('hair_treatment'),
    openToMakeup: set.has('beauty_makeup'),
    openToNails: set.has('beauty_nails'),
    openToSkincare: set.has('beauty_skin') || set.has('beauty_injectables'),
  };
}
