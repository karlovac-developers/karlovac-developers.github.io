/** getStaticPaths for the Post view, shared by the hr and en entry files. */
import { safeCollection } from '../lib/collections';
import type { Locale } from '../i18n/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function paths(_locale: Locale) {
  const posts = (await safeCollection('blog')).filter((p) => !p.data.draft);
  /* PARITY.md pins the ordering: date desc, then title, then id, matching
     Hugo's section order (posts must not set weight). next = newer. */
  const cmp = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
  const sorted = [...posts].sort(
    (a, b) => +b.data.date - +a.data.date || cmp(a.data.title, b.data.title) || cmp(a.id, b.id),
  );
  return sorted.map((post, i) => ({
    params: { slug: post.id },
    props: { post, newer: sorted[i - 1], older: sorted[i + 1] },
  }));
}
