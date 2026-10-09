import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanText, TEXT_EXTENSIONS } from './keyScan';
import type { KeyFinding } from './keyScan';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * npm run check:no-keys
 * Fails if an API key, or a server-only name, is in the web build, the Android copy of it, or the source.
 * Run it after `npm run build` and before handing a build to anyone.
 */
const SHIPPED = ['dist', path.join('android', 'app', 'src', 'main', 'assets', 'public')];
const SOURCE = ['src', 'tutor', 'worker', 'scripts', 'public', '.env.example', 'capacitor.config.ts', 'package.json'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.wrangler']);

function* walk(target: string): Generator<string> {
  if (!existsSync(target)) return;
  if (statSync(target).isFile()) {
    yield target;
    return;
  }
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    yield* walk(path.join(target, entry.name));
  }
}

const findings: KeyFinding[] = [];
let scanned = 0;
const scan = (targets: string[], shipped: boolean) => {
  for (const rel of targets) {
    for (const file of walk(path.join(ROOT, rel))) {
      if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()) && path.basename(file) !== '.env.example') continue;
      scanned += 1;
      findings.push(...scanText(path.relative(ROOT, file), readFileSync(file, 'utf8'), shipped));
    }
  }
};

const builds = SHIPPED.filter((p) => existsSync(path.join(ROOT, p)));
scan(builds, true);
scan(SOURCE, false);

if (builds.length === 0) console.log('Note: no build found (dist/). Run `npm run build` first to check what would be shipped.');
if (findings.length > 0) {
  console.error('Possible API keys found:\n');
  for (const f of findings) console.error(`  - ${f.file}: ${f.what}`);
  process.exit(1);
}
console.log(`No API keys found (${scanned} files checked${builds.length ? `, including ${builds.join(' and ')}` : ''}).`);
