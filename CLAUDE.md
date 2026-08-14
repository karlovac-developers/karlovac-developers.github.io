# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Karlovac Developers meetup site — a static, dependency-free site served by GitHub Pages from the repo root at https://karlovac-developers.github.io/. No build step, no package manager, no tests, no CI. Pushing to `main` deploys.

## Running locally

```bash
python3 -m http.server 8000
```

Serve it over http — do **not** open `index.html` as a `file://` page. The job wall `fetch()`es `jobs.json`, which browsers block on a null origin (`jobs.js` logs a warning when it detects this), and `localStorage` for the language toggle also fails there.

## Architecture

### Pages are standalone, not templated

Every page is a complete HTML file: `index.html` plus one `index.html` per directory (`give-a-talk/`, `host-a-meetup/`, `jobs/`). The hero header, footer, font `<link>`s, and inline SVG favicon are **duplicated** in each. A change to the footer or nav means editing every page.

Subpages must carry `<body data-root="../">`. Both `translations.js` and `jobs.js` read that attribute to resolve paths from the site root — without it, translated relative links and the `jobs.json` fetch break on subpages.

`style.css` is the single stylesheet for all of these, organised into `/* ── SECTION ── */` banners with the brand palette as custom properties on `:root`. Prefer reusing existing tokens and component classes (`.card`, `.btn-pill`, `.btn-solid`, `.inline-link`, `.section-title`) over adding new ones.

`rostilj/` is deliberately outside all of the above: a one-off event landing page with its own inline `<style>`, its own fonts, its own poster-art design language, Croatian-only and not wired to the i18n engine. Don't try to fold it into the shared design system.

### i18n (`translations.js`)

A flat `translations` object with `en` and `hr` dictionaries keyed by dotted strings. On `DOMContentLoaded` it applies the stored language (`localStorage` key `kd-lang`, default `en`) by walking:

- `[data-i18n]` → sets `textContent`
- `[data-i18n-html]` → sets `innerHTML`, rewriting relative `href="…"` with the `data-root` prefix

The English text is also written literally into the HTML so the page reads correctly before JS runs. **Any new user-facing string needs a key in both `en` and `hr`**, plus the English copy inline in the markup.

`applyLang()` ends by dispatching a `langchange` CustomEvent on `document`. Anything that renders text from JS must listen for it and re-render — `jobs.js` does this via `paint()`.

### Job wall (`jobs.js` + `jobs.json`)

`jobs.json` is the live data, hand-edited by a maintainer; `jobs.example.json` is a schema reference with an inline `_fields` legend and is **not fetched by the site**. Update the example whenever the schema changes.

The same script drives two surfaces, keyed off element IDs present on the page: `#jobs-preview` (homepage card, first `JOBS_PREVIEW_COUNT` entries) and `#jobs-list` (the `/jobs/` page, with `[data-jobs-filter]` buttons and a `#jobs-count`). It bails early if neither exists.

Behaviour worth knowing before changing it:

- Postings auto-hide `JOBS_EXPIRY_DAYS` (60) after their `posted` date, so `posted` must be a real ISO date. The 60 days is also stated in the `jobs.how.p` and `jobs.rules.li4` copy — keep them in sync if you change the constant.
- Entries missing `posted` or `role` are silently dropped; the list sorts newest first.
- A failed fetch and an empty wall render different messages (`jobs.unavailable` vs `jobs.empty`) — the `LOAD_FAILED` flag exists to keep that distinction.
- `kind` is `hiring` or `available` and changes the badge, the filter bucket, and the CTA label (`Apply →` vs `Get in touch →`).
- `JOBS_FORM_URL` at the top of `jobs.js` is still the placeholder `https://forms.gle/REPLACE-ME`. It is injected into every `[data-jobs-form]` link at runtime.

### Hero carousel

The inline script at the bottom of `index.html` probes `assets/images/meetups/meetup_01.jpg`, `meetup_02.jpg`, … and stops at the first 404. Numbering must be contiguous. With no images present it costs one failed request and the CSS gradient shows through; the auto-advance timer only starts once a second image loads.
