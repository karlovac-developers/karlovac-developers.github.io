# Stage 9: Implementation Readiness Test

**Target:** `docs/designs/astro-popular-migration.md`, DetailedRange lines 680–1252.
**Standard:** `implementation-readiness-standard.md` (zero-decision rule).

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-implementation-readiness` | completed (verdict: fails the zero-decision rule) |
| `egm-codebase-details` | completed |
| `egm-style` | completed |

After removing duplicates: **1 Blocker, 17 Major, 21 Nit.**

The orchestrator checked three claims against the theme source before writing this report, and all three hold:
*   `src/lib/talks.ts` L38 and L78 type against `CollectionEntry<'speakers'>`.
*   `Footer.astro` L4 imports `version` from `package.json`.
*   `EventsEmpty.astro` L22 and `events/[...page].astro` L57 render `<CalendarSubscribe />` unconditionally.

**Confirmed correct by the codebase reviewer:** the dependency versions, the Node 22 pin, the behaviour of `popular-markdown.mjs`, that every listed theme file exists, the `data-` attributes used by the client scripts, the job and carousel constants, the event facts for CroMesh and Korana, and the five English mock postings.

## Blocker

### R1. Copying the theme as planned fails `astro check` and possibly `astro build`
*   **Lens:** implementation-readiness IR-B1, codebase B1 and M2.
*   **Scope:** #5, #10, #20, #36, #38, #40, #55; Verification (L1235–1237).
*   Three separate causes:
    1.  **Collections registered only when their flag is on** (#20). `lib/talks.ts` (L38, L78, imported by the enabled event pages), `OrganizerCard`, `AuthorBox` and `PostCard` all reference collection types that would not exist. `calendar.ics.ts` calls `getCollection('venues')` directly.
    2.  **Footer imports `version` from `package.json`** (L4, rendered at L45), but the new `package.json` (#5) has no `version`. That is a type error, and probably a build error from the missing export.
    3.  **The theme has never been type-checked.** `BaseLayout.astro` L44 reads `SITE.fontAwesome`, which `SITE` does not declare.
*   **Recommendation:**
    *   Either register every collection always, with a `.gitkeep` per empty folder and a relaxed Verification warning rule, or list the theme files that change to `safeCollection` and loose types, each moved to "Copy and modify".
    *   Remove the version suffix from Footer (#38), or add `version` to #5.
    *   Run `astro check` once on the unchanged copy, and fold every error into the plan and `THEME.md`.

## Major

### R2. No phases with exit checks; commit 1 cannot build (IR-M1)
*   **Scope:** L687–692.
*   Step 2 is all 60 items with no order. Step 1 does not say whether demo content, `setup-questions.json`, `DemoBar.astro`, the other `scripts/*.py`, `CHANGELOG.md` or `AGENTS.md` are copied. The upstream `package.json` declares workspaces that are not copied, so commit 1 needs its own minimal `package.json`. The brief's staging, including "confirm the untouched build passes the a11y gate", was lost.
*   **Recommendation:** phases with an exit check each:
    1.  Import plus a minimal `package.json`, then build.
    2.  Flags and demo removal, then build plus alt-text check.
    3.  i18n and layout, then `check:types`.
    4.  Content.
    5.  Jobs and carousel.
    6.  CI and docs.

    Give step 1 an explicit file list.

### R3. Config and view conversions contradict each other (IR-M3, codebase M10; adds weight to Stage 8 Z1)
*   **Scope:** #17 `HOME`, `SECTIONS`; #31.
*   Removing `HOME.stats` and `testimonials` breaks `index.astro`'s reads (L72–80, L167–190), which contradicts "off, not removed". Leaving disabled `SECTIONS` as plain strings breaks `pick()` in converted views that `astro check` still type-checks.
*   **Recommendation:** every config text field becomes an `{ hr, en }` pair now, or disabled views are not converted. Make #17 and #31 agree.

### R4. Component-level flag checks are missing; v1 fails the link check (IR-M4, codebase M1, M5)
*   **Scope:** #31, #36, #39; flag table L382.
*   `CalendarSubscribe` links to `/events/calendar.ics`, which is never built with `calendar` off, from `EventsEmpty` (home and events page) and `events/[...page].astro`. `check-links.mjs` fails on day one. Separately, loading `blog-filter.js` only when blog is on breaks the talks page, which uses the same script (`talks/[...page].astro` L5–7).
*   **Recommendation:** list every flag check inside components: `CalendarSubscribe`, `SpeakerInvite`, the RSS link, and the script loading on `blog || talks`.

### R5. `withBase()` → `localeHref()` would break assets and external links (IR-M5; settles Stage 5 N6)
*   **Scope:** #31, #37, #39; L327–329.
*   `withBase()` also wraps scripts, Font Awesome, the logo, hero, favicon, external URLs and `mailto:`. Swapping it wholesale gives `/en/scripts/nav.js` and mangled external links.
*   **Recommendation:** `localeHref` touches only site-absolute page paths and passes everything else through. Asset calls keep `withBase()`.

### R6. The i18n helpers have no signatures (IR-M6)
*   **Scope:** #19; L319–335.
*   `contentAlternate` cannot build a URL from its arguments, `peerHref(url)` and `peerHref(pathname)` disagree, `Astro.currentLocale` is `string | undefined` with no narrowing helper, and how components get the locale is not stated.
*   **Recommendation:** TypeScript signatures for every export, a `getLocale(Astro): Locale` helper, and one rule for how components receive the locale.

### R7. BaseLayout's list of changes is incomplete (codebase M3)
*   **Scope:** #36.
*   `SITE.title`, `tagline` and `description` (L29–30, 95, 97, 107, 110) need `pick()`. `copyCode`, `checklistDone` and `skipToContent` (L120–121) need `t()`. `og:locale` needs the `hr_HR` form, not `localeTag()`'s `hr-HR`.

### R8. Disabled endpoints and components read `SITE` keys that #17 removes (codebase M4)
*   **Scope:** #17, #35, #39.
*   `SITE.locale` is used in `llms.txt.ts`, `talks`, `EventRow`, `PostCard` and `blog/[slug]`. `SITE.talks` and `SITE.speakers.invite` are cast to `any`, so turning a flag on later silently does nothing. `llms.txt.ts` expects page ids `'start'` and `'about'`, but they become `hr/about`. `SpeakerInvite` links to `/speak/`.
*   **Recommendation:** list each change: `FEATURES.*` instead of `SITE.talks`, prefixed page ids, `pick()`, `safeCollection('venues')`, and SpeakerInvite linking to `/give-a-talk/`.

### R9. The job schema and the jobs page are underspecified (IR-M7, codebase M8)
*   **Scope:** #18, #20, #28, #31, #44.
*   Optional fields are not named, and the `available` mock postings have no `company`. `type` should be an enum of `full-time`, `part-time`, `contract`, `internship`, `student`. The current page's subtitle, "How it works", four rules, posted date on each card, `jobs.type.*`, `jobs.vouched`, the home page's "See all postings" link, and the new-tab rule for `http(s)` links are not specified. How a placeholder `JOBS_FORM_URL` is detected is not stated.
*   **Recommendation:** write out the zod schema, the page sections in order, and a mapping from each `jobs.*` key to its new key.

### R10. Home page content and order are open (IR-M8, codebase M7)
*   **Scope:** #17, #31.
*   `hero.*` has only `tagline` and two CTAs. The current title is the literal "KD." and there is no eyebrow or lead. `join.p3` contains an `<a>`, but feature `body` renders as plain text. No icons are named. The job preview's place, heading and link are not given.
*   **Recommendation:** give the values (title, lead from `hero.tagline`, CTAs with their Meetup URLs from `index.html` L42–43), the icons, and the section order.

### R11. `lang` on whole cards mislabels interface text (IR-M9)
*   **Scope:** #39, #44; L352–353.
*   Badges, "Vouched by", Apply and `MockBadge` would be read in the wrong voice. Put `lang` only on the inner text: title, description, venue, role, company, location.

### R12. The carousel cannot be built without decisions (IR-M10, style M5; adds to C8 and Z6)
*   **Scope:** #29, #30, #45, #48.
*   `<Image>` needs imported `ImageMetadata`, but the manifest holds strings, and the resolution method is not given. #18 has control strings, but no controls are defined. How photos are hidden without JavaScript is not said. Photo count, source and licence string are open ("two to four", "for example Unsplash").

### R13. No negative or edge-case tests (IR-M11)
*   **Scope:** Verification (L1233–1252).
*   No custom check is shown to fail on bad input. "No test runner" overlooks `node --test`.
*   **Recommendation:** pure expiry and upcoming functions in `src/lib/` with `node --test` cases (59, 60 and 61 days, mock exempt, event today, event yesterday), fixture tests for each check, and all of them wired into `check`. The old code keeps day 60 (`<=`), so test the boundary.

### R14. Node type stripping and imports (style M8, codebase M6, IR Nit 6)
*   **Scope:** #5, #7, #57, #8.
*   Running `.ts` without a flag needs Node 22.18 or later, while `engines: ">=22"` allows 22.0–22.5, which cannot strip types at all. Node needs explicit `.ts` extensions and cannot load `astro:*`, but `localeHref` wraps `astro:i18n`.
*   **Recommendation:** pin `>=22.18`. `ui.ts`, `config.ts` and anything Node imports use `.ts` extensions, `import type` only, and no `astro:*`.

### R15. The `check` script's inputs are wrong (style M2, IR Nit 7, codebase Nit 4 and 8)
*   **Scope:** #5.
*   `check-i18n` reads `src/`, not `dist/`. Give the exact command. Also run `check-image-alt.py` on `src/content`, as the theme does. Give versions for `@astrojs/check` and `typescript`.

### R16. Content sources and placeholder text are ambiguous (style M4, IR Nit 3 and 4, codebase Nit 6)
*   **Scope:** #21–#27.
*   "Current" vs `legacy-static`: name one source everywhere ("`translations.js` on `legacy-static`"). The Korana entry does not say whether the schedule goes in the body, or which sections are left out. The mock CoC keeps `hello@example.com` and an "Adapt it to your community" closing. MDX import paths need one more `../` under `hr/` and `en/`. "Sajam znanja na Korani" comes from `index.html` L96, not `next.*`.

### R17. Exo 2 needs its own `unicode-range` values (codebase M9)
*   **Scope:** #52, #53.
*   The theme's font README says ranges must come from the same Google Fonts fetch as the files. Record the fetch URL. Also, `BRAND.fontDisplay` (codebase Nit 3) can carry the override and leave `typography.css` unmodified.

### R18. Wording that leaves the implementer guessing (style M1, M3, M6, M7, M9)
*   **Scope:** #8, #14, #32, #54, Cutover step 5.
*   #8's "small module" is unnamed (moot if Z2 drops the sitemap filter). #14's "scheduled-workflow caveat" is not stated. #32 "`jobs/index.astro` is fixed" is ambiguous, and the rename rule has no reason (moot if Z1 removes renames). #54 says "theme CSS stays unmodified", which contradicts #52. Rollback "if needed" has no trigger.

## Nit

1.  `lang` values: the CUJs expect `hr` and `en`, while `localeTag()` gives `hr-HR` and `en-GB` (IR).
2.  CroMesh with no venue shows "Venue wanted" and "Venue to be announced" on a past event (IR).
3.  #16 is marked Create but already exists, and the fate of `docs/designs/review/` is open (IR, style).
4.  `deploy.yml`: start from the theme's `scripts/templates/deploy-astro.yml.tmpl` (action versions, `configure-pages`, `cancel-in-progress: false`, `contents: read` for build) (IR, codebase).
5.  `check-links.mjs`: say whether absolute same-origin URLs, relative paths and `srcset` count as internal, and where the allow-list lives (IR, style).
6.  `list-mocks.mjs`: how placeholder images are recognised (IR).
7.  NAV: whether "Host a meetup" repeats as its own first child (IR).
8.  Job `id` rule: `<role-slug>-<posted YYYY-MM-DD>` (IR, style).
9.  Jobs filter: reuse `.g-filter`, and use distinct `data-` names so `blog-filter.js` cannot bind to it (codebase).
10. `check-jsonld.py` could also run on `dist/` (codebase).
11. Draft banner: `<Callout tone="warn">` fits inside page content better than `.g-notice` (codebase).
12. Page parent back-links need the `hr/`/`en/` prefix stripped (codebase).
13. `pages` already uses `glob`, so only the folder layout changes. The `file()` loader is unverified for Astro 7 (codebase).
14. #35 "(and similar)": write out the parameter values (style).
15. #26: delete "Nothing is invented" and the line after it (style).
16. #15: write each topic as a rule (style).
17. "planning-note names": define it once (style).
18. #25: say the `hr` file is the translation and the `en` file the adapted text (style).
19. #53: name the Exo 2 source and version (style).
20. Verification: "the checks above cover the behaviour that can break" is absolute (style).
21. Small wording: L702, L1203, and the draft-banner text in both languages (style).
