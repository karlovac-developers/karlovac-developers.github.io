import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLive, visibleJobs } from '../src/lib/jobs.ts';

const now = new Date('2026-11-05T03:00:00Z');
const daysAgo = (n: number) => new Date(+now - n * 86_400_000);

test('a posting is live on day 59 and day 60', () => {
  assert.equal(isLive(daysAgo(59), now), true);
  assert.equal(isLive(daysAgo(60), now), true);
});

test('a posting expires on day 61', () => {
  assert.equal(isLive(daysAgo(61), now), false);
});

test('mocks never expire, real postings do, newest first', () => {
  const jobs = [
    { id: 'old-real', data: { posted: daysAgo(61), mock: false } },
    { id: 'old-mock', data: { posted: daysAgo(400), mock: true } },
    { id: 'new-real', data: { posted: daysAgo(1), mock: false } },
  ];
  assert.deepEqual(visibleJobs(jobs, now).map((j) => j.id), ['new-real', 'old-mock']);
});
