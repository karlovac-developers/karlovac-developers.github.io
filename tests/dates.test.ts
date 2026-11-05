import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUpcoming, zagrebDay } from '../src/lib/dates.ts';

/* A date-only front matter value is read as midnight UTC. */
const eventDay = new Date('2026-06-20');

test('an event yesterday is past', () => {
  assert.equal(isUpcoming(eventDay, new Date('2026-06-21T10:00:00Z')), false);
});

test('an event is upcoming at the 03:00 UTC build on its own day', () => {
  assert.equal(isUpcoming(eventDay, new Date('2026-06-20T03:00:00Z')), true);
});

test('an event is upcoming at 23:00 Zagreb time on its day (summer, UTC+2)', () => {
  assert.equal(isUpcoming(eventDay, new Date('2026-06-20T21:00:00Z')), true);
});

test('an event is past just after midnight Zagreb time (summer, UTC+2)', () => {
  assert.equal(isUpcoming(eventDay, new Date('2026-06-20T22:30:00Z')), false);
});

test('an event tomorrow is upcoming', () => {
  assert.equal(isUpcoming(eventDay, new Date('2026-06-19T12:00:00Z')), true);
});

test('the day boundary follows winter time (UTC+1)', () => {
  const winter = new Date('2027-01-14');
  assert.equal(isUpcoming(winter, new Date('2027-01-14T22:30:00Z')), true);
  assert.equal(isUpcoming(winter, new Date('2027-01-14T23:30:00Z')), false);
});

test('zagrebDay crosses the daylight-saving change', () => {
  assert.equal(zagrebDay(new Date('2026-03-28T23:30:00Z')), '2026-03-29');
  assert.equal(zagrebDay(new Date('2026-03-29T22:30:00Z')), '2026-03-30');
});
