import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildState, compare } from '../scripts/build-state.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const ics = readFileSync(new URL('./fixtures/meetup.ics', import.meta.url), 'utf8');

test('the Meetup event counts until the end of its day', () => {
  assert.equal(buildState(root, new Date('2026-11-13T20:00:00Z'), ics).meetup.length, 1);
  assert.equal(buildState(root, new Date('2026-11-13T23:30:00Z'), ics).meetup.length, 0);
});

test('the state changes when a day passes an event', () => {
  const before = buildState(root, new Date('2026-11-13T20:00:00Z'), ics);
  const after = buildState(root, new Date('2026-11-14T03:00:00Z'), ics);
  assert.equal(compare(after, before), 'meetup changed');
  assert.equal(compare(before, before), null);
});

test('an unreachable Meetup feed does not trigger a rebuild', () => {
  const now = new Date('2026-11-06T03:00:00Z');
  const live = buildState(root, now, ics);
  assert.equal(compare(buildState(root, now, null), live), null);
});

test('a missing live state triggers a rebuild', () => {
  assert.equal(compare(buildState(root, new Date(), ics), null), 'no live state');
});
