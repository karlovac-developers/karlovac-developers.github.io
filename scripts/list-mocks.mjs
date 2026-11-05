#!/usr/bin/env node
/** Lists every mock and placeholder in the site, so replacing them is one
 *  checklist. Never fails: mocks are allowed, they only have to be findable.
 *
 *  Usage: node scripts/list-mocks.mjs [root]
 *
 *  Lists content files with `mock: true` in their front matter, JSON entries
 *  with "mock": true, HOME stats and testimonials marked mock in
 *  src/config.ts, and every line of content, data or config containing
 *  REPLACE-ME or example.com (code fallbacks and comments are skipped). */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PLACEHOLDER = /REPLACE-ME|example\.com/;

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    return d.isDirectory() ? files(p) : [p];
  });
}

/** Returns { mocks: string[], placeholders: string[] }, paths relative to root. */
export async function listMocks(root = '.') {
  const rel = (p) => relative(root, p).split(sep).join('/');
  const mocks = [];
  const placeholders = [];

  for (const f of files(join(root, 'src/content'))) {
    if (!/\.mdx?$/.test(f)) continue;
    const fm = readFileSync(f, 'utf8').match(/^---\n([\s\S]*?)\n---/);
    if (fm && /^mock:\s*true\s*$/m.test(fm[1])) mocks.push(rel(f));
  }

  for (const f of files(join(root, 'src/data'))) {
    if (!f.endsWith('.json')) continue;
    const data = JSON.parse(readFileSync(f, 'utf8'));
    for (const entry of Array.isArray(data) ? data : []) {
      if (entry && entry.mock === true) mocks.push(`${rel(f)}#${entry.id ?? '?'}`);
    }
  }

  const configPath = join(root, 'src/config.ts');
  if (existsSync(configPath)) {
    const { HOME } = await import(pathToFileURL(configPath).href);
    HOME?.stats?.forEach((s, i) => s.mock && mocks.push(`src/config.ts#HOME.stats[${i}]`));
    HOME?.testimonials?.forEach((t, i) => t.mock && mocks.push(`src/config.ts#HOME.testimonials[${i}] (${t.name})`));
  }

  const scanned = [...files(join(root, 'src/content')), ...files(join(root, 'src/data')), configPath];
  for (const f of scanned) {
    if (!existsSync(f) || !/\.(ts|json|mdx?)$/.test(f)) continue;
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const comment = /^\s*(\/\/|\/\*|\*)/.test(line);
      if (!comment && PLACEHOLDER.test(line)) placeholders.push(`${rel(f)}:${i + 1}: ${line.trim().slice(0, 120)}`);
    });
  }

  return { mocks, placeholders };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { mocks, placeholders } = await listMocks(process.argv[2] ?? '.');
  console.log(`Mock content (${mocks.length}):`);
  for (const m of mocks) console.log(`  ${m}`);
  console.log(`\nPlaceholders (${placeholders.length}):`);
  for (const p of placeholders) console.log(`  ${p}`);
}
