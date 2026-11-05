# Karlovac Developers

The website of [Karlovac Developers](https://www.meetup.com/karlovac-developers-meetup/),
a community meetup for developers and tech enthusiasts in Karlovac, at
<https://karlovac-developers.github.io/>.

The site is built with [Astro](https://astro.build/) from the
[Popular](https://github.com/mariatta/astro-theme-popular) theme, and is served in
Croatian at `/` and in English at `/en/`. See [THEME.md](THEME.md) for what was
changed in the theme, and
[docs/designs/astro-popular-migration.md](docs/designs/astro-popular-migration.md)
for the design.

## Setup

Node 22.23.4 or later (Astro's minimum; `.nvmrc` selects the latest 22.x) and Python 3 for two of the checks.

```bash
npm install
npm run dev       # http://localhost:4321/
npm run build     # static site in dist/
npm run preview   # serve dist/
npm run check     # types, tests, alt text, JSON-LD, links (run after build)
npm run mocks     # list every mock and placeholder
```

## Adding content

All paths are the same in both languages: Croatian at `/events/`, English at
`/en/events/`.

*   **A page** (fixed text, translated): add `src/content/pages/hr/<slug>.mdx` and
    `src/content/pages/en/<slug>.mdx` with the same file name. English files link to
    `/en/…` pages; Croatian files link without the prefix.
*   **An event, post, speaker, venue, organizer or author** (written once): add a
    Markdown file to `src/content/<collection>/`, with `lang: hr` or `lang: en` for
    the language it is written in. It shows on both the Croatian and English site,
    marked with its own language.
*   **A job posting**: add an entry to `src/data/jobs.json`. The schema is in
    `src/content.config.ts`: `link` must start with `https://` or `mailto:`, and
    postings disappear 60 days after `posted`.
*   **Interface text**: add the key to both `hr` and `en` in `src/i18n/ui.ts`, or
    add a `{ hr, en }` pair in `src/config.ts`. A key missing on either side fails
    `npm run check`.

**Events from Meetup.** Events are announced on Meetup. Every build reads Meetup's
public calendar feed (`MEETUP_ICAL_URL` in `src/config.ts`) and adds each upcoming
event that has no file in `src/content/events/`, with its title, date, time and
description, and an RSVP button to Meetup. The daily check (see Deploy) publishes
a new Meetup event by the next morning; run the deploy workflow by hand (Actions →
Deploy site → Run workflow, or `gh workflow run deploy.yml`) to publish it sooner.

The feed has no venue, so a synced event links to Meetup for the location. To add
a venue, speakers or talks, write the event's file: name it
`<date>-<title slug>.md` (the synced event's URL shows the name) and set
`meetupUrl` to the Meetup event page. A file with the same `meetupUrl` replaces the
synced event. The feed lists upcoming events only, so once an event is over it
disappears from the site unless it has a file: write one for every event worth
keeping in the archive.

If Meetup cannot be reached, the build logs a warning and goes on without the
synced events. `MEETUP_SYNC=off npm run build` skips the fetch.

The past events up to 2026-10-10 and their venues were imported once from Meetup's
event pages. Meetup listed 49 past events then; the 39 older ones have no file and
are counted in the home page's "events hosted" stat through
`MEETUP_PAST_EVENTS_NOT_ON_SITE`.

**Home photos.** `src/data/hero-photos.json` lists the carousel photos, which are
in `src/assets/hero/`. Each needs alt text in both languages and a `source` link,
which the caption links to.

## Mock content

Where no real content exists yet, the site shows mock content. Every mock has
`mock: true`, shows a visible "Primjer" / "Example" label, and has "Primjer: " in
front of its title in the RSS and calendar feeds. Mock people's surname is
"Primjer". `npm run mocks` lists every mock and placeholder (including the job form
URL, `JOBS_FORM_URL` in `src/config.ts`). To replace a mock, put the real content
in and remove `mock: true`.

## Turning a feature off

Every theme feature is on. To turn one off, set its flag to `false` in `FEATURES`
in `src/config.ts` (this hides navigation, footer and home links to it) and delete
its entry files from both `src/pages/` and `src/pages/en/`:

| Feature | Entry files |
| --- | --- |
| `blog` | `blog/[...page].astro`, `blog/[slug].astro` |
| `tags` | `tags/[tag]/[...page].astro` |
| `authors` | `authors/[slug].astro` |
| `talks` | `talks/[...page].astro` |
| `speakers` | `speakers/index.astro`, `speakers/[slug].astro` |
| `venues` | `venues/index.astro`, `venues/[slug].astro` |
| `organizers` | `organizers/[...page].astro`, `organizers/[slug].astro` |
| `jobs` | `jobs/index.astro` |
| `events` | `events/[...page].astro`, `events/[slug].astro` |
| `rss` | `rss.xml.js` (Croatian only, no `en/` twin) |
| `calendar` | `events/calendar.ics.ts` (no `en/` twin) |
| `llms` | `llms.txt.ts` (no `en/` twin) |
| `docs` | none: handbook and runbooks are pages; delete `src/content/docs/` |
| `heroCarousel`, `stats`, `testimonials` | none: home page sections only |

Then run `npm run build && npm run check`.

## Deploy

`.github/workflows/deploy.yml` builds and checks every pull request. Pushes to
`main` and manual runs also deploy to GitHub Pages.

**The daily check.** At 03:00 UTC a scheduled run works out what changes without
a commit: which event files are upcoming, which job postings are still visible and
which events Meetup's calendar lists (`scripts/build-state.mjs`). Every deploy
publishes the same summary as `/build-state.json`. The scheduled run compares the
two and builds and deploys only when they differ, so most days it ends after the
check, in a few seconds. If Meetup cannot be reached, the check compares the rest
and leaves the Meetup part as it is. `node scripts/build-state.mjs --compare
https://karlovac-developers.github.io/build-state.json` runs the same check locally.

**Scheduled runs stop after 60 days without repository activity.** GitHub disables
them and emails the workflow's last actor. Re-enable the workflow under Actions →
Deploy site → Enable workflow.

## The previous site at /old/

`public/old/` is a frozen copy of the static site that was live before this one
(`main` at `e27727f`), served at <https://karlovac-developers.github.io/old/>.
Its only changes are a `noindex` tag and canonical links pointing at `/old/`, so
search engines do not treat it as a copy of the new pages. Do not edit it. To
remove it, delete `public/old/`.

The Astro dev server does not map `/old/` to `/old/index.html`; open
`/old/index.html` there, or check the built site with
`python3 -m http.server --directory dist`.

## Rollback

The static site that was live before this one is on the `live-static` branch.

1.  Disable the deploy workflow: `gh workflow disable deploy.yml`.
2.  In Settings → Pages, set the source to "Deploy from a branch", branch
    `live-static`, folder `/`.

`legacy-static` holds the old site's source files, including the pages that were
never published. It is an archive, not a rollback target.
