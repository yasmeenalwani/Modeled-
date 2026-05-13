/**
 * Geocoding utilities using Nominatim (OpenStreetMap) - free, no API key required.
 * Used to convert salon addresses to lat/lng for travel-time matching.
 *
 * Rate limit: 1 request per second (Nominatim usage policy).
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode an address to lat/lng using Nominatim.
 * @param {string} address - Full address (e.g. "123 Main St, New York, NY 10001")
 * @returns {Promise<{ lat: number, lng: number } | null>} Coordinates or null if not found
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') return null;
  const trimmed = address.trim();
  if (trimmed.length < 5) return null;

  try {
    const params = new URLSearchParams({
      q: trimmed,
      format: 'json',
      limit: '1',
      addressdetails: '0',
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': 'ModeledManagement/1.0 (salon-location-matching)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  } catch (err) {
    console.warn('Geocoding failed:', err?.message);
    return null;
  }
}

/**
 * Geocode with rate limiting (1 req/sec). Use when batching.
 */
let lastGeocodeTime = 0;
export async function geocodeAddressWithRateLimit(address) {
  const now = Date.now();
  const elapsed = now - lastGeocodeTime;
  if (elapsed < 1000) {
    await new Promise((r) => setTimeout(r, 1000 - elapsed));
  }
  lastGeocodeTime = Date.now();
  return geocodeAddress(address);
}
