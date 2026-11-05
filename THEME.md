# Theme provenance

This site is built from the [Popular](https://github.com/mariatta/astro-theme-popular)
Astro theme by Mariatta, MIT licence (see `THEME-LICENSE`).

*   **Upstream commit:** `d1554d5e95ec11b7dbc42cbb2dad7327494cfe19` (v0.13.0, 2026-10-05)
*   **Copied from:** the plain-project copy in the upstream repository's top-level
    `src/`, `public/`, `astro.config.mjs`, `popular-markdown.mjs` and `tsconfig.json`.

To compare against a newer upstream release, check out both commits of the
upstream repository and diff the paths above. Then apply the upstream changes to
this project by hand, using the table below to see which files were changed
here.

## Not copied

`package/`, `demos/`, `smoke/`, `create-popular-site/`, `src/content/**` (demo
content), `src/data/setup-questions.json`, `public/images/**`, every file in
`scripts/` except `check-image-alt.py` and `check-jsonld.py`, `.github/`,
`AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`, `PACKAGING.md`, `PARITY.md`,
`RELEASING.md`, `UPSTREAM-HANDOFF.md`, `package.json`, `package-lock.json`.

## Local changes to theme files

Changes that apply to every converted file are listed once:

*   **Translation:** `STRINGS.x` → `t(locale, 'x')`; `SITE.title`, `tagline`,
    `description` and config text → `pick(locale, …)`; `SITE.locale` dates →
    `formatDate()` (Europe/Zagreb); page links `withBase()` → `pageHref()`. Every
    converted file reads the locale with `getLocale(Astro)`.
*   **Upcoming events:** `date >= now` → `isUpcoming()` (end of the day in Zagreb).
*   **Loop variables named `t`** (which shadowed the translation helper) renamed to
    `talk` or `tag`.

| File | Change | Reason |
| --- | --- | --- |
| `src/pages/**` page routes | Moved to `src/views/<Name>.astro`, with `getStaticPaths` in `src/views/<Name>.paths.ts`; replaced by entry files under `src/pages/` and `src/pages/en/` | One view per route, two languages (design: Language routing) |
| `src/pages/[...slug].astro` → `views/Page` | Reads `pages/<locale>/` and `docs/<locale>/`, strips the folder from the slug and parent links, shows a callout on mock pages | Pages and docs are written per language |
| `src/pages/index.astro` → `views/Home` | Rewritten for `{ hr, en }` config; carousel replaces the hero image; job preview section; flag checks per section; mock labels on stats and testimonials; organizer strings translated; past-event stat counts real events plus `MEETUP_PAST_EVENTS_NOT_ON_SITE`; next-event venue links to Meetup for synced events | Bilingual home page with the site's features |
| `src/pages/events/[...page].astro` → `views/EventsList` | Literal `title="Events"` → `t(locale, 'events.title')` | Croatian `<title>` |
| `src/pages/events/[slug].astro`, `blog/[slug].astro`, `authors/`, `speakers/`, `venues/`, `organizers/[slug].astro` → views | `langRule={{ entryLang }}`, `lang` and `data-entry-lang` on entry text, mock labels, venue/speaker/tag links behind their flags | Canonical points at the entry's language; untranslated text is marked |
| `src/pages/blog/[...page].astro`, `organizers/[...page].astro` → views | Literal titles → section titles | Croatian `<title>` |
| `src/pages/talks/[...page].astro` → `views/Talks` | Builds whenever its entry files exist (was `SITE.talks`) | Routes are turned off by deleting entry files (design decision 34) |
| `src/pages/rss.xml.js` | Croatian site title and description; mock titles prefixed "Primjer: " | A feed has one language and cannot show the mock label |
| `src/pages/events/calendar.ics.ts` | `safeCollection('venues')`; Croatian title; mock summaries prefixed "Primjer: " | As above |
| `src/pages/llms.txt.ts` | Rewritten in English with `/en/` links, `isUpcoming()`, `FEATURES` flags, mock prefix | Was single-language and read `SITE.locale`/`SITE.talks` |
| `src/layouts/BaseLayout.astro` | `lang`, `og:locale` (+ alternate), canonical and hreflang from `alternates()`; new `langRule` prop; RSS link and docs/blog scripts behind flags; DemoBar and PreviewBar removed; imports `site.css`; `SITE.fontAwesome` read loosely | Language rules in the design; the bars never render on this site |
| `src/components/Header.astro` | Labels from pairs, entries filtered by flags, `LangSwitch` added (not on 404), CTA opens Meetup in a new tab | Bilingual navigation |
| `src/components/Footer.astro` | Labels from pairs, links filtered by flags, land-acknowledgement block and theme version removed | Bilingual footer; no acknowledgement text; version belonged to the theme |
| `src/components/EventRow.astro` | Mock label; `lang` on entry text; venue-wanted, "to be announced" and "confirmed" only for upcoming events; speaker names behind the speakers flag; no venue-wanted badge for an event with `meetupUrl` and no venue, which links to Meetup for the location | A past event with no venue (CroMesh #2) showed "venue wanted" |
| `src/components/EventsEmpty.astro` | Chat button replaced by a link to Meetup's upcoming events | Meetup is where events are announced |
| `src/components/CalendarSubscribe.astro` | Renders nothing when `FEATURES.calendar` is off | No links to a feed that is not built |
| `src/components/SpeakerInvite.astro` | Shown on `FEATURES.speakers`, links to `/give-a-talk/` | `SITE.speakers.invite` and `/speak/` do not exist here |
| `src/components/AuthorBox.astro` | Profile link only when that profile type's flag is on; mock label; `lang` on bio | Also used for speakers and organizers |
| `src/components/PageHero.astro` | Optional `lang` and `mock` props | Entry titles in the other language; mock pages |
| `src/components/PostCard.astro` | Mock label, `lang` on entry text, tag links behind the tags flag | As above |
| `src/components/Pagination.astro` | Local helper renamed `pageUrl` | Clashed with the imported `pageHref` |
| `src/components/Checklist.astro`, `Notice.astro`, `OrganizerCard.astro`, `Photo.astro` | Translation conversion only | — |
| `src/components/DemoBar.astro`, `PreviewBar.astro` | Removed | Render only on the theme's demo and preview builds |
| `src/pages/events/[slug].astro` → `views/Event` (Meetup) | "Event on Meetup" link when `meetupUrl` is set; venue links to Meetup for synced events | Synced events have no venue |
| `src/components/HeroCarousel.astro` | Caption links to the photo's source; "illustrative photo" only on mocks | Photos are the group's own Meetup photos |
| `src/config.ts` | Rewritten: text as `{ hr, en }` pairs, `STRINGS` moved to `src/i18n/ui.ts`, `FEATURES`, job and Meetup constants, `isOn()`, site navigation and home content | Bilingual config |
| `src/content.config.ts` | `lang` and `mock` on collections; `jobs` and `heroPhotos` collections (`file()` loader); `events` loader wrapped by `withMeetupEvents()` | Content model in the design |
| `astro.config.mjs` | `site`, `trailingSlash: 'always'`, `i18n` block | Language routing |
| `src/styles/tokens/fonts.css`, `src/styles/fonts/` | Quantico files and rules replaced by bundled Exo 2 (latin, latin-ext); README notes the source | Quantico has no Croatian letters (design decision 28) |

## Tooling notes

*   TypeScript is pinned to `^5`. TypeScript 6 turns `strict` on by default, and
    the theme's code produces implicit-`any` errors under it.
