# Stage 5: Initial Zoom Out Review

**Target:** `docs/designs/astro-popular-migration.md` (lines 1–1252, full file)
**Reviewer:** `egm-zoom-out` (Skeptical Architect). Status: completed.
**Context read:** persona, zoom-out standard, the full target, the concept brief, CLAUDE.md, and upstream theme files at `d1554d5` (config.ts, content.config.ts, astro.config.mjs, BaseLayout.astro, index.astro, [...slug].astro, events/[slug].astro, speakers/index.astro, Notice.astro, PreviewBar.astro, lib/collections.ts, public/scripts/nav.js, package.json).

**Verdict:** no Blockers. The objective, motivation and root problem are clear and match the brief. The main problem is complexity: most of it is machinery built and checked for features that are switched off in v1. 5 Major, 8 Nit.

## Major

### M1. Disabled features are fully converted to bilingual code now
*   **Scope:** Goals, "Theme features without content are off, not removed" (L84–87); #31 (L982–986); #35 (L1016–1023); #39 (L1051–1057).
*   **Rationale:** v1 enables events, jobs, pages and home. Yet the plan moves 11 disabled page files into views and converts each to `t()`/`pick()`/`localeHref()`/`formatDate()` (BlogList, Post, Author, Tag, Talks, SpeakersIndex, Speaker, VenuesIndex, Venue, OrganizersList, Organizer). It does the same for disabled-only components (PostCard, AuthorBox, CalendarSubscribe, Checklist, SpeakerInvite) and three disabled endpoints. That is most of the conversion work, none of it is visible in v1, and only `astro check` covers it. It will drift until a flag is turned on.
*   **Challenges recorded decision 15.** A cheaper option meets decision 15 and Goal L86: keep disabled theme files in the repo, unconverted and outside the build (for example a `theme-parked/` folder recorded in THEME.md), and convert them when the feature is turned on, which is the only time the work can be tested. If decision 15 stays as written, the design should say plainly that the converted disabled code is untested until its flag goes on.

### M2. Renaming fixed routes is a workaround; leaving out entry files is simpler
*   **Scope:** "How a flag takes effect" (L388–396); #32 (L997–1002); #35 (L1016–1023).
*   **Rationale:** `speakers/index.astro` → `speakers/[...index].astro`, `rss.xml.js` → `[rss].xml.ts` and similar exist only so `getStaticPaths` can return `[]`. Option A already gives a structural switch: a route exists only if its entry file exists. Keep disabled views (or park them, per M1) and do not create their entry files. Turning a feature on means setting the flag (nav, footer, home) and adding two short entry files. The renames, per-view `getStaticPaths` gating and the "if jobs is ever turned off" footnote (L1000–1002) go away. The code-level detail at L394–395 is also an altitude drop.
*   **Contradicts recorded decision 15's mechanism** ("A disabled route's `getStaticPaths` returns `[]`").

### M3. `keyFeature` and enabled-only key checking do nothing in v1; CUJ 9 and the flag test cannot fail as written
*   **Scope:** Feature flags, Translations bullet (L400–402); #18 (L853–860); #57 (L1182–1185); CUJ 9 (L221–229); Verification Plan, flag test (L1243–1245).
*   **Rationale:** #18 types `ui.ts` so both sides have the same keys and writes Croatian for every theme key from day one. TypeScript (`astro check`, in CI) already fails on a missing key, so feature-tagged filtering has no gap to catch. The flag test ("no English blog strings") cannot happen: the English blog strings are the theme's own and already exist. CUJ 9 rests on the same premise.
*   **Fix:** require every key in both languages always, enforced by the type, and drop `keyFeature`. Rewrite CUJ 9 and the flag test to check something that can fail (an empty Croatian value, or a missing entry file). This follows decision 15's "no translations until on", but #18 already gives up that saving.

### M4. The sitemap filter needs a cross-layer module for a problem the canonical already solves
*   **Scope:** Sitemap (L360–362); #8 (L753–756).
*   **Rationale:** `astro.config.mjs` cannot call `getCollection`, so the "small module" would read content outside the content layer, duplicating the zod collections, and it gets harder once an event has `lang: 'en'`. The `/en/` copies already carry a canonical to the content-language URL (decision 25). Simpler options: (a) drop the filter, (b) a path-pattern rule with no content lookup, (c) the theme's existing `noindex` prop on BaseLayout (BaseLayout.astro L25, L116) for those copies.

### M5. Importing `getStaticPaths` from an `.astro` view is unverified; the shared `getStaticPaths` depends on an unstated rule
*   **Scope:** Language routing (L296–299); #31 (L969–970); #32 (L991–992).
*   **Rationale:** (1) `.astro` modules are typed with a default export only, so `import { getStaticPaths } from '../views/X.astro'` is likely to fail `astro check`, which CI runs. A sibling `.ts` module per route for `getStaticPaths` is the conventional layout. (2) `getStaticPaths` has no `Astro.currentLocale`, so the shared function returns the same params for both locales. For `Page.astro` that works only because `hr/` and `en/` have identical file names. State that dependency explicitly.

## Nit

### N1. Twin checks duplicate the link check
*   **Scope:** Language routing (L300–304); check-i18n bullets 3–4 (L1187–1190).
*   Every page links to its swapped-prefix peer, and `check-links.mjs` fails on missing targets, so it already proves twins exist. Drop the file-tree twin checks and their allow-list, or keep only the page-folder check as a faster early failure.

### N2. Goal 2 and CUJ 2 describe a fallback that is not built
*   **Scope:** Goals (L72–75); CUJ 2 (L160–162); `peerHref` (L330–335).
*   `peerHref` always swaps the prefix (except on 404), and the checks prevent missing peers. The Goals and CUJ still promise a home-page fallback for single-locale pages, which do not exist. Reword.

### N3. PreviewBar is converted but can never render here
*   **Scope:** #39 (L1051).
*   PreviewBar.astro renders only under `SITE.previewMode` or `POPULAR_PREVIEW_NOTE` for generator builds. Drop it as DemoBar is dropped, with `previewLabel`/`previewBanner`.

### N4. Factual counts and claims about the theme
*   **Scope:** L315, L336, L339, L854, L1104–1108.
*   `STRINGS` at `d1554d5` has 79 keys (config.ts L32–110), not 76.
*   26 files outside config.ts read `STRINGS` or `SITE.locale`, not 25.
*   `nav.js` has no strings. Only `copy-code.js` and `checklist.js` read `data-` attributes from `<body>`.
*   `index.astro` hard-codes English outside `STRINGS`: "The team", "Meet the organizers", "All organizers" (L153–161) and a `'Community'` fallback (L195). The key check cannot catch these.

### N5. Endpoint file names disagree across sections
*   **Scope:** L303–304, L391, L1016–1020.
*   The allow-list says `rss.xml.ts`, `events/calendar.ics.ts`, `llms.txt.ts`. "How a flag takes effect" says `rss.xml.js`. #35 renames to `[rss].xml.ts`, `events/[calendar].ics.ts`, `[llms].txt.ts`. Pick one. With M2, these are simply not routed in v1.

### N6. `localeHref` stacks two base-prefixing helpers
*   **Scope:** L327–329; #55 (L1169–1170).
*   `getRelativeLocaleUrl()` already applies `base`. Adding `withBase` risks a double prefix if `base` changes. Use one. Keep `url.ts` for `absoluteUrl` and the theme's untouched callers.

### N7. Use an existing link checker
*   **Scope:** #58 (L1192–1197).
*   lychee (offline) or linkinator against `dist/` already do this. Low stakes.

### N8. Carousel cost for stock photos (challenges recorded decision 17)
*   **Scope:** CUJ 8; Hero carousel (L419–425); #29, #30, #45, #48.
*   A manifest, licence audit, component, client script, strings and flag, all to rotate photos labelled "illustrative". The theme's single hero image costs nothing, and `heroCarousel: false` already exists. Recorded as the largest optional simplification, since it is the owner's decision.

## Keep as is

*   Reuse of `safeCollection` for conditionally registered collections.
*   Client strings through `data-` attributes, the theme's pattern.
*   DraftBanner on the theme's `g-notice` styles.
*   Build-time jobs through the zod `file()` loader.
*   One daily cron with no client-side expiry duplicate.
*   Single-value config for URLs, SOCIAL and BRAND.
*   The reasoning for rejecting i18n libraries and git subtree.
