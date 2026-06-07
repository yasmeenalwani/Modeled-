/**
 * Capture full-page PNG screenshots for demo walkthrough printing.
 * Requires: dev server on BASE_URL (default http://localhost:80)
 * Run: npm run screenshots:demo
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE = process.env.BASE_URL || 'http://localhost:80';
const OUT_DIR = path.join(ROOT, 'docs', 'export', 'demo-walkthrough-screenshots');
const ZIP_PATH = path.join(ROOT, 'docs', 'export', 'demo-walkthrough-screenshots.zip');

/** @type {{ folder: string; name: string; path: string }[]} */
const PAGES = [
  // Public
  { folder: '01-public', name: '01-landing', path: '/' },
  { folder: '01-public', name: '02-join', path: '/join' },
  { folder: '01-public', name: '03-demo-hub', path: '/demo' },
  { folder: '01-public', name: '04-enter', path: '/enter' },

  // Demo — Model (Seraphina)
  { folder: '02-demo-model-seraphina', name: '01-profile', path: '/demo/seraphina/profile' },
  { folder: '02-demo-model-seraphina', name: '02-opportunities', path: '/demo/seraphina/opportunities' },
  { folder: '02-demo-model-seraphina', name: '03-photos', path: '/demo/seraphina/photos' },
  { folder: '02-demo-model-seraphina', name: '04-games', path: '/demo/seraphina/games' },
  { folder: '02-demo-model-seraphina', name: '05-chat', path: '/demo/seraphina/chat' },
  { folder: '02-demo-model-seraphina', name: '06-calendar', path: '/demo/seraphina/calendar' },
  { folder: '02-demo-model-seraphina', name: '07-sessions', path: '/demo/seraphina/sessions' },

  // Demo — Pro (Sarah)
  { folder: '03-demo-pro-sarah', name: '01-profile', path: '/demo/sarah/profile' },
  { folder: '03-demo-pro-sarah', name: '02-matching', path: '/demo/sarah/matching' },
  { folder: '03-demo-pro-sarah', name: '03-portfolio', path: '/demo/sarah/portfolio' },
  { folder: '03-demo-pro-sarah', name: '04-calendar', path: '/demo/sarah/calendar' },
  { folder: '03-demo-pro-sarah', name: '05-education', path: '/demo/sarah/education' },
  { folder: '03-demo-pro-sarah', name: '06-shop', path: '/demo/sarah/shop' },
  { folder: '03-demo-pro-sarah', name: '07-chat', path: '/demo/sarah/chat' },

  // Demo — Partner (Luxe)
  { folder: '04-demo-partner', name: '01-dashboard', path: '/demo/partner' },
  { folder: '04-demo-partner', name: '02-profile', path: '/demo/partner/profile' },
  { folder: '04-demo-partner', name: '03-services', path: '/demo/partner/services' },
  { folder: '04-demo-partner', name: '04-team', path: '/demo/partner/team' },
  { folder: '04-demo-partner', name: '05-schedule', path: '/demo/partner/schedule' },
  { folder: '04-demo-partner', name: '06-campaigns', path: '/demo/partner/campaigns' },
  { folder: '04-demo-partner', name: '07-conversions', path: '/demo/partner/conversions' },
  { folder: '04-demo-partner', name: '08-financials', path: '/demo/partner/financials' },
  { folder: '04-demo-partner', name: '09-support', path: '/demo/partner/support' },

  // Admin (localhost dev — no login)
  { folder: '05-admin', name: '01-dashboard', path: '/admin' },
  { folder: '05-admin', name: '02-trends', path: '/admin/trends' },
  { folder: '05-admin', name: '03-revenue', path: '/admin/revenue' },
  { folder: '05-admin', name: '04-models', path: '/admin/models' },
  { folder: '05-admin', name: '05-professionals', path: '/admin/professionals' },
  { folder: '05-admin', name: '06-salons', path: '/admin/salons' },
  { folder: '05-admin', name: '07-requests', path: '/admin/requests' },
  { folder: '05-admin', name: '08-matching', path: '/admin/matching' },
  { folder: '05-admin', name: '09-match-approval', path: '/admin/match-approval' },
  { folder: '05-admin', name: '10-criteria', path: '/admin/criteria' },
  { folder: '05-admin', name: '11-bookings', path: '/admin/bookings' },
  { folder: '05-admin', name: '12-calendar', path: '/admin/calendar' },
  { folder: '05-admin', name: '13-waitlist', path: '/admin/waitlist' },
  { folder: '05-admin', name: '14-services', path: '/admin/services' },
  { folder: '05-admin', name: '15-packages', path: '/admin/packages' },
  { folder: '05-admin', name: '16-onboarding', path: '/admin/onboarding' },
  { folder: '05-admin', name: '17-training', path: '/admin/training' },
  { folder: '05-admin', name: '18-photos', path: '/admin/photos' },
  { folder: '05-admin', name: '19-crm', path: '/admin/crm' },
  { folder: '05-admin', name: '20-trips', path: '/admin/trips' },
  { folder: '05-admin', name: '21-campaigns', path: '/admin/campaigns' },
  { folder: '05-admin', name: '22-monitoring', path: '/admin/monitoring' },
  { folder: '05-admin', name: '23-performance', path: '/admin/performance' },
  { folder: '05-admin', name: '24-feedback', path: '/admin/feedback' },
  { folder: '05-admin', name: '25-chat', path: '/admin/chat' },
  { folder: '05-admin', name: '26-onboarding-analytics', path: '/admin/onboarding-analytics' },
  { folder: '05-admin', name: '27-engagement-analytics', path: '/admin/engagement-analytics' },
  { folder: '05-admin', name: '28-conversion-analytics', path: '/admin/conversion-analytics' },
  { folder: '05-admin', name: '29-role-model', path: '/admin/role-model' },
  { folder: '05-admin', name: '30-role-model-applications', path: '/admin/role-model/applications' },
];

async function waitForApp(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);
  const loading = page.locator('text=Loading...');
  if (await loading.isVisible().catch(() => false)) {
    await loading.waitFor({ state: 'hidden', timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(1500);
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const manifest = [];
  let ok = 0;
  let fail = 0;

  for (const item of PAGES) {
    const dir = path.join(OUT_DIR, item.folder);
    mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${item.name}.png`);
    const url = `${BASE}${item.path}`;

    const page = await context.newPage();
    try {
      console.log(`Capturing ${url} …`);
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      if (!response || response.status() >= 400) {
        throw new Error(`HTTP ${response?.status() ?? 'no response'}`);
      }
      await waitForApp(page);
      await page.screenshot({ path: filePath, fullPage: true });
      manifest.push({ ...item, url, file: path.relative(ROOT, filePath), status: 'ok' });
      ok += 1;
    } catch (err) {
      console.warn(`  FAILED: ${err.message}`);
      manifest.push({ ...item, url, file: null, status: 'fail', error: err.message });
      fail += 1;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  writeFileSync(
    path.join(OUT_DIR, 'README.txt'),
    [
      'Modeled Demo Walkthrough Screenshots',
      `Generated: ${new Date().toISOString()}`,
      `Base URL: ${BASE}`,
      `Screenshots: ${ok} ok, ${fail} failed`,
      '',
      'Folders:',
      '  01-public          — Landing, join, demo hub',
      '  02-demo-model      — Seraphina (model portal)',
      '  03-demo-pro        — Sarah (professional portal)',
      '  04-demo-partner    — Luxe Studio partner portal',
      '  05-admin           — Admin Command Center',
      '',
      'Print: open each PNG and print, or attach demo-walkthrough-screenshots.zip to email.',
      '',
    ].join('\r\n'),
  );

  writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const zip = new AdmZip();
  zip.addLocalFolder(OUT_DIR);
  zip.writeZip(ZIP_PATH);

  console.log('\nDone.');
  console.log(`Folder: ${OUT_DIR}`);
  console.log(`Zip:    ${ZIP_PATH}`);
  console.log(`${ok} captured, ${fail} failed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
