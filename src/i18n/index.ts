/** Language helpers.
 *
 *  Croatian is served unprefixed at `/`, English under `/en/` (see the i18n
 *  block in astro.config.mjs). Paths written in config and content are
 *  locale-neutral (`/events/`); pageHref() adds the prefix for English.
 *
 *  Loaded by Node for tests and list-mocks: only `.ts` imports, no astro:*. */
import { ui, type UiKey } from './ui.ts';

export type Locale = 'hr' | 'en';
export type Pair = { hr: string; en: string };
export type PageLangRule = 'translated' | 'none' | { entryLang: Locale };
export type HeadLinks = {
  canonical: string;
  hreflang: { lang: string; href: string }[];
};

export const locales: Locale[] = ['hr', 'en'];
export const defaultLocale: Locale = 'hr';

export function getLocale(astro: { currentLocale?: string }): Locale {
  return astro.currentLocale === 'en' ? 'en' : 'hr';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'hr' : 'en';
}

export function t(locale: Locale, key: UiKey, vars?: Record<string, string | number>): string {
  let s = ui[locale][key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function pick(locale: Locale, pair: Pair): string {
  return pair[locale];
}

export function htmlLang(locale: Locale): 'hr' | 'en' {
  return locale;
}

export function intlLocale(locale: Locale): 'hr-HR' | 'en-GB' {
  return locale === 'en' ? 'en-GB' : 'hr-HR';
}

export function ogLocale(locale: Locale): 'hr_HR' | 'en_GB' {
  return locale === 'en' ? 'en_GB' : 'hr_HR';
}

/* A site-absolute page path: starts with one slash, and its last segment has
   no file extension (so /rss.xml and /fontawesome/x.css are not pages). */
function isPagePath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  const last = path.split(/[?#]/)[0].split('/').pop() ?? '';
  return !last.includes('.');
}

function stripLocale(pathname: string): string {
  if (pathname === '/en' || pathname === '/en/') return '/';
  return pathname.startsWith('/en/') ? pathname.slice(3) : pathname;
}

/** The page path for `locale`. Anything that is not a page path (external
 *  URLs, mailto:, anchors, assets, feeds) is returned unchanged. */
export function pageHref(locale: Locale, path: string): string {
  if (!isPagePath(path)) return path;
  const neutral = stripLocale(path);
  return locale === 'en' ? `/en${neutral}` : neutral;
}

/** The same page in the other language. */
export function peerHref(pathname: string): string {
  const neutral = stripLocale(pathname);
  return pathname === neutral ? `/en${neutral}` : neutral;
}

export function formatDate(date: Date, locale: Locale, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString(intlLocale(locale), { ...options, timeZone: 'Europe/Zagreb' });
}

/** Canonical and hreflang links for a page (see "Content in two languages"
 *  in the design). Translated pages point at themselves and list both
 *  languages; a single-entry page points at the copy in the entry's
 *  language and lists none; 'none' (the 404 page) emits neither. */
export function alternates(pathname: string, site: URL | string, rule: PageLangRule): HeadLinks {
  const neutral = stripLocale(pathname);
  const abs = (p: string) => new URL(p, site).href;
  if (rule === 'none') return { canonical: '', hreflang: [] };
  if (rule === 'translated') {
    return {
      canonical: abs(pathname),
      hreflang: [
        { lang: 'hr', href: abs(neutral) },
        { lang: 'en', href: abs(`/en${neutral}`) },
        { lang: 'x-default', href: abs(neutral) },
      ],
    };
  }
  return {
    canonical: abs(rule.entryLang === 'en' ? `/en${neutral}` : neutral),
    hreflang: [],
  };
}
