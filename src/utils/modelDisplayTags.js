/**
 * Human-readable attribute chips for model gallery cards.
 */
export function buildModelCardTags(model) {
  if (!model) return [];

  const chips = [];
  const add = (value, prefix = '') => {
    if (value == null || value === '' || value === '—') return;
    const label = String(value).replace(/_/g, ' ').trim();
    if (!label) return;
    chips.push(prefix ? `${prefix}${label}` : label);
  };

  add(model.hairLength);
  add(model.hairColor);
  add(model.hairTexture);
  add(model.hairCondition);
  add(model.hairDensity);
  add(model.skinTone, 'skin ');
  add(model.eyeColor, 'eyes ');
  if (model.locationZip) chips.push(`ZIP ${model.locationZip}`);
  if (model.virginHair) chips.push('virgin hair');

  const openServices = [];
  if (model.openToHaircut) openServices.push('haircut');
  if (model.openToColor) openServices.push('color');
  if (model.openToStyling) openServices.push('styling');
  if (model.openToMakeup) openServices.push('makeup');
  if (openServices.length) chips.push(openServices.join(' · '));

  if (Array.isArray(model.tags)) {
    model.tags.forEach((tag) => {
      if (typeof tag !== 'string' || !tag.trim()) return;
      const label = tag.includes(':') ? tag.split(':').pop() : tag;
      add(label.replace(/_/g, ' '));
    });
  }

  return [...new Set(chips)].slice(0, 8);
}
