#!/usr/bin/env node
/** Checks every internal link in a built site.
 *
 *  Usage: node scripts/check-links.mjs <dist-dir>
 *
 *  Fails when:
 *    - an internal href, src or srcset has no matching file in the build;
 *    - a page link crosses languages: a page under /en/ links to a page
 *      outside it, or a page outside /en/ links into it. Links that carry
 *      hreflang (the language switcher, alternate links) and canonical links
 *      may cross, and so may links inside an entry body written in the other
 *      language (marked data-entry-lang), which is written once for both.
 *
 *  Internal means root-relative (/x/) or absolute on SITE_ORIGIN. A page
 *  link is a path ending in "/". */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE_ORIGIN = 'https://karlovac-developers.github.io';

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return htmlFiles(p);
    return d.name.endsWith('.html') ? [p] : [];
  });
}

/* The URL path a built file is served at: dist/en/about/index.html -> /en/about/ */
function servedPath(dist, file) {
  const rel = relative(dist, file).split(sep).join('/');
  return '/' + rel.replace(/(^|\/)index\.html$/, '$1');
}

function toPath(url) {
  if (url.startsWith(SITE_ORIGIN + '/')) url = url.slice(SITE_ORIGIN.length);
  if (!url.startsWith('/') || url.startsWith('//')) return null;
  return decodeURI(url.split(/[?#]/)[0]);
}

function resolves(dist, path) {
  const p = join(dist, path);
  if (path.endsWith('/')) return existsSync(join(p, 'index.html'));
  if (existsSync(p) && statSync(p).isFile()) return true;
  return existsSync(join(p, 'index.html'));
}

const TAG = /<(a|link|img|script|source|iframe)\b[^>]*>/gi;
const ATTR = (name) => new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
const attr = (tag, name) => {
  const m = tag.match(ATTR(name));
  return m ? (m[2] ?? m[3] ?? m[4]) : undefined;
};

/* [start, end) offsets of every <div data-entry-lang> element, found by
   counting nested divs from its opening tag. */
function entryRegions(html) {
  const regions = [];
  for (const m of html.matchAll(/<div\b[^>]*\bdata-entry-lang=/gi)) {
    const div = /<div\b|<\/div>/gi;
    div.lastIndex = m.index + 1;
    let depth = 1;
    let end = html.length;
    for (let d; depth > 0 && (d = div.exec(html)); ) {
      depth += d[0].toLowerCase() === '</div>' ? -1 : 1;
      if (depth === 0) end = d.index;
    }
    regions.push([m.index, end]);
  }
  return regions;
}

/** Returns a list of problems, one string each. */
export function checkDist(dist) {
  const problems = [];
  for (const file of htmlFiles(dist)) {
    const page = servedPath(dist, file);
    const pageIsEn = page === '/en/' || page.startsWith('/en/');
    const isNotFound = page === '/404.html';
    const html = readFileSync(file, 'utf8');
    const regions = entryRegions(html);
    for (const match of html.matchAll(TAG)) {
      const tag = match[0];
      const inEntry = regions.some(([a, b]) => match.index >= a && match.index < b);
      const urls = [attr(tag, 'href'), attr(tag, 'src')];
      const srcset = attr(tag, 'srcset');
      if (srcset) urls.push(...srcset.split(',').map((s) => s.trim().split(/\s+/)[0]));
      const crossingAllowed = inEntry || isNotFound || attr(tag, 'hreflang') !== undefined || attr(tag, 'rel') === 'canonical';
      for (const url of urls) {
        if (!url) continue;
        const path = toPath(url);
        if (path === null) continue;
        if (!resolves(dist, path)) problems.push(`${page}: broken link ${url}`);
        if (crossingAllowed || !path.endsWith('/')) continue;
        const targetIsEn = path === '/en/' || path.startsWith('/en/');
        if (pageIsEn && !targetIsEn) problems.push(`${page}: links out of English to ${url}`);
        if (!pageIsEn && targetIsEn) problems.push(`${page}: links into English to ${url}`);
      }
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = process.argv[2] ?? 'dist';
  const problems = checkDist(dist);
  for (const p of problems) console.error(p);
  if (problems.length) {
    console.error(`check-links: ${problems.length} problem(s)`);
    process.exit(1);
  }
  console.log('check-links: OK');
}
