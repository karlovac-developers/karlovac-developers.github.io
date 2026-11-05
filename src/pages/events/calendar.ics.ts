import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildIcs } from '../../lib/ical';
import { absoluteUrl } from '../../lib/url';
import { SITE } from '../../config';
import { safeCollection } from '../../lib/collections';
import { pick } from '../../i18n/index.ts';

/* iCalendar feed: upcoming events plus the last 90 days. A feed has one
   language, so it uses the Croatian site name. Mock events are prefixed
   "Primjer: ", since a calendar app cannot show the mock label. */
export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://example.com');
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const events = (await getCollection('events'))
    .filter((e) => !e.data.draft && +e.data.date >= cutoff)
    .sort((a, b) => +a.data.date - +b.data.date);
  const venues = await safeCollection('venues');
  const duration = (SITE as Record<string, any>).events?.defaultDurationMinutes ?? 120;
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const body = buildIcs(
    events.map((e) => {
      const v = e.data.venueRef ? venues.find((x) => x.id === e.data.venueRef) : undefined;
      return {
        title: e.data.mock ? `Primjer: ${e.data.title}` : e.data.title,
        date: e.data.date,
        time: e.data.time,
        description: (e.data.description ?? '').trim(),
        checkin: e.data.checkin,
        cancelled: e.data.cancelled,
        venue: v ? { name: v.data.title, address: v.data.address } : (e.data.venue ? { name: e.data.venue } : undefined),
        permalink: absoluteUrl(`/events/${e.id}/`, origin),
      };
    }),
    { siteTitle: pick('hr', SITE.title), dtstamp, durationMinutes: duration },
  );
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
