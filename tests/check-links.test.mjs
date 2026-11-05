import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDist } from '../scripts/check-links.mjs';

const fixture = (name) => new URL(`./fixtures/${name}/`, import.meta.url).pathname;

test('a clean build passes, including other-language entry bodies', () => {
  assert.deepEqual(checkDist(fixture('dist-ok')), []);
});

test('a missing target fails', () => {
  const problems = checkDist(fixture('dist-broken'));
  assert.equal(problems.length, 2);
  assert.match(problems[0], /broken link \/missing\//);
});

test('an English page linking to a Croatian page without hreflang fails', () => {
  assert.deepEqual(checkDist(fixture('dist-crossing')), ['/en/: links out of English to /about/']);
});
