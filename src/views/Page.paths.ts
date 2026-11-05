/** getStaticPaths for the Page view. Pages and docs live in hr/ and en/
 *  folders with the same file names; each locale builds from its own
 *  folder, and the folder prefix is stripped from the URL slug. */
import { safeCollection } from '../lib/collections';
import type { Locale } from '../i18n/index.ts';

const inLocale = (locale: Locale) => (e: { id: string }) => e.id.startsWith(`${locale}/`);
export const slugOf = (id: string) => id.slice(id.indexOf('/') + 1);

export async function paths(locale: Locale) {
  const pages = (await safeCollection('pages')).filter(inLocale(locale));
  const docs = (await safeCollection('docs')).filter(inLocale(locale));
  const bySlug = new Map(pages.map((p) => [slugOf(p.id), p]));
  return [
    ...pages.map((entry) => {
      // Nested page (policies/conduct) links back to its parent segment;
      // root pages have no parent. Label prefers the parent's shortTitle.
      const slug = slugOf(entry.id);
      const cut = slug.lastIndexOf('/');
      const parentEntry = cut > 0 ? bySlug.get(slug.slice(0, cut)) : undefined;
      const parent = parentEntry
        ? { href: `/${slugOf(parentEntry.id)}/`, label: parentEntry.data.shortTitle ?? parentEntry.data.title }
        : null;
      return { params: { slug }, props: { entry, kind: 'page', parent } };
    }),
    ...docs.map((entry) => ({ params: { slug: slugOf(entry.id) }, props: { entry, kind: 'doc', parent: null } })),
  ];
}
