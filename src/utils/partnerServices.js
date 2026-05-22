/** Format service price for display */
export function formatServicePrice(service) {
  if (!service) return '—';
  if (service.priceLabel) return service.priceLabel;
  if (service.priceMin != null && service.priceMax != null) {
    if (service.priceMin === service.priceMax) return `$${service.priceMin}`;
    return `$${service.priceMin}–$${service.priceMax}`;
  }
  if (service.priceMin != null) return `From $${service.priceMin}`;
  if (service.price != null) return `$${service.price}`;
  return '—';
}

export function parseServicesList(raw) {
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
