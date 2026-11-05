# Stage 6: Comprehension Test

**Target:** `docs/designs/astro-popular-migration.md`. FeatureRange 1–679, DetailedRange 680–1252.
**Reviewer:** `egm-comprehension` (Naive Reader). Status: completed. No document standard applies to this stage.
**Context read:** persona, full target, concept brief, CLAUDE.md, the theme clone's `src/pages` listing, `jobs.json`.

## What this proposes

In one release, the hand-written bilingual static site is replaced by an Astro project. The project starts from a full copy of the Popular meetup theme's plain-project source at a pinned commit. The copy is then edited directly, and every change to it is logged in THEME.md. Astro i18n routing serves Croatian at `/` and English at `/en/`.

Each route keeps its logic in one view under `src/views/`. Each route also has two small entry files: one under `src/pages/` and one under `src/pages/en/`. All interface text comes from typed hr/en dictionaries and `{hr, en}` config pairs. Submitted content (events, jobs) is shown in both locales without translation. It is marked with `lang`, and on the off-language copy the canonical link points to the entry's own language.

Theme features with no content are switched off with `FEATURES` flags, not deleted. Current-site features (job wall, hero carousel, the give-a-talk, host-a-meetup and unconference pages, the language switcher) are rebuilt in the theme's design. Missing real content ships as labelled mocks that CI lists on every build. GitHub Actions builds the site, runs the checks and deploys on push and once a day. Rollback means pointing Pages back at the `legacy-static` branch.

## How the existing system works, per this document

The current site is five standalone HTML pages, each with its own copy of the header and footer. `translations.js` swaps the inline Croatian text for English in the browser after the page loads, so English has no URLs of its own and crawlers only see Croatian. Events are a hard-coded card on the home page. The job wall loads an unvalidated `jobs.json` in the browser, has a filter and hides postings after 60 days. GitHub Pages serves the `main` branch root with no build step. The current text and the `jobs.json` schema are kept only as source material. `rostilj/` and `unconference/` survive on `legacy-static`.

Compared with the brief, this matches decisions 1–31 with one exception: the document puts the events list under the untranslated canonical rule, while brief decision 25 counts listings as translated pages. See finding 3.

## Findings

5 Major, 7 Nit. No Blocker: every section could be paraphrased.

### F1. Endpoint names and the allow-list disagree. Severity: Major
*   **Scope:** Language routing allow-list (L301–304); Feature flags, "Fixed routes" (L390–396); #35 (L1016–1023); #57 (L1189–1190).
*   Three sets of names for the same endpoints: `rss.xml.ts` / `events/calendar.ics.ts` / `llms.txt.ts` (allow-list), `rss.xml.js` (flag section), `[rss].xml.ts` / `events/[calendar].ics.ts` / `[llms].txt.ts` (#35).
*   Two single-path patterns appear without explanation: rest routes (`[...index]`, `index: undefined`) for the indexes, and named parameters (`rss: 'rss'`) for the endpoints. A reader cannot tell what the allow-list should contain after the renames, or which pattern to use for a new flagged fixed route.
*   Why RSS may be Croatian-only while every other route needs a twin is explained only in #35, not where the allow-list is defined.

### F2. The switcher's fallback cannot be followed. Severity: Major
*   **Scope:** Goals (L72–75); CUJ 2 (L160–162); `peerHref` (L330–335); #33, 404 page (L1004–1009); #41 (L1064–1070).
*   The Goal and CUJ 2 promise a home-page fallback for pages in one locale. The `peerHref` section says no such page exists except 404. `peerHref` is a pure prefix swap given only a URL, so it cannot know a target is missing. #33 gives the 404 page links to both home pages, which leaves open whether 404 renders `LangSwitch` at all, and where it would point, since GitHub Pages serves `404.html` at any path.
*   Needed: one statement saying which pages use the fallback, how `peerHref` decides, and whether 404 renders `LangSwitch`.

### F3. Canonical and hreflang rules do not fit together. Severity: Major
*   **Scope:** Content in two languages (L350–362); CUJ 3 (L171–172); #31 `EventsList.astro`/`Event.astro` (L977–979); Goals, "Untranslated content is labelled" (L76–79).
*   #31 passes `translated={false}` and `contentLang` to both `EventsList` and `Event`. A list holds entries in mixed languages, brief decision 25 counts listings as translated, and the document gives no single `contentLang` for a list or a canonical for `/en/events/`.
*   The rule covers only "when the entry's language differs from the page's". What the same-language copy emits is unstated, for example whether `/events/korana-2026/` emits hreflang to an `/en/` copy whose canonical points back to it.
*   The Goal gives Croatian job postings under `/en/` a canonical to the Croatian page, but postings are cards on `/jobs/` with no page of their own.
*   Suggested: a table with rows for home and listings, MDX pages, an entry page in its own language, an entry page in the other language, and job cards; columns for canonical, hreflang and sitemap.

### F4. How strings of a disabled feature are stored is unclear. Severity: Major
*   **Scope:** Goals (L69–71); Feature flags, "Translations" (L400–402); #18 (L853–860); #57 (L1182–1185); Verification flag test (L1243–1245); CUJ 9.
*   #18 types `ui.ts` so both sides have the same keys, so a missing key is a type error whatever the flags say. The flag section and the brief say a disabled feature needs no translations. The flag test expects the i18n check to name missing English blog keys, but the type check would fail first.
*   Unanswered: are disabled features' `en` keys empty strings, or is the `en` side `Partial`? Who keeps `keyFeature` correct, and what happens when a core component uses a key tagged with a disabled feature? The text says "keys used by files of enabled features", but the mechanism is a tag map, not usage.

### F5. CUJ 9's navigation claim cannot pass as written. Severity: Major
*   **Scope:** CUJ 9 (L225–229); #17 `NAV` (L830–832).
*   CUJ 9 says turning on `FEATURES.blog` makes the blog appear in the navigation. The v1 `NAV` in #17 lists only Events, Jobs, Give a talk, Host a meetup and About, and nothing says a `feature: 'blog'` entry stays in config. The same question applies to the home "latest posts" section.

### F6. "Option A" is undefined. Severity: Nit
*   **Scope:** L299.
*   Not defined in this document. In the brief, "(A)" under B3 is a different choice (render every content route under both locales). Name the decision or cite it by number.

### F7. The sitemap filter's module is undefined. Severity: Nit
*   **Scope:** L342, L754–756.
*   It is not said what "the list" is, which module holds it, or how it is built at config time.

### F8. Mocks' exemption from expiry is only implied. Severity: Nit
*   **Scope:** CUJ 6 (L193–202); Job wall (L412); Alternative M.
*   No sentence in the FeatureRange says that postings with `mock: true` never expire because all five are already past 60 days, so CUJ 6 reads as a contradiction until #31.

### F9. "The build fails" is inaccurate. Severity: Nit
*   **Scope:** Goals L70, CUJ 9 L228, Verification.
*   The failure comes from `scripts/check-i18n.mjs` through `npm run check`, or from the type check, not from `astro build`. Say "CI fails" or "`npm run check` fails".

### F10. Rollback leaves the scheduled workflow running. Severity: Nit
*   **Scope:** Cutover step 5 (L1230–1231); Rollout & Rollback (L653–655).
*   Not said whether `deploy-pages` fails daily after Pages goes back to "deploy from branch", or whether to disable the workflow.

### F11. Undefined names and drifting terms. Severity: Nit
*   **Scope:** whole document.
*   Undefined: CroMesh; "the Korana day" (Korana not identified as a place until #27); rostilj ("barbecue"); unconference; "the user" and "the user's rule"; "Goldfish review findings" (L661); Sätteri; the theme config objects `SITE`, `NAV`, `CTA`, `FOOTER`, `SECTIONS`, `HOME`, `SOCIAL`, `BRAND`; the `talks` and `docs` features; "the docs branch" in #31.
*   Drift: "twin", "peer" (diagram L283), "counterpart". A short glossary fixes this.

### F12. Which README? Severity: Nit
*   **Scope:** #53 (L1155).
*   Not clear whether `src/styles/fonts/README.md` or the root README from #14 is meant.
