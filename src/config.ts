/** Site configuration (adapted from the Popular theme's config.ts, see THEME.md).
 *
 *  Every piece of text visitors read is a `{ hr, en }` pair, resolved with
 *  pick() from src/i18n. URLs, icons, flags, SOCIAL and BRAND are single
 *  values. Interface strings live in src/i18n/ui.ts.
 *
 *  Loaded by Node for tests and list-mocks: no imports, no astro:*. */

type Pair = { hr: string; en: string };
type Link = { label: Pair; href: string; feature?: Feature };

/* ── Feature flags ──
   A flag hides every link to and embed of its feature (navigation, footer,
   home sections, component checks). Routes are not flagged: to turn a
   feature off, set its flag to false and delete its route entry files
   under src/pages/ and src/pages/en/ (README lists them per feature). */
export const FEATURES = {
  events: true,
  jobs: true,
  heroCarousel: true,
  blog: true,
  rss: true,
  tags: true,
  authors: true,
  talks: true,
  speakers: true,
  venues: true,
  organizers: true,
  docs: true,
  calendar: true,
  llms: true,
  stats: true,
  testimonials: true,
};
export type Feature = keyof typeof FEATURES;

export const MEETUP_URL = 'https://www.meetup.com/karlovac-developers-meetup/';
export const MEETUP_UPCOMING_URL = 'https://www.meetup.com/karlovac-developers-meetup/events/?type=upcoming';

/* ── Job wall ── */
export const JOBS_EXPIRY_DAYS = 60;
export const JOBS_PREVIEW_COUNT = 2;
/* Still a placeholder: the "post a job" button renders as a labelled mock
   with no link until this points at a real form. */
export const JOBS_FORM_URL = 'https://forms.gle/REPLACE-ME';

/* ── Hero carousel ── */
export const HERO_INTERVAL_MS = 4000;

export const SITE: {
  title: Pair;
  tagline: Pair;
  description: Pair;
  brandName: string;
  brandSub: string;
  logo?: string;
  favicon: string;
  ogImage?: string;
} = {
  title: { hr: 'Karlovac Developers', en: 'Karlovac Developers' },
  tagline: { hr: 'Karlovački meetup za programere', en: "Karlovac's developer meetup group" },
  description: {
    hr: 'Karlovac Developers je zajednica programera i tech entuzijasta iz Karlovca: susreti, predavanja, poslovi i druženje.',
    en: 'Karlovac Developers is a community of developers and tech enthusiasts in Karlovac: meetups, talks, jobs and good company.',
  },
  brandName: 'Karlovac',
  brandSub: 'Developers',
  favicon: '/favicon.svg',
};

/* List pagination size. */
export const PAGINATION = { pageSize: 10 };

/* Renameable content sections (theme feature). */
export const SECTIONS_MAP = {
  authors: 'authors',
  team: 'organizers',
};

/* Re-brand the site here. Only the display font is set: the theme's
   Quantico has no Croatian letters. */
export const BRAND: Record<string, string> = {
  fontDisplay: "'Exo 2', Inter, sans-serif",
};

export const NAV: (Link & { children?: Link[] })[] = [
  {
    label: { hr: 'Događanja', en: 'Events' },
    href: '/events/',
    feature: 'events',
    children: [
      { label: { hr: 'Događanja', en: 'Events' }, href: '/events/', feature: 'events' },
      { label: { hr: 'Predavanja', en: 'Talks' }, href: '/talks/', feature: 'talks' },
    ],
  },
  { label: { hr: 'Blog', en: 'Blog' }, href: '/blog/', feature: 'blog' },
  { label: { hr: 'Poslovi', en: 'Jobs' }, href: '/jobs/', feature: 'jobs' },
  {
    label: { hr: 'Uključi se', en: 'Get involved' },
    href: '/get-involved/',
    children: [
      { label: { hr: 'Uključi se', en: 'Get involved' }, href: '/get-involved/' },
      { label: { hr: 'Održi predavanje', en: 'Give a talk' }, href: '/give-a-talk/' },
      { label: { hr: 'Ugosti susret', en: 'Host a meetup' }, href: '/host-a-meetup/' },
      { label: { hr: 'Unconference', en: 'Unconference' }, href: '/unconference/' },
    ],
  },
  {
    label: { hr: 'O nama', en: 'About' },
    href: '/about/',
    children: [
      { label: { hr: 'O nama', en: 'About us' }, href: '/about/' },
      { label: { hr: 'Organizatori', en: 'Organizers' }, href: '/organizers/', feature: 'organizers' },
      { label: { hr: 'Predavači', en: 'Speakers' }, href: '/speakers/', feature: 'speakers' },
      { label: { hr: 'Mjesta', en: 'Venues' }, href: '/venues/', feature: 'venues' },
      { label: { hr: 'Kodeks ponašanja', en: 'Code of Conduct' }, href: '/code-of-conduct/' },
    ],
  },
  { label: { hr: 'Priručnik', en: 'Handbook' }, href: '/handbook/', feature: 'docs' },
];

export const CTA = {
  label: { hr: 'Pridruži se', en: 'Join us' },
  url: MEETUP_URL,
  icon: 'fa-brands fa-meetup',
};

export const SOCIAL: { label: string; icon: string; url: string; feature?: Feature }[] = [
  { label: 'Meetup', icon: 'fa-brands fa-meetup', url: MEETUP_URL },
  { label: 'GitHub', icon: 'fa-brands fa-github', url: 'https://github.com/karlovac-developers' },
  { label: 'RSS', icon: 'fa-solid fa-rss', url: '/rss.xml', feature: 'rss' },
];

export const FOOTER: {
  tagline: Pair;
  credit: { label: string; url: string };
  columns: { title: Pair; links: Link[] }[];
} = {
  tagline: { hr: 'Karlovački meetup za programere', en: "Karlovac's developer meetup group" },
  credit: { label: 'Popular. An Astro theme by Mariatta.', url: 'https://popular.mariatta.ca/' },
  columns: [
    {
      title: { hr: 'Zajednica', en: 'Community' },
      links: [
        { label: { hr: 'O nama', en: 'About us' }, href: '/about/' },
        { label: { hr: 'Blog', en: 'Blog' }, href: '/blog/', feature: 'blog' },
        { label: { hr: 'Kodeks ponašanja', en: 'Code of Conduct' }, href: '/code-of-conduct/' },
      ],
    },
    {
      title: { hr: 'Uključi se', en: 'Get involved' },
      links: [
        { label: { hr: 'Održi predavanje', en: 'Give a talk' }, href: '/give-a-talk/' },
        { label: { hr: 'Ugosti susret', en: 'Host a meetup' }, href: '/host-a-meetup/' },
        { label: { hr: 'Unconference', en: 'Unconference' }, href: '/unconference/' },
        { label: { hr: 'Poslovi', en: 'Jobs' }, href: '/jobs/', feature: 'jobs' },
      ],
    },
    {
      title: { hr: 'Organizatori', en: 'Organizers' },
      links: [
        { label: { hr: 'Organizatori', en: 'Organizers' }, href: '/organizers/', feature: 'organizers' },
        { label: { hr: 'Priručnik', en: 'Handbook' }, href: '/handbook/', feature: 'docs' },
        { label: { hr: 'Upute za susrete', en: 'Runbooks' }, href: '/runbooks/', feature: 'docs' },
      ],
    },
  ],
};

/* Support box at the bottom of blog posts, null hides it. */
export const SUPPORT: null | {
  badge: Pair;
  text: Pair;
  ctas: { label: Pair; url: string; variant?: string }[];
} = null;

/* List-page headers. */
type SectionHead = { eyebrow: Pair; title: Pair; lead: Pair };
export const SECTIONS: Record<'blog' | 'events' | 'organizers' | 'speakers' | 'venues' | 'jobs', SectionHead> = {
  blog: {
    eyebrow: { hr: 'Blog', en: 'Blog' },
    title: { hr: 'Blog', en: 'Blog' },
    lead: { hr: 'Osvrti i novosti iz zajednice.', en: 'Recaps and news from the community.' },
  },
  events: {
    eyebrow: { hr: 'Događanja', en: 'Events' },
    title: { hr: 'Događanja', en: 'Events' },
    lead: {
      hr: 'Nadolazeći susreti. Sva događanja su besplatna i novi ljudi su uvijek dobrodošli.',
      en: 'Upcoming gatherings. All events are free, and newcomers are always welcome.',
    },
  },
  organizers: {
    eyebrow: { hr: 'Tim', en: 'The team' },
    title: { hr: 'Organizatori', en: 'Organizers' },
    lead: {
      hr: 'Zajednicu vode volonteri. Želiš pomoći? Javi se.',
      en: 'The community is run by volunteers. Want to help? Say hi.',
    },
  },
  speakers: {
    eyebrow: { hr: 'Predavači', en: 'Speakers' },
    title: { hr: 'Predavači', en: 'Speakers' },
    lead: {
      hr: 'Svi koji su uzeli mikrofon na nekom od naših susreta.',
      en: 'Everyone who has taken the mic at one of our gatherings.',
    },
  },
  venues: {
    eyebrow: { hr: 'Mjesta', en: 'Venues' },
    title: { hr: 'Mjesta', en: 'Venues' },
    lead: { hr: 'Prostori koji nas ugošćuju.', en: 'The rooms that host us.' },
  },
  jobs: {
    eyebrow: { hr: 'Poslovi', en: 'Jobs' },
    title: { hr: 'Poslovi', en: 'Jobs' },
    lead: {
      hr: 'Pozicije koje kruže zajednicom i ljudi otvoreni za nove prilike. Iza svakog oglasa stoji netko tko poznaje posao.',
      en: 'Roles going around the community, and people open to work. Every posting is vouched for by someone who knows the work.',
    },
  },
};

type Cta = { label: Pair; url: string; icon?: string; variant?: string };

export const HOME: {
  hero: { eyebrow?: Pair; title: Pair; lead: Pair; ctas: Cta[] };
  stats: { value: string | Pair; label: Pair; mock?: boolean }[];
  featuresHead: { eyebrow?: Pair; title: Pair; lead?: Pair };
  features: { icon: string; title: Pair; body: Pair }[];
  testimonialsHead: { eyebrow?: Pair; title: Pair; lead?: Pair };
  testimonials: { quote: Pair; name: string; role: Pair; photo?: string; mock?: boolean }[];
  getInvolved: { eyebrow?: Pair; title: Pair; lead: Pair; ctas: Cta[] };
} = {
  hero: {
    title: { hr: 'Karlovac Developers', en: 'Karlovac Developers' },
    lead: { hr: 'Karlovački meetup za programere', en: "Karlovac's developer meetup group" },
    ctas: [
      { label: { hr: '🎉 Pridruži se Meetupu', en: '🎉 Join the Meetup' }, url: MEETUP_URL, variant: 'primary' },
      { label: { hr: '📅 Sljedeći događaj', en: '📅 Next Event' }, url: MEETUP_UPCOMING_URL, variant: 'outline' },
    ],
  },
  /* @pastEventCount resolves at build time to the number of past events. */
  stats: [
    { value: '@pastEventCount', label: { hr: 'događanja', en: 'events hosted' }, mock: true },
    { value: '2026', label: { hr: 'osnovano', en: 'founded' }, mock: true },
    { value: { hr: 'Svi', en: 'All' }, label: { hr: 'dobrodošli', en: 'welcome' }, mock: true },
    { value: { hr: 'Besplatno', en: 'Free' }, label: { hr: 'ulaz', en: 'to attend' }, mock: true },
  ],
  featuresHead: { title: { hr: 'Što radimo', en: 'What we do' } },
  features: [
    {
      icon: 'fa-solid fa-people-group',
      title: { hr: 'Što je Karlovac Developers?', en: "What's Karlovac Developers?" },
      body: {
        hr: 'Karlovac Developers je opušten meetup koji vodi zajednica programera i tech entuzijasta u Karlovcu.',
        en: 'Karlovac Developers is a casual, community-run meetup group for developers and tech enthusiasts in Karlovac.',
      },
    },
    {
      icon: 'fa-solid fa-user-plus',
      title: { hr: 'Pridruži nam se', en: 'Join Us' },
      body: {
        hr: 'Redovito se okupljamo kako bismo popričali, podijelili znanje i uživali u društvu. Svrati na sljedeći Meetup i vidi o čemu se radi!',
        en: "We meet regularly to chat, share knowledge, and enjoy each other's company. Drop by our next Meetup to see what it's all about!",
      },
    },
    {
      icon: 'fa-solid fa-building',
      title: { hr: 'Ugosti meetup', en: 'Host a Meetup' },
      body: {
        hr: 'Želiš ugostiti Karlovac Developers meetup u svom prostoru?',
        en: 'Want to host a Karlovac Developers meetup at your space?',
      },
    },
  ],
  testimonialsHead: { title: { hr: 'Što kažu članovi', en: 'What members say' } },
  testimonials: [
    {
      quote: {
        hr: 'Došla sam na prvi susret ne poznajući nikoga, a otišla s tri nova projekta i pet novih prijatelja.',
        en: 'I came to my first meetup knowing nobody and left with three new projects and five new friends.',
      },
      name: 'Iva Primjer',
      role: { hr: 'članica', en: 'member' },
      mock: true,
    },
    {
      quote: {
        hr: 'Najbolje mjesto u Karlovcu za čuti što drugi zapravo rade, bez prodajnih prezentacija.',
        en: 'The best place in Karlovac to hear what people actually build, with no sales pitches.',
      },
      name: 'Luka Primjer',
      role: { hr: 'član', en: 'member' },
      mock: true,
    },
  ],
  getInvolved: {
    title: { hr: 'Ima mjesta za svakoga', en: "There's a place for everyone" },
    lead: { hr: 'Održi predavanje, ugosti susret ili samo dođi.', en: 'Give a talk, host a meetup, or just show up.' },
    ctas: [
      { label: { hr: 'Održi predavanje', en: 'Give a talk' }, url: '/give-a-talk/', variant: 'primary' },
      { label: { hr: 'Ugosti susret', en: 'Host a meetup' }, url: '/host-a-meetup/', variant: 'outline' },
      { label: { hr: 'Unconference', en: 'Unconference' }, url: '/unconference/', variant: 'outline' },
    ],
  },
};

/** True when `feature` is unset or its flag is on. */
export function isOn(feature?: Feature): boolean {
  return !feature || FEATURES[feature];
}
