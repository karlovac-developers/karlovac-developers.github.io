# Concept Brief: Rebuild the Karlovac Developers site on the Astro "Popular" theme with hr/en routing

Author: Marko Filipović
Date: 2026-11-04

## Overview

The plan is to replace the whole karlovac-developers.github.io site in one go with a new Astro project built from the Popular theme (github.com/mariatta/astro-theme-popular, MIT). The theme is vendored into the repo so its source can be edited. Astro's built-in i18n routing serves Croatian at `/` and English at `/en/`.

Only static authored text gets translated: UI strings and the authored pages. Events, posts, bios and job postings stay in the language they were written in. The site deploys as static output through GitHub Actions. It uses the theme's default brand, which stays configurable. The language switcher links to the same page in the other locale.

Version 1 is done when every feature chosen in the feature quiz (the Feature Inventory below) works.

Six reviewer lenses looked at this concept: design, codebase details, zoom-out, comprehension, implementation readiness and structural. All six completed. They worked from the GoldfishContext file and the current repo. None of them could open the theme's source, so anything they say about theme internals is marked "verify".

The concept holds up, and running it costs close to nothing (no server, no database, free Actions minutes). The main risks are:

- The i18n work is much larger than "split STRINGS".
- Untranslated content has no routing rule.
- Some source material exists only as uncommitted files.
- Without a cap on the feature quiz, the definition of done has no limit.

## Analysis

### Blocker

**B1. Uncommitted work would be lost in the replacement.**
Lenses: codebase-details, implementation-readiness, structural, comprehension.

- `rostilj/` and `unconference/` are untracked and have never been committed.
- `translations.js`, `host-a-meetup/index.html`, `style.css`, `CLAUDE.md` and `README.md` have uncommitted edits.
- The `unconf.*` and `hostpage.unconf.*` hr/en copy appears to exist only in the working copy.
- A local branch, `rubyzg-style-redesign`, was also reported. Nobody has said what happens to it.

A clean-slate replacement would destroy the only copy of two pages the quiz is meant to decide on. Step 0 has to be: commit everything, untracked directories included, to a `legacy-static` branch and tag it. That snapshot is also the rollback point.

**B2. "Vendored" is undefined, and the choice decides how i18n routing can work.**
Lenses: design, implementation-readiness, comprehension, zoom-out, structural.

The theme is an npm integration. It injects its own routes and allows only 8 components to be overridden. There are three readings of "vendor it":

- (a) Keep the integration as a local workspace package. Every injected route then needs a hand-made `/en/` twin. Whether `astro:i18n` helpers work inside injected routes is unverified.
- (b) Flatten the theme into ordinary project source and delete the integration and packaging layer.
- (c) Use a git subtree.

Most lenses recommend (b): it fits "a plain Astro project following Astro's guidelines" and removes the 8-component limit. Whichever is chosen, record the upstream commit SHA, keep the MIT licence notice, keep a log of local patches, and land the untouched import as its own commit before any edits.

**B3. No rule for content that exists in only one language.**
Lenses: all six.

The concept doesn't say whether `/en/events/foo/` exists for a Croatian-only event. The two options are:

- (A) Render every content route under both locales. The chrome follows the URL and the body keeps its original language.
- (B) Render each content entry once.

Under B the switcher leads to a 404, or drops the visitor out of English chrome. Most lenses recommend A, with the canonical URL of an `/en/` copy pointing at the `/` copy, and hreflang only on genuinely translated pages.

The switcher also needs a fallback for pages with no peer, such as rostilj or a single-locale MDX page. Proposed rule: link to the other locale's home or section index, show a short "only available in Croatian" note, and never emit a link that 404s. RSS and tag pages should be one set each, not one per locale.

**B4. The definition of done has no limit, and "works" is not defined.**
Lenses: zoom-out, comprehension, structural, implementation-readiness, design.

The quiz hasn't happened, and nothing caps what it can select. Each theme feature kept adds translation work in both locales plus fork maintenance. There are no acceptance checks, and quiz answers can conflict. For example, "next event" needs the events collection and "latest posts" needs the blog.

What's needed:

- Each quiz row gets dependencies and one observable acceptance check in both `/` and `/en/`.
- Decide what happens to features nobody picks: delete them from the fork, or leave them unlinked.
- Zoom-out proposes a cap: v1 equals the current site's scope plus whatever is free. It also proposes the rule "v1 needs no content that doesn't exist yet."

**B5. Cutover to an Actions deploy has no plan.**
Lenses: implementation-readiness, codebase-details, structural, design.

Pages currently serves the `main` branch root. Switching the Pages source to "GitHub Actions" is a manual repo-settings change that needs admin rights. If the Astro source merges first, Pages serves the raw source tree.

Proposed order:

1. Add the workflow (`configure-pages`, `upload-pages-artifact` with `dist/`, `deploy-pages`, permissions `pages: write` and `id-token: write`).
2. An admin switches the Pages source.
3. Merge.
4. Check the first deploy.

Rollback means pointing the Pages source back at `legacy-static`. Use `site: 'https://karlovac-developers.github.io'` with no `base`, since this is an org root site. Use either the theme's `scripts/setup.py` or a hand-written workflow, not both.

### Major

**M1. Translatable text lives in more than STRINGS.**
Lenses: design, structural, implementation-readiness, comprehension.

- NAV labels, CTA, FOOTER (including the land-acknowledgement slot), SOCIAL labels and HOME section copy in `src/config.ts` are all user-facing text.
- `SITE.locale: 'en-US'` is a single value and probably drives date formatting (verify).
- Splitting only STRINGS leaves English chrome and US dates on Croatian pages.

Split config into:

- Locale-neutral settings: SITE identity, BRAND, SOCIAL hrefs, feature toggles.
- Per-locale copy: `src/i18n/hr.ts` and `src/i18n/en.ts`, plus an Intl locale (`hr-HR`, and `en-GB` or `en-US`).

Make `hr` the reference type and declare `en` with `satisfies` so a missing key fails the build. Shallow nesting grouped by component is preferred over the old flat dotted keys.

**M2. Components need one locale lookup path.**
Lenses: design, structural, zoom-out, implementation-readiness.

Components that read STRINGS at module level have no locale. Add a single `src/i18n/` module with these helpers: `getLocale(Astro)`, `t()`, `localizedPath()`, `alternatePath()`, `formatDate()`. They wrap `Astro.currentLocale` and `getRelativeLocaleUrl`. Each vendored component then gets one mechanical change.

Rules for the module:

- Add a CI grep check that fails on any direct STRINGS import.
- Client scripts (tag filter, scroll-spy, checklists, a future job filter) get their text from data attributes, never by importing the dictionaries.
- Hard-coded internal hrefs in vendored components are the most likely regression. Build every internal link through the helper.

**M3. Route templates would be duplicated per locale.**
Lenses: structural, design.

Mirroring `src/pages/` into `src/pages/en/` doubles every template, which repeats the duplication problem the current CLAUDE.md warns about. Write each route once with the locale as a parameter: either an optional `[...locale]` segment, or thin per-locale stubs that call a shared page. Only content and dictionaries should be per-locale files.

**M4. No slug policy for translated pages.**
Lenses: implementation-readiness, design, comprehension, structural.

With translated slugs (`/o-nama/` vs `/en/about/`), the switcher needs a map. The options:

- Identical ASCII slugs in both locales, so the switcher only swaps the prefix (recommended).
- A `translationKey` frontmatter field.

Slugs should be ASCII-only either way. Tag slugs need a slugify rule for č ć đ š ž. Add a build check that every translated page has its peer or is explicitly flagged as single-locale.

**M5. Mixed-language pages need language marking.**
Lenses: comprehension, design, structural, implementation-readiness.

An English page wrapping a Croatian event body needs `<html lang="en">` with `lang="hr"` on the content wrapper. Without it, screen readers read Croatian with an English voice. Add a required or defaulted `lang` field to every untranslated collection schema, and consider a small visible "in Croatian" badge. The Sessionize import scripts, if kept, should set `lang` too.

**M6. Time-dependent output goes stale on a static build.**
Lenses: all six.

- "Next event" and the upcoming/past split are computed at build time (inferred, verify).
- Moving the job wall's 60-day expiry to build time would break the "60 days" promise in `jobs.how.p` and `jobs.rules.li4`.
- GitHub Actions runners use UTC while the current expiry uses local midnight, so the two can disagree by a day.

Fix: add a daily `schedule:` cron to the deploy workflow, ideally with a small client-side guard as backup. Make sure cron failures are visible to someone.

**M7. Locale metadata is not covered.**
Lenses: comprehension, implementation-readiness, zoom-out, codebase-details.

Today `<title>` and the meta description are never translated, and only the homepage has og tags. The new shared layout should emit, per locale:

- `<html lang>`
- title, description, og tags and `og:locale`
- canonical URL
- `hreflang` alternates (hr, en, `x-default`) where a peer exists
- sitemap entries

**M8. GitHub Pages has a single 404.html.**
Lenses: implementation-readiness, design.

A per-locale 404 is not possible on the server. Ship one bilingual 404, or a Croatian one with a link to `/en/`.

**M9. Theme demo content and empty states.**
Lenses: implementation-readiness, zoom-out, codebase-details.

- The starter's sample events, organizers, testimonials, stats and posts would go live as if real.
- Both real events the site knows about (Korana on 2026-05-16, CroMesh #2 on 2026-02-28) are in the past, so "next event" will be empty.

Decide per home section whether it shows real content or is turned off. Acceptance must cover clean empty states.

**M10. Job wall conversion contract.**
Lenses: codebase-details, design, zoom-out, comprehension, implementation-readiness.

The theme has no jobs collection. Converting means:

- Build a zod schema from the `_fields` legend in `jobs.example.json`:
  - Required: `posted`, `kind`, `role`, `location`, `type`, `description`, `vouchedBy`, `link`.
  - Optional: `company`.
  - `kind` is an enum (`hiring` or `available`). Today an unknown `kind` gets the hiring badge but fails the hiring filter.
  - `type` is an enum including `student`.
- Add a client-side filter or static filtered pages, a homepage preview slot (the theme has no such section), and new dictionary keys.

Other points:

- `LOAD_FAILED` versus empty has no build-time equivalent. Drop the "unavailable" message on purpose, or keep a runtime fetch.
- `JOBS_FORM_URL` is still `forms.gle/REPLACE-ME`.
- Every mock posting has expired: the newest is 2026-08-11, which expired on 2026-10-10. Previews therefore show the empty state.
- Keep the 60-day constant in one place that the copy reads from.

**M11. Croatian diacritics and third-party fonts.**
Lenses: design, codebase-details, implementation-readiness.

- It is not known whether Quantico covers Latin Extended (č ć đ š ž). If it doesn't, Croatian headings on the default locale fall back to another font. rostilj explicitly loads `latin-ext` for this reason.
- Loading Google Fonts from Google's servers has an EU GDPR court precedent.

Test early. Consider self-hosting the fonts (Fontsource) with latin-ext subsets, and making the display font a BRAND value.

**M12. Reuse the existing copy, not the code.**
Lenses: zoom-out, structural, codebase-details.

"Disregard existing code" should not mean rewriting the text. `translations.js` holds about 145 reviewed keys per locale (`en` from line 2, `hr` from line 155). They cover the intro, join, give-a-talk, host-a-meetup, unconference and the jobs UI and rules.

The design doc needs a migration map:

- Dictionary keys go to dictionaries or MDX pages.
- `jobs.example.json` becomes the zod schema.
- The mock `jobs.json` is dropped.

A Code of Conduct has no existing copy in either language, so it must be written fresh.

**M13. No boundary between vendored and site code.**
Lenses: structural, design.

If theme files are mixed into `src/` with site code, nobody can later tell what is upstream or cherry-pick a fix. Proposal:

- `src/theme/` holds the vendored code, with an `UPSTREAM.md` recording the repo URL, SHA, licence and patch log.
- `src/site/` holds site-only components such as the switcher and job wall.
- `THIRD_PARTY_NOTICES.md` holds the licences.

Then delete unused theme collections, routes and scripts before starting i18n work. That shrinks the surface to translate and maintain.

**M14. Repo docs will describe the wrong project.**
Lenses: all six.

- CLAUDE.md and README describe a no-build site (`python3 -m http.server`, `data-root`, `data-i18n`, `langchange`, carousel probing).
- The theme's AGENTS.md is written for package users.
- There is no `.gitignore`, so `node_modules/` and `dist/` could get committed.

Rewriting the docs is part of v1, not a follow-up. That means: one authoritative agent doc, and a README covering how to add a string, page, event or job, and how deploy works.

**M15. Versions and acceptance gates are not pinned.**
Lenses: implementation-readiness, design, codebase-details.

- Pin the Astro version from the theme's `package.json` and pin Node (`.nvmrc` with `node-version-file`). Commit the lockfile and use `npm ci`. Document manual upgrades as re-diffing against the recorded SHA.
- CI on every PR should run:
  - build plus the a11y alt-text gate
  - dictionary key parity
  - page-peer check
  - internal link check, including every switcher href
  - `<html lang>` matches the URL prefix
  - zod schema failures
  - a fail or warn on `REPLACE-ME` in config
- Deploy failures should notify a maintainer.

**M16. rostilj does not fit the theme or the i18n model.**
Lenses: codebase-details, zoom-out, design, structural.

- It is Croatian-only and has its own design, as CLAUDE.md requires.
- Its date, 2026-06-20, has passed.
- Its plan, schedule and checklist don't map onto the event, venue or check-in schemas.
- It contains internal planning notes not meant for publication, such as "homebrew — Marin i Igor?" and "papirnati tanjuri — Carpe Diem?", and names people.

The cheapest faithful option is a verbatim copy to `public/rostilj/index.html`, excluded from the i18n parity check, with the notes scrubbed and its alt text checked against the a11y gate.

**M17. Contrarian: is English needed at launch?**
Lens: zoom-out.

English is the single reason the theme has to be forked. A Croatian-only launch could use the unmodified npm package with STRINGS translated, which keeps the upgrade path. Adding `/en/` later would mean forking at that point. The user has already decided on hr+en. This is listed only as the largest available simplification.

### Nit

- **N1.** No automatic redirect on `/` in v1. If remembering the language is ever built, it should be one isolated script that redirects only on a bare visit to `/` after an explicit switcher choice, never on deep links and never for crawlers. Static hosting allows no Accept-Language redirect. (comprehension, design, structural, codebase-details, implementation-readiness)
- **N2.** Set `build.format: 'directory'` and `trailingSlash: 'always'`, or choose another shape explicitly, so the switcher, NAV and canonical URLs agree. (implementation-readiness)
- **N3.** Croatian has three plural forms. Use `Intl.PluralRules` for counts such as job totals. (codebase-details)
- **N4.** Checklist `localStorage` keys will differ between `/docs/x` and `/en/docs/x`. Make that a deliberate choice. (design, implementation-readiness)
- **N5.** Alt text in translated MDX must be written in each locale. In submitted content, alt should be a required schema field. (design, implementation-readiness)
- **N6.** Build meetup photos through `astro:assets` (WebP/AVIF), not `public/`. GitHub Pages limits are 1 GB published and about 100 GB/month bandwidth. (design)
- **N7.** Embedded `<a href>` in translated strings (`join.p3`, `hostpage.unconf.p`) should become locale-aware links. (codebase-details)
- **N8.** The land-acknowledgement footer slot needs a decision: fill, empty or remove. (comprehension, zoom-out, structural)
- **N9.** Add a short glossary to the design doc for: feature quiz, vendored, peer locale, STRINGS, BRAND, injected routes, rostilj (Croatian for "barbecue", an event name) and unconference. Also name who owns the Croatian translations of theme-supplied text. (comprehension)
- **N10.** No CNAME exists, so the Actions deploy needs no custom-domain handling. If a domain is added later, set it in Pages settings. (implementation-readiness)
- **N11.** Old root files (`index.html`, `style.css`, `translations.js`, `jobs.js`, the per-page HTML) should be deleted in the same change as the switch, after B1. (codebase-details, design)

## Feature Inventory

This is the feature quiz. Suggested statuses come from the reviewers. The final decision belongs to the user. "Free" means it ships with the theme and needs few or no new translated strings.

| Feature | Source | What converting it involves | i18n impact | Suggested status |
| --- | --- | --- | --- | --- |
| Home: hero | theme | Configure HOME hero copy; drop the old KD wordmark | Hero copy per locale (reuse `hero.*`) | v1. Replaces the current home page, and the strings exist |
| Home: stats | theme | Turn off in HOME config | None if off | drop. No users yet, and made-up numbers are worse than none |
| Home: features | theme | Fill from `intro.*`, `join.*`, `host.*` | Per-locale config copy | v1. Existing copy maps onto it |
| Home: next event (auto-selected) | theme | Needs events collection, an empty state, and a daily rebuild | Event body untranslated; label strings per locale | v1 only if a real upcoming event exists, otherwise postpone. Both known events are past |
| Home: latest posts | theme | Needs blog | Strings only | postpone. No posts exist |
| Home: organizers section | theme | Organizer entries | Bios untranslated; labels per locale | v1. Cheap, and gives a meetup credibility |
| Home: testimonials | theme | Turn off | None if off | drop. Nobody to quote |
| Home: CTA | theme | CTA config pointing to Meetup | CTA copy per locale | v1. Free |
| Blog (tags, tag pages, multi-author) | theme | Collection, tag slugify rules for diacritics | One set of tag pages; `lang` field on posts | postpone. No content |
| RSS | theme | Comes with blog | One feed, not per locale | postpone. Arrives with the blog |
| Events collection, upcoming/past split | theme | Seed with Korana and CroMesh #2; `lang` field; daily cron | Bodies untranslated; routes under both locales (B3) | v1 if at least one real event exists, otherwise postpone. Needs the content-locale rule decided |
| Speaker profiles | theme | Speakers collection | Bios untranslated | postpone. Put the speaker's name and link in the event entry |
| Venue pages (address, arrival, accessibility) | theme | Venues collection | Notes untranslated or per locale (undecided) | postpone. An address in the event entry is enough |
| Check-in instructions | theme | Event or venue field | Per-locale or untranslated (undecided) | drop. No event series needs it |
| Organizers/team page | theme | Organizer entries plus a page | Labels per locale | v1. Cheap |
| Docs/handbook with scroll-spy TOC | theme | Docs collection; client JS strings via data attributes | Must be classified as translated or single-language | drop, unless unconference goes here. Guides work as plain pages |
| Checklists (localStorage) | theme | MDX component; per-locale keys | Client strings via data attributes | postpone. Only useful if unconference or host guides use them |
| About page | theme | Per-locale MDX from `intro.*` and `join.*` | Translated (hr and en MDX) | v1. Core meetup page with existing copy |
| Code of Conduct page | theme | Per-locale MDX; new copy needed | Translated, written fresh in both | v1. Core for a meetup, but no copy exists yet |
| Get involved page | theme | Per-locale MDX; could absorb give-a-talk and host | Translated | v1, or merge with give-a-talk and host-a-meetup |
| `<Callout>` MDX component | theme | Keep | Content per MDX | v1. Free, and the existing pages use CTA callouts |
| `<Checklist>` MDX component | theme | Keep or delete | Client strings | postpone. Keep only if a v1 page uses it |
| Organizers/authors collections | theme | Schemas | Untranslated | v1 (organizers only). Authors arrive with the blog |
| Accessibility CI gate (alt text) | theme | Make it a required workflow step; confirm scan scope | Alt text per locale in MDX | v1. Free and useful |
| Sessionize/spreadsheet import scripts | theme | Python toolchain | Should set `lang` | drop. No Sessionize; events live on meetup.com |
| `scripts/setup.py` workflow generator | theme | Generates the Pages workflow | None | drop. Hand-write Astro's standard Pages workflow instead |
| BRAND configuration | theme | Leave empty for the default identity | Locale-neutral | v1. Already in config, needs no work |
| Land-acknowledgement footer slot | theme | Fill, empty or remove | Per-locale if filled | drop or leave empty. Needs a decision (N8) |
| Dark footer with social links | theme | Set real SOCIAL (Meetup, GitHub) | Footer text per locale | v1. Free |
| Inter/Quantico fonts, Font Awesome | theme | Verify latin-ext; maybe self-host | Diacritics coverage | v1 (verify). Croatian is the default locale |
| Give a talk | existing | Per-locale MDX from `talk.*` | Translated, copy exists | v1. Existing page with complete hr/en copy |
| Host a meetup | existing | Per-locale MDX from `hostpage.*` | Translated, copy exists | v1. Existing page with complete hr/en copy |
| Unconference guide | existing | Per-locale MDX from `unconf.*` (uncommitted; B1), or merge into host-a-meetup | Translated, copy exists | v1. Cheap, since the copy exists, but commit it first |
| Job wall | existing | Zod collection, client filter and expiry guard, daily cron, preview slot, real form URL (M10) | Postings untranslated; UI strings exist | postpone. Never launched, mock data expired, form URL is a placeholder |
| Jobs info page (rules plus "post a job" link) | new | Per-locale MDX from `jobs.how.*` and `jobs.rules.*` | Translated, copy exists | v1 if the job wall is postponed. Keeps the offer visible cheaply |
| Hero photo carousel | existing | Build-time image list via `astro:assets`, alt per image | Alt text | drop. No photos exist; use the theme hero |
| rostilj event page | existing | Verbatim copy to `public/rostilj/`, scrub internal notes, exclude from parity check | Croatian-only, no switcher peer | postpone or drop. The event is past and the page contains unpublished notes; if kept, pass it through unchanged |
| Language switcher (same page, no-peer fallback) | new | i18n helper, build-time map of available paths | Core | v1. Required by the concept |
| Remembering language choice | new | Client script on `/` only | Redirect risk | drop for v1. Path-based locale is enough |
| Per-locale title, meta, og, canonical, hreflang, sitemap | new | Shared layout plus `@astrojs/sitemap` i18n options | Core | v1. Cheap with the helper, and fixes a known gap |
| Content `lang` field and "in Croatian" badge | new | Schema field plus wrapper attribute | Accessibility | v1. Needed whenever untranslated content renders under `/en/` |
| Bilingual 404 page | new | Single `404.html` | Both languages on one page | v1. Pages allows only one 404 |
| Daily scheduled rebuild | new | `schedule:` cron in the workflow | None | v1 if events or jobs ship. Prevents stale "next event" and expired postings |
| CI quality gates (key parity, page peers, link check, lang check, placeholder check) | new | Scripts in the PR workflow | Enforces parity | v1. Replaces the manual "keep en/hr in sync" rule |
| Self-hosted fonts and icons | new | Fontsource, subset icons | Diacritics | postpone, unless Quantico lacks latin-ext or GDPR is a concern |
| Add-to-calendar (.ics) per event and calendar feed | new | Endpoint per event | None | postpone. Needs events first |
| Job submission via GitHub Issue Form | new | Issue template matching the zod schema | Template per locale or bilingual | postpone. Arrives with the job wall |
| Static search (Pagefind) | new | Build step | Indexes by `lang` | postpone. Too little content |
| Privacy-friendly analytics | new | Script, off by default | None | postpone |
| Meetup.com event sync | new | Manual entry or import script | Untranslated | postpone. Manual entry is fine at this volume |

### V1 scope after applying the user's rule

The rule (decision 14) is: take the theme as it is, disable each theme feature the current site has no equivalent or content for, and bring in every feature the current site already has. This replaces the per-row "Suggested status" above wherever the two disagree.

**Enabled: theme features the current site already has an equivalent for**

- Home page: hero, features, CTA, and next event. The current home page already has all four, including an event card.
- Events collection with the upcoming/past split, seeded with the two events the current site already describes: CroMesh Meetup #2 (`index.html`) and the Korana day (`next.excerpt`, `rostilj/`).
- About page, built from the current `intro.*` and `join.*` copy.
- `<Callout>`, the dark footer with social links, the BRAND config left empty, the fonts, and the alt-text CI gate. These ship with the theme's layout and need no new content.

**Incorporated: current-site features rebuilt in the theme's design**

- Give a talk, host a meetup, and the unconference guide, each as hr and en MDX pages.
- The language switcher: the current site has one, so it is kept, now based on the URL path.
- The job wall, reading the current `jobs.json` schema. See open item 1 below.

**Disabled: theme features with no current equivalent or no content**

- Home sections: stats, latest posts, organizers, testimonials.
- Blog, RSS, tag pages, and authors.
- Speaker profiles, venue pages, and check-in instructions. Speaker and venue names go into the event entry as text.
- Organizers/team page.
- Docs/handbook and `<Checklist>`.
- Code of Conduct and Get involved pages: the current site has neither page and no CoC copy. See open item 3.
- Land-acknowledgement slot.
- Sessionize/spreadsheet import scripts and `scripts/setup.py`.

**Needed by the decisions already made, not by the rule**

- The i18n helper, per-locale dictionaries, the switcher's fallback when a page has no counterpart in the other language, per-locale `<title>`/meta/canonical/hreflang, the `lang` attribute on content that renders under `/en/` in its original language, the bilingual 404, and the GitHub Actions deploy.
- A daily scheduled rebuild, because events (and the job wall, if kept) depend on the current date.

**How "disabled" works once the theme is flattened.** The npm integration's `routes: { speakers: false }` switch disappears when the theme is flattened into `src/`. There are two ways to replace it:

- **Feature flags (recommended):** add a `FEATURES` object to `src/config.ts`. Each disabled route's `getStaticPaths` returns `[]` while its flag is off, and nav entries and home sections check the same flags.
- **Delete:** remove the code and restore it from the recorded upstream commit when it is needed.

Flags keep the theme intact, but disabled code still has to compile on every Astro upgrade. Disabled features need no translations: a key-parity check runs only over strings used by enabled features, and a feature has to pass that check before its flag can be turned on.

**Open items the rule does not settle** (all four are now resolved by decisions 16–19)

1. **Job wall.** The current site has the code, but the postings are mock data that has already expired, and the form URL is `forms.gle/REPLACE-ME`. Bringing it in rebuilds a feature that has never been live.
2. **Hero photo carousel.** The current site has the code but no photos (`assets/` does not exist). Disable it unless photos exist.
3. **Code of Conduct.** The rule disables it because no copy exists. Most meetups and venues expect one.
4. **rostilj.** Its information (date, place, schedule) fits the Korana event entry. Its poster design and Croatian-only status do not fit the theme. The options: an event entry only, an event entry plus the original page copied unchanged to `public/rostilj/`, or drop it. The event date (20 June 2026) has passed.

## Goals vs. Non-Goals

**Goals**

- Replace the current static site with an Astro project built from a vendored copy of the Popular theme. Theme code is kept separate from site code, with recorded provenance.
- Croatian at `/` and English at `/en/` through Astro's built-in i18n routing. All authored UI and page text exists in both, and missing keys fail the build.
- A language switcher that always lands on a real page.
- Untranslated content marked with its own `lang`.
- Static output deployed by GitHub Actions to the org root site. A rollback path to the legacy static site is kept.
- The theme's default brand, configurable through BRAND alone.
- Every feature selected in the quiz works in both locales, each with a written acceptance check.
- Rewritten README and CLAUDE.md, plus a `.gitignore`.

**Non-Goals**

- Translating events, blog posts, speaker bios, job postings or other submitted content.
- Preserving existing URLs or the old design.
- Keeping an `npm update` upgrade path for the theme.
- Reusing the old code (`translations.js`, `jobs.js`, `style.css`). The old copy and data schemas are reused as inputs.
- Server-side language detection or automatic redirects on `/`.
- Folding rostilj into the shared design system.
- Theme features with no real content behind them yet (stats, testimonials, blog, speakers, venues) unless the quiz selects them.

## Alternatives Weighed

| Alternative | Status | Reason |
| --- | --- | --- |
| Two separate builds (hr and en) of the unmodified theme package, merged in CI | Rejected (user decision) | Bypasses Astro's i18n routing. It would keep the package upgradeable, but loses locale-aware helpers and a single route model |
| Paraglide JS | Rejected (context) | Active, but its old Astro adapter is deprecated and static-site support is unclear |
| astro-i18next | Rejected (context) | Beta, possibly archived |
| @otrodigital/astro-i18n-next | Rejected (context) | Experimental |
| Hand-rolled per-locale dictionaries | Chosen | Astro routes but doesn't translate. About 150 keys per locale fits a typed `hr.ts`/`en.ts` with a `t()` helper |
| Keep the theme as a local integration package (injected routes kept) | Open, leaning rejected | Cleaner upstream diffs, but injected routes need hand-made `/en/` twins, the 8-component override limit remains, and helper support is unverified |
| Flatten the theme into project source | Open, leaning chosen | Plain Astro project, simplest locale routing, no override limit. Needs a provenance file and patch log |
| git subtree vendoring | Open | Keeps a cherry-pick path from upstream at little cost. Can be combined with either layout |
| Croatian-only launch on the unmodified npm package, English later | Raised by zoom-out; contradicts the user's decision | Removes the fork and keeps upgrades. Adding English later means forking then |
| Original Hugo theme (hugo-theme-popular) with Hugo's built-in multilingual support | Raised by design as a sanity check only | Gives per-language content and translation linking out of the box, but gives up Astro and decision 2 |
| Mirrored `src/pages/` and `src/pages/en/` page files | Rejected by reviewers | Duplicates page logic per locale. Use one template with the locale as a parameter |
| Phased rollout behind feature flags | Raised by design | The deploy stays big-bang, but quiz features can ship off without removing code |
| Job wall as a runtime `fetch()` of JSON (as today) | Rejected (decision 22) | Keeps true 60-day expiry and the failed-load message, but bypasses the content layer and zod validation |
| rostilj ported into the theme | Rejected by the user | Became an event entry instead (decision 19). The poster page stays on `legacy-static` |
| rostilj as a verbatim `public/rostilj/` passthrough | Rejected by the user | Costs nothing, but publishes a past event's page and its unpublished planning notes |
| Deleting disabled theme code instead of flagging it | Rejected by the user (decision 15) | Less code to keep building, but every feature turned on later has to be re-imported from upstream |
| Refreshing mock job `posted` dates | Rejected (decision 21) | Keeps the expiry logic exercised, but the dates need bumping every 60 days |
| Browser-side expiry guard in addition to the daily rebuild | Rejected (decision 23) | Duplicates the build logic to save at most one day of staleness |
| Keeping Quantico as the display font | Rejected (decision 28) | Google Fonts serves it in `latin` only, so Croatian diacritics fall back to another typeface |
| Unconference merged into host-a-meetup | Rejected (decision 24) | One page fewer, but the copy and the existing link are already separate |

## Key Decisions & Staging for Next Steps

**Resolved (from the user)**

1. Replace the whole site in one go. Existing URLs may be dropped or redesigned, since nobody uses the site today.
2. Treat this as a new Astro project following Astro's guidelines. Old code is disregarded.
3. Use Astro's built-in i18n routing, with hr as the unprefixed default at `/` and en at `/en/`. This requires vendoring and editing the theme, and the npm upgrade path is accepted as lost. The two-build approach is rejected.
4. Translate only static authored text: UI strings, About, CoC, give-a-talk and host-a-meetup. Submitted content stays in its original language.
5. The switcher links to the same page in the other locale. Remembering the choice is optional.
6. Use the theme's default brand. BRAND stays configurable.
7. An npm toolchain with a GitHub Actions deploy is acceptable.
8. The job wall should match the theme and may be postponed. rostilj and unconference are quiz items.
9. v1 is done when every quiz-selected feature works.
10. No i18n library: hand-rolled per-locale dictionaries.
11. Preservation (B1) is done: the full working tree, including `rostilj/` and `unconference/`, is committed as branch `legacy-static` and tag `legacy-static-2026-11-04`, both pushed to `origin`. Before the push, the names of people and a sponsor in rostilj's planning notes were removed from the snapshot. The local working copy of `rostilj/` still has them. `main` and the working tree are unchanged.
12. Content locale model (B3): render every content route under both `/` and `/en/`. The interface follows the URL and the body keeps its original language.
13. Vendoring layout (B2): flatten the theme into ordinary project source under `src/` and remove its integration and packaging layer. Record the upstream commit SHA and the MIT notice, and keep a log of local changes.
14. V1 scope cap (B4): the theme as it is, with each feature the current site lacks disabled and each feature the current site has brought in. See "V1 scope after applying the user's rule" under Feature Inventory.
15. Disabling uses feature flags: a `FEATURES` object in `src/config.ts`. A disabled route's `getStaticPaths` returns `[]`, and nav entries and home sections check the same flag. A disabled feature needs no translations until its flag is turned on.
16. The job wall ships in v1 with the current mock postings.
17. The hero carousel ships in v1 with mock photos.
18. A mock Code of Conduct ships in v1, in both hr and en.
19. rostilj becomes an event entry, the Korana day of 20 June 2026, in the events collection. The standalone poster page is not carried over; it survives on `legacy-static`.
20. Every mock is visibly marked as a mock on the page.

**Rules for mock content (from decisions 16–20)**

- **One marker.** Each mock entry carries `mock: true` in its frontmatter or JSON. Mock photos are listed in one manifest file. The schemas accept the field, and a shared component renders a visible "Primjer / Example" badge in both locales wherever a mock appears. The badge is not a colour change alone, so screen readers announce it too.
- **Mock Code of Conduct.** A banner at the top of both language versions says it is a draft that has not been adopted. Otherwise visitors or venues could read it as binding. The real text replaces it, it is not edited into it.
- **Mock job postings must stay visible.** The current postings are already past the 60-day expiry, so the wall would render empty. Mock entries are exempt from expiry (decision 21). Company and person names must be fictional.
- **Mock photos.** Use only images licensed for reuse without permission (for example the Unsplash licence, or CC0). Record the source and licence of each photo in the manifest. A stock photo of a meetup must not suggest it shows a Karlovac Developers event, so the badge or the caption says "illustrative photo".
- **The mock form URL.** `forms.gle/REPLACE-ME` stays a placeholder. The job wall's "post a job" button is badged as a mock or disabled until a real form exists, so no one submits into nothing.
- **Find them all.** A CI step lists every entry with `mock: true` and every placeholder URL on each build. That makes "remove the mocks" one searchable checklist and not a hunt through the site.

**Resolved on 2026-11-05 (the user asked for all open questions to be settled)**

21. **Mock job postings are exempt from expiry.** The build skips the 60-day check for entries with `mock: true`, and every real entry keeps it. The weakness: mocks never disappear on their own. The CI mock list (see the mock rules) covers that. Rejected: refreshing the mock `posted` dates, because the dates would have to be bumped again every 60 days.
22. **Job postings load at build time.** `jobs.json` becomes a content collection that uses Astro's `file()` loader and a zod schema, so a malformed posting fails the build and does not show up broken. The trade-off: a new posting appears only after a rebuild. A push triggers one, so the delay is the length of the build. Rejected: fetching the file in the browser, because the schema check would happen only in the visitor's browser and the page would need a separate loading state and a separate error state.
23. **Freshness: a daily scheduled rebuild only.** A `schedule:` cron in the deploy workflow rebuilds once a day, so "next event" and job expiry are at most one day stale. Rejected: an extra check in the browser that hides expired items, because it duplicates the build logic for a one-day gain. If the cron is skipped (GitHub disables scheduled workflows after 60 days without repository activity), the site keeps showing the state of the last build. Re-enabling the workflow fixes it.
24. **Unconference gets its own page** at `/unconference/` and `/en/unconference/`, linked from host-a-meetup. The copy already exists as a separate set of strings, and the current host page already links to it.
25. **Canonical and hreflang.**
    - Translated pages (home, listings, MDX pages): each language version points its canonical at itself, and both carry `hreflang="hr"`, `hreflang="en"` and `hreflang="x-default"`. `x-default` points to the hr version.
    - Untranslated content under `/en/` (an event written in Croatian, for example): canonical points to the `/` version, with no hreflang.
    - RSS and tag pages are disabled in v1. When the blog is turned on, there is one feed and one set of tag pages, not one per locale.
26. **Slugs and the switcher.** Both locales use the same ASCII slug (`/events/korana-2026/` and `/en/events/korana-2026/`). The switcher adds or removes `/en`, and the build checks that the target exists. If it does not, the switcher links to the other locale's home page. Because of decision 12 every content page has a peer, so the fallback only applies to pages that exist in one locale.
27. **Translatable config.** Every text field in `NAV`, `CTA`, `FOOTER`, `HOME` and `STRINGS` becomes an `{ hr, en }` pair, resolved by one `t()` helper in `src/i18n/`. URLs, flags, `SOCIAL` and `BRAND` stay shared. `hr` is the reference dictionary. A CI check fails the build if an enabled feature has an hr key with no en key or the other way round. The maintainer owns the translations, including the Croatian for the theme's built-in strings.
28. **Fonts: replace Quantico with Exo 2.** Checked on 2026-11-05: Google Fonts serves Quantico in the `latin` subset only, which lacks č, ć, đ, š and ž. Croatian headings would mix two typefaces wherever those letters appear. Exo 2 has a similar geometric style and is served with `latin-ext`. Inter already has `latin-ext` and stays. The display font is set through the brand font setting so it can be changed later. Self-hosting is postponed.
29. **`rubyzg-style-redesign` deleted.** Checked: every commit on it was already in `main`. Deleted locally with `git branch -d`, which refuses unmerged branches. It was never on the remote.
30. **Pages cutover rights.** Checked: the maintainer's GitHub account has admin rights on the repo. Pages currently uses `build_type: legacy` and serves the `main` branch root. The switch to GitHub Actions happens at cutover (staging step 9), not before: `gh api -X PUT repos/karlovac-developers/karlovac-developers.github.io/pages -f build_type=workflow`.
31. **English ships at launch.** Already decided (decision 3). M17's Croatian-only launch is recorded under Alternatives Weighed.

**Resolved after the Goldfish design review (2026-11-05)**

32. **Every theme feature is on in v1, with labelled mock content wherever real content does not exist.** This supersedes decision 14's scope rule and the "Disabled" list under V1 scope. Blog, RSS, tags, authors, talks, speakers, venues, organizers, docs (handbook, runbooks, checklists), the calendar feed, `llms.txt`, stats and testimonials all ship.
33. **Mocks appear in the RSS and calendar feeds too.** Feeds cannot show a badge, so each mock item's title starts with "Primjer: ".
34. **Everything is converted to bilingual code now**, since nothing starts disabled (review D1). Feature flags stay in `src/config.ts` for turning features off later. A feature is turned off by setting its flag to `false` and deleting its route entry files, not by renaming routes or returning `[]` from `getStaticPaths` (review D2; supersedes decision 15's mechanism).
35. **The hero carousel keeps auto-advance and gains a visible pause/play button** (WCAG 2.2.2; review D3; extends decision 17).
36. **Rollback goes to a new `live-static` branch at `e27727f`**, the commit live on GitHub Pages today, and starts by disabling the deploy workflow. `legacy-static` stays the archive of source material (review D4; changes the rollback target in decisions 11 and 30).
37. **Every mock person and place is obviously fictional.** Mock people's surname is "Primjer". Mock venues are named "… Primjer". No real Karlovac venue, company or community member appears in mock content.

**Still open**

1. **Acceptance checks per enabled feature.** This belongs to `/egm-draft`: one observable check per feature, in both `/` and `/en/`.

**Suggested staging**

0. **Preserve.** Done: `legacy-static` branch and tag created and pushed without the planning-note names (decision 11), and `rubyzg-style-redesign` deleted (decision 29).
1. **Decide.** Done: decisions 1–31.
2. **Import.** On a feature branch, add the theme untouched at a pinned SHA, flattened into `src/`, with licence and provenance recorded. Pin Node and Astro, add `.gitignore`, and confirm the untouched build passes the a11y gate.
3. **Flag.** Add `FEATURES` to `src/config.ts` and put each disabled feature behind its flag (decision 15). Remove the demo content.
4. **CI on PRs.** Build, the a11y gate, key parity, page-peer check and link check. Nothing deploys yet.
5. **i18n.** `astro.config` i18n block, the `src/i18n/` helper module, per-locale dictionaries and config copy, locale-aware layout (lang, hreflang, canonical, Intl dates), the switcher with its fallback, client-script strings via data attributes, and the bilingual 404.
6. **Content.** hr and en MDX pages from the existing copy (about, give-a-talk, host-a-meetup, unconference), the mock CoC with its draft banner, the two seed events (CroMesh Meetup #2 and the Korana day from rostilj), and empty states for every enabled home section.
7. **Existing features.** The job wall as a build-time collection with mocks exempt from expiry, the hero carousel with licensed mock photos and their manifest, the mock badge component, and the CI mock list.
8. **Docs.** Rewrite README and CLAUDE.md, and reconcile or remove the theme's AGENTS.md.
9. **Cutover.** Add the deploy job with the daily cron (decision 23). An admin switches the Pages source to GitHub Actions. Merge to `main`, then smoke-test `/`, `/en/`, a deep page in each locale, the 404 page and RSS if present. Rollback means pointing the Pages source at `legacy-static`.
