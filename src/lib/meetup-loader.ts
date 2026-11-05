/** The events loader: Markdown files in src/content/events/, plus the
 *  upcoming events in Meetup's iCalendar feed that have no file.
 *
 *  A file wins over the feed: an event whose file has the same `meetupUrl`
 *  (or the same id) is not added again, so an organizer can add a venue,
 *  speakers or talks by writing the file. If the feed cannot be fetched,
 *  the build goes on with the files alone and logs a warning. Set
 *  MEETUP_SYNC=off to skip the fetch (offline work, tests). */
import type { Loader } from 'astro/loaders';
import { meetupId, parseIcs, toEntry } from './meetup.ts';

export function withMeetupEvents(files: Loader, icalUrl: string): Loader {
  return {
    name: 'events-with-meetup',
    load: async (ctx) => {
      await files.load(ctx);
      if (process.env.MEETUP_SYNC === 'off') {
        ctx.logger.info('Meetup sync is off (MEETUP_SYNC=off)');
        return;
      }
      let text: string;
      try {
        const res = await fetch(icalUrl, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
      } catch (err) {
        ctx.logger.warn(`Meetup calendar not loaded (${(err as Error).message}); building with event files only`);
        return;
      }
      const known = new Set(
        ctx.store.values().map((e) => meetupId(e.data.meetupUrl as string | undefined)).filter(Boolean),
      );
      let added = 0;
      for (const event of parseIcs(text)) {
        const entry = toEntry(event);
        if (known.has(event.meetupId) || ctx.store.has(entry.id)) continue;
        const data = await ctx.parseData({ id: entry.id, data: entry.data });
        ctx.store.set({
          id: entry.id,
          data,
          body: entry.body,
          rendered: await ctx.renderMarkdown(entry.body),
          digest: ctx.generateDigest({ ...entry.data, body: entry.body }),
        });
        added++;
      }
      ctx.logger.info(`Meetup calendar: ${added} event(s) added`);
    },
  };
}
