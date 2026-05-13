/**
 * Build zipCentroids.json from US Census 2020 ZCTA Gazetteer
 *
 * Downloads the Census ZCTA file, parses tab-delimited data, and outputs
 * a compact JSON lookup: { "10001": [lat, lng], ... }
 *
 * Run: npm run build:zip-centroids
 * Requires: adm-zip (devDependency), network access for download
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CENSUS_URL = 'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip';
const OUTPUT_PATH = path.resolve(__dirname, '../src/matching/data/zipCentroids.json');

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ModeledBuild/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function parseZctaFile(content) {
  const lines = content.toString('utf8').split(/\r?\n/).filter(Boolean);
  const centroids = {};
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length < 7) continue;
    const geoid = String(cols[0] || '').trim();
    if (geoid === 'GEOID') continue; // skip header
    const lat = parseFloat(cols[5]);
    const lng = parseFloat(cols[6]);
    if (!geoid || geoid.length !== 5 || isNaN(lat) || isNaN(lng)) continue;
    centroids[geoid] = [lat, lng];
  }
  return centroids;
}

async function main() {
  console.log('Downloading Census ZCTA Gazetteer...');
  let buffer;
  try {
    buffer = await fetchUrl(CENSUS_URL);
  } catch (err) {
    console.error('Download failed:', err.message);
    console.error('You can manually download from:', CENSUS_URL);
    console.error('Place 2020_Gaz_zcta_national.zip in scripts/ and re-run.');
    process.exit(1);
  }

  console.log('Extracting and parsing...');
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const txtEntry = entries.find((e) => e.entryName.endsWith('.txt') || e.entryName.endsWith('.tsv'));
  if (!txtEntry) {
    console.error('No .txt/.tsv file found in zip. Entries:', entries.map((e) => e.entryName));
    process.exit(1);
  }

  const content = txtEntry.getData().toString('utf8');
  const centroids = parseZctaFile(content);

  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(centroids), 'utf8');

  console.log(`Wrote ${Object.keys(centroids).length} ZCTAs to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
