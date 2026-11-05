/** getStaticPaths for the Organizer view, shared by the hr and en entry files. */
import { safeCollection } from '../lib/collections';
import type { Locale } from '../i18n/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function paths(_locale: Locale) {
  const organizers = await safeCollection('organizers');
  return organizers.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}
