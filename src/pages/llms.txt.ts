import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl } from '../lib/url';
import { SITE, FEATURES, MEETUP_URL } from '../config';
import { pick, formatDate } from '../i18n/index.ts';
import { isUpcoming } from '../lib/dates.ts';

/* llms.txt: a build-time plain-text summary for AI agents (adapted from the
   theme, see THEME.md). Written in English, linking the English pages. Names
   the next upcoming event, prefixed "Primjer: " when it is a mock. */
export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => absoluteUrl(p, site);
  const now = new Date();

  const events = (await getCollection('events'))
    .filter((e) => !e.data.draft)
    .sort((a, b) => +a.data.date - +b.data.date);
  const next = events.find((e) => isUpcoming(e.data.date, now));

  const pageIds = new Set((await getCollection('pages')).map((p) => p.id));
  const fmt = (d: Date) => formatDate(d, 'en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const title = (e: NonNullable<typeof next>) => (e.data.mock ? `Primjer: ${e.data.title}` : e.data.title);

  const lines: string[] = [`# ${pick('en', SITE.title)}`, '', pick('en', SITE.description), ''];
  lines.push(
    next
      ? `Next event: ${title(next)} on ${fmt(next.data.date)}${next.data.time ? `, ${next.data.time}` : ''} (${abs(`/en/events/${next.id}/`)})`
      : 'No upcoming events are scheduled right now.',
    '',
  );
  lines.push(`Join the community on Meetup: ${MEETUP_URL}`, '');
  lines.push('## Links');
  if (pageIds.has('en/start')) lines.push(`Start here (newcomers): ${abs('/en/start/')}`);
  if (pageIds.has('en/about')) lines.push(`About: ${abs('/en/about/')}`);
  lines.push(`Events: ${abs('/en/events/')}`);
  if (FEATURES.calendar) lines.push(`Calendar feed (iCalendar): ${abs('/events/calendar.ics')}`);
  if (FEATURES.talks) lines.push(`Talk archive: ${abs('/en/talks/')}`);
  if (FEATURES.jobs) lines.push(`Jobs: ${abs('/en/jobs/')}`);
  lines.push('', 'The same pages exist in Croatian without the /en prefix.', 'Built with the Popular theme.');

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
