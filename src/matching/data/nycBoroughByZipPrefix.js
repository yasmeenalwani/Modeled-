/**
 * NYC borough by ZIP prefix (first 3 digits).
 * Used for same-borough bonus in location scoring.
 * Manhattan: 100xx, Brooklyn: 112xx, Queens: 111xx-116xx, Bronx: 104xx, Staten Island: 103xx
 */
export const NYC_BOROUGH_BY_PREFIX = {
  '100': 'manhattan',
  '101': 'manhattan',
  '102': 'manhattan',
  '103': 'staten_island',
  '104': 'bronx',
  '111': 'queens',
  '112': 'brooklyn',
  '113': 'queens',
  '114': 'queens',
  '115': 'queens',
  '116': 'queens',
};

export function getNycBorough(zip) {
  if (!zip || typeof zip !== 'string') return null;
  const prefix = String(zip).replace(/\D/g, '').slice(0, 3);
  return NYC_BOROUGH_BY_PREFIX[prefix] || null;
}
