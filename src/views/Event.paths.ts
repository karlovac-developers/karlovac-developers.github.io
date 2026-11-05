/** getStaticPaths for the Event view, shared by the hr and en entry files. */
import { safeCollection } from '../lib/collections';
import type { Locale } from '../i18n/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function paths(_locale: Locale) {
  const events = (await safeCollection('events')).filter((e) => !e.data.draft);
  return events.map((event) => ({ params: { slug: event.id }, props: { event } }));
}
