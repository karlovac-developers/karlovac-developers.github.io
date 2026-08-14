# Karlovac Developers

The website for [Karlovac Developers](https://karlovac-developers.github.io/) — a casual, community-run meetup group for developers and tech enthusiasts in Karlovac.

- **Site:** https://karlovac-developers.github.io/
- **Meetup:** https://www.meetup.com/karlovac-developers-meetup/

A static site with no build step, no dependencies and no package manager — plain HTML, one stylesheet and two small scripts. GitHub Pages serves it from the repo root, so **pushing to `main` deploys**.

## Running locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Serve it over http rather than opening `index.html` directly — on a `file://` page the browser blocks the `jobs.json` fetch and `localStorage`, so the job wall and the language toggle won't work.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Homepage — hero, intro cards, job preview |
| `give-a-talk/`, `host-a-meetup/`, `jobs/` | Subpages, one `index.html` each |
| `style.css` | The single stylesheet for all of the above |
| `translations.js` | Croatian/English dictionaries and the i18n engine |
| `jobs.js`, `jobs.json` | The job wall and its data |
| `jobs.example.json` | Schema reference for `jobs.json` (not loaded by the site) |
| `rostilj/` | A standalone one-off event page with its own design |

Pages are standalone rather than templated: the header, footer, fonts and favicon are duplicated in each file, so a change to the nav or footer means editing every page.

## Adding a job posting

`jobs.json` is a plain array, hand-edited and committed. Copy an entry from `jobs.example.json`, fill it in and open a PR — `_fields` in that file documents every key. Two things to get right:

- `posted` must be the real date in `YYYY-MM-DD`. Postings disappear from the site automatically 60 days later.
- `vouchedBy` is the community member referring the posting. That's the whole point of the wall — don't leave it blank.

Use `kind: "hiring"` for a company looking for someone and `kind: "available"` for a person open to work.

## Changing the text

Every user-facing string lives in `translations.js` under a dotted key, in both `en` and `hr`. The Croatian copy is *also* written literally into the HTML so the page reads correctly before JavaScript runs — when you edit a string, edit both, and keep them identical or the page will visibly change on load.

Adding a new string means: a key in `en`, the same key in `hr`, a `data-i18n="key"` (or `data-i18n-html="key"` for markup) attribute on the element, and the Croatian text inline as the element's content.

## Contributing

Issues and pull requests are welcome — for the site itself, for job postings, or for fixing our Croatian. If you want to give a talk or host a meetup, the [give a talk](https://karlovac-developers.github.io/give-a-talk/) and [host a meetup](https://karlovac-developers.github.io/host-a-meetup/) pages are the faster route.
