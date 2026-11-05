# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Karlovac Developers meetup site: an Astro 7 static site built from the Popular theme, served in Croatian at `/` and English at `/en/`. GitHub Actions builds, checks and deploys it to GitHub Pages (`.github/workflows/deploy.yml`). The design is `docs/designs/astro-popular-migration.md`; every change to theme files is recorded in `THEME.md`.

## Commands

```bash
npm run dev       # dev server (Astro 7 runs it detached; stop with `npx astro dev stop`)
npm run build     # static site in dist/
npm run check     # astro check, node --test, alt-text, JSON-LD and link checks (needs a build first)
npm run mocks     # list every mock and placeholder
```

Node 22.18+ (type stripping runs the `.ts` tests without a flag). TypeScript is pinned to `^5`: TypeScript 6 turns `strict` on, which the theme's code does not pass.

## Architecture

### Routes: views plus twin entry files

Page logic lives in `src/views/<Name>.astro`. Dynamic routes keep their `getStaticPaths` in `src/views/<Name>.paths.ts` as `paths(locale)`. Each route has two entry files of a few lines, one under `src/pages/` and one under `src/pages/en/`, which render the view and export `getStaticPaths = () => paths('hr' | 'en')`. When adding a route, add both entry files. Feeds and text endpoints (`rss.xml.js`, `events/calendar.ics.ts`, `llms.txt.ts`, `robots.txt.ts`) and `404.astro` exist once, without an `en/` twin.

### Language

*   Interface text comes from `t(locale, key)` (dictionaries in `src/i18n/ui.ts`) or `pick(locale, pair)` (`{ hr, en }` pairs in `src/config.ts`). Never write user-facing text as a literal in a view or component. A new key goes in both `ui.hr` and `ui.en`; `astro check` fails on a missing key and `tests/i18n.test.ts` on an empty one.
*   Get the locale with `getLocale(Astro)`. Build links to pages with `pageHref(locale, '/path/')`; it leaves external URLs, `mailto:`, anchors and files (anything with an extension) unchanged. Format dates with `formatDate()`, which always uses Europe/Zagreb.
*   Pages and docs live in `src/content/{pages,docs}/{hr,en}/` with the same file names. English MDX links start with `/en/`; Croatian ones do not.
*   Submitted collections (events, blog, authors, speakers, venues, organizers, jobs) are written once, with a `lang` field, and render under both locales. Put `lang` on the entry's own text only, never on badges or labels. Single-entry views pass `langRule={{ entryLang }}` to `BaseLayout`, which points the canonical at the copy in the entry's language. An entry body shown in the other language is wrapped in `data-entry-lang`, so `check-links.mjs` lets its links point at its own language.
*   Events are upcoming until the end of their day in Zagreb: use `isUpcoming()` from `src/lib/dates.ts`, never `date >= now`.

### Feature flags

`FEATURES` in `src/config.ts` hides navigation, footer, home and component links to a feature. Routes are not flagged: a route exists only while its entry files exist. To turn a feature off, set the flag and delete its entry files (README has the list). All collections stay registered in `src/content.config.ts`.

### Mock content

Every mock carries `mock: true` and shows `<MockBadge />`; mock pages and docs show a warning callout; feeds prefix mock titles with "Primjer: ". Mock people's surname is "Primjer", mock venues are "… Primjer", mock companies are "Primjer d.o.o.", and contact addresses use `example.com`. Never use a real person, venue or company in mock content.

### Job wall

`src/data/jobs.json` is the `jobs` collection (zod schema in `src/content.config.ts`; `link` must be `https:` or `mailto:`). `src/lib/jobs.ts` hides real postings after `JOBS_EXPIRY_DAYS` (60) whole days and never hides mocks. The kind filter is `public/scripts/jobs-filter.js`. The 60 days also appear in the `jobs.how.p` and `jobs.rules.li4` strings.

### Node-loaded files

`src/config.ts`, `src/i18n/*.ts`, `src/lib/dates.ts` and `src/lib/jobs.ts` are loaded by Node for tests and `list-mocks`. They import only other `.ts` files, with explicit `.ts` extensions, use `as` (not `<T>`) for type assertions, and never import `astro:*`.

### Theme files

Most of `src/components`, `src/lib`, `src/styles` and `public/` is the theme's code. Site-specific styles go in `src/styles/site.css`, not in the theme's stylesheets. Every change to a theme file gets a row in `THEME.md`.
