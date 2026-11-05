# Theme provenance

This site is built from the [Popular](https://github.com/mariatta/astro-theme-popular)
Astro theme by Mariatta, MIT licence (see `THEME-LICENSE`).

*   **Upstream commit:** `d1554d5e95ec11b7dbc42cbb2dad7327494cfe19` (v0.13.0, 2026-10-05)
*   **Copied from:** the plain-project copy in the upstream repository's top-level
    `src/`, `public/`, `astro.config.mjs`, `popular-markdown.mjs` and `tsconfig.json`.

To compare against a newer upstream release, check out both commits of the
upstream repository and diff the paths above. Then apply the upstream changes to
this project by hand, using the table below to see which files were changed
here.

## Not copied

`package/`, `demos/`, `smoke/`, `create-popular-site/`, `src/content/**` (demo
content), `src/data/setup-questions.json`, `public/images/**`, every file in
`scripts/` except `check-image-alt.py` and `check-jsonld.py`, `.github/`,
`AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`, `PACKAGING.md`, `PARITY.md`,
`RELEASING.md`, `UPSTREAM-HANDOFF.md`, `package.json`, `package-lock.json`.

## Local changes to theme files

| File | Change | Reason |
| --- | --- | --- |
| `src/layouts/BaseLayout.astro` | Reads `SITE.fontAwesome` through `(SITE as Record<string, any>)` | `SITE` does not declare the optional key, which fails `astro check` |
| `src/components/Footer.astro` | Removed the `version` import from `package.json` and the "v{version}" suffix after the credit | This project's `package.json` holds the site's version, not the theme's |
| `src/config.ts` | Typed `HOME.testimonialsHead` with an optional `lead`, and `HOME.testimonials` items with an optional `photo` | `index.astro` reads both, which fails `astro check` against the inferred type |

## Tooling notes

*   TypeScript is pinned to `^5`. TypeScript 6 turns `strict` on by default, and
    the theme's code produces implicit-`any` errors under it.
