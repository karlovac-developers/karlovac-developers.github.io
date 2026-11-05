# Stage 7: Critic Review

**Target:** `docs/designs/astro-popular-migration.md`, FeatureRange lines 1–679.
**Standard:** `feature-spec-standard.md` (design and structural reviewers).

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-design` | completed (verdict: Revise) |
| `egm-structural` | completed |
| `egm-style` | completed |

After removing duplicates: 0 Blocker, 15 Major, 21 Nit. The orchestrator spot-checked two factual claims before writing this report. Both hold: the mock postings include `vouchedBy: "Marko F."`, and the theme ships `src/content/events/first-meetup.md` and `launch-night.md`.

## Major

### C1. The theme's demo events would go live as Karlovac Developers history
*   **Lens:** design. **Scope:** Starting point (L249–258); Events (L437–439); CUJ 3 (L164–173).
*   Upstream `first-meetup.md` ("Our first meetup", 2026-08-06) and `launch-night.md` (2026-05-14) are in the past. They would be copied unchanged and listed under past events in both locales, in English and without a mock label. Brief staging step 3 said to remove demo content; the design never does.
*   **Recommendation:** state that every upstream `src/content/**` entry is removed except the pages being replaced, naming the files. Add a check that fails if any event other than the two seeded ones exists at launch.

### C2. Theme placeholder images ship as the logo, favicon and link-preview image
*   **Lens:** design. **Scope:** Goals (L88–95); Non-Goals "A custom brand" (L118–120); Problem (L46–48); Brand (L441–446).
*   `logo.png` is a "YC" (Your Community) monogram used as header logo and favicon. The current site already has a "KD" SVG favicon. `ogImage` is `hero.png`, which reads "Your photo here / Placeholder — replace with your community photo", so every shared link previews with it. That works against the Problem section's point about link previews. Neither image is labelled on the page.
*   **Partly challenges decision 6.** The reviewer argues these are placeholder content, not brand.
*   **Recommendation:** keep the existing KD SVG favicon, show the brand as text with no logo, point `ogImage` at the first carousel photo or drop it, and say so in Brand.

### C3. Event dates have no time zone, so the next event disappears on its own day
*   **Lens:** design. **Scope:** Goals (L96–98); CUJ 3; Data flow (L286); L466–468.
*   `z.coerce.date()` reads a date-only value as midnight UTC. The theme treats an event as upcoming only while `date >= now`, so the 03:00 UTC build on the event day already moves it to "past". Dates are formatted on a UTC runner without `timeZone`. Job expiry has the same midnight-UTC edge. Brief M6 flagged this.
*   **Recommendation:** an event counts as upcoming until the end of its day in Europe/Zagreb (or `date` must carry a time and offset). `formatDate()` passes `timeZone: 'Europe/Zagreb'`. Apply the same rule to job expiry, and add an "event today" CUJ.

### C4. The rollback target is not the live site, and the workflow keeps running after rollback
*   **Lens:** design, comprehension (F10). **Scope:** Overview (L33–35); Goals (L96–99); CUJ 11 (L239–245); NFR (L653–655).
*   `legacy-static` snapshots the working tree, not live `main` (`e27727f`). Rolling back would publish pages that were never live: `unconference/`, the uncommitted edits, and the rostilj poster page (names removed, but still the page Alternative P chose not to publish; the snapshot still has two "?" planning chips). The rollback steps do not disable `deploy.yml`, so its push and daily triggers fail or override the rollback.
*   **Challenges decision 11 as used for rollback (decision 30, staging step 9).**
*   **Recommendation:** tag `e27727f` as the rollback point (keep `legacy-static` as the source-material archive), and add "disable the deploy workflow" to the rollback steps.

### C5. No Risks & Mitigations section
*   **Lens:** design, structural. **Scope:** whole range. Risks are scattered across L306–308, 466–468, 535–537, 545–549, 642–655.
*   The standard requires failure modes, security, limits and mitigations. Missing:
    *   **Security:** the job `link` field. A plain URL check accepts `javascript:`, so restrict it to `https:` and `mailto:`. Escaping of submitted fields. Who may edit `jobs.json`. Pinning third-party Actions to commit SHAs.
    *   **Failure modes:** a broken `main` or failed install silently stops the daily rebuild. GitHub can delay or drop scheduled runs. The 60-day disabling of scheduled workflows. There is no deploy-failure notice (brief M15).
    *   **Upkeep:** Astro security updates and theme fixes ported by hand across about 60 files, with no owner or cadence ("if at all", L114).
    *   **Limits:** GitHub Pages' 1 GB site size and about 100 GB/month bandwidth (photo sizes matter).
    *   **Process:** mocks reaching production unnoticed, and rollback needing admin rights.
*   **Recommendation:** an H2 "Risks & Mitigations" between Alternatives and NFR, one row per risk: likelihood and impact, mitigation, owner.

### C6. Text written directly into templates bypasses the translation check
*   **Lens:** design, zoom-out N4. **Scope:** Goals (L68–71); Translating text (L310–341); Feature flags (L400–402).
*   `check-i18n` compares dictionary keys only. Upstream has English written directly into templates: `index.astro` "The team", "Meet the organizers", "All organizers", the `'Community'` fallback, and `events/[...page].astro` `<BaseLayout title="Events">`. That last one would give the Croatian `/events/` page an English `<title>`, the metadata problem the design sets out to fix. "Never a literal string" is enforced only by a CLAUDE.md sentence.
*   **Recommendation:** an automated check, either a lint over `src/views` and `src/components` for literal text and literal `title`/`aria-label`/`alt` values, or a check on `dist/` that `hr` pages contain none of the theme's English defaults and every `<title>` matches its locale.

### C7. Links inside MDX bodies can switch the visitor's language
*   **Lens:** design. **Scope:** CUJ 1 (L150–153); Translating text (L327–335); check-links (L460–461).
*   `localeHref()` covers config links only. MDX links (host-a-meetup to unconference, give-a-talk calls to action) get only the base from `popular-markdown.mjs`. A `/unconference/` link in English MDX resolves, so the link check passes, but it lands an English visitor on the Croatian page.
*   **Recommendation:** `check-links.mjs` fails if an `/en/` page links outside `/en/`, or a `/` page links into `/en/`, except the switcher and allow-listed endpoints.

### C8. The carousel has no pause control
*   **Lens:** design. **Scope:** CUJ 8 (L211–219); Hero carousel (L419–425); Accessibility (L649–652).
*   WCAG 2.2.2 requires a way to pause motion that lasts over 5 seconds, separate from `prefers-reduced-motion`. The rotation is continuous at 4000 ms. Pause on hover or focus is not enough.
*   **Recommendation:** a visible, keyboard-operable pause/play button with labels in both languages, in CUJ 8 and the accessibility requirements. **Adds to decision 17.**

### C9. Events now have two sources of truth, and the empty state is often false
*   **Lens:** design. **Scope:** CUJ 3; Non-Goals (L127); Events (L437–439).
*   The current site sends visitors to Meetup's upcoming page, so Meetup is the source of truth. In v1, "next event" comes only from hand-added entries, so "Nothing on the calendar" will be false whenever Meetup lists an event nobody copied. Separately, `community.chat` pointing at Meetup would label a Meetup link "Join the chat".
*   **Recommendation:** the empty state links to Meetup's upcoming events, the README names who copies each Meetup event and when, and the Meetup link gets its own label.

### C10. Endpoint file names and the allow-list disagree
*   **Lens:** structural, design N2, style N15, comprehension F1, zoom-out N5. **Scope:** L302–304, L390–396, L333.
*   The allow-list names `rss.xml.ts` and similar, L391 says `rss.xml.js` (the upstream name), and the plan renames them to `[rss].xml.ts`. L333 calls the allow-list "the 404 page" though it has five entries, four of which are non-HTML endpoints with no switcher.
*   **Recommendation:** one name per file throughout. Say what the allow-list matches, and that only 404 is a page.

### C11. "Open Questions" holds no open questions
*   **Lens:** structural, style, design N9. **Scope:** L130–139.
*   Item 1 answers itself, and item 2 is "a mechanical choice". L134 points to a "Verification Plan" outside this range.
*   **Recommendation:** write "None", or list the real unresolved items (for example the unverified claims at L483–484 and L510–511). Move the font note into Brand.

### C12. "Option A" cannot be resolved and collides with Alternative A
*   **Lens:** style, comprehension F6. **Scope:** L299.
*   No "option A" for routing exists in this document or the brief. Alternative A is the rejected two-build approach, and the brief's B3 "(A)" is about content locales.
*   **Recommendation:** "the per-locale entry-file layout (see Alternatives E and G)". Do not use "option A".

### C13. Rejection reasons cite a person instead of a reason or decision
*   **Lens:** style, structural N6, design N7. **Scope:** L485–486, 512–513, 536–537, 578, 584, 592, 631, 436.
*   "The user chose…" records an outcome without a reason. "The user" is never defined, and only Alternative H cites a decision number.
*   **Recommendation:** say "the owner" and cite the brief's decision: A→3, C→13, I→31, J→2, K→15, M→21, L→22, N→23, O→28, P→19, Q→24, L436→14. Name the con that decided each one.

### C14. Two Goals are absolute or unmeasurable
*   **Lens:** style. **Scope:** L80, L88.
*   "Everything the current site does still works" contradicts the Non-Goals (rostilj page, old URLs) and Alternative L (no failed-load state). "Can't be mistaken for real content" cannot be tested.
*   **Recommendation:** "These current-site features are rebuilt:" and "Mock content is labelled and listed."

### C15. The canonical and hreflang rules do not cover listings, same-language copies, English entries or jobs
*   **Lens:** comprehension F3, design N3. **Scope:** L76–79, L350–362, #31.
*   Listings are translated pages (brief decision 25), yet `EventsList` gets `translated={false}`. What the same-language entry page emits is unstated. Job postings have no page, so "canonical to the Croatian page" cannot apply. Entries with `lang: 'en'` (the five mock postings, any English event) need the `/` copy treated as the non-canonical one, which the sitemap filter does not handle.
*   **Recommendation:** one table with rows for home and listings, MDX pages, an entry page in its own language, an entry page in the other language, and job cards; columns for canonical, hreflang and sitemap.

## Nit

1.  **Theme facts.** `STRINGS` has 79 keys, not 76. The count of files reading it is off by one (design N1, zoom-out N4).
2.  **Mock names.** "Mock postings use fictional names" is false: `vouchedBy` includes "Marko F." (matches the maintainer), and "Ivan K.", "Ana M.", "Petra L." could be real people. Replace them with obviously fictional names (design N5).
3.  **Alt-text claim too strong.** `check-image-alt.py` cannot tell whether both languages exist. Enforce `alt: { hr, en }` non-empty in a `hero-photos.json` schema (design N4).
4.  **Alternative E's reason also applies to the chosen layout**, which uses `[...slug]` and `[...page]` with i18n routing. Give a reason specific to E, or call it a preference (design N6).
5.  **Missing alternative:** pre-built filtered job pages instead of the browser filter (brief M10) (design N7).
6.  **The visible "in Croatian" badge** from the brief's inventory was dropped without a reason (design N8).
7.  **`trailingSlash` and `build.format` unset.** State `trailingSlash: 'always'` so prefix swapping and `getRelativeLocaleUrl()` agree (design N10).
8.  **Home sections key off collection contents, not `HOME` entries.** Say the Home view checks flags directly (design N11).
9.  **"The build fails" is really `npm run check` failing** (design N11, comprehension F9).
10. **Additional Resources and Future Improvements are H3** under NFR. Make them H2 (structural, style).
11. **Horizontal rules** are used inconsistently (structural).
12. **Unlinked references.** The upstream repo, the Astro guides and the brief are not Markdown links (structural).
13. **Diagram box border misaligned** at L274–276 (structural).
14. **Line 661 overruns 80 columns** (structural).
15. **Unsourced, hedged cons in Alternative B.** Verify them or cut to the verifiable point (style).
16. **"twin", "peer", "counterpart"** for one concept. Pick one and define it (style, comprehension F11).
17. **Alternative Q contradicts itself** ("one page fewer" vs "costs nothing"). Alternative P's "costs nothing" is absolute (style).
18. **Opinion and filler.** "a poor base" (L39), "clearly", "mostly", "small", "almost no", "anyway", "covers the need" (style).
19. **"proves"** overstates a link check (L74–75, L334–335) (style).
20. **Undefined names and process jargon.** rostilj, the Korana day, CroMesh, Popular, unconference, Sätteri, the config objects, "Goldfish review findings", "the reviewers' list". Add a short glossary (style, comprehension F11).
21. **Small wording.** "checks only the keys" doubled word (L401); "posters" is ambiguous (L646); "SIL Open Font License" is the official spelling; "about 150 strings" is unexplained (L497); the CUJ intro says "one enabled feature" though CUJs 9–11 are workflows; Alternative M's reason uses "real-shaped"; "work in progress" (L62) (style).

## Out of lane, routed by the orchestrator

*   **Brief decision 28 vs the design on font self-hosting** (structural). The owner already resolved this during drafting, choosing to keep the draft's version (Exo 2 bundled). Reconciliation item: say in the design that the brief's "self-hosting postponed" was superseded.
