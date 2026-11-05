# Consolidated Review Report

**Target:** [`docs/designs/astro-popular-migration.md`](../astro-popular-migration.md) (1252 lines). FeatureRange 1–679, DetailedRange 680–1252.
**Mode:** consolidated (all five stages, run without pauses, and no edits made between stages).
**Date:** 2026-11-05

## Stage status

| Stage | Reviewers | Status | Report |
| --- | --- | --- | --- |
| 5. Initial Zoom Out | zoom-out | completed | [zoom_out_report.md](zoom_out_report.md) |
| 6. Comprehension Test | comprehension | completed | [comprehension_report.md](comprehension_report.md) |
| 7. Critic Review | design, structural, style | completed | [critic_report.md](critic_report.md) |
| 8. Intermediate Zoom Out | zoom-out | completed | [intermediate_zoom_out_report.md](intermediate_zoom_out_report.md) |
| 9. Implementation Readiness | implementation-readiness, codebase-details, style | completed | [implementation_readiness_report.md](implementation_readiness_report.md) |

The stage reports hold about 150 raw findings. This report merges them into **1 Blocker, 15 Major and 10 Nit-group action items**. The orchestrator checked five load-bearing claims against the theme source and the repo, and all five hold:
*   The theme ships demo events.
*   The mock postings name "Marko F.".
*   `talks.ts` types against `speakers`.
*   `Footer` imports `version` from `package.json`.
*   `CalendarSubscribe` renders with no condition.

**Overall:** the problem, goals and architecture hold up. No reviewer argued against the migration itself. Two things block implementation: the plan as written does not type-check or build when the theme is copied the way it says, and too many details are left to the implementer. Stage 8 found that most findings collapse into a few structural changes, and that several fixes proposed in Stage 7 add more than they solve. Those rejected fixes are listed at the end.

## Decisions needed from the owner

These four findings challenge a recorded decision. They need the owner's call before the design is revised.

| # | Question | Challenges | Options |
| --- | --- | --- | --- |
| D1 | Convert disabled features to bilingual code now, or park them unconverted until their flag is turned on? | Decision 15 ("converted now") | **Convert now:** larger v1, and disabled code is untested until turned on, plus R3's constraint that every config pair exists from day one. **Park:** the disabled views, their components and their keys stay out of the build and are converted when turned on. |
| D2 | How does a disabled route stay off: `getStaticPaths` returning `[]` with renamed fixed routes, or no entry files at all? | Decision 15's mechanism | **No entry files:** removes the renames, the allow-list entries for endpoints, and the "if jobs is turned off" footnote. **`[]` with renames:** keeps the current text. |
| D3 | Keep the auto-advancing carousel (needs a WCAG pause button), make it click-only, or use the theme's single hero image until real photos exist? | Decision 17 | **Keep:** add the pause control and the open decisions in A12. **Click-only:** no interval, no reduced-motion branch, no pause. **Single image:** `heroCarousel: false`, and the manifest, component and script are not built. |
| D4 | Roll back to a new `live-static` branch at `e27727f` (what is live today), or to `legacy-static` (which publishes unconference, the uncommitted edits and the rostilj page)? | Decision 11 as used by decision 30 | **`live-static`:** keeps `legacy-static` as the archive of source material. **`legacy-static`:** state openly what a rollback publishes. |

## Action items

### Blocker

**A1. Make the plan type-check and build.** (R1)
*   Decide how collections are registered: always registered, with `.gitkeep` files, or registered only when their flag is on, with the affected theme files listed as "Copy and modify". `talks.ts`, `OrganizerCard`, `AuthorBox`, `PostCard` and `calendar.ics.ts` reference collections by name.
*   Remove Footer's `version` import (or add `version` to `package.json`).
*   Make one `astro check` run on the unchanged copy the first gate, and fold each error into the plan (known so far: `SITE.fontAwesome`).

### Major

**A2. Restructure flags and translations around one rule.** (Z1; Stage 5 M2, M3, N5; F1, F4, F5; C10; R3; IR flag test)
*   Apply D1 and D2.
*   Typed `ui.ts` parity is the only key check, and `keyFeature` is removed.
*   Every config text field the compiled code reads is an `{ hr, en }` pair.
*   Keep `HOME.stats` and `testimonials` or delete their markup, consistently with D1.
*   Rewrite CUJ 9 and the flag test so they can fail.

**A3. One canonical and hreflang rule, and no sitemap filter.** (Z2; Stage 5 M4; F3; C15; style M1)
*   "A page is untranslated only if it renders a single submitted entry."
*   Listings, including `/events/` and `/jobs/`, are translated.
*   Event pages point their canonical at the copy under the entry's own language prefix, with no hreflang.
*   Job cards get `lang` only.
*   Drop the sitemap filter and its module.

**A4. Rollback that works.** (Z3; C4; F10; style M9)
*   Apply D4.
*   The first rollback step is `gh workflow disable`.
*   State what triggers a rollback.

**A5. Ship no theme demo content or placeholder images.** (Z4; C1; C2; Critic Nit 2; IR-M1 step-1 scope)
*   Copy no upstream `src/content/**` entries, and no `src/data/setup-questions.json` or `DemoBar.astro`.
*   Leave `SITE.logo` and `ogImage` unset, and use the current KD SVG favicon.
*   Replace the mock `vouchedBy` names, including "Marko F.", with names that are obviously fictional.

**A6. Event dates in Europe/Zagreb.** (Z5; C3)
*   An event counts as upcoming until the end of its day in Europe/Zagreb.
*   `formatDate()` passes `timeZone: 'Europe/Zagreb'`.
*   Add an "event today" CUJ.
*   Job expiry is left as it is.

**A7. Phase the work with an exit check per phase.** (R2)
1.  Import with a minimal `package.json`, then build.
2.  Flags and demo removal, then build plus the alt-text check.
3.  i18n and layout, then `check:types`.
4.  Content.
5.  Jobs, plus the carousel per D3.
6.  CI and docs.

Step 1 gets an explicit file list.

**A8. List every flag check inside components and layout.** (R4)
*   `CalendarSubscribe` renders nothing while `calendar` is off. Without this, v1 fails the link check.
*   `SpeakerInvite` checks its flag.
*   The RSS `<link>` and social link check their flag.
*   `blog-filter.js` loads when `blog || talks`.

**A9. Define the i18n helper API.** (R5; R6; R14; Stage 5 N6)
*   Signatures for every export, plus `getLocale(Astro): Locale`.
*   One rule for how components get the locale.
*   `localeHref` applies to site-absolute page paths only, and assets keep `withBase()`.
*   Node 22.18 or later, `.ts` extensions, and no `astro:*` imports in anything Node loads.

**A10. Complete the BaseLayout, endpoint and component change lists.** (R7; R8; Z7; C6; Stage 5 N4)
*   BaseLayout's `SITE` and `STRINGS` uses, and `og:locale` in the `hr_HR` form.
*   `SITE.locale`, `SITE.talks` and `SITE.speakers.invite` replaced by flags or helpers, `llms.txt` page ids, and SpeakerInvite's `/speak/` link.
*   The known hard-coded English strings: the Events `<title>`, the organizer headings and the `'Community'` fallback.

**A11. Specify the job wall fully.** (R9; Critic C5/Z9 link scheme)
*   A zod schema with optional fields, a `type` enum, and `link` restricted to `https:` or `mailto:`.
*   The page sections in order, the card fields including the posted date, and a key mapping.
*   The new-tab rule, and how a placeholder form URL is detected.

**A12. Specify the home page and, if kept, the carousel.** (R10; R12; C8; Z6)
*   Hero values and CTAs, the feature icons, and the section order.
*   The job preview block, and the empty state linking to Meetup's upcoming events (C9).
*   If the carousel stays (D3): asset resolution, the pause/play control, how photos are hidden without JavaScript, and an exact photo count, source and licence string.

**A13. Add tests that can fail.** (R13)
*   Pure functions for expiry and "upcoming", with `node --test` cases: days 59, 60 and 61, a mock that is exempt, an event today, an event yesterday.
*   A fixture test that makes each custom check fail.
*   Wire both into `npm run check`, with the exact command (R15).

**A14. Cross-language link rule.** (C7; Z8)
*   `check-links.mjs` fails on any `/en/` ↔ `/` link that does not carry `hreflang`.
*   CLAUDE.md states that English MDX links start with `/en/`.

**A15. A short risks section.** (C5; Z9; structural 1)
*   Prose, not a matrix. Cover the job link scheme, the 60-day disabling of scheduled workflows, GitHub's email on a failed run, upkeep by hand, mocks reaching production, and rollback needing admin rights.

**A16. Fix content sources and placeholders.** (R16; R17)
*   One named source for all text: `translations.js` on `legacy-static`.
*   The Korana body, with the sections that are left out.
*   The mock CoC's contact address and closing paragraph, and MDX import depth.
*   Exo 2 `unicode-range` values from the same fetch as the files, with the fetch URL recorded.
*   Consider `BRAND.fontDisplay` in place of editing `typography.css`.

### Nit groups

**N-A. Switcher wording.** Remove the fallback promise from Goal 2 and CUJ 2, and state that the 404 page renders no `LangSwitch`. (Stage 5 N2, F2, Z10)

**N-B. Consistent names.** Use one set of endpoint names (moot after D2). Pick one term out of twin, peer and counterpart. Replace "option A" with the layout's name. (F1, F6, C10, C12, style)

**N-C. Glossary.** CroMesh, Korana, rostilj, unconference, Popular, Sätteri, the config objects, and "the owner". (F11, style)

**N-D. Decision citations.** Cite brief decision numbers in place of "the user chose", and give "Open Questions" real content or write "None". (C11, C13, structural)

**N-E. Goals wording.** "These current-site features are rebuilt", "Mock content is labelled and listed", "`npm run check` fails" rather than "the build fails", and a sentence that mocks are exempt from expiry. (C14, F8, F9)

**N-F. Formatting.** Heading levels for Additional Resources and Future Improvements, horizontal rules, links, diagram alignment, line wrapping. (structural)

**N-G. Wording in the implementation plan.** Style nits 1–21 in the Stage 9 report.

**N-H. Small technical nits.**
*   `trailingSlash: 'always'`.
*   `lang` values `hr` and `en`.
*   CroMesh's "Venue wanted" badge on a past event.
*   The `deploy.yml` template from the theme.
*   What `check-links` counts as internal.
*   Placeholder detection in `list-mocks`.
*   The job `id` rule.
*   Reusing `.g-filter`.
*   Draft banner as `<Callout tone="warn">`.
*   Page back-links with the `hr/`/`en/` prefix.
*   Drop PreviewBar.
*   Theme counts: 79 keys, 24 files.

**N-I. Font note.** State that decision 28's "self-hosting postponed" was superseded.

**N-J. Unconference links (request from a parallel session in this repo).** Link `/unconference/` from the footer and the homepage wherever give-a-talk is linked.

## Fixes proposed by reviewers and rejected by Stage 8

| Proposed fix | Source | Why it is rejected |
| --- | --- | --- |
| A check that fails if events other than the two seeded ones exist | C1 | It fails the first time a real event is added. Not copying demo content solves the problem. |
| Carousel photo as `ogImage` | C2 | Link previews would show a stock photo without its "illustrative" label (decision 20). |
| A lint for literal text in templates, and a `dist/` scan for English defaults | C6 | A hand-made parser with false positives for a one-time conversion. A listed set of literals plus the CUJ 1 walk-through covers it. |
| A likelihood/impact/owner risk matrix, Pages limits, an escaping item | C5 | One maintainer. Two to four images. Astro escapes output by default. |
| Time-zone handling for job expiry | C3 | Decision 23 already accepts one day of staleness. |
| `keyFeature` and the file-tree twin checks | Stage 5 N1, M3 | The typed dictionary and the link check already cover them. |
| Pre-built filtered job pages, extra alternatives | Critic Nit 5 | Not needed for v1. |
| A custom deploy-failure notifier | C5 | GitHub emails the actor when a scheduled run fails. |
| SHA-pinned Actions, an external link checker | C5, Stage 5 N7 | Optional. |

## Traceability matrix

| Action | Stage 5 | Stage 6 | Stage 7 | Stage 8 | Stage 9 |
| --- | --- | --- | --- | --- | --- |
| A1 | | | | | R1 (IR-B1, CD-B1, CD-M2) |
| A2 | M1, M2, M3, N5 | F1, F4, F5 | C10 | Z1 | R3, R18 (#32) |
| A3 | M4 | F3, F7 | C15, Nit 3 | Z2 | R18 (#8) |
| A4 | | F10 | C4 | Z3 | R18 (rollback trigger) |
| A5 | | | C1, C2, Nit 2 | Z4 | R2 (step-1 scope) |
| A6 | | | C3 | Z5 | |
| A7 | | | | | R2 |
| A8 | | | | | R4 |
| A9 | N6 | | | | R5, R6, R14 |
| A10 | N4 | | C6 | Z7 | R7, R8 |
| A11 | | | C5 (link scheme) | Z9 | R9 |
| A12 | N8 | | C8, C9 | Z6, Z10 | R10, R12 |
| A13 | | | | | R13, R15 |
| A14 | | | C7 | Z8 | Nit 5 |
| A15 | | | C5, structural 1 | Z9 | R18 (#14) |
| A16 | | | | | R16, R17, Nit 19 |
| N-A | N2 | F2 | | Z10 | |
| N-B | N5 | F1, F6, F11 | C10, C12, Nit 16 | Z10 | |
| N-C | | F11 | Nit 20 | Z10 | |
| N-D | | | C11, C13 | Z10 | |
| N-E | | F8, F9 | C14, Nit 9 | Z10 | |
| N-F | | | Nits 10–14 | | |
| N-G | | F12 | Nits 17–21 | | Nits 14–21 |
| N-H | M5, N3 | | Nits 1, 4–8 | Z10 | Nits 1–13 |
| N-I | | | out-of-lane note | Z10 | |
| N-J | | | | | (parallel-session request) |

Stage 5 M5 (whether `getStaticPaths` can be imported from an `.astro` view, and the dependency on identical file names) belongs under **A9**: put each `getStaticPaths` in a sibling `.ts` module, and state the file-name dependency.

## Resolution (2026-11-05)

The owner asked to apply every action item, with every theme feature turned on and mock content wherever no real content exists. That is recorded as brief decisions 32–37. The design was rewritten to match. Fixes that Stage 8 rejected were not applied.

| Item | Outcome | Where in the design |
| --- | --- | --- |
| D1 | All features converted now (decision 34) | Feature flags |
| D2 | Routes are off when their entry files are absent, with no renames (decision 34) | Feature flags; CUJ 11 |
| D3 | Auto-advance kept, pause/play button added (decision 35) | CUJ 9; plan 5.3 |
| D4 | Rollback to `live-static` at `e27727f`, workflow disabled first (decision 36) | Cutover |
| A1 | Fixed: all collections always registered, Footer version removed, `astro check` gate in phase 1 | Plan 1.5, 1.6 |
| A2 | Fixed: typed parity, `keyFeature` dropped, config pairs everywhere, CUJ 11 replaces old CUJ 9 | Translating text; plan 2.2, 2.5 |
| A3 | Fixed: one rule plus a table, sitemap filter dropped | Content in two languages |
| A4 | Fixed: trigger and steps | Cutover |
| A5 | Fixed: no demo content, logo and ogImage unset, KD favicon, "Primjer" names | Plan 1.2, 2.5, 2.6, 4.6 |
| A6 | Fixed: `isUpcoming` in Europe/Zagreb, CUJ 4 | Events and dates; plan 2.4 |
| A7 | Fixed: six phases with exit checks | Plan |
| A8 | Fixed: listed component flag checks | Feature flags; plan 3.4 |
| A9 | Fixed: signatures, `getLocale`, `pageHref` scope, Node rules, `paths(locale)` modules | Translating text; Language routing |
| A10 | Fixed | Plan 2.7, 3.1, 3.3, 3.4 |
| A11 | Fixed: zod schema, page order, key names kept | Plan 4.1, 5.1 |
| A12 | Fixed | Plan 2.5, 5.3 |
| A13 | Fixed: `node --test` cases and fixtures | Plan 6.3 |
| A14 | Fixed | Plan 6.1; CLAUDE.md rules |
| A15 | Fixed: prose Risks & Mitigations section | Risks & Mitigations |
| A16 | Fixed | Plan 4.2, 4.4, 5.4 |
| N-A to N-J | Fixed (glossary, citations, wording, formatting, unconference links in nav, footer and home) | Throughout |
| Stage 5 M5 | Fixed: `paths.ts` modules with a documented fallback | Language routing; Open Questions |

The design has not been re-reviewed since this rewrite.
