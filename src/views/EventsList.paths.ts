/** getStaticPaths for the EventsList view, shared by the hr and en entry files. */
import { safeCollection } from '../lib/collections';
import { PAGINATION } from '../config';
import type { Locale } from '../i18n/index.ts';
import { isUpcoming } from '../lib/dates.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function paths(_locale: Locale) {
  const now = new Date();
  const all = (await safeCollection('events')).filter((e) => !e.data.draft);
  const upcoming = all.filter((e) => isUpcoming(e.data.date, now)).sort((a, b) => +a.data.date - +b.data.date);
  const past = all.filter((e) => !isUpcoming(e.data.date, now)).sort((a, b) => +b.data.date - +a.data.date);
  const size = PAGINATION.pageSize;
  const total = Math.max(1, Math.ceil(past.length / size));
  return Array.from({ length: total }, (_, i) => ({
    params: { page: i === 0 ? undefined : `page/${i + 1}` },
    props: { current: i + 1, total, upcoming, past: past.slice(i * size, (i + 1) * size) },
  }));
}
