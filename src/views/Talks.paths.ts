/** getStaticPaths for the Talks view, shared by the hr and en entry files. */
import { safeCollection } from '../lib/collections';
import { collectTalks } from '../lib/talks';
import type { Locale } from '../i18n/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function paths(_locale: Locale) {
  const events = (await safeCollection('events')).filter((e) => !e.data.draft);
  const speakers = await safeCollection('speakers');
  return [{ params: { page: undefined }, props: { talks: collectTalks(events, speakers) } }];
}
