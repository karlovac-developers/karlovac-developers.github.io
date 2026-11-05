/** getStaticPaths for the BlogList view, shared by the hr and en entry files. */
import { safeCollection } from '../lib/collections';
import { PAGINATION } from '../config';
import type { Locale } from '../i18n/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function paths(_locale: Locale) {
  const posts = (await safeCollection('blog')).filter((p) => !p.data.draft).sort((a, b) => +b.data.date - +a.data.date);
  const size = PAGINATION.pageSize;
  const total = Math.max(1, Math.ceil(posts.length / size));
  const tags = [...new Set(posts.flatMap((p) => p.data.tags))];
  return Array.from({ length: total }, (_, i) => ({
    params: { page: i === 0 ? undefined : `page/${i + 1}` },
    props: { current: i + 1, total, posts: posts.slice(i * size, (i + 1) * size), tags },
  }));
}
