/* ============================================================
   JOB WALL — jobs.js
   Reads jobs.json and renders postings on the homepage preview
   and the full /jobs/ page. See jobs.example.json for the schema.
   ============================================================ */

// ── Configuration ───────────────────────────────────────────
// TODO: paste the Google Form URL for job submissions here.
const JOBS_FORM_URL = 'https://forms.gle/REPLACE-ME';

// Postings auto-hide this many days after their `posted` date.
const JOBS_EXPIRY_DAYS = 60;

// How many postings the homepage card shows.
const JOBS_PREVIEW_COUNT = 2;

// ── Helpers ─────────────────────────────────────────────────

function jobsRoot() {
  return document.body.getAttribute('data-root') || '';
}

function currentLang() {
  return document.documentElement.lang === 'hr' ? 'hr' : 'en';
}

function t(key, fallback) {
  const dict = (typeof translations !== 'undefined' && translations[currentLang()]) || {};
  return dict[key] !== undefined ? dict[key] : fallback;
}

/** A posting is live until JOBS_EXPIRY_DAYS after it was posted. */
function isActive(job, now) {
  const posted = new Date(job.posted + 'T00:00:00');
  if (isNaN(posted.getTime())) return false;
  return (now - posted) / 86400000 <= JOBS_EXPIRY_DAYS;
}

function formatDate(iso, lang) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'hr' ? 'hr-HR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ── Rendering ───────────────────────────────────────────────

function renderJob(job, lang) {
  const item = el('article', 'job');

  const head = el('div', 'job-head');
  head.appendChild(el(
    'span',
    'job-kind job-kind-' + (job.kind === 'available' ? 'available' : 'hiring'),
    job.kind === 'available'
      ? t('jobs.kind.available', 'I know someone')
      : t('jobs.kind.hiring', 'Looking for someone')
  ));
  head.appendChild(el('time', 'job-posted', formatDate(job.posted, lang)));
  item.appendChild(head);

  item.appendChild(el('h4', 'job-role', job.role));

  const metaBits = [];
  if (job.company) metaBits.push(job.company);
  if (job.location) metaBits.push(job.location);
  if (job.type) metaBits.push(t('jobs.type.' + job.type, job.type));
  if (metaBits.length) item.appendChild(el('p', 'job-meta', metaBits.join(' · ')));

  if (job.description) item.appendChild(el('p', 'job-desc', job.description));

  const foot = el('div', 'job-foot');
  if (job.vouchedBy) {
    foot.appendChild(el('span', 'job-vouch',
      t('jobs.vouched', 'Vouched by') + ' ' + job.vouchedBy));
  }
  if (job.link) {
    const a = el('a', 'inline-link',
      job.kind === 'available' ? t('jobs.contact', 'Get in touch →') : t('jobs.apply', 'Apply →'));
    a.href = job.link;
    if (/^https?:/.test(job.link)) { a.target = '_blank'; a.rel = 'noopener'; }
    foot.appendChild(a);
  }
  item.appendChild(foot);

  return item;
}

function renderInto(container, jobs, lang) {
  container.textContent = '';

  // A failed fetch is not the same as an empty wall — say which.
  if (LOAD_FAILED) {
    container.appendChild(el('p', 'jobs-empty',
      t('jobs.unavailable', 'Postings could not be loaded right now.')));
    return;
  }
  if (!jobs.length) {
    container.appendChild(el('p', 'jobs-empty',
      t('jobs.empty', 'No open postings right now — be the first.')));
    return;
  }
  jobs.forEach(job => container.appendChild(renderJob(job, lang)));
}

// ── Boot ────────────────────────────────────────────────────

let ALL_JOBS = [];
let LOAD_FAILED = false;
let activeFilter = 'all';

function paint() {
  const lang = currentLang();

  // Point every submission link at the configured form.
  document.querySelectorAll('[data-jobs-form]').forEach(a => { a.href = JOBS_FORM_URL; });

  const preview = document.getElementById('jobs-preview');
  if (preview) renderInto(preview, ALL_JOBS.slice(0, JOBS_PREVIEW_COUNT), lang);

  const list = document.getElementById('jobs-list');
  if (list) {
    const filtered = activeFilter === 'all'
      ? ALL_JOBS
      : ALL_JOBS.filter(j => (j.kind || 'hiring') === activeFilter);
    renderInto(list, filtered, lang);

    const count = document.getElementById('jobs-count');
    if (count) {
      count.textContent = filtered.length === 1
        ? t('jobs.count.one', '1 open posting')
        : t('jobs.count.many', '{n} open postings').replace('{n}', filtered.length);
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('jobs-preview') && !document.getElementById('jobs-list')) return;

  // Filter buttons on the /jobs/ page
  document.querySelectorAll('[data-jobs-filter]').forEach(btn => {
    btn.addEventListener('click', function () {
      activeFilter = btn.getAttribute('data-jobs-filter');
      document.querySelectorAll('[data-jobs-filter]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      paint();
    });
  });

  // Re-render when the language toggle fires
  document.addEventListener('langchange', paint);

  if (location.protocol === 'file:') {
    // Browsers give file:// pages a null origin and block fetch() outright,
    // so jobs.json can never load this way. Serve the folder instead:
    //   python3 -m http.server 8000
    console.warn(
      'Job postings need the site served over http:// — jobs.json cannot be ' +
      'fetched from a file:// page. Try: python3 -m http.server 8000'
    );
  }

  fetch(jobsRoot() + 'jobs.json', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(jobs => {
      const now = new Date();
      ALL_JOBS = (Array.isArray(jobs) ? jobs : [])
        .filter(j => j && j.posted && j.role && isActive(j, now))
        .sort((a, b) => (a.posted < b.posted ? 1 : -1));
      paint();
    })
    .catch(() => { ALL_JOBS = []; LOAD_FAILED = true; paint(); });
});
