# Karlovac Developers site on the Astro "Popular" theme, in Croatian and English

*   **Author:** Marko Filipović
*   **Status:** Implemented on branch `astro-migration` (2026-11-05); see Implementation notes
*   **Date:** 2026-11-05
*   **Brief:** [astro-popular-migration-brief.md](./astro-popular-migration-brief.md)
    (decisions 1–37 are cited as "decision N")
*   **Review:** [review/consolidated_review_report.md](./review/consolidated_review_report.md)

--------------------------------------------------------------------------------

## Overview

This design replaces the whole karlovac-developers.github.io site, in one
release, with a new Astro project built from the
[Popular theme](https://github.com/mariatta/astro-theme-popular) (MIT
licence). Popular is a theme for meetups and small communities. It has a home
page built from sections, events split into upcoming and past, a blog, talks,
speakers, venues, organizers, a handbook, and pages written in MDX.

The theme's source is copied into this repository as ordinary project files and
edited from there. It is not installed as an npm package (decision 13). The
site uses Astro's built-in language routing, with Croatian at `/` and English
at `/en/` (decision 3). Every piece of fixed page text exists in both
languages. Content that people submit or write once (events, job postings,
blog posts, speaker bios) stays in the language it was written in and is shown
inside the interface of whichever language the visitor chose (decisions 4 and
12).

Version 1 turns on every theme feature (decision 32) and keeps every feature
the current site has. Where real content does not exist yet, v1 ships mock
content that is labelled on the page and listed on every build (decisions 20
and 37).

GitHub Actions builds the site on every push to `main` and once a day, and
deploys it to GitHub Pages as static files. Rollback is to a `live-static`
branch at the commit that is live today (decision 36).

## Glossary

*   **Popular:** the Astro theme this site is built from.
*   **The owner:** the maintainer of this site, who made the decisions in the
    brief.
*   **CroMesh Meetup #2:** a past Karlovac Developers meetup (28 February 2026).
*   **Korana:** the river in Karlovac. "Roštilj na Korani" ("barbecue on the
    Korana") was a community day on 20 June 2026. Its one-off poster page,
    `rostilj/`, is not carried over.
*   **Unconference:** a meetup format where attendees set the agenda on the
    day. The current site has a guide to running one.
*   **Twin:** the same route or page in the other language.
*   **Mock:** placeholder content marked `mock: true`, shown with a visible
    label, and listed by `npm run mocks`.
*   **Theme config objects:** `SITE` (name, description), `NAV` (header
    menu), `CTA` (header button), `FOOTER`, `SECTIONS` (list-page headers),
    `HOME` (home page sections), `SOCIAL` (social links) and `BRAND` (colours
    and fonts), all in `src/config.ts`.
*   **Sätteri:** Astro 7's default Markdown processor.

## The Problem

The current site has four limitations:

*   **Every page repeats the same header, footer, fonts and favicon.** A change
    to the navigation means editing five HTML files by hand, and nothing
    catches a page that was missed.
*   **Translation happens in the browser after the page loads.** The Croatian
    text is written into the HTML and then overwritten by `translations.js`.
    If the inline copy and the dictionary drift apart, the page visibly
    changes on load. Search engines and link previews only see Croatian, and
    English pages have no URL of their own.
*   **There is no structure for the things a meetup site needs next.** Events
    are a hard-coded card on the home page. There is no list of past events,
    no talks, speakers, venues or organizers, no blog, and no Code of
    Conduct.
*   **Content has no validation.** A typo in `jobs.json` shows up only as a
    broken or missing card in a visitor's browser.

Popular has the structure the site is missing: content collections checked
against schemas, a composable home page, event, talk and speaker pages, and a
configuration file for branding. It supports only one language, so most of
this design is about making it bilingual and fitting the current site's
features into it.

The site has no regular users today (decision 1). That is why it can be
replaced in one release, its URLs can change, and mock content can be shown
publicly as long as it is labelled.

## Goals

*   **Both languages, one site.** Every page exists at a Croatian URL under `/`
    and an English URL under `/en/`, built from one view per route. `npm run
    check` fails if any dictionary key is missing or empty in either
    language.
*   **The language switcher always lands on the same page in the other
    language.** `npm run check` fails if any switcher link is broken.
*   **Untranslated content is marked.** When an event, post or job posting
    written in one language appears on a page in the other, its text carries
    its own `lang` attribute, so screen readers pronounce it correctly. Pages
    that render one such entry point their canonical link at the copy in the
    entry's language.
*   **These current-site features are rebuilt:** home page with the next
    event, give a talk, host a meetup, the unconference guide, the job wall
    with its hiring/available filter and 60-day expiry, the hero photo
    carousel, and the language switch. Each exists in both languages.
*   **Every theme feature works in both languages:** blog with tags and RSS,
    authors, talks, speakers, venues, organizers, handbook and runbooks with
    checklists, the calendar feed, `llms.txt`, and the stats and testimonials
    home sections.
*   **Mock content is labelled and listed.** Every mock shows a "Primjer"
    label on Croatian pages and an "Example" label on English pages. Mock
    titles in the RSS and calendar feeds start with "Primjer: ". `npm run
    mocks` lists every mock and placeholder URL.
*   **Features can be turned off later without restoring code.** Each feature
    has a flag in `src/config.ts`.
*   **The brand can be changed in one place.** v1 uses the theme's default
    look with the Exo 2 heading font, which supports Croatian letters (č, ć,
    đ, š, ž). Colours and fonts change through `BRAND`.
*   **Deploys are automatic and reversible.** A push to `main` builds,
    checks and deploys. A daily build keeps "next event" and job expiry
    current. A documented rollback restores today's site.
*   **The repository documents itself.** README.md and CLAUDE.md describe the
    project, the translation, flag and mock rules, and the deploy. THEME.md
    records the theme's upstream commit and every local change.

## Non-Goals

*   **Translating submitted content.** Events, job postings, blog posts and
    speaker bios appear in the language they were written in.
*   **Keeping the old URLs, design or code.** `translations.js`, `jobs.js`
    and `style.css` are not reused. Their text and the `jobs.json` data are
    used as source text. No redirects are set up from old URLs.
*   **Receiving theme updates through npm.** The theme becomes this project's
    code. Upstream changes are copied by hand (see Risks).
*   **Choosing the language automatically.** GitHub Pages cannot redirect by
    browser language, and remembering the last choice is not part of v1.
*   **A custom brand.** No logo or colours of Karlovac Developers' own in v1.
    The current "KD" favicon is kept, and the brand name shows as text.
*   **Real content where none exists.** The design ships labelled mocks and a
    way to replace them, not real posts, speakers, photos or a Code of
    Conduct.
*   **The rostilj poster page.** Its information becomes an event entry.
*   **Calendar files per event, search, analytics, Meetup.com sync, job
    submission through GitHub issues.**

## Open Questions

None. Two facts are confirmed during phase 1 rather than assumed, and each has
a fallback written into the plan:

*   That an entry file can export `getStaticPaths` as a constant imported
    from a `.ts` module (the documented
    `export const getStaticPaths = (…) satisfies GetStaticPaths` form).
*   That Astro 7's `file()` loader reads `src/data/*.json` as documented.

## Critical User Journeys (CUJs)

Each journey is one acceptance check. "Both locales" means the check passes at
the `/…` URL and at the `/en/…` URL.

### CUJ 1: A visitor reads the site in either language

*   **Given**: the site is deployed.
*   **When**: a visitor opens `/`, then uses the language switcher.
*   **Then**: `/` has `<html lang="hr">` and all interface text in Croatian,
    including the `<title>`. The switcher leads to `/en/`, which has
    `<html lang="en">` and all interface text in English. Every page link on
    `/en/` stays under `/en/`, and every page link on `/` stays outside it,
    apart from the switcher.

### CUJ 2: The switcher keeps the visitor on the same page

*   **Given**: a visitor is on any page, for example `/give-a-talk/` or an
    event page.
*   **When**: they press the switcher.
*   **Then**: they land on the same page in the other language. The 404 page
    has no switcher, because it already links to both home pages.

### CUJ 3: A visitor sees upcoming and past events

*   **Given**: the events collection holds two real past events (CroMesh
    Meetup #2, Roštilj na Korani) and two mock upcoming events.
*   **When**: a visitor opens the home page and `/events/`.
*   **Then**: the home page shows the nearest mock event as "next event",
    with a mock label. `/events/` lists both mock events under "upcoming" and
    both real events under "past". Each event page opens in both locales. A
    Croatian event's text has `lang="hr"` on `/en/`, and both copies point
    their canonical at the `/` copy. Dates are shown in the page's language,
    in Europe/Zagreb time.

### CUJ 4: An event is still "next" on its own day

*   **Given**: an event dated today, and a build at 03:00 UTC.
*   **When**: a visitor opens the home page that morning.
*   **Then**: the event is still shown as the next event. It moves to "past"
    with the first build after midnight Europe/Zagreb.

### CUJ 5: A visitor reads a translated page

*   **Given**: the about, give-a-talk, host-a-meetup, unconference, get
    involved, start here and Code of Conduct pages, and the handbook and
    runbooks, exist in `hr` and `en`.
*   **When**: a visitor opens any of them in either locale.
*   **Then**: the page is fully in that language. It carries `hreflang="hr"`,
    `hreflang="en"` and `hreflang="x-default"` links, and its canonical
    points to itself.

### CUJ 6: A visitor reads a mock page

*   **Given**: the Code of Conduct, handbook, runbooks, start here and get
    involved pages are mocks.
*   **When**: a visitor opens one in either locale.
*   **Then**: a warning callout at the top says, in the page's language,
    that this is example text that has not been adopted.

### CUJ 7: A visitor browses the job wall

*   **Given**: `src/data/jobs.json` holds the five mock postings, all marked
    `mock: true`, with `posted` dates more than 60 days old.
*   **When**: a visitor opens `/jobs/` and uses the hiring/available filter.
*   **Then**: all five mock postings are shown, each with a mock label.
    Postings marked `mock: true` never expire. The filter shows only the
    chosen kind and updates the count text in the page's language. Without
    JavaScript, all postings are shown and the filter is hidden. The "post a
    job" button is labelled as a mock and has no link. The home page shows
    the first two postings and a link to `/jobs/`.

### CUJ 8: A real posting expires

*   **Given**: a real posting (no `mock` field) posted 61 days before the
    build date, and one posted 60 days before.
*   **When**: the daily build runs.
*   **Then**: the 61-day posting is gone from the job wall and the home page.
    The 60-day posting is still shown.

### CUJ 9: A visitor sees the hero photos

*   **Given**: the photo manifest lists three mock photos with alt text in
    both languages, a source URL and a licence.
*   **When**: a visitor opens the home page in either locale.
*   **Then**: the hero shows the photos one at a time, every 4 seconds, each
    captioned as an illustrative photo with a mock label. A visible pause/play
    button, reachable with the keyboard and labelled in the page's language,
    stops and restarts the rotation. With `prefers-reduced-motion: reduce`,
    the rotation starts paused. Without JavaScript, only the first photo is
    shown.

### CUJ 10: A feed reader sees mocks marked

*   **Given**: the blog has mock posts and the events have mock events.
*   **When**: a reader subscribes to `/rss.xml` or `/events/calendar.ics`.
*   **Then**: each mock item's title starts with "Primjer: ".

### CUJ 11: A maintainer turns a feature off

*   **Given**: `FEATURES.venues` is `true`.
*   **When**: the maintainer sets it to `false` and deletes the
    `venues/` entry files under `src/pages/` and `src/pages/en/`.
*   **Then**: no venue pages are built, venues disappear from navigation,
    footer and event pages, and `npm run check` passes.

### CUJ 12: A maintainer finds every mock

*   **Given**: the site contains mocks.
*   **When**: CI runs `npm run mocks`.
*   **Then**: the log lists each mock entry and each placeholder URL with its
    file path. The run never fails.

### CUJ 13: A maintainer deploys and rolls back

*   **Given**: the Pages source is set to GitHub Actions.
*   **When**: a commit is pushed to `main`.
*   **Then**: the workflow builds, runs the checks and tests, and deploys. If
    a rollback is needed, disabling the workflow and setting the Pages source
    to the `live-static` branch serves today's site.

## Technical Plan (Architecture)

### Starting point

The theme repository at commit `d1554d5e95ec11b7dbc42cbb2dad7327494cfe19`
(v0.13.0, 2026-10-05) holds the theme twice: as a plain Astro project in its
top-level `src/`, `public/`, `astro.config.mjs` and `popular-markdown.mjs`,
and as an npm package in `package/`. This design starts from the plain
project. The theme's demo content, demo sites, npm package, Hugo templates and
Python import scripts are not copied (the exact list is in phase 1 of the
plan). `THEME.md` records the upstream commit, the MIT licence and every local
change.

The theme targets Astro 7. Astro 7's upgrade guide lists no changes to i18n
routing. Its new default Markdown processor, Sätteri, is already handled by
the theme's `popular-markdown.mjs`.

The theme has never been run through `astro check`. Phase 1 runs it once on
the unchanged copy and fixes every error before any other change.

### Data flow

```text
 src/config.ts             src/i18n/               src/content/ + src/data/
 FEATURES, BRAND,          ui.ts: hr/en            pages/{hr,en}, docs/{hr,en},
 text as {hr, en} pairs    index.ts: t(), pick(),  events, blog, speakers, ...,
                           getLocale(), hrefs      jobs.json, hero-photos.json
        │                         │                        │ zod schemas
        ▼                         ▼                        ▼ content.config.ts
 ┌──────────────────────────────────────────────────────────────────────┐
 │ src/views/<Route>.astro   one view per route, reads the locale         │
 │ src/views/<Route>.paths.ts getStaticPaths(locale) for dynamic routes   │
 └──────────────────────────────────────────────────────────────────────┘
        ▲ imports                                        ▲ imports
 src/pages/<route>.astro  (hr, unprefixed)     src/pages/en/<route>.astro
        │                                                │
        └───────────────────── astro build ──────────────┘
                                   │
          dist/ ──► npm run check (types, tests, alt text, JSON-LD, links)
                                   │
          GitHub Actions deploy-pages ──► karlovac-developers.github.io
          (push to main, and daily at 03:00 UTC)
```

### Language routing

`astro.config.mjs` sets `site: 'https://karlovac-developers.github.io'`,
`base: '/'`, `trailingSlash: 'always'`, and
`i18n: { defaultLocale: 'hr', locales: ['hr', 'en'], routing: { prefixDefaultLocale: false } }`.
No i18n fallback is configured.

Each route has:

*   one view component in `src/views/` with the page's markup and logic;
*   for dynamic routes, a `paths.ts` module whose `getStaticPaths(locale)`
    returns the route's params for that locale;
*   two entry files of a few lines, one under `src/pages/` and one under
    `src/pages/en/`, which render the view and export
    `getStaticPaths = () => paths('hr')` or `paths('en')`.

Passing the locale into `getStaticPaths` is what lets the page route read
`hr/` entries for Croatian and `en/` entries for English, since
`getStaticPaths` has no `Astro.currentLocale`. If phase 1 shows Astro does not
accept a `getStaticPaths` constant built from an import, each entry file
declares `export async function getStaticPaths() { return paths('en'); }`
instead.

Route paths are English in both locales (`/events/` and `/en/events/`,
decision 26), so the switcher only adds or removes the `/en` prefix. The
cost: Croatian visitors see English words in their URLs.

The feeds and text endpoints (`rss.xml`, `events/calendar.ics`, `llms.txt`,
`robots.txt`) and the `404` page exist once, not per locale.

### Translating text

*   **Dictionaries.** `src/i18n/ui.ts` exports `ui = { hr: {...}, en: {...} }`.
    The `en` object is typed as `Record<keyof typeof ui.hr, string>`, so a key
    missing on either side fails `astro check`. A test fails on any empty
    value. The dictionaries start from the theme's 79 `STRINGS` keys and the
    current site's `jobs.*` keys (names kept as they are), plus the new keys
    listed in plan item 2.2.
*   **Config text.** Every text field in `SITE`, `NAV`, `CTA`, `FOOTER`,
    `SECTIONS` and `HOME` is a `{ hr, en }` pair. URLs, icons, flags,
    `SOCIAL` and `BRAND` are single values.
*   **Helpers** in `src/i18n/index.ts`:

    ```ts
    type Locale = 'hr' | 'en';
    type Pair = { hr: string; en: string };
    getLocale(astro: { currentLocale?: string }): Locale   // 'hr' unless 'en'
    t(locale: Locale, key: keyof typeof ui.hr, vars?: Record<string, string | number>): string
    pick(locale: Locale, pair: Pair): string
    htmlLang(locale): 'hr' | 'en'
    intlLocale(locale): 'hr-HR' | 'en-GB'          // for Intl date formatting
    ogLocale(locale): 'hr_HR' | 'en_GB'
    pageHref(locale, path: string): string          // see below
    peerHref(pathname: string): string              // adds or removes /en
    formatDate(date: Date, locale, options: Intl.DateTimeFormatOptions): string
    alternates(pathname: string, site: URL, rule: PageLangRule): HeadLinks
    ```

*   **`pageHref`** applies only to site-absolute page paths (starting with
    `/` and not a file such as `/rss.xml`). It returns the path under `/en/`
    for English. Everything else (external URLs, `mailto:`, anchors, assets,
    feeds) passes through unchanged. Asset paths keep the theme's
    `withBase()`. Since `base` is `/`, no second base prefix is applied.
*   **How components get the locale.** Views call
    `getLocale(Astro)`. Components called from a view receive `locale` as a
    prop. `BaseLayout`, `Header`, `Footer` and `LangSwitch` call
    `getLocale(Astro)` themselves.
*   **Hard-coded English in the theme** is replaced by keys: the
    `title="Events"` in `events/[...page].astro`, "The team", "Meet the
    organizers", "All organizers" and the `'Community'` fallback in
    `index.astro`. Phase 3 lists any others found by the CUJ 1 walk-through.
*   **Client scripts** get their strings from `data-` attributes written in
    the page's language, as the theme already does for `copy-code.js` and
    `checklist.js`.
*   **Node-loaded files.** `ui.ts`, `config.ts` and `src/lib/{dates,jobs}.ts`
    are also loaded by Node for tests and `list-mocks`. They import only
    other `.ts` files, with explicit `.ts` extensions, use `import type` for
    types, and never import `astro:*` modules.

### Content in two languages

The rule: **a page is untranslated only if it renders a single submitted
entry.** Lists of submitted entries are translated pages that happen to
contain entries in various languages.

| Page | Canonical | hreflang | `lang` on entry text | Sitemap |
| --- | --- | --- | --- | --- |
| Home, list pages (`/events/`, `/jobs/`, `/blog/`, `/talks/`, `/speakers/`, `/venues/`, `/organizers/`, tag pages) | itself | hr, en, x-default (→ hr) | on each entry whose language differs from the page's | both copies |
| MDX pages and docs (hr/en files) | itself | hr, en, x-default (→ hr) | not needed | both copies |
| Single entry page (event, post, speaker, venue, organizer, author), either copy | the copy under the entry's language prefix | none | on the entry's text when it differs from the page's | both copies |
| Job cards (no pages of their own) | n/a | n/a | on the card's text fields | n/a |

*   **Pages and docs** live in `hr/` and `en/` folders with the same file
    names. `paths('hr')` reads `hr/*` and `paths('en')` reads `en/*`, and
    strips the prefix from the slug. Parent back-links strip it the same way.
*   **Submitted collections** (events, blog, authors, speakers, venues,
    organizers, jobs) are not split. Each schema gains `lang: 'hr' | 'en'`
    (default `'hr'`) and `mock: boolean` (default `false`).
*   **`lang` goes on the entry's own text only:** title, description, body,
    venue name, role, company, location. Badges, labels, buttons and the mock
    label stay in the page's language.

### Feature flags

`src/config.ts` exports `FEATURES`. In v1 every flag is `true`:

`events`, `jobs`, `heroCarousel`, `blog`, `rss`, `tags`, `authors`, `talks`,
`speakers`, `venues`, `organizers`, `docs`, `calendar`, `llms`, `stats`,
`testimonials`.

A flag controls the places that link to or embed its feature:

*   `NAV`, `FOOTER` and `SOCIAL` entries can name a `feature`. Entries whose
    flag is off are removed before rendering.
*   The Home view checks the flags for its sections directly.
*   Components with flag checks: `CalendarSubscribe` (`calendar`),
    `SpeakerInvite` (`speakers`), the RSS `<link>` in `BaseLayout` (`rss`),
    venue links in `EventRow` and the event page (`venues`), speaker links
    (`speakers`), author boxes (`authors`), tag links (`tags`), and the
    script tags in `BaseLayout` (`checklist.js` and `toc.js` on `docs`;
    `blog-filter.js` on `blog || talks`, since the talks page uses it).

Routes are not flagged. A route exists only if its entry files exist. To turn
a feature off, the maintainer sets its flag to `false` and deletes its entry
files (decision 34). README lists which entry files belong to each feature.

All collections are always registered in `content.config.ts`, so the theme's
typed references to them (`lib/talks.ts`, `OrganizerCard`, `AuthorBox`,
`PostCard`) keep compiling whatever the flags say.

### Mock content

*   **Marker.** Every mock carries `mock: true`: in frontmatter, in JSON
    entries, and on `HOME.stats` and `HOME.testimonials` items in config.
*   **On the page.** `MockBadge.astro` renders "Primjer" or "Example" as
    text, in the page's language. Mock events, posts, speakers, venues,
    organizers, authors, jobs, photos, stats and testimonials show it. Mock
    MDX pages and docs show a `<Callout tone="warn">` at the top saying the
    text is an example that has not been adopted.
*   **In feeds.** The RSS feed and the calendar feed prefix each mock
    item's title with "Primjer: " (decision 33). `llms.txt` prefixes the
    next event the same way.
*   **Names.** Every mock person's surname is "Primjer" (for example "Iva
    Primjer"), every mock venue is named "… Primjer", and mock companies are
    "Primjer d.o.o." No real venue, company or community member appears
    (decision 37). Contact addresses use `example.com`.
*   **Listing.** `npm run mocks` prints every mock entry, mock config item
    and placeholder (`REPLACE-ME`, `example.com`) with its file path.

### Features carried over from the current site

*   **Job wall.** `src/data/jobs.json` is loaded as the `jobs` collection
    with Astro's `file()` loader and the schema in plan item 4.1. The view
    drops real postings more than 60 days old (a posting on day 60 is still
    shown), never drops mocks, sorts newest first, and renders the page
    sections in plan item 5.1. A client script filters by kind. The form
    button is a mock while `JOBS_FORM_URL` contains `REPLACE-ME`.
*   **Hero carousel.** `src/data/hero-photos.json` is loaded as the
    `heroPhotos` collection (`file()` loader, schema with non-empty `alt.hr`
    and `alt.en`). Images live in `src/assets/hero/` and are resolved with
    `import.meta.glob`, then rendered with Astro's `<Image>`. Photos after
    the first have the `hidden` attribute until the script runs. A pause/play
    button controls the rotation (decision 35).
*   **Pages.** About, give a talk, host a meetup and unconference are built
    from the current site's text. Code of Conduct, start here and get
    involved are mocks adapted from the theme's starter pages.
*   **Events.** Two real past events and two mock upcoming events (plan item
    4.4).

### Events and dates

The theme counts an event as upcoming while `date >= now`. A date-only value
is read as midnight UTC, so a 03:00 UTC build on the event's day would already
move it to "past". `src/lib/dates.ts` replaces that test with
`isUpcoming(date, now)`: an event is upcoming until the end of its calendar
day in Europe/Zagreb. Home, the events list, `llms.txt` and the stats use it.
`formatDate()` always passes `timeZone: 'Europe/Zagreb'`. Job expiry keeps a
plain day count, since a day of staleness is accepted (decision 23).

### Brand

`BRAND` sets only `fontDisplay: "'Exo 2', Inter, sans-serif"`. The theme's
Quantico files and `@font-face` rules are replaced by Exo 2 (decision 28,
whose "self-hosting postponed" is superseded: the theme bundles all fonts
itself, so Exo 2 is bundled too). `SITE.logo` and `SITE.ogImage` are unset,
so the header shows the brand name as text and link previews use a text card.
The favicon is the current site's "KD" SVG.

### Checks and deploy

`.github/workflows/deploy.yml` is based on the theme's
`scripts/templates/deploy-astro.yml.tmpl`. It runs on pull requests, on
pushes to `main`, daily at 03:00 UTC, and by hand. It installs, type-checks,
builds, runs `npm run check` and `npm run mocks`, and on `main` and the
schedule deploys `dist/` with `actions/deploy-pages`.

`npm run check` runs:

*   `astro check` (types, including dictionary parity);
*   `node --test` on `tests/` (dates, job expiry, empty-string check on
    dictionaries and config pairs, and fixtures that make each script below
    fail);
*   `scripts/check-image-alt.py` on `dist/` and `src/content/` (theme
    script, unchanged);
*   `scripts/check-jsonld.py` on `dist/` (theme script, unchanged);
*   `scripts/check-links.mjs` on `dist/`: every internal link resolves, and
    no page link crosses between `/` and `/en/` unless the anchor carries
    `hreflang` (the switcher and alternate links).

## Risks & Mitigations

*   **Scheduled builds stop.** GitHub disables scheduled workflows after 60
    days without repository activity, and can delay or skip runs. "Next
    event" and job expiry then stop updating. GitHub emails the workflow's
    actor when a scheduled run fails. README tells the maintainer how to
    re-enable the workflow in the Actions tab.
*   **A broken `main` stops all deploys.** The live site stays at the last
    good build. Pull requests run the same checks first.
*   **Hand-ported upkeep.** The theme is now this project's code. The
    maintainer applies Astro security updates with `npm update` and copies
    theme fixes by hand, using `THEME.md` to see what was changed locally.
*   **Mocks mistaken for real content.** Labels on every page, "Primjer: "
    in feed titles, fictional names, and the `npm run mocks` list. Feed
    subscribers still receive mock items until they are replaced.
*   **Unsafe links in job postings.** The schema accepts only `https:` and
    `mailto:` links, so a `javascript:` URL fails the build. Astro escapes
    all other text by default. Only people with push access can edit
    `jobs.json`.
*   **Rollback needs admin rights** on the repository, which the maintainer
    has (decision 30).
*   **Upstream theme assumptions break under i18n.** The type check, the
    tests and the link check run on every pull request.

## Alternatives Considered

### Alternative A: Two builds of the unmodified npm theme, merged in CI

Build once with Croatian `STRINGS` at `/` and once with English at
`/en/`, then deploy both.

*   **Pros**: the theme stays an unmodified package.
*   **Cons**: does not use Astro's i18n routing, the switcher can only guess
    the other URL, and RSS and the sitemap are produced twice.
*   **Reason for Rejection**: the owner chose Astro's i18n setup over
    upgradeability (decision 3).

### Alternative B: An i18n library (Paraglide JS, astro-i18next, @otrodigital/astro-i18n-next)

Use a library for message lookup instead of a typed dictionary.

*   **Pros**: message formatting and translator tooling.
*   **Cons**: none of them removes the need to edit the theme's components,
    which read `STRINGS` directly, and each adds a dependency.
*   **Reason for Rejection**: 79 theme keys plus about 60 site keys fit a
    typed dictionary (decision 10).

### Alternative C: Keep the theme as a local integration package

Keep `package/` as a workspace package that injects the theme's routes.

*   **Pros**: theme and site code stay apart.
*   **Cons**: every injected route needs a hand-made `/en/` twin, and only
    eight components can be overridden.
*   **Reason for Rejection**: flattening removes both limits (decision 13).

### Alternative D: git subtree of the theme repository

*   **Pros**: `git subtree pull` for upstream changes.
*   **Cons**: brings in the whole repository, and the i18n edits touch
    almost every theme file, so upstream merges would conflict on most of
    them.
*   **Reason for Rejection**: `THEME.md` with the pinned commit supports
    manual comparison at no cost.

### Alternative E: One dynamic route with an optional language segment

One file per route, such as `src/pages/[...locale]/events/[slug].astro`.

*   **Pros**: no twin entry files.
*   **Cons**: puts the locale itself into a route parameter, which Astro's
    i18n guide does not describe, so `Astro.currentLocale` and the i18n
    helpers would depend on undocumented behaviour.
*   **Reason for Rejection**: the owner preferred the documented per-locale
    folder layout.

### Alternative F: Astro's i18n fallback with `fallbackType: 'rewrite'`

Build only Croatian pages and let Astro produce `/en/` copies.

*   **Pros**: almost no routing code.
*   **Cons**: the docs do not say whether fallback works with static output,
    and a rewritten page may report Croatian as its locale.
*   **Reason for Rejection**: both risks can only be ruled out by building
    it.

### Alternative G: Full page files duplicated per locale

Copy each page's whole logic into `src/pages/` and `src/pages/en/`.

*   **Pros**: no view layer.
*   **Cons**: every change is made twice and the copies drift.
*   **Reason for Rejection**: the chosen layout duplicates only the entry
    files.

### Alternative H: Croatian URL paths (`/dogadanja/`, `/poslovi/`)

*   **Pros**: Croatian visitors see their language in URLs.
*   **Cons**: the switcher needs a path translation table, and every new
    route needs an entry.
*   **Reason for Rejection**: decision 26 keeps one slug in both locales.

### Alternative I: Croatian-only launch, English later

*   **Pros**: no fork until English is added.
*   **Cons**: the same fork later, after content and links exist.
*   **Reason for Rejection**: English ships at launch (decision 31).

### Alternative J: The Hugo version of the theme

*   **Pros**: Hugo's multilingual support works out of the box.
*   **Cons**: gives up Astro.
*   **Reason for Rejection**: the owner asked for an Astro project
    (decision 2).

### Alternative K: v1 limited to what the current site has

Ship only the current site's features and turn the rest of the theme off.

*   **Pros**: smaller v1, less mock content, less translation.
*   **Cons**: the theme's structure is the reason for the switch, and every
    feature turned on later needs its own conversion.
*   **Reason for Rejection**: the owner chose every feature on with mocks
    (decision 32, superseding decision 14).

### Alternative L: Leave mocks out of the RSS and calendar feeds

*   **Pros**: feed subscribers never receive placeholder posts or events.
*   **Cons**: the feeds would be empty or nearly empty, so they could not be
    tested.
*   **Reason for Rejection**: the owner chose mocks in the feeds, with a
    "Primjer: " title prefix (decision 33).

### Alternative M: Turning routes off by renaming them or returning `[]`

Rename fixed routes to single-path dynamic routes so `getStaticPaths` can
return `[]` when a flag is off.

*   **Pros**: one flag switches a route.
*   **Cons**: renames theme files and needs an allow-list and naming rules.
*   **Reason for Rejection**: deleting the entry files is simpler
    (decision 34).

### Alternative N: Load job postings in the browser with `fetch()`, as today

*   **Pros**: a new posting appears without a rebuild.
*   **Cons**: no schema check before publishing, separate loading and error
    states, and no text in the HTML that search engines read.
*   **Reason for Rejection**: build-time loading with a daily rebuild
    (decision 22).

### Alternative O: Refresh the mock job dates instead of exempting mocks

*   **Pros**: expiry runs on the mock data.
*   **Cons**: the dates need updating every 60 days, or the wall goes empty.
*   **Reason for Rejection**: decision 21. The `node --test` cases cover
    expiry instead.

### Alternative P: An extra expiry check in the browser

*   **Pros**: expired postings disappear even if a daily build did not run.
*   **Cons**: duplicates the build's logic in a client script.
*   **Reason for Rejection**: saves at most one day (decision 23).

### Alternative Q: Keep Quantico as the display font

*   **Pros**: no font change.
*   **Cons**: the theme bundles it in the basic Latin set only, so Croatian
    letters fall back to another typeface.
*   **Reason for Rejection**: Croatian is the default language
    (decision 28).

### Alternative R: The rostilj page copied unchanged or ported

*   **Pros**: keeps the poster design. A verbatim copy needs no porting
    work.
*   **Cons**: the event is past, the page is Croatian-only, and it contains
    planning notes.
*   **Reason for Rejection**: it becomes an event entry (decision 19).

### Alternative S: Unconference merged into host-a-meetup

*   **Pros**: one page fewer to maintain.
*   **Cons**: the existing text and the link to it are already separate.
*   **Reason for Rejection**: decision 24.

### Alternative T: A click-only carousel, or the single theme hero image

*   **Pros**: no auto-advance means no pause control or reduced-motion
    handling. A single image needs no carousel at all.
*   **Cons**: drops the current site's rotating hero.
*   **Reason for Rejection**: the owner kept auto-advance with a pause
    button (decision 35).

### Alternative U: Roll back to `legacy-static`

*   **Pros**: one branch for both archive and rollback.
*   **Cons**: it holds the working tree, so a rollback would publish pages
    that were never live.
*   **Reason for Rejection**: decision 36.

--------------------------------------------------------------------------------

## Non-Functional Requirements

*   **Privacy**: fonts, icons and images are served from the site itself, as
    the theme already does. No third-party requests, analytics or cookies.
    `checklist.js` keeps checklist progress in the visitor's own
    `localStorage`.
*   **Accessibility**: every image has alt text in both languages (schema
    plus alt-text check). Entry text carries its own `lang`. The carousel has
    a pause/play button and respects `prefers-reduced-motion`. The mock label
    is text, not colour alone.
*   **Rollout & Rollback**: one release. Rollback steps are in the Cutover
    section.

## Additional Resources

*   [Concept brief](./astro-popular-migration-brief.md): decisions 1–37 and
    the brainstorm review.
*   [Consolidated review](./review/consolidated_review_report.md) and the
    stage reports in [review/](./review/).
*   Theme source at upstream commit `d1554d5`: `README.md`, `AGENTS.md`,
    `PARITY.md`, `src/config.ts`, `src/content.config.ts`,
    `src/styles/fonts/README.md`.
*   [Astro internationalization guide](https://docs.astro.build/en/guides/internationalization/)
    and [Astro 7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/).

## Future Improvements

*   **Replace the mocks** with real content, and set `JOBS_FORM_URL`.
    `npm run mocks` shows what remains.
*   **A custom brand** through `BRAND`, and a logo.
*   **Remember the language choice** in `localStorage`.
*   **Not in v1:** calendar files per event, search, analytics, Meetup.com
    sync, job submission through GitHub issue forms.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

All theme files come from upstream commit
`d1554d5e95ec11b7dbc42cbb2dad7327494cfe19`. "Copy" means copy unchanged.
"Copy and modify" means copy, then make the listed change. Every change to a
theme file is recorded in `THEME.md`. All text taken from the current site
comes from `translations.js` and the HTML files **on the `legacy-static`
branch**.

The work is done on a feature branch in six phases. Each phase ends with an
exit check that must pass before the next phase starts, and is one or more
commits.

### Phase 1: Import the theme unchanged

**Exit check:** `npm run build` succeeds and `npx astro check` reports no
errors.

#### 1.1 Old site (Delete)

*   Delete `index.html`, `give-a-talk/`, `host-a-meetup/`, `jobs/`,
    `translations.js`, `jobs.js`, `jobs.json`, `jobs.example.json`,
    `style.css`.
*   Delete the untracked `rostilj/` and `unconference/` folders from the
    working tree. Both are on `legacy-static`, where rostilj has no
    personal names. This deletes the only copy of rostilj that has them.

#### 1.2 Theme files (Copy)

Copy these from upstream, unchanged:

*   `astro.config.mjs`, `popular-markdown.mjs`, `tsconfig.json`
*   `src/components/*.astro` (`DemoBar.astro` and `PreviewBar.astro` are
    needed by the unchanged `BaseLayout` and are deleted in 2.7)
*   `src/layouts/BaseLayout.astro`, `src/lib/*.ts`, `src/pages/**`
*   `src/config.ts`, `src/content.config.ts`
*   `src/styles/**`
*   `public/fontawesome/**`, `public/scripts/*.js`
*   `scripts/check-image-alt.py`, `scripts/check-jsonld.py`
*   `scripts/templates/deploy-astro.yml.tmpl` (reference for 6.4, deleted
    after)
*   `LICENSE` as `THEME-LICENSE`

Do not copy: `package/`, `demos/`, `smoke/`, `create-popular-site/`,
`src/content/**`, `src/data/setup-questions.json`, `public/images/**`, the
other `scripts/**`, `.github/`, `AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`,
`PACKAGING.md`, `PARITY.md`, `RELEASING.md`, `UPSTREAM-HANDOFF.md`,
`package.json`, `package-lock.json`.

#### 1.3 `package.json` (Create)

*   `name: "karlovac-developers-site"`, `version: "1.0.0"`, `private: true`,
    `type: "module"`, `engines.node: ">=22.18"`.
*   Dependencies at the theme's ranges: `astro ^7.0.6`, `@astrojs/mdx
    ^7.0.2`, `@astrojs/sitemap ^3.7.3`, `@astrojs/rss ^4.0.0`.
*   Dev dependencies: `@astrojs/check` at the latest version and
    `typescript` at `^5`, recorded in the lockfile. TypeScript 6 turns
    `strict` on by default, which the theme's code does not pass.
*   Scripts:
    *   `dev`: `astro dev`
    *   `build`: `astro build`
    *   `preview`: `astro preview`
    *   `check`: `astro check && node --test tests/*.test.ts tests/*.test.mjs && python3 scripts/check-image-alt.py dist src/content && python3 scripts/check-jsonld.py dist && node scripts/check-links.mjs dist`
    *   `mocks`: `node scripts/list-mocks.mjs`

#### 1.4 `package-lock.json`, `.nvmrc`, `.gitignore` (Create)

*   `package-lock.json` from `npm install`, committed.
*   `.nvmrc`: `22.18`.
*   `.gitignore`: `dist/`, `.astro/`, `node_modules/`, `.DS_Store`,
    `__pycache__/`.

#### 1.5 Empty collections for the first build (Create)

*   One placeholder file per collection, so the unchanged theme builds:
    `src/content/{blog,events,organizers,authors,speakers,venues,docs,pages}/.gitkeep`.
    Phase 4 replaces them with content.

#### 1.6 Type errors in the unchanged copy (Copy and modify)

*   Run `npx astro check` and fix every error in the copied files. Known
    so far:
    *   `src/layouts/BaseLayout.astro` L44 reads `SITE.fontAwesome`, which
        `SITE` does not declare. Read it as
        `(SITE as Record<string, any>).fontAwesome`, as the theme does for
        its other optional keys.
    *   `src/components/Footer.astro` L4 imports `version` from
        `package.json` and renders "v{version}" after the theme credit.
        Remove the import and the version suffix. The credit stays.
    *   `src/pages/index.astro` reads `testimonialsHead.lead` and
        `testimonial.photo`, which the inferred `HOME` type lacks. Type both
        as optional in `src/config.ts`.
*   Record each fix in `THEME.md`.

#### 1.7 `THEME.md` (Create)

*   The upstream URL and commit, the "Do not copy" list from 1.2, and a
    table of every changed theme file with a one-line reason. Each later
    phase adds its rows.

### Phase 2: i18n core, layout and chrome

**Exit check:** `npm run build` and `npx astro check` pass. `/` and `/en/`
both render, with `lang="hr"` and `lang="en"`, and the switcher on each links
to the other.

#### 2.1 `astro.config.mjs` (Copy and modify)

*   `site: 'https://karlovac-developers.github.io'`, `base: '/'`,
    `trailingSlash: 'always'`, and the `i18n` block from the Technical Plan.
    `sitemap()` keeps its default options.

#### 2.2 `src/i18n/ui.ts` (Create)

*   `ui.hr` holds the theme's 79 `STRINGS` keys with Croatian values written
    for each, and `ui.en` holds the theme's English values.
*   The current site's job keys, with their names unchanged and their hr/en
    values from `translations.js` on `legacy-static`: `jobs.title`,
    `jobs.subtitle`, `jobs.page.sub`, `jobs.all`, `jobs.post`,
    `jobs.how.title`, `jobs.how.p`, `jobs.rules.li1`–`li4`,
    `jobs.filter.all`, `jobs.filter.hiring`, `jobs.filter.available`,
    `jobs.kind.hiring`, `jobs.kind.available`, `jobs.type.full-time`,
    `jobs.type.part-time`, `jobs.type.contract`, `jobs.type.internship`,
    `jobs.type.student`, `jobs.vouched`, `jobs.apply`, `jobs.contact`,
    `jobs.count.one`, `jobs.count.many`, `jobs.empty`. `jobs.unavailable` is
    not carried over, since there is no runtime fetch.
*   New keys with written hr/en values:
    *   `lang.switch.label`: "EN" / "HR"
    *   `lang.switch.aria`: "Read in English" / "Čitaj na hrvatskom"
        (each written in the target language, so `hr` holds "Read in
        English")
    *   `mock.label`: "Primjer" / "Example"
    *   `mock.page.title`: "Primjer teksta" / "Example text"
    *   `mock.page.body`: "Ovo je primjer teksta koji još nije usvojen." /
        "This is example text that has not been adopted."
    *   `mock.photo`: "Ilustrativna fotografija" / "Illustrative photo"
    *   `carousel.label`: "Fotografije sa susreta" / "Meetup photos"
    *   `carousel.pause`: "Zaustavi" / "Pause"
    *   `carousel.play`: "Pokreni" / "Play"
    *   `notfound.title`, `notfound.body`, `notfound.home` in both
        languages
    *   `home.jobs.title`, `home.jobs.all`, `home.team.eyebrow`,
        `home.team.title`, `home.team.all`, `home.involved.eyebrow` (from
        the theme's hard-coded English, translated)
    *   `events.title` (replaces `title="Events"`)
*   `ui.en` is typed `Record<keyof typeof ui.hr, string>`.

#### 2.3 `src/i18n/index.ts` (Create)

*   The exports and signatures in the Technical Plan. `alternates()`
    returns `{ canonical: string, hreflang: { lang, href }[] }` for the rule
    passed in: `'translated'`, or `{ entryLang: Locale }` for single-entry
    pages.

#### 2.4 `src/lib/dates.ts` (Create)

*   `zagrebDay(date: Date): string` returns `YYYY-MM-DD` in Europe/Zagreb.
*   `isUpcoming(date: Date, now: Date): boolean` is
    `zagrebDay(date) >= zagrebDay(now)`.
*   No Astro imports.

#### 2.5 `src/config.ts` (Copy and modify)

*   **`STRINGS`** moves out to `ui.ts`. **`SITE.locale`** is removed.
    **`SITE.title`**, **`tagline`** and **`description`** become pairs.
*   **`SITE`** values:
    *   `brandName: 'Karlovac'`, `brandSub: 'Developers'`.
    *   `logo` and `ogImage` are removed.
    *   `favicon: '/favicon.svg'`.
    *   `landAcknowledgement` is removed (the slot stays empty).
    *   `community.chat` is removed. The Meetup link is the `CTA`.
    *   `speakers.invite` and `talks` are replaced by `FEATURES.speakers`
        and `FEATURES.talks`.
*   **`FEATURES`**: all 16 flags `true`. `JOBS_EXPIRY_DAYS = 60`,
    `JOBS_PREVIEW_COUNT = 2`, `JOBS_FORM_URL = 'https://forms.gle/REPLACE-ME'`,
    `HERO_INTERVAL_MS = 4000`, `MEETUP_URL` and `MEETUP_UPCOMING_URL` (the
    two Meetup URLs from `index.html` on `legacy-static`).
*   **`NAV`** (labels as pairs, `feature` named where it applies):
    *   Events (`/events/`), with children Events and Talks (`/talks/`).
    *   Blog (`/blog/`).
    *   Jobs (`/jobs/`).
    *   Get involved (`/get-involved/`), with children Get involved, Give a
        talk, Host a meetup and Unconference.
    *   About (`/about/`), with children About us, Organizers, Speakers,
        Venues and Code of Conduct.
    *   Handbook (`/handbook/`).

    Each parent repeats itself as its first child, as the theme's About menu
    does.
*   **`CTA`**: label pair "Pridruži se" / "Join us", `url: MEETUP_URL`.
*   **`SOCIAL`**: Meetup (`MEETUP_URL`), GitHub
    (`https://github.com/karlovac-developers`), RSS (`/rss.xml`,
    `feature: 'rss'`).
*   **`FOOTER`**: tagline pair from `hero.tagline`.
    *   Community: About us, Blog, Code of Conduct.
    *   Get involved: Give a talk, Host a meetup, Unconference, Jobs.
    *   Organizers: Organizers, Handbook, Runbooks.

    The theme credit stays, without the version.
*   **`SECTIONS`**: every entry's `eyebrow`, `title` and `lead` become pairs.
    The theme entries keep their English and gain Croatian. New `jobs`
    entry: `title` from `jobs.title`, `lead` from `jobs.page.sub`.
*   **`HOME`** (all text as pairs):
    *   **`hero`:** no eyebrow. `title` "Karlovac Developers". `lead` from
        `hero.tagline`. CTAs: `hero.cta.join` → `MEETUP_URL` (primary) and
        `hero.cta.next` → `MEETUP_UPCOMING_URL` (outline). `image` is
        removed.
    *   **`stats`:** four mock items, each `mock: true`:
        `@pastEventCount` "događanja" / "events hosted"; "2026"
        "osnovano" / "founded"; "Svi" / "All" "dobrodošli" / "welcome";
        "Besplatno" / "Free" "ulaz" / "to attend".
    *   **`featuresHead`:** title "Što radimo" / "What we do".
    *   **`features`:**
        *   `fa-solid fa-people-group`, title `intro.title`, body `intro.p1`
        *   `fa-solid fa-user-plus`, title `join.title`, body `join.p1`
        *   `fa-solid fa-building`, title `host.title`, body `host.p1`
    *   **`testimonialsHead`:** title "Što kažu članovi" / "What members
        say".
    *   **`testimonials`:** two mock items, `mock: true`, names "Iva
        Primjer" and "Luka Primjer", roles "članica" / "member" and
        "član" / "member", quotes written in both languages.
    *   **`getInvolved`:** title "Ima mjesta za svakoga" / "There's a place
        for everyone", lead "Održi predavanje, ugosti susret ili samo dođi."
        / "Give a talk, host a meetup, or just show up.", CTAs Give a talk
        (primary), Host a meetup and Unconference (outline).
*   **`BRAND`**: `{ fontDisplay: "'Exo 2', Inter, sans-serif" }`.
*   **`DEMO_BAR`** is removed.

#### 2.6 `public/favicon.svg` (Create)

*   The SVG from the `data:` favicon in `index.html` on `legacy-static`,
    decoded into a file.

#### 2.7 `src/layouts/BaseLayout.astro` (Copy and modify)

*   `locale = getLocale(Astro)`.
*   `<html lang={htmlLang(locale)}>`.
*   `og:locale` from `ogLocale(locale)`, plus `og:locale:alternate`.
*   `SITE.title`, `tagline` and `description` through `pick()` (L29, L30,
    L95, L97, L107, L110).
*   `skipToContent`, `copyCode` and `checklistDone` through `t()`
    (L120–121).
*   New prop `langRule` (`'translated'` by default, or
    `{ entryLang }`) passed to `alternates()`, which emits the canonical
    and hreflang links. This replaces the current canonical line.
*   The RSS `<link>` is emitted only when `FEATURES.rss` is on.
    `checklist.js` and `toc.js` load on `FEATURES.docs`, and
    `blog-filter.js` on `FEATURES.blog || FEATURES.talks`.
*   `DemoBar` and `PreviewBar` imports are removed.
*   `src/styles/site.css` is imported after the theme styles.

#### 2.8 `src/components/Header.astro`, `Footer.astro` (Copy and modify)

*   Labels through `pick()`. Entries whose `feature` is off are removed.
    Page links through `pageHref()`. Asset paths keep `withBase()`.
*   Header adds `<LangSwitch />` before the CTA.
*   Footer drops the land-acknowledgement block.

#### 2.9 `src/components/LangSwitch.astro` (Create)

*   `<a href={peerHref(Astro.url.pathname)} hreflang={other} lang={other}>`
    showing `t(locale, 'lang.switch.label')`, with
    `aria-label={t(other, 'lang.switch.aria')}`.

#### 2.10 `src/components/MockBadge.astro` (Create)

*   `<span class="g-badge kd-mock">{t(locale, 'mock.label')}</span>`, with
    `locale` as a prop.

#### 2.11 `src/pages/404.astro` (Create)

*   Both languages on one page, Croatian first, each with a link to its home
    page. No `LangSwitch`. `<html lang="hr">`, with the English block in
    `lang="en"`.

#### 2.12 `src/styles/site.css` (Create)

*   Styles for the switcher, mock badge, job cards and carousel, built from
    the theme's tokens. The job filter uses the theme's `.g-filter` buttons.
    This keeps site rules out of the theme's stylesheets, so `THEME.md` only
    lists the font change there.

### Phase 3: Views and routes

**Exit check:** `npm run build` and `npx astro check` pass. Every route
renders in both locales with the empty collections. The CUJ 1 walk-through
on `npm run preview` finds no English text on `/` pages.

#### 3.1 `src/views/` and `src/views/*.paths.ts` (Create)

*   One view per upstream page file, holding that file's code, with:
    *   `STRINGS.x` → `t(locale, 'x')`;
    *   config text → `pick()`;
    *   page links → `pageHref()`;
    *   `SITE.locale` dates → `formatDate()`;
    *   `e.data.date >= now` → `isUpcoming(e.data.date, now)`;
    *   hard-coded English → the keys from 2.2;
    *   `getStaticPaths` moved into `<View>.paths.ts` as `paths(locale)`.
*   Views:
    *   `Home`: from `index.astro`. Adds the job preview section after the
        next-event section. The section order is hero, stats, features,
        next event or empty state, jobs, latest posts, organizers,
        testimonials, get involved. Stats and testimonials show
        `MockBadge` per mock item. `HeroCarousel` replaces the hero
        `<img>`.
    *   `Page`: from `[...slug].astro`. `paths(locale)` reads
        `pages/<locale>/*` and `docs/<locale>/*`, strips the prefix, and
        builds parent back-links from the stripped ids. Renders the mock
        callout when `mock` is true.
    *   `EventsList`, `Event`: from `events/[...page].astro` and
        `events/[slug].astro`. `Event` passes
        `langRule={{ entryLang: entry.data.lang }}`. `EventsList` is
        translated. Its empty state links to `MEETUP_UPCOMING_URL`.
    *   `Jobs`: new, see 5.1.
    *   `BlogList`, `Post`, `Author`, `Tag`, `Talks`, `SpeakersIndex`,
        `Speaker`, `VenuesIndex`, `Venue`, `OrganizersList`, `Organizer`:
        from their upstream pages. Single-entry views pass
        `langRule={{ entryLang }}`.

#### 3.2 Entry files under `src/pages/` and `src/pages/en/` (Create; upstream page files replaced)

*   For each route, two files that render the view and export
    `getStaticPaths = () => paths('<locale>')`:
    *   `index.astro`
    *   `[...slug].astro`
    *   `events/[...page].astro`, `events/[slug].astro`
    *   `jobs/index.astro`
    *   `blog/[...page].astro`, `blog/[slug].astro`
    *   `authors/[slug].astro`
    *   `tags/[tag]/[...page].astro`
    *   `talks/[...page].astro`
    *   `speakers/index.astro`, `speakers/[slug].astro`
    *   `venues/index.astro`, `venues/[slug].astro`
    *   `organizers/[...page].astro`, `organizers/[slug].astro`
*   Fallback if phase 1 shows the constant form is rejected: see Language
    routing.

#### 3.3 `src/pages/rss.xml.js`, `src/pages/events/calendar.ics.ts`, `src/pages/llms.txt.ts`, `src/pages/robots.txt.ts` (Copy and modify; robots Copy)

*   **`rss.xml.js`:** `pick('hr', SITE.title)` and `description`. Mock post
    titles are prefixed "Primjer: ".
*   **`calendar.ics.ts`:** `safeCollection('venues')` in place of
    `getCollection`. Mock event summaries are prefixed "Primjer: " before
    `buildIcs()`.
*   **`llms.txt.ts`:**
    *   English text and `pick('en', …)`.
    *   `isUpcoming()` and `formatDate('en')`.
    *   `FEATURES.talks` in place of `SITE.talks`.
    *   Page ids `en/about` and `en/start`, with `/en/` links.
    *   "Primjer: " on a mock next event.

#### 3.4 Components (Copy and modify)

*   `EventRow`, `EventsEmpty`, `Notice`, `Pagination`, `PostCard`,
    `AuthorBox`, `CalendarSubscribe`, `Checklist`, `SpeakerInvite`: take
    `locale`, use `t()`, `formatDate()` and `pageHref()`, and add
    `MockBadge` when the entry is a mock.
*   Flag checks:
    *   `CalendarSubscribe` renders nothing when `FEATURES.calendar` is off.
    *   `SpeakerInvite` renders only on `FEATURES.speakers` and links to
        `/give-a-talk/`.
    *   `EventRow` links venues only on `FEATURES.venues` and speakers only
        on `FEATURES.speakers`.
    *   `AuthorBox` renders only on `FEATURES.authors`.
*   `EventRow` and `PostCard` put `lang` on title, description and venue
    text only.
*   `EventRow` shows the "venue wanted" badge and "venue to be announced"
    only for upcoming events, so CroMesh (no venue) shows neither.
*   `Callout`, `FAQ`, `FAQItem`, `Gallery`, `OrganizerCard`, `PageHero`,
    `Photo`, `Pullquote` stay unchanged.

### Phase 4: Content

**Exit check:** `npm run build`, `npx astro check` and the alt-text check
pass. CUJs 3, 5 and 6 pass on `npm run preview`. `npm run mocks` lists
every mock below.

#### 4.1 `src/content.config.ts` (Copy and modify)

*   Every collection stays registered.
*   `events`, `blog`, `authors`, `speakers`, `venues` and `organizers` gain
    `lang` (default `'hr'`) and `mock` (default `false`).
*   `pages` and `docs` gain `mock` and read their `hr/` and `en/` folders.
*   New `jobs` collection, `file('src/data/jobs.json')`:

    ```ts
    z.object({
      id: z.string(),
      posted: z.coerce.date(),
      kind: z.enum(['hiring', 'available']),
      role: z.string(),
      company: z.string().optional(),     // omitted for kind: 'available'
      location: z.string(),
      type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'student']),
      description: z.string(),
      vouchedBy: z.string(),
      link: z.string().regex(/^(https:\/\/|mailto:)/),
      lang: z.enum(['hr', 'en']).default('hr'),
      mock: z.boolean().default(false),
    })
    ```

*   New `heroPhotos` collection, `file('src/data/hero-photos.json')`:
    `{ id, file, alt: { hr: z.string().min(1), en: z.string().min(1) },
    source: z.string().url(), licence: z.string(), mock: z.boolean() }`.
*   The `.gitkeep` files from 1.5 are deleted.

#### 4.2 Translated pages (Create)

Each page has an `hr` and an `en` file under `src/content/pages/`. MDX files
import components as `'../../../components/Callout.astro'`.

*   **`about.mdx`:** from `intro.*` and `join.*` (including `join.p3` and
    its link).
*   **`give-a-talk.mdx`:** from `talk.*`, with `<Callout>` for the call to
    action.
*   **`host-a-meetup.mdx`:** from `hostpage.*`, including the unconference
    section and its link.
*   **`unconference.mdx`:** from `unconf.*`.
*   **`code-of-conduct.mdx`** (mock): the theme's starter text. "Your
    Community" becomes Karlovac Developers. The reporting address becomes
    `conduct@example.com`, and the closing "Adapt it to your community"
    paragraph is removed. The `hr` file is a Croatian translation of that
    text. `mock: true`.
*   **`start.mdx`, `get-involved.mdx`** (mock): the theme's starter pages,
    with the community name replaced. `get-involved` links to give-a-talk,
    host-a-meetup, unconference and jobs. Croatian translations. `mock: true`.

English files link to pages under `/en/`. Croatian files link outside it.

#### 4.3 Docs (Create)

*   `src/content/docs/{hr,en}/handbook.mdx` and `runbooks.mdx`: the
    theme's starter docs with the community name replaced, translated, with
    their `<Checklist>` blocks kept. `mock: true`.

#### 4.4 Events (Create)

*   **`cromesh-meetup-2.md`:**
    *   Title "CroMesh Meetup #2", date `2026-02-28`, `lang: hr`.
    *   No venue, time or body. The current site records none.
*   **`korana-2026.md`:**
    *   Title "Roštilj na Korani", date `2026-06-20`, time "09:00–20:00",
        venue "Korana, Karlovac", `lang: hr`.
    *   `description`: the first sentence of the rostilj page's lead.
    *   Body: the four time blocks of its schedule.
    *   The "Plan u 8 koraka" and preparation sections are left out.
    *   Source: `rostilj/index.html` on `legacy-static`.
*   **`primjer-susret-1.md`, `primjer-susret-2.md`** (mock):
    *   Dated the second Thursday of the second and fourth month after the
        implementation date, at 18:00.
    *   `venueRef` to the mock venue.
    *   One `talks` entry each, with `speaker` set to a mock speaker.
    *   Tags, `lang: hr`, `mock: true`.

#### 4.5 Other collections (Create, all `mock: true`, `lang: hr`)

*   `blog/primjer-prvi-post.md`, `blog/primjer-drugi-post.md`: two short
    posts, each with two tags and `authors: [iva-primjer]`.
*   `authors/iva-primjer.md`.
*   `speakers/luka-primjer.md`, `speakers/ana-primjer.md`.
*   `venues/dvorana-primjer.md`: "Dvorana Primjer", address "Ulica
    primjera 1, 47000 Karlovac", wheelchair, transit and parking notes.
*   `organizers/iva-primjer.md`, `organizers/marko-primjer.md`.
*   No photos for mock people or venues. If a component requires a photo,
    the phase 4 exit check fails and the component is fixed to handle a
    missing one.

#### 4.6 `src/data/jobs.json` (Create)

*   The five postings from `jobs.json` on `legacy-static`, without the
    `_note` entry.
*   Each gets:
    *   `id` as `<role-slug>-<posted>` (role lower-cased, non-alphanumerics
        replaced by `-`, posted as `YYYY-MM-DD`);
    *   `mock: true`, `lang: 'en'`;
    *   `vouchedBy` replaced with "Iva P.", "Luka P.", "Ana P.", "Marko P."
        and "Iva P." in order;
    *   `company` replaced with "Primjer d.o.o." where present.

#### 4.7 Hero photos (Create)

*   **`src/assets/hero/hero-01.jpg`, `hero-02.jpg`, `hero-03.jpg`:**
    *   Three photos from Unsplash, found by searching "tech meetup",
        "developer workshop" and "coding group".
    *   Landscape, at least 1600 px wide.
    *   No readable company logos and no identifiable screens.
*   **`src/data/hero-photos.json`:** one entry per photo, with `id`, `file`,
    `alt` (hr and en), `source` (the photo's Unsplash URL),
    `licence: "Unsplash License"` and `mock: true`.

### Phase 5: Job wall and carousel

**Exit check:** CUJs 7, 9 and the home job preview pass on `npm run
preview`, with JavaScript on and off.

#### 5.1 `src/views/Jobs.astro`, `src/lib/jobs.ts`, `src/components/JobCard.astro` (Create)

*   **`src/lib/jobs.ts`:**
    *   `isLive(posted, now, days)`: true while the whole days since
        `posted` are at most `days`.
    *   `visibleJobs(jobs, now)`: keeps mocks and live postings, sorted by
        `posted` descending.
    *   No Astro imports.
*   **The page, in order:**
    1.  `PageHero` with `SECTIONS.jobs`.
    2.  A `<Callout>` with `jobs.how.title`, `jobs.how.p`, the four
        `jobs.rules.*` items, and the post-a-job button (`jobs.post`). The
        button is a mock with no `href` while `JOBS_FORM_URL` contains
        `REPLACE-ME`.
    3.  The filter: three `.g-filter` buttons with `data-jobs-filter`
        values `all`, `hiring` and `available`, labelled `jobs.filter.*`,
        `hidden` until the script runs.
    4.  The count (`jobs.count.one` or `jobs.count.many`).
    5.  The cards, or `jobs.empty` when there are none.
*   **`JobCard`:**
    *   Header: the kind badge (`jobs.kind.*`), the type (`jobs.type.*`) and
        `MockBadge`.
    *   Role, then company, then location.
    *   The posted date through `formatDate`.
    *   Description.
    *   `jobs.vouched` with `vouchedBy`.
    *   The link (`jobs.apply` for hiring, `jobs.contact` for available).
        `https:` links open in a new tab with `rel="noopener"`.
    *   `lang` on role, company, location and description only.
    *   `data-jobs-kind` on the card.
*   **The home preview** shows `visibleJobs()` limited to
    `JOBS_PREVIEW_COUNT`, with `home.jobs.title` and a `home.jobs.all` link
    to `/jobs/`.

#### 5.2 `public/scripts/jobs-filter.js` (Create)

*   Unhides the filter, sets `aria-pressed`, hides cards whose
    `data-jobs-kind` does not match, and rewrites the count from
    `data-count-one` and `data-count-many`.
*   It uses its own `data-jobs-*` names, so `blog-filter.js` never binds to
    it.

#### 5.3 `src/components/HeroCarousel.astro`, `public/scripts/hero-carousel.js` (Create)

*   **`HeroCarousel`:**
    *   Loads `heroPhotos` and resolves each `file` with
        `import.meta.glob('/src/assets/hero/*.jpg', { eager: true })`. A
        missing file throws a build error that names it.
    *   Renders each photo as a `<figure>` with `<Image>`, `alt` in the
        page's language, and a caption of `mock.photo` plus `MockBadge`.
    *   Photos after the first have `hidden`.
    *   A `<button>` with `data-label-pause` and `data-label-play`, also
        `hidden` until the script runs.
    *   The wrapper has `aria-roledescription="carousel"` and
        `aria-label={t(locale, 'carousel.label')}`, plus
        `data-interval={HERO_INTERVAL_MS}`.
*   **`hero-carousel.js`:**
    *   Unhides the button.
    *   Advances every `data-interval` ms by moving `hidden` to the next
        photo.
    *   The button toggles between pause and play and updates its label and
        `aria-pressed`.
    *   Starts paused when `prefers-reduced-motion: reduce` matches.

#### 5.4 Fonts (Copy and modify)

*   **`src/styles/tokens/fonts.css`:** the four Quantico `@font-face` rules
    are replaced by eight Exo 2 rules (latin and latin-ext × 400 and 700 ×
    normal and italic).
    *   The `unicode-range` values are copied from the same response as the
        files: `https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,400;0,700;1,400;1,700&display=swap`,
        requested with a current desktop browser user agent.
*   **`src/styles/fonts/`:**
    *   Quantico's woff2 files and `OFL-Quantico.txt` are removed.
    *   Eight `exo2-*.woff2` files and `OFL-Exo2.txt` are added.
    *   `src/styles/fonts/README.md` gains the fetch URL and date.

### Phase 6: Checks, CI and documentation

**Exit check:** `npm run check` passes locally. The pull request's workflow
run passes. Each fixture test shows its check failing on bad input.

#### 6.1 `scripts/check-links.mjs` (Create)

*   Reads every `.html` file in `dist/`. Internal links are:
    *   root-relative `href`, `src` and `srcset` values;
    *   absolute URLs on `https://karlovac-developers.github.io`.
*   Fails when an internal link has no matching file in `dist/` (a path
    ending in `/` maps to its `index.html`).
*   Fails when a page link (a path ending in `/`) on a page under `/en/`
    points outside `/en/`, or a page link on a page outside `/en/` points
    into it, unless the `<a>` or `<link>` has `hreflang`.
*   Exports a `checkDist(dir)` function for the tests.

#### 6.2 `scripts/list-mocks.mjs` (Create)

*   Prints every content file with `mock: true` in its frontmatter, every
    JSON entry with `"mock": true`, and every `HOME.stats` and
    `HOME.testimonials` item with `mock: true` (imports `src/config.ts`).
*   Prints every line in `src/` containing `REPLACE-ME` or `example.com`.
*   Always exits 0. Exports `listMocks(root)` for the tests.

#### 6.3 `tests/` (Create)

*   **`dates.test.ts`:** `isUpcoming` for an event yesterday, today at 00:00
    and at 23:00 Zagreb time, and tomorrow, across a daylight-saving change.
*   **`jobs.test.ts`:** `isLive` at 59, 60 and 61 days. `visibleJobs` keeps
    a mock posted 400 days ago and sorts newest first.
*   **`i18n.test.ts`:** no empty string in `ui.hr`, `ui.en` or any
    `{ hr, en }` pair in `src/config.ts`.
*   **`check-links.test.mjs`:** fixtures in `tests/fixtures/dist-ok/`,
    `dist-broken/` (one missing target) and `dist-crossing/` (an `/en/`
    page linking to `/about/` without `hreflang`). Only `dist-ok` passes.
*   **`list-mocks.test.mjs`:** a fixture tree with one mock entry and one
    `REPLACE-ME` line. Both are listed.

#### 6.4 `.github/workflows/deploy.yml` (Create)

*   Based on `deploy-astro.yml.tmpl`.
*   Triggers: `pull_request`, `push` to `main`, `schedule` `0 3 * * *`,
    `workflow_dispatch`.
*   The `build` job (`permissions: contents: read`):
    *   `actions/checkout@v4`;
    *   `actions/setup-node@v4` with `node-version-file: .nvmrc` and
        `cache: npm`;
    *   `npm ci`, `npm run build`, `npm run check`, `npm run mocks`;
    *   `actions/configure-pages@v5` and
        `actions/upload-pages-artifact@v3` with `path: dist`.
*   The `deploy` job:
    *   runs only when the event is not `pull_request`;
    *   `needs: build`;
    *   `permissions: pages: write, id-token: write`;
    *   `environment: github-pages`;
    *   `actions/deploy-pages@v4`;
    *   `concurrency: { group: pages, cancel-in-progress: false }`.
*   `scripts/templates/` is then deleted.

#### 6.5 `README.md` (Modify, full rewrite)

*   What the site is.
*   Setup and commands: `npm install`, `dev`, `build`, `check`, `mocks`.
*   How to add, in both languages, a page, an event, a post or a job
    posting.
*   How to turn a feature off: set its flag and delete its entry files, with
    the file list per feature.
*   The mock rules.
*   Who copies each Meetup event into `src/content/events/`: the organizer
    who creates it on Meetup, the same day.
*   Scheduled builds: GitHub disables the daily build after 60 days without
    repository activity. Re-enable it under Actions → deploy → Enable
    workflow.
*   Rollback, as in Cutover.

#### 6.6 `CLAUDE.md` (Modify, full rewrite)

*   Describes the Astro project, with these rules:
    *   Logic lives in `src/views/`. Each route has an entry file under
        `src/pages/` and one under `src/pages/en/`.
    *   Interface text comes from `t()` or `pick()`, never literal strings.
        A new key goes in `ui.hr` and `ui.en`.
    *   English MDX links start with `/en/`.
    *   Every mock carries `mock: true`. Mock people's surname is "Primjer".
    *   Every change to a theme file gets a row in `THEME.md`.
    *   Files loaded by Node (`ui.ts`, `config.ts`, `src/lib/dates.ts`,
        `src/lib/jobs.ts`) use `.ts` imports and no `astro:*`.

#### 6.7 Design record (Modify)

*   This file's Status becomes Approved when implementation starts, and any
    deviation from the plan is noted here.
*   `docs/designs/review/` is committed with it.

### Cutover

1.  Push the feature branch, and confirm the pull request run passes.
2.  Create the rollback branch:
    `git branch live-static e27727f && git push origin live-static`.
3.  Switch Pages to Actions:
    `gh api -X PUT repos/karlovac-developers/karlovac-developers.github.io/pages -f build_type=workflow`.
    The current site stays up until the first deploy.
4.  Merge to `main` and watch the deploy job.
5.  Walk through CUJs 1–10 on the live site.
6.  **Roll back** if any of CUJs 1, 2, 3 or 7 fails on the live site and
    cannot be fixed on `main` the same day:
    *   `gh workflow disable deploy.yml`;
    *   set the Pages source back to "deploy from branch", branch
        `live-static`, folder `/`.

### Verification Plan

*   **Build:** `npm run build` with no errors.
*   **Types:** `npx astro check` with no errors, which also proves dictionary
    parity.
*   **Tests:** `node --test` passes the cases in 6.3, including the fixtures
    that must fail.
*   **Static checks:** `npm run check` passes.
*   **Mock report:** `npm run mocks` lists:
    *   2 mock events, 2 posts, 1 author, 2 speakers, 1 venue, 2 organizers;
    *   5 job postings, 3 photos;
    *   the Code of Conduct, start and get-involved pages and the two docs,
        in each locale;
    *   4 stats and 2 testimonials;
    *   `JOBS_FORM_URL`;
    *   the `example.com` addresses.
*   **Feeds:** `dist/rss.xml` and `dist/events/calendar.ics` have "Primjer: "
    on every mock title (CUJ 10).
*   **Manual walk-through:** `npm run preview`, CUJs 1–9 in a browser, once
    with JavaScript off for CUJs 7 and 9, and once with reduced motion on for
    CUJ 9.
*   **Turn-off test (CUJ 11):** on a scratch branch, set `FEATURES.venues`
    to `false`, delete the venue entry files, and confirm `npm run build`
    and `npm run check` pass with no venue links.

--------------------------------------------------------------------------------

## Implementation notes (2026-11-05)

Both open questions resolved as hoped: entry files export
`getStaticPaths = () => paths('<locale>')` and Astro accepts it, and the
`file()` loader reads `src/data/*.json`. Deviations from the plan:

*   **Phases 2 and 3 landed together.** Changing the config text to
    `{ hr, en }` pairs breaks every theme page that reads it, so the i18n core
    and the views had to change in the same commit.
*   **Components read the locale themselves** with `getLocale(Astro)` rather
    than receiving it as a prop. `Astro.currentLocale` is available in
    components, so the prop added nothing.
*   **The unchanged theme had 19 type errors, not 1,** because npm installed
    TypeScript 6, which enables `strict`. TypeScript is pinned to `^5`; the
    remaining 5 errors were fixed in phase 1 (THEME.md).
*   **`AuthorBox` stays visible when `authors` is off.** It also renders
    speakers and organizers, so only the profile link is gated, by the flag of
    that profile type.
*   **Mock pages and docs are shorter adaptations** of the theme's starter text
    in both languages, keeping its headings, callouts and checklists, not full
    translations. Checklist ids carry a language suffix so the two versions do
    not share saved progress.
*   **Mock names avoid the maintainer's first name:** `vouchedBy` values are
    Iva P., Luka P., Ana P., Petar P., Iva P., and the second organizer is
    Petar Primjer.
*   **Exo 2 is four files, not eight.** It is a variable font; Google serves
    the same file for 400 and 700, so each style and subset has one file with
    `font-weight: 400 700`, like the theme's Inter.
*   **Hero photos:** Unsplash `m76kVfIRS5U`, `bIltCMXIwRE` and `UikYLDQj9_I`.
    Two earlier candidates were dropped for showing Apple logos, one for
    portrait orientation and one for a company sign.
*   **The link check has one more exemption:** links inside an entry body shown
    in the other language (`data-entry-lang`) may point at pages in the
    entry's language, since the body is written once. The 404 page uses a new
    `langRule: 'none'` and emits no canonical or hreflang.
*   **`npm run mocks` scans only content, data and `src/config.ts`** for
    placeholders, skipping comments, so code fallbacks are not listed.
*   **The previous site stays reachable at `/old/`** (owner's request after
    implementation). `public/old/` holds the files of `main` at `e27727f`,
    copied unchanged except for a `noindex` tag and canonical and `og:url`
    links pointing at `/old/`. Astro copies it into the build as-is. The
    rollback to `live-static` is unaffected.
*   **The `lang.switch.aria` key holds text in the target language** in each
    dictionary ("Read in English" in `hr`), and the switcher link carries the
    matching `lang`.
*   **Meetup content (owner's request after implementation; Meetup sync was
    out of scope for v1).**
    *   *Build-time sync:* the `events` loader adds the upcoming events in
        Meetup's public iCalendar feed that have no file (see README). The
        feed lists no venue and no past events.
    *   *One-off import:* the ten most recent past events (2025-11-25 to
        2026-10-10) and their four venues were imported from the data
        embedded in Meetup's public event pages. That data is undocumented
        and may fall under Meetup's terms of use, so it was read once, by
        hand, and is not part of the build. The import replaced the
        hand-written CroMesh #2 and Korana files. Korana takes Meetup's
        details: 10:00–23:00 at Foginovo kupalište.
    *   *Mocks:* the two mock events moved to September and October 2025, so
        the upcoming list shows only real events, and they still demonstrate
        talks and speakers. Mock events are left out of the "events hosted"
        stat.
    *   *Stats and talk form:* the stats are real (founded 2017, 200+ members,
        free entry, and past events counted as above). The talk page links to
        the group's Croatian "Call For Speakers" Google Form.
    *   *Hero photos:* the Unsplash photos were replaced by three images from
        the group's Meetup pages (the group photo, the Korana meadow and the
        OpenStreetMap event cover), with the owner's approval.
    *   *People:* no member data was imported. Speaker names appear only
        where the organizers wrote them in the event descriptions.

--------------------------------------------------------------------------------

*Drafted with EGM*
