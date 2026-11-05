import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ui } from '../src/i18n/ui.ts';
import * as config from '../src/config.ts';

test('no dictionary value is empty in either language', () => {
  for (const locale of ['hr', 'en'] as const) {
    for (const [key, value] of Object.entries(ui[locale])) {
      assert.ok(value.trim() !== '', `ui.${locale}["${key}"] is empty`);
    }
  }
});

/* Walks config and returns the path of every { hr, en } pair. */
function pairs(value: unknown, path: string, out: [string, { hr: unknown; en: unknown }][] = []) {
  if (Array.isArray(value)) value.forEach((v, i) => pairs(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if ('hr' in o && 'en' in o && Object.keys(o).length === 2) out.push([path, o as { hr: unknown; en: unknown }]);
    else for (const [k, v] of Object.entries(o)) pairs(v, `${path}.${k}`, out);
  }
  return out;
}

test('no { hr, en } pair in src/config.ts has an empty side', () => {
  const found = pairs(config, 'config');
  assert.ok(found.length > 50, `expected many pairs, found ${found.length}`);
  for (const [path, pair] of found) {
    assert.ok(typeof pair.hr === 'string' && pair.hr.trim() !== '', `${path}.hr is empty`);
    assert.ok(typeof pair.en === 'string' && pair.en.trim() !== '', `${path}.en is empty`);
  }
});
