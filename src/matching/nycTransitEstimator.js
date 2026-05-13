/**
 * NYC transit time estimator - approximates travel minutes without paid APIs.
 * Uses straight-line distance * borough-specific multiplier.
 * Base: ~0.25 miles/min (~15 mph average NYC transit speed).
 */

import zipCentroids from './data/zipCentroids.json';
import { getNycBorough } from './data/nycBoroughByZipPrefix.js';

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Adjacent borough pairs (reasonable commute). Non-adjacent get higher multiplier. */
const ADJACENT_PAIRS = new Set([
  'manhattan-brooklyn',
  'brooklyn-manhattan',
  'manhattan-queens',
  'queens-manhattan',
  'brooklyn-queens',
  'queens-brooklyn',
]);

function getTransitMultiplier(modelBorough, salonBorough) {
  if (!modelBorough || !salonBorough) return 2.0; // Unknown, assume cross-borough
  if (modelBorough === salonBorough) {
    if (modelBorough === 'manhattan') return 1.4;
    if (modelBorough === 'brooklyn') return 1.6;
    if (modelBorough === 'queens') return 1.8;
    if (modelBorough === 'bronx') return 1.6;
    if (modelBorough === 'staten_island') return 2.0; // Car-dependent
    return 1.6;
  }
  const key = `${modelBorough}-${salonBorough}`;
  if (ADJACENT_PAIRS.has(key)) return 2.2; // Cross-borough adjacent
  return 2.8; // Non-adjacent (e.g. Staten Island to Manhattan, Bronx to Brooklyn)
}

const MILES_PER_MIN = 0.25; // ~15 mph NYC transit average

/**
 * Estimate travel time in minutes from model (ZIP) to salon (lat/lng).
 * @param {string} modelZip - Model's 5-digit ZIP
 * @param {{ lat: number, lng: number }} salonCoords - Salon coordinates
 * @param {string} [salonZip] - Salon ZIP for borough (optional, for when coords missing)
 * @returns {number | null} Estimated minutes, or null if cannot compute
 */
export function estimateNYCTravelMinutes(modelZip, salonCoords, salonZip) {
  const normZip = String(modelZip || '').replace(/\D/g, '').slice(0, 5);
  if (!normZip) return null;

  const modelCoord = zipCentroids[normZip];
  if (!modelCoord) return null;

  let salonLat, salonLng;
  if (salonCoords && typeof salonCoords.lat === 'number' && typeof salonCoords.lng === 'number') {
    salonLat = salonCoords.lat;
    salonLng = salonCoords.lng;
  } else {
    const salonCoord = salonZip ? zipCentroids[String(salonZip).replace(/\D/g, '').slice(0, 5)] : null;
    if (!salonCoord) return null;
    salonLat = salonCoord[0];
    salonLng = salonCoord[1];
  }

  const miles = haversineMiles(modelCoord[0], modelCoord[1], salonLat, salonLng);
  const modelBorough = getNycBorough(normZip);
  const salonBorough = getNycBorough(salonZip);
  const multiplier = getTransitMultiplier(modelBorough, salonBorough);
  const minutes = (miles / MILES_PER_MIN) * multiplier;
  return Math.round(Math.max(0, minutes));
}

/**
 * Convert estimated travel minutes to score (0-100).
 */
export function travelTimeToScore(minutes) {
  if (minutes == null) return 50;
  if (minutes <= 15) return 100;
  if (minutes <= 25) return 88;
  if (minutes <= 40) return 72;
  if (minutes <= 55) return 52;
  if (minutes <= 75) return 30;
  return 10;
}
