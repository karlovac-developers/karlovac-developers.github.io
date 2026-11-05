# Stage 8: Intermediate Zoom Out

**Target:** `docs/designs/astro-popular-migration.md` (lines 1–1252). The document was not edited between stages, since this run is uninterrupted.
**Reviewer:** `egm-zoom-out` (Skeptical Architect). Status: completed.
**Inputs:** Stage 5, 6 and 7 reports, the brief, CLAUDE.md, and upstream `config.ts`, `BaseLayout.astro`, `Header.astro`, `Footer.astro`, `index.astro`, `events/[...page].astro` and the `src/content/**` listing at `d1554d5`.

**Verdict:** no Blockers. The Stage 6–7 findings collapse into about six groups, each fixed by one small change. Several of the Critic's fixes add more machinery than the problem needs, and two conflict with recorded rules.

**Confirmed upstream:** an event is upcoming only while `date >= now` (`index.astro` L14, `events/[...page].astro` L17). `<BaseLayout title="Events">` is a literal (`events/[...page].astro` L44). Demo entries exist in every collection, not only events. `SITE.logo`, `favicon` and `ogImage` are optional, Header and Footer render the logo only if it is set, and the theme's setup text calls text-only "a fine answer".

## Findings

### Z1. One change fixes the whole flag and translation group. Major
*   **Covers:** Stage 5 M1, M2, M3, N5; Stage 6 F1, F4, F5; Stage 7 C10.
*   **Change:** a disabled route has no entry file (Stage 5 M2). `ui.ts` holds the keys of the code that compiles, with key parity enforced by the type. `keyFeature` is removed.
*   **Effect:** the renames (`[...index]`, `[rss]`), the "if jobs is ever turned off" footnote and the endpoint names in the allow-list disappear. The allow-list becomes `404.astro` and `robots.txt.ts`.
*   **CUJ 9 and the flag test become:** the maintainer sets the flag, adds the NAV or HOME entry, the two entry files and the keys, and `astro check` fails until both languages have every key.
*   M2 and M3 apply whatever is decided on M1. `astro check` type-checks converted disabled views, so their keys must be in the typed `ui.ts` anyway, which leaves `keyFeature` nothing to filter. M1 (park disabled code unconverted) remains the larger optional saving.
*   **Challenges decision 15's mechanism** ("`getStaticPaths` returns `[]`"), and its "converted now" if M1 is taken. Decision 27's CI check is still met by the type check.

### Z2. One sentence settles canonical and hreflang; the sitemap filter goes. Major
*   **Covers:** Stage 5 M4, Stage 6 F3, Stage 7 C15.
*   **Rule:** "A page is untranslated only if it renders a single submitted entry." So `EventsList` and `/jobs/` are translated listings (decision 25), job cards only get `lang`, and an event page's two copies both carry a canonical to the copy under its entry's language prefix, with no hreflang.
*   #31 passing `translated={false}` to `EventsList` contradicts decision 25. The rule fixes that.
*   C15's point about `lang: 'en'` entries adds weight to M4: drop the filter and rely on canonicals, or use the theme's `noindex`. Do not build the cross-layer module.

### Z3. Rollback needs a branch at the live commit and a disabled workflow. Major
*   **Covers:** Stage 6 F10, Stage 7 C4.
*   Pages "deploy from branch" needs a branch, so C4's "tag `e27727f`" is not enough alone. Create a branch (for example `live-static`) at `e27727f` as the rollback source, and make `gh workflow disable` the first rollback step. `legacy-static` stays the source-material archive. Decision 11 is unaffected; only the rollback branch in decision 30 and staging step 9 changes.

### Z4. Demo content and placeholder images: fix by not copying, not by checks. Major
*   **Covers:** Stage 7 C1, C2, Nit 2.
*   **C1:** "No upstream `src/content/**` entries are copied; the starter CoC is source text for #25 only." This also stops demo authors, blog, docs, organizers, speakers and venues going live when a flag is turned on. **Drop** C1's event-count check: it fails the first time a real event is added.
*   **C2:** config only. Leave `SITE.logo` unset (text wordmark), use the existing KD SVG favicon, and leave `ogImage` unset. **Reject** using a carousel photo as `ogImage`: link previews would show a stock photo without its "illustrative" label, which breaks decision 20. This does not really challenge decision 6, since the theme documents text-only as valid.
*   **Nit 2:** `vouchedBy: "Marko F."` breaks the brief's fictional-names rule. Must fix with a data edit.

### Z5. Event-day time zone: fix events, leave job expiry alone. Major
*   **Covers:** Stage 7 C3.
*   One helper, "upcoming until the end of the day in Europe/Zagreb", used by Home and EventsList, plus `timeZone: 'Europe/Zagreb'` in `formatDate()`. Add an "event today" CUJ. **Drop** the job-expiry part: decision 23 already accepts a day of staleness.

### Z6. The pause control adds weight to dropping the carousel. Major
*   **Covers:** Stage 7 C8, Stage 5 N8.
*   C8 is right (WCAG 2.2.2). Cheaper ways to comply: (a) no auto-advance, so photos change only on a click and the interval, reduced-motion branch and pause button all go; (b) the theme's single hero (`heroCarousel: false`). **Challenges decision 17**, still the owner's call. If kept as designed, the pause button is required.

### Z7. Hard-coded English: list the strings, skip the lint. Major (fix) / Nit (enforcement)
*   **Covers:** Stage 5 N4, Stage 7 C6.
*   Name the known literals in #31: `events/[...page].astro` L44 title, `index.astro` "The team", "Meet the organizers", "All organizers", and the `'Community'` fallback. **Drop** C6's template lint and `dist/` English scan: a hand-made parser with false positives guarding a one-time conversion. CUJ 1's walk-through catches the rest.

### Z8. Cross-locale MDX links: one rule in the existing checker. Nit
*   **Covers:** Stage 7 C7.
*   `check-links.mjs` fails when an `/en/` page links into `/` or the reverse, except anchors carrying `hreflang` (the switcher and alternates), so no allow-list is needed. Add to CLAUDE.md: English MDX links start with `/en/`.

### Z9. A short risks section, not a matrix. Nit
*   **Covers:** Stage 7 C5.
*   **Keep:** restrict job `link` to `https:` and `mailto:` (one change to the schema), a sentence that GitHub emails the actor when a scheduled run fails (no custom notifier), and a sentence that the maintainer ports Astro security updates by hand.
*   **Drop:** the escaping item (Astro escapes by default), Pages size and bandwidth limits (two to four `<Image>` photos), and the likelihood/owner matrix. SHA-pinning Actions is optional.

### Z10. Smaller items. Nit
*   **Switcher fallback** (N2, F2): delete the fallback promise in Goal 2 and CUJ 2, and say 404 renders no `LangSwitch` because it already links to both homes. Consistent with decision 26.
*   **Events empty state** (C9): link it to Meetup's upcoming events, give `community.chat` its own label, and add one README sentence on who copies Meetup events.
*   **Wording and glossary** (C11, C12/F6, C13, C14, F9, F11, F12, Critic Nits 16 and 20): one editing pass. Downgrade C13 to Nit.
*   **`trailingSlash: 'always'`** (Critic Nit 7): keep.
*   **Hero alt schema** (Critic Nit 3): load `hero-photos.json` with `file()` and zod, only if the carousel stays.
*   **Font note:** one sentence that decision 28's "self-hosting postponed" was superseded.

## Prioritised list

**Must fix before implementation**
1.  Z1: no entry files for disabled routes, key parity enforced by the type, `keyFeature` removed, CUJ 9 and the flag test rewritten. M1 (park disabled code) is the owner's call under decision 15.
2.  Z2: the canonical rule, `EventsList` translated, sitemap filter dropped.
3.  Z3: rollback branch at `e27727f`, and disable the workflow first.
4.  Z4: copy no upstream content entries; leave logo and `ogImage` unset and use the KD favicon; use fictional mock names.
5.  Z5: events upcoming until end of day in Europe/Zagreb, and `formatDate` takes a `timeZone`.
6.  Z6: a pause control, no auto-advance, or no carousel. Owner's call under decision 17.
7.  Z7: list the hard-coded literals in #31.
8.  Stage 5 M5: verify `getStaticPaths` can be imported from an `.astro` view (else a sibling `.ts`), and state the dependency on identical file names. Not addressed by Stages 6–7; still stands.

**Should fix**
*   Z8, the Z9 link scheme and two risk sentences, the Z10 switcher wording and Meetup empty-state link, `trailingSlash`, F8 (one sentence on mock expiry), Stage 5 N3 (drop PreviewBar) and N6 (one base helper), the wording and glossary pass, the font note.

**Drop**
*   C1's event-count check; C2's carousel photo as `ogImage`; C6's template lint and `dist/` scan; C5's matrix, Pages limits and escaping item; C3's job-expiry time zone; `keyFeature` and the file-tree twin checks (Stage 5 N1); Critic Nits 5, 11, 13, 14, 15; Nit 6 gets one sentence or nothing; a custom deploy notifier. Optional: SHA pinning, Stage 5 N7.
