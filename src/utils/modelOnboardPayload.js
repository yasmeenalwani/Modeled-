/**
 * Model onboard payload helpers — age, service prefs, validation.
 */

export function isValidDateString(s) {
  if (!s || typeof s !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  return s === d.toISOString().slice(0, 10);
}

/** Compute integer age from a YYYY-MM-DD birthday, or null if invalid. */
export function ageFromBirthday(birthday) {
  if (!isValidDateString(birthday)) return null;
  const dob = new Date(`${birthday}T12:00:00`);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

/** True only if the birthday is valid AND the person is 18 or older. */
export function isAdult(birthday) {
  const age = ageFromBirthday(birthday);
  return age != null && age >= 18;
}

/**
 * Derive the matching ageRange bucket from a YYYY-MM-DD birthday.
 * Returns one of '18-24' | '25-34' | '35-44' | '45-54' | '55+' or null.
 */
export function ageRangeFromBirthday(birthday) {
  const age = ageFromBirthday(birthday);
  if (age == null || age < 18) return null;
  if (age <= 24) return '18-24';
  if (age <= 34) return '25-34';
  if (age <= 44) return '35-44';
  if (age <= 54) return '45-54';
  return '55+';
}

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
