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

Node 22.18 or later (see `.nvmrc`) and Python 3 for two of the checks.

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

**Events from Meetup.** Events are announced on Meetup. The organizer who creates
an event there also adds it to `src/content/events/` the same day, so the home
page's "next event" stays true.

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
`main`, a daily run at 03:00 UTC and manual runs also deploy to GitHub Pages. The
daily run keeps "next event" and job expiry current.

**Scheduled builds stop after 60 days without repository activity.** GitHub
disables them and emails the workflow's last actor. Re-enable the workflow under
Actions → Deploy site → Enable workflow.

## Rollback

The static site that was live before this one is on the `live-static` branch.

1.  Disable the deploy workflow: `gh workflow disable deploy.yml`.
2.  In Settings → Pages, set the source to "Deploy from a branch", branch
    `live-static`, folder `/`.

`legacy-static` holds the old site's source files, including the pages that were
never published. It is an archive, not a rollback target.
