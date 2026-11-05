/** getStaticPaths for the OrganizersList view, shared by the hr and en entry files. */
import { safeCollection } from '../lib/collections';
import { PAGINATION } from '../config';
import type { Locale } from '../i18n/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function paths(_locale: Locale) {
  const organizers = (await safeCollection('organizers')).sort((a, b) => a.data.weight - b.data.weight);
  const size = PAGINATION.pageSize;
  const total = Math.max(1, Math.ceil(organizers.length / size));
  return Array.from({ length: total }, (_, i) => ({
    params: { page: i === 0 ? undefined : `page/${i + 1}` },
    props: { current: i + 1, total, organizers: organizers.slice(i * size, (i + 1) * size) },
  }));
}
