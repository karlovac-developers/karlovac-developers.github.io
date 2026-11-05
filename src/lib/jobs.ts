/** Job wall rules: which postings show, in which order.
 *
 *  Real postings show for JOBS_EXPIRY_DAYS whole days after `posted` (a
 *  posting on day 60 still shows). Mock postings never expire.
 *
 *  Loaded by Node for tests: only `.ts` imports. */
import { JOBS_EXPIRY_DAYS } from '../config.ts';

const DAY_MS = 86_400_000;

export function isLive(posted: Date, now: Date, days: number = JOBS_EXPIRY_DAYS): boolean {
  return Math.floor((+now - +posted) / DAY_MS) <= days;
}

type Job = { data: { posted: Date; mock: boolean } };

export function visibleJobs<T extends Job>(jobs: T[], now: Date): T[] {
  return jobs
    .filter((j) => j.data.mock || isLive(j.data.posted, now))
    .sort((a, b) => +b.data.posted - +a.data.posted);
}
