// Shared options for admin + pro request intake — aligned with matching engine & ModelProfile schema.

export const ANY = 'any';

export const HAIR_COLOR_OPTIONS = [
  { value: ANY, label: 'Any — no preference' },
  { value: 'black', label: 'Black' },
  { value: 'brown', label: 'Brown' },
  { value: 'blonde', label: 'Blonde' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' },
  { value: 'colored', label: 'Colored / fashion / highlights' },
];

export const HAIR_LENGTH_OPTIONS = [
  { value: ANY, label: 'Any — no preference' },
  { value: 'short', label: 'Short (chin or above)' },
  { value: 'medium', label: 'Medium (shoulder)' },
  { value: 'long', label: 'Long (past shoulders)' },
  { value: 'extra_long', label: 'Extra long (mid-back+)' },
];

export const HAIR_TEXTURE_OPTIONS = [
  { value: ANY, label: 'Any — no preference' },
  { value: 'straight', label: 'Straight' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'curly', label: 'Curly' },
  { value: 'coily', label: 'Coily' },
];

export const HAIR_CONDITION_OPTIONS = [
  { value: ANY, label: 'Any — no preference' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'color_treated', label: 'Color treated' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'virgin', label: 'Virgin (never colored)' },
];

export const HAIR_DENSITY_OPTIONS = [
  { value: ANY, label: 'Any — no preference' },
  { value: 'thin', label: 'Thin' },
  { value: 'medium', label: 'Medium' },
  { value: 'thick', label: 'Thick' },
];

export const AGE_RANGE_OPTIONS = [
  { value: ANY, label: 'Any age' },
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35-44', label: '35–44' },
  { value: '45-54', label: '45–54' },
  { value: '55+', label: '55+' },
];

export const CURL_PATTERN_OPTIONS = [
  { value: ANY, label: 'Any curl pattern' },
  { value: '1A', label: '1A — Straight fine' },
  { value: '1B', label: '1B — Straight medium' },
  { value: '1C', label: '1C — Straight coarse' },
  { value: '2A', label: '2A — Loose waves' },
  { value: '2B', label: '2B — Waves' },
  { value: '2C', label: '2C — Defined waves' },
  { value: '3A', label: '3A — Loose curls' },
  { value: '3B', label: '3B — Curls' },
  { value: '3C', label: '3C — Tight curls' },
  { value: '4A', label: '4A — Soft coils' },
  { value: '4B', label: '4B — Coils' },
  { value: '4C', label: '4C — Tight coils' },
];

export const SKIN_TONE_OPTIONS = [
  { value: ANY, label: 'Any — no preference' },
  { value: 'fair', label: 'Fair' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'olive', label: 'Olive' },
  { value: 'tan', label: 'Tan' },
  { value: 'brown', label: 'Brown' },
  { value: 'dark', label: 'Dark' },
];

export const VIRGIN_HAIR_OPTIONS = [
  { value: ANY, label: 'Any — not required' },
  { value: 'yes', label: 'Must be virgin hair' },
  { value: 'no', label: 'Not virgin OK' },
];

export const OPEN_TO_CHANGE_OPTIONS = [
  { value: ANY, label: 'Any' },
  { value: 'yes', label: 'Open to major change' },
  { value: 'no', label: 'Minor / maintenance only' },
];

export const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'low', label: 'Low' },
];

export const STYLIST_LEVEL_OPTIONS = [
  { value: 'all_levels', label: 'All levels' },
  { value: 'senior', label: 'Senior' },
  { value: 'junior', label: 'Junior' },
  { value: 'apprentice', label: 'Apprentice' },
  { value: 'student', label: 'Student' },
];

/** Criteria object for matchingEngine.findMatches */
export function buildMatchCriteriaFromIntakeForm(form) {
  const criteria = {};
  const setIf = (key, val) => {
    if (val && val !== ANY && val !== 'Any') criteria[key] = val;
  };

  setIf('hairColor', form.desiredHairColor);
  setIf('hairLength', form.desiredHairLength);
  setIf('hairTexture', form.desiredHairTexture);
  setIf('hairCondition', form.desiredHairCondition);
  setIf('hairDensity', form.desiredHairDensity);
  setIf('ageRange', form.desiredAgeRange);
  setIf('curlPattern', form.desiredCurlPattern);
  setIf('skinTone', form.desiredSkinTone);

  if (form.requireVirginHair === 'yes') criteria.virginHair = true;
  if (form.openToChange === 'yes') criteria.openToChange = true;
  if (form.openToChange === 'no') criteria.openToChange = false;
  if (form.desiredCutStyle && form.desiredCutStyle !== ANY) criteria.desiredCutStyle = form.desiredCutStyle;

  return criteria;
}

export const MATCH_CRITERIA_MARKER = '__matchCriteria__=';

export function serializeExtendedCriteria(form) {
  const extra = {};
  if (form.desiredHairDensity && form.desiredHairDensity !== ANY) extra.hairDensity = form.desiredHairDensity;
  if (form.desiredAgeRange && form.desiredAgeRange !== ANY) extra.ageRange = form.desiredAgeRange;
  if (form.desiredCurlPattern && form.desiredCurlPattern !== ANY) extra.curlPattern = form.desiredCurlPattern;
  if (form.desiredSkinTone && form.desiredSkinTone !== ANY) extra.skinTone = form.desiredSkinTone;
  if (form.requireVirginHair === 'yes') extra.virginHair = true;
  if (form.openToChange && form.openToChange !== ANY) extra.openToChange = form.openToChange === 'yes';
  if (form.desiredCutStyle && form.desiredCutStyle !== ANY) extra.desiredCutStyle = form.desiredCutStyle;
  if (Object.keys(extra).length === 0) return '';
  return `${MATCH_CRITERIA_MARKER}${JSON.stringify(extra)}`;
}

export function parseExtendedCriteria(adminNotes) {
  if (!adminNotes || typeof adminNotes !== 'string') return {};
  const idx = adminNotes.indexOf(MATCH_CRITERIA_MARKER);
  if (idx === -1) return {};
  const jsonPart = adminNotes.slice(idx + MATCH_CRITERIA_MARKER.length).split('\n')[0].trim();
  try {
    return JSON.parse(jsonPart);
  } catch {
    return {};
  }
}

/** Map stored ModelRequest → criteria for matching engine */
export function buildMatchCriteriaFromRequest(request) {
  const extra = parseExtendedCriteria(request?.adminNotes);
  const criteria = { ...extra };

  const setIf = (key, val) => {
    if (val && val !== ANY && val !== 'Any') criteria[key] = val;
  };

  setIf('hairColor', request?.desiredHairColor);
  setIf('hairLength', request?.desiredHairLength);
  setIf('hairTexture', request?.desiredHairTexture);
  setIf('hairCondition', request?.desiredHairCondition);

  if (request?.desiredHairCondition === 'virgin') criteria.virginHair = true;
  if (extra.virginHair === true) criteria.virginHair = true;

  return criteria;
}

export function valueForDb(field, formValue) {
  if (!formValue || formValue === ANY || formValue === 'Any') return null;
  return formValue;
}

export function getOptionLabel(options, value) {
  if (!value || value === ANY) return null;
  return options.find((o) => o.value === value)?.label || value;
}

// —— Scheduling ——

export const SCHEDULING_MODE_OPTIONS = [
  { value: 'fixed', label: 'Fixed — specific date & time' },
  { value: 'flexible', label: 'Flexible — open to model availability' },
  { value: 'recurring', label: 'Recurring — repeats weekly' },
];

export const WEEKDAY_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const WEEKDAY_TO_JS = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

export function getNextWeekdayISODate(weekday) {
  const target = WEEKDAY_TO_JS[String(weekday || '').toLowerCase()];
  if (target === undefined) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }
  const d = new Date();
  const current = d.getDay();
  let days = (target - current + 7) % 7;
  if (days === 0) days = 0;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** DB requires date+time; derive anchor values from scheduling mode */
export function resolveRequestDateTime(form) {
  const mode = form.schedulingMode || form.schedulingFlexibility || 'fixed';
  if (mode === 'recurring') {
    return {
      requestedDate: getNextWeekdayISODate(form.recurringWeekday || 'tuesday'),
      requestedTime: form.recurringTime || '13:00',
    };
  }
  if (mode === 'flexible') {
    const start = form.flexibleDateStart?.trim();
    const d = start || (() => {
      const x = new Date();
      x.setDate(x.getDate() + 3);
      return x.toISOString().slice(0, 10);
    })();
    return {
      requestedDate: d,
      requestedTime: form.flexibleTimePreference || '12:00',
    };
  }
  return {
    requestedDate: form.requestedDate,
    requestedTime: form.requestedTime || '12:00',
  };
}

export function serializeSchedulingNotes(form) {
  const mode = form.schedulingMode || form.schedulingFlexibility || 'fixed';
  if (mode === 'flexible') {
    const parts = [
      'Scheduling: FLEXIBLE',
      form.flexibleDateStart && `Earliest: ${form.flexibleDateStart}`,
      form.flexibleDateEnd && `Latest: ${form.flexibleDateEnd}`,
      form.flexibleTimePreference && `Preferred time: ${form.flexibleTimePreference}`,
      form.flexibleNotes && `Notes: ${form.flexibleNotes}`,
    ].filter(Boolean);
    return parts.join('. ');
  }
  if (mode === 'recurring') {
    const day = getOptionLabel(WEEKDAY_OPTIONS, form.recurringWeekday) || form.recurringWeekday || 'Tuesday';
    const parts = [
      `Scheduling: RECURRING every ${day} at ${form.recurringTime || '13:00'}`,
      form.recurringEndDate && `Until: ${form.recurringEndDate}`,
      form.recurringCount && `Sessions: ${form.recurringCount}`,
      form.recurringNotes && `Notes: ${form.recurringNotes}`,
    ].filter(Boolean);
    return parts.join('. ');
  }
  return null;
}

export function validateIntakeScheduling(form) {
  const mode = form.schedulingMode || form.schedulingFlexibility || 'fixed';
  const missing = [];
  if (!(form.location || '').trim()) missing.push('Location');
  if (mode === 'fixed') {
    if (!form.requestedDate) missing.push('Date');
    if (!form.requestedTime) missing.push('Time');
  }
  if (mode === 'flexible') {
    if (!form.flexibleDateStart && !form.flexibleNotes?.trim()) {
      missing.push('Flexible window (start date or notes)');
    }
  }
  if (mode === 'recurring') {
    if (!form.recurringWeekday) missing.push('Day of week');
    if (!form.recurringTime) missing.push('Recurring time');
  }
  return { ok: missing.length === 0, missing, mode };
}
