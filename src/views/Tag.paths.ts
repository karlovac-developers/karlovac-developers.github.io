/** getStaticPaths for the Tag view, shared by the hr and en entry files. */
import { PAGINATION } from '../config';
import { tagSlug } from '../lib/slugs';
import { safeCollection } from '../lib/collections';
import type { Locale } from '../i18n/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function paths(_locale: Locale) {
  const posts = (await safeCollection('blog')).filter((p) => !p.data.draft);
  const labels = new Map(); // slug -> first-seen tag spelling
  for (const p of posts) for (const t of p.data.tags) {
    const slug = tagSlug(t);
    if (!labels.has(slug)) labels.set(slug, t);
  }
  const size = PAGINATION.pageSize;
  return [...labels.entries()].flatMap(([slug, label]) => {
    const tagged = posts
      .filter((p) => p.data.tags.some((t) => tagSlug(t) === slug))
      .sort((a, b) => +b.data.date - +a.data.date);
    const total = Math.max(1, Math.ceil(tagged.length / size));
    return Array.from({ length: total }, (_, i) => ({
      params: { tag: slug, page: i === 0 ? undefined : `page/${i + 1}` },
      props: { label, current: i + 1, total, count: tagged.length, posts: tagged.slice(i * size, (i + 1) * size) },
    }));
  });
}
