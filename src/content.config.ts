import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { withMeetupEvents } from './lib/meetup-loader.ts';
import { MEETUP_ICAL_URL } from './config.ts';

/** Front-matter schemas (adapted from the Popular theme, see THEME.md).
 *  Submitted collections gain `lang` (the language the entry is written in)
 *  and `mock` (placeholder content, labelled on the page and listed by
 *  `npm run mocks`). Pages and docs are split into hr/ and en/ folders. */
const lang = z.enum(['hr', 'en']).default('hr');
const mock = z.boolean().default(false);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    lang,
    mock,
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false), // drafts are excluded from builds, matching Hugo
    author: z.string().optional(), // simple byline fallback
    authors: z.array(z.string()).default([]), // slugs of entries in the authors collection
    guestAuthors: z
      .array(
        z.object({
          name: z.string(),
          title: z.string().optional(),
          photo: z.string().optional(),
          bio: z.string().optional(),
          website: z.string().optional(),
          social: z.array(z.object({ label: z.string(), icon: z.string(), url: z.string() })).default([]),
        })
      )
      .default([]),
    description: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    speaker: z
      .object({
        name: z.string(),
        title: z.string().optional(),
        photo: z.string().optional(),
        bio: z.string().optional(),
      })
      .optional(),
  }),
});

/* Event files plus Meetup's upcoming events (see src/lib/meetup-loader.ts). */
const events = defineCollection({
  loader: withMeetupEvents(glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }), MEETUP_ICAL_URL),
  schema: z.object({
    lang,
    mock,
    title: z.string(),
    date: z.coerce.date(), // the event's start time; upcoming vs past is decided by this
    draft: z.boolean().default(false), // drafts are excluded from builds, matching Hugo
    description: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    time: z.string().optional(),
    venue: z.string().optional(),
    venueWanted: z.boolean().default(false),
    planning: z.boolean().default(false), // "Planning" badge instead of "Confirmed", and no RSVP button
    address: z.string().optional(),
    speaker: z.string().optional(), // one-liner fallback when no speaker profiles are referenced
    speakers: z.array(z.string()).default([]), // slugs of entries in the speakers collection
    venueRef: z.string().optional(), // slug of a venues-collection entry; wins over the flat venue fields
    checkin: z.string().optional(), // e.g. "Bring your registration email (print or phone) and photo ID."
    venueNotes: z.string().optional(), // e.g. "Buzz 204 at the side door."; overrides the venue page's notes
    rsvp: z.string().optional(),
    meetupUrl: z.string().optional(), // the Meetup event page; also how a file is matched to a synced event
    cancelled: z.boolean().default(false), // EventCancelled JSON-LD + visible badge
    online: z.boolean().default(false), // OnlineEventAttendanceMode + VirtualLocation
    price: z.union([z.number(), z.string()]).optional(), // machine price for Offer
    currency: z.string().optional(), // ISO currency for price
    cost: z.string().optional(), // free-text displayed cost (e.g. "15 CAD")
    // §3 talk archive (all optional). Simple case: event-level recording/slides
    // (single-talk meetups). Multi-talk case: a talks[] array, which wins over
    // the event-level recording/slides when present.
    recording: z.string().optional(),
    slides: z.string().optional(),
    talks: z.array(z.object({
      title: z.string(),
      speaker: z.string().optional(), // speaker-collection slug, same resolution as `speakers`
      recording: z.string().optional(),
      slides: z.string().optional(),
    })).optional(),
  }),
});

const organizers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/organizers' }),
  schema: z.object({
    lang,
    mock,
    title: z.string(),
    weight: z.number().default(100),
    role: z.string().optional(),
    photo: z.string().optional(),
    description: z.string().optional(),
    social: z
      .array(z.object({ label: z.string(), icon: z.string(), url: z.string() }))
      .default([]),
  }),
});

/** Author profiles: referenced from blog posts via `authors: [slug]`. */
const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    lang,
    mock,
    title: z.string(), // the author's name
    role: z.string().optional(),
    photo: z.string().optional(),
    bio: z.string().optional(),
    website: z.string().optional(),
    social: z.array(z.object({ label: z.string(), icon: z.string(), url: z.string() })).default([]),
  }),
});

/** Speaker profiles: referenced from events via `speakers: [slug]`. */
const speakers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/speakers' }),
  schema: z.object({
    lang,
    mock,
    title: z.string(), // the speaker's name
    role: z.string().optional(),
    photo: z.string().optional(),
    bio: z.string().optional(),
    website: z.string().optional(),
    social: z.array(z.object({ label: z.string(), icon: z.string(), url: z.string() })).default([]),
  }),
});

/** Venue pages: referenced from events via `venueRef: slug`. */
const venues = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/venues' }),
  schema: z.object({
    lang,
    mock,
    title: z.string(), // the venue's name
    address: z.string().optional(),
    photo: z.string().optional(),
    notes: z.string().optional(), // arrival notes inherited by events held here
    accessibility: z.string().optional(),
    wheelchair: z.boolean().default(false), // step-free access badge
    transit: z.string().optional(),
    parking: z.string().optional(),
    access: z.string().optional(), // freeform markdown: washrooms, quiet space, childcare, scent policy
    website: z.string().optional(),
  }),
});

/** Long-form docs (handbook, runbooks), MDX with Callout/Checklist components. */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    mock,
    title: z.string(),
    eyebrow: z.string().optional(),
    lead: z.string().optional(),
    weight: z.number().default(100), // sidebar order, matching Hugo's weight
  }),
});

/** Simple prose pages (about, code of conduct, get involved). */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    mock,
    title: z.string(),
    eyebrow: z.string().optional(),
    lead: z.string().optional(),
    // Short label used by a child page's back link (Hugo parity: shortTitle).
    shortTitle: z.string().optional(),
  }),
});

/** Job wall postings: one JSON array, validated at build time. */
const jobs = defineCollection({
  loader: file('src/data/jobs.json'),
  schema: z.object({
    id: z.string(),
    posted: z.coerce.date(),
    kind: z.enum(['hiring', 'available']),
    role: z.string(),
    company: z.string().optional(), // omitted for kind: 'available'
    location: z.string(),
    type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'student']),
    description: z.string(),
    vouchedBy: z.string(),
    link: z.string().regex(/^(https:\/\/|mailto:)/, 'link must start with https:// or mailto:'),
    lang,
    mock,
  }),
});

/** Home hero photos. `file` names an image in src/assets/hero/. */
const heroPhotos = defineCollection({
  loader: file('src/data/hero-photos.json'),
  schema: z.object({
    id: z.string(),
    file: z.string(),
    alt: z.object({ hr: z.string().min(1), en: z.string().min(1) }),
    source: z.url(),
    licence: z.string(),
    mock,
  }),
});

export const collections = { blog, events, organizers, authors, speakers, venues, docs, pages, jobs, heroPhotos };
