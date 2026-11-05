#!/usr/bin/env node
/** The parts of the site that change without a commit: which event files
 *  are upcoming, which job postings are visible, and Meetup's upcoming
 *  events. The deploy writes this to dist/build-state.json; the scheduled
 *  check compares it with the live copy and rebuilds only when it differs.
 *
 *  Usage:
 *    node scripts/build-state.mjs              print the state as JSON
 *    node scripts/build-state.mjs --compare URL
 *        compare with the state at URL; print changed=true|false (also to
 *        $GITHUB_OUTPUT when set) and the reason */
import { readdirSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const lib = (p) => import(pathToFileURL(join(root, p)).href);
const { isUpcoming } = await lib('src/lib/dates.ts');
const { visibleJobs } = await lib('src/lib/jobs.ts');
const { parseIcs } = await lib('src/lib/meetup.ts');
const { MEETUP_ICAL_URL } = await lib('src/config.ts');

/* The `date` and `draft` front-matter fields of an event file. */
function frontMatter(text) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const field = (k) => fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]+)`, 'm'))?.[1]?.trim();
  return { date: field('date'), draft: field('draft') === 'true' };
}

/** The state for `now`. `ics` is Meetup's feed, or null when it could not
 *  be fetched (the Meetup part is then null and ignored by compare()). */
export function buildState(dir, now, ics) {
  const eventsDir = join(dir, 'src/content/events');
  const upcoming = readdirSync(eventsDir)
    .filter((f) => /\.mdx?$/.test(f))
    .filter((f) => {
      const { date, draft } = frontMatter(readFileSync(join(eventsDir, f), 'utf8'));
      return !draft && date && isUpcoming(new Date(date), now);
    })
    .map((f) => f.replace(/\.mdx?$/, ''))
    .sort();
  const jobsFile = join(dir, 'src/data/jobs.json');
  const jobs = existsSync(jobsFile)
    ? visibleJobs(JSON.parse(readFileSync(jobsFile, 'utf8')).map((j) => ({ ...j, data: { posted: new Date(j.posted), mock: !!j.mock } })), now).map((j) => j.id).sort()
    : [];
  const meetup = ics === null
    ? null
    : parseIcs(ics)
        .filter((e) => isUpcoming(new Date(e.date), now))
        .map((e) => `${e.meetupId} ${e.date} ${e.start ?? ''}-${e.end ?? ''} ${e.title} ${createHash('sha256').update(e.description).digest('hex').slice(0, 12)}`)
        .sort();
  return { upcoming, jobs, meetup };
}

/** Why `current` differs from `live`, or null when it does not. */
export function compare(current, live) {
  if (!live) return 'no live state';
  for (const key of ['upcoming', 'jobs', 'meetup']) {
    if (key === 'meetup' && current.meetup === null) continue;
    if (JSON.stringify(current[key]) !== JSON.stringify(live[key])) return `${key} changed`;
  }
  return null;
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ics = process.env.MEETUP_SYNC === 'off' ? null : await fetchText(MEETUP_ICAL_URL);
  const current = buildState(root, new Date(), ics);
  const i = process.argv.indexOf('--compare');
  if (i === -1) {
    console.log(JSON.stringify(current, null, 2));
  } else {
    const text = await fetchText(process.argv[i + 1]);
    let live = null;
    try { live = text && JSON.parse(text); } catch { /* treated as missing */ }
    if (ics === null) console.log('Meetup calendar not loaded; comparing event files and jobs only');
    const reason = compare(current, live);
    console.log(reason ? `changed=true (${reason})` : 'changed=false');
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${!!reason}\n`);
  }
}
