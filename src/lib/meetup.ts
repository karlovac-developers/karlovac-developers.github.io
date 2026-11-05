/** Meetup's public iCalendar feed, turned into event entries.
 *
 *  The feed (MEETUP_ICAL_URL in src/config.ts) lists upcoming events only,
 *  with no venue. It has the title, the start and end time in Europe/Zagreb,
 *  the Markdown description and the event URL. src/lib/meetup-loader.ts adds
 *  these events to the events collection at build time.
 *
 *  Loaded by Node for tests: only `.ts` imports, no astro:*. */

export type MeetupEvent = {
  meetupId: string;
  url: string;
  title: string;
  date: string; // YYYY-MM-DD, Zagreb time
  start?: string; // HH:MM
  end?: string; // HH:MM
  description: string; // Markdown
};

/* RFC 5545 §3.1: a line starting with a space or tab continues the previous one. */
function unfold(text: string): string[] {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
}

/* RFC 5545 §3.3.11 TEXT escapes. */
function unescapeText(s: string): string {
  return s.replace(/\\([\\;,nN])/g, (_, c: string) => (c === 'n' || c === 'N' ? '\n' : c));
}

/* 20261113T180000 -> { date: '2026-11-13', time: '18:00' }. The feed writes
   times with TZID=Europe/Zagreb, which is what the site shows. */
function localTime(v: string): { date: string; time?: string } | undefined {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return undefined;
  return { date: `${m[1]}-${m[2]}-${m[3]}`, time: m[4] ? `${m[4]}:${m[5]}` : undefined };
}

/** The Meetup event ID in an event URL, or undefined. */
export function meetupId(url: string | undefined): string | undefined {
  return url?.match(/\/events\/(\d+)/)?.[1];
}

/** Every VEVENT in an iCalendar document that has a Meetup event URL. */
export function parseIcs(text: string, groupName = 'Karlovac Developers'): MeetupEvent[] {
  const events: MeetupEvent[] = [];
  let cur: Record<string, { params: string; value: string }> | null = null;
  for (const line of unfold(text)) {
    if (line === 'BEGIN:VEVENT') { cur = {}; continue; }
    if (line === 'END:VEVENT' && cur) {
      const url = cur.URL?.value ?? '';
      const id = meetupId(url);
      const start = cur.DTSTART && localTime(cur.DTSTART.value);
      const end = cur.DTEND && localTime(cur.DTEND.value);
      if (id && start) {
        /* Meetup starts every description with the group's name on a line of its own. */
        const description = unescapeText(cur.DESCRIPTION?.value ?? '').replace(new RegExp(`^${groupName}\\n`), '').trim();
        events.push({
          meetupId: id,
          url,
          title: unescapeText(cur.SUMMARY?.value ?? '').trim(),
          date: start.date,
          start: start.time,
          end: end && end.date === start.date ? end.time : undefined,
          description,
        });
      }
      cur = null;
      continue;
    }
    if (!cur) continue;
    const m = line.match(/^([A-Z-]+)((?:;[^:]*)?):(.*)$/);
    if (m) cur[m[1]] = { params: m[2], value: m[3] };
  }
  return events;
}

/** A URL slug: lower case ASCII words joined by hyphens, at most `words` of them. */
export function slugify(s: string, words = 6): string {
  return s
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .slice(0, words)
    .join('-');
}

/** The first paragraph of a Markdown text as plain text, cut at `max` characters. */
export function summary(markdown: string, max = 200): string {
  const para = markdown.trim().split(/\n\s*\n/)[0] ?? '';
  const plain = para
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return plain.slice(0, plain.lastIndexOf(' ', max - 1)).replace(/[,;:.]$/, '') + '…';
}

/** The events-collection entry for a Meetup event. Its id is
 *  `<date>-<title slug>`, the same name an imported or hand-written file
 *  for the event gets, so turning a synced event into a file keeps its URL. */
export function toEntry(e: MeetupEvent): { id: string; data: Record<string, unknown>; body: string } {
  const data: Record<string, unknown> = {
    title: e.title,
    date: e.date,
    description: summary(e.description),
    meetupUrl: e.url,
    rsvp: e.url,
    lang: 'hr',
  };
  if (e.start) data.time = e.end ? `${e.start}–${e.end}` : e.start;
  return { id: `${e.date}-${slugify(e.title)}`, data, body: e.description };
}
