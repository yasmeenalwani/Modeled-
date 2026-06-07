/**
 * Generates docs/export/CODEBASE_MANIFEST.json for Claude Code / audit handoff.
 * Run: npm run export:manifest
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const OUT = join(ROOT, 'docs', 'export', 'CODEBASE_MANIFEST.json');
const exts = new Set(['.jsx', '.js', '.ts', '.tsx']);
const roots = ['src', 'amplify', 'scripts'];

function walk(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(ent.name)) continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (exts.has(extname(ent.name))) {
      const rel = relative(ROOT, p).replace(/\\/g, '/');
      const content = readFileSync(p, 'utf8');
      out.push({ path: rel, lines: content.split(/\r?\n/).length, bytes: statSync(p).size });
    }
  }
  return out;
}

let files = [];
for (const r of roots) walk(join(ROOT, r), files);
files.sort((a, b) => b.lines - a.lines);

const byTop = {};
for (const f of files) {
  const top = f.path.split('/').slice(0, 2).join('/');
  if (!byTop[top]) byTop[top] = { files: 0, lines: 0 };
  byTop[top].files++;
  byTop[top].lines += f.lines;
}

const manifest = {
  generatedAt: new Date().toISOString(),
  repo: 'modeled-frontend',
  totals: {
    sourceFiles: files.length,
    sourceLines: files.reduce((s, f) => s + f.lines, 0),
    adminPages: files.filter((f) => f.path.startsWith('src/admin/pages/')).length,
    lambdaHandlers: files.filter((f) => f.path.includes('amplify/functions') && f.path.endsWith('handler.ts')).length,
    schemaLines: files.find((f) => f.path === 'amplify/data/resource.ts')?.lines ?? 0,
  },
  byArea: byTop,
  files,
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2));
console.log(`Wrote ${OUT}`);
console.log(`${manifest.totals.sourceFiles} files, ${manifest.totals.sourceLines} lines`);
