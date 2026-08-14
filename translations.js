const translations = {
  en: {
    /* ── Home: hero ───────────────────────────── */
    'hero.tagline':      "Karlovac's developer meetup group",
    'hero.cta.join':     '🎉 Join the Meetup',
    'hero.cta.next':     '📅 Next Event',

    /* ── Home: intro ──────────────────────────── */
    'intro.title':       "What's Karlovac Developers?",
    'intro.p1':          'Karlovac Developers is a casual, community-run meetup group for developers and tech enthusiasts in Karlovac.',
    'intro.p2':          "Whether you're a seasoned engineer, a curious beginner, or just here to hang out and for the good vibes — you're welcome here. We meet up, share ideas, hack on stuff, and learn together.",

    /* ── Home: cards ──────────────────────────── */
    'join.title':        'Join Us',
    'join.p1':           "We meet regularly to chat, share knowledge, and enjoy each other's company. Drop by our next Meetup to see what it's all about!",
    'join.p2':           "You don't need to give a talk — just come hang out, grab a coffee, and meet fellow developers.",
    'join.p3':           'Got something to share? Awesome — <a href="give-a-talk/" class="inline-link">sign up to speak</a>',

    'host.title':        'Host a Meetup',
    'host.p1':           'Want to host a Karlovac Developers meetup at your space?',
    'host.p2':           "We're always looking for friendly venues, and hosting is a great way to support the local dev community.",
    'host.p3':           "If you've got a space and want to get involved, sign up to host here.",
    'host.cta':          'Sign up to host →',

    'next.title':        'Our next Meetup',
    'next.date':         'May 16, 2026',
    'next.excerpt':      'A full-day outdoor gathering on the banks of the Korana river — knowledge sharing, a bonfire, and swimming. Open to all local tech professionals and enthusiasts...',

    'past.title':        'Past Meetups',
    'past.date':         'February 28, 2026',
    'past.all':          'Show all past Meetups →',

    'read.more':         'Read more →',

    /* ── Job wall ─────────────────────────────── */
    'jobs.title':        'Jobs',
    'jobs.subtitle':     'Looking for someone — I know someone',
    'jobs.all':          'See all postings →',
    'jobs.post':         'Post an opening →',
    'jobs.empty':        'No open postings right now — be the first.',
    'jobs.page.sub':     'Roles going around the community, and people open to work. Every posting is vouched for by someone who knows the work.',
    'jobs.filter.all':      'All',
    'jobs.filter.hiring':   'Looking for someone',
    'jobs.filter.available': 'I know someone',
    'jobs.kind.hiring':     'Looking for someone',
    'jobs.kind.available':  'I know someone',
    'jobs.vouched':      'Vouched by',
    'jobs.apply':        'Apply →',
    'jobs.contact':      'Get in touch →',
    'jobs.count.one':    '1 open posting',
    'jobs.count.many':   '{n} open postings',
    'jobs.type.full-time':  'Full-time',
    'jobs.type.part-time':  'Part-time',
    'jobs.type.contract':   'Contract',
    'jobs.type.internship': 'Internship',
    'jobs.type.student':    'Student',
    'jobs.how.title':    'How it works',
    'jobs.how.p':        'Anyone can submit — a company hiring, or a developer open to work. Submissions go through a short form and a maintainer publishes the ones that fit. Postings drop off automatically after 60 days, so nothing here is stale.',
    'jobs.rules.li1':    'Every posting names the community member vouching for it',
    'jobs.rules.li2':    'Real roles from real people — no recruiter listing farms',
    'jobs.rules.li3':    'Karlovac, Zagreb, and remote all welcome',
    'jobs.rules.li4':    'Postings expire after 60 days; resubmit if the role is still open',

    /* ── Footer ───────────────────────────────── */
    'footer.line1':      'Karlovac Developers ❤️ Karlovac',
    'footer.line2':      'Built by developers, for developers.',

    /* ── Page: give a talk ────────────────────── */
    'page.back':         '← Back to home',

    'talk.title':        'Give a talk',
    'talk.sub':          "Got something to share? We'd love to hear it — no matter how big or small.",
    'talk.why.title':    'Why speak?',
    'talk.why.p':        'Our meetups run on people sharing what they know. You do not need to be an expert or a polished presenter — you just need something you find interesting. Chances are somebody in the room has been wondering about exactly that.',
    'talk.what.title':   'What can I talk about?',
    'talk.what.li1':     'A tool or library you use every day',
    'talk.what.li2':     'A side project you built, however small',
    'talk.what.li3':     'A lesson learned the hard way in production',
    'talk.what.li4':     'AI, web, cloud, mobile, .NET, DevOps, open source, embedded, networking — all fair game',
    'talk.what.li5':     'A live demo of something you think is cool',
    'talk.format.title': 'Formats',
    'talk.format.li1':   'Lightning talk — 5 to 10 minutes, slides optional',
    'talk.format.li2':   'Full talk — 20 to 30 minutes plus questions',
    'talk.format.li3':   'Workshop — 45 to 90 minutes, hands-on',
    'talk.format.li4':   'Show and tell — informal, just open your laptop',
    'talk.first.title':  'First time presenting?',
    'talk.first.p':      "Perfect — we are a friendly, low-pressure crowd, and plenty of our speakers started right here. Tell us what you have in mind and we will help you shape it, review your slides, or run a rehearsal beforehand.",
    'talk.cta.p':        'Ready when you are. Send us a message with your topic and roughly how long you need, and we will find a slot at one of the upcoming meetups.',
    'talk.cta.btn':      'Pitch your talk on Meetup →',

    /* ── Page: host a meetup ──────────────────── */
    'hostpage.title':      'Host a meetup',
    'hostpage.sub':        'Have a space? Help the local dev community grow.',
    'hostpage.why.title':  'Why host?',
    'hostpage.why.p':      'Hosting is the simplest way to support the local tech scene, and it puts your team in front of the people building things in Karlovac. It costs you an evening and a room.',
    'hostpage.need.title': 'What we need from you',
    'hostpage.need.li1':   'Room for roughly 15 to 30 people, with somewhere to sit',
    'hostpage.need.li2':   'A screen or projector',
    'hostpage.need.li3':   'Wi-Fi for the speakers',
    'hostpage.need.li4':   'A weekday evening, usually from 18:00',
    'hostpage.need.li5':   'Ideally somewhere nearby to grab a drink afterwards',
    'hostpage.give.title': 'What we bring',
    'hostpage.give.li1':   'The speakers and the programme for the evening',
    'hostpage.give.li2':   'Promotion through Meetup and our community chat',
    'hostpage.give.li3':   'The crowd — our meetups usually draw a dozen or more people',
    'hostpage.give.li4':   'A room left exactly as we found it',
    'hostpage.how.title':  'How it works',
    'hostpage.how.li1':    'Get in touch and tell us about your space',
    'hostpage.how.li2':    'We agree on a date that suits you',
    'hostpage.how.li3':    'We announce the meetup and line up the talks',
    'hostpage.how.li4':    'You open the door, we handle the rest',
    'hostpage.cta.p':      'Got a space in mind? Message us with the location, roughly how many people fit, and which dates work for you.',
    'hostpage.cta.btn':    'Offer your space on Meetup →',
  },

  hr: {
    /* ── Naslovnica: hero ─────────────────────── */
    'hero.tagline':      'Karlovački meetup za programere',
    'hero.cta.join':     '🎉 Pridruži se Meetupu',
    'hero.cta.next':     '📅 Sljedeći događaj',

    /* ── Naslovnica: uvod ─────────────────────── */
    'intro.title':       'Što je Karlovac Developers?',
    'intro.p1':          'Karlovac Developers je opušten meetup koji vodi zajednica programera i tech entuzijasta u Karlovcu.',
    'intro.p2':          'Bilo da si iskusan inženjer, radoznali početnik ili si tu samo zbog dobre atmosfere — dobrodošao si. Družimo se, dijelimo ideje, radimo na projektima i učimo zajedno.',

    /* ── Naslovnica: kartice ──────────────────── */
    'join.title':        'Pridruži nam se',
    'join.p1':           'Redovito se okupljamo kako bismo popričali, podijelili znanje i uživali u društvu. Svrati na sljedeći Meetup i vidi o čemu se radi!',
    'join.p2':           'Ne moraš držati predavanje — samo dođi, uzmi kavu i upoznaj druge programere.',
    'join.p3':           'Imaš nešto za podijeliti? Odlično — <a href="give-a-talk/" class="inline-link">prijavi se za predavanje</a>',

    'host.title':        'Ugosti meetup',
    'host.p1':           'Želiš ugostiti Karlovac Developers meetup u svom prostoru?',
    'host.p2':           'Uvijek tražimo prostore s dobrom ekipom, a ugošćivanje je odličan način da podržiš lokalnu dev zajednicu.',
    'host.p3':           'Ako imaš prostor i želiš se uključiti, prijavi ga ovdje.',
    'host.cta':          'Prijavi prostor →',

    'next.title':        'Naš sljedeći Meetup',
    'next.date':         '16. svibnja 2026.',
    'next.excerpt':      'Cjelodnevno okupljanje na obali Korane — dijeljenje znanja, logorska vatra i kupanje. Otvoreno za sve lokalne tech stručnjake i entuzijaste...',

    'past.title':        'Prošli Meetupovi',
    'past.date':         '28. veljače 2026.',
    'past.all':          'Pogledaj sve prošle Meetupove →',

    'read.more':         'Pročitaj više →',

    /* ── Zid poslova ──────────────────────────── */
    'jobs.title':        'Poslovi',
    'jobs.subtitle':     'Tražim nekoga — Znam nekoga',
    'jobs.all':          'Pogledaj sve oglase →',
    'jobs.post':         'Objavi oglas →',
    'jobs.empty':        'Trenutno nema otvorenih oglasa — budi prvi.',
    'jobs.page.sub':     'Pozicije koje kruže zajednicom i ljudi otvoreni za nove prilike. Iza svakog oglasa stoji netko tko poznaje posao.',
    'jobs.filter.all':      'Sve',
    'jobs.filter.hiring':   'Tražim nekoga',
    'jobs.filter.available': 'Znam nekoga',
    'jobs.kind.hiring':     'Tražim nekoga',
    'jobs.kind.available':  'Znam nekoga',
    'jobs.vouched':      'Preporučuje',
    'jobs.apply':        'Prijavi se →',
    'jobs.contact':      'Javi se →',
    'jobs.count.one':    '1 otvoreni oglas',
    'jobs.count.many':   'Otvorenih oglasa: {n}',
    'jobs.type.full-time':  'Puno radno vrijeme',
    'jobs.type.part-time':  'Nepuno radno vrijeme',
    'jobs.type.contract':   'Ugovor',
    'jobs.type.internship': 'Praksa',
    'jobs.type.student':    'Studentski',
    'jobs.how.title':    'Kako to ide',
    'jobs.how.p':        'Oglas može poslati svatko — tvrtka koja zapošljava ili programer otvoren za nove prilike. Prijave idu kroz kratki obrazac, a održavatelj objavljuje one koje odgovaraju. Oglasi se automatski skidaju nakon 60 dana pa ovdje nema zastarjelih.',
    'jobs.rules.li1':    'Uz svaki oglas stoji ime člana zajednice koji ga preporučuje',
    'jobs.rules.li2':    'Stvarne pozicije od stvarnih ljudi — bez agencijskog spama',
    'jobs.rules.li3':    'Karlovac, Zagreb i remote — sve je dobrodošlo',
    'jobs.rules.li4':    'Oglasi istječu nakon 60 dana; pošalji ponovno ako je pozicija još otvorena',

    /* ── Podnožje ─────────────────────────────── */
    'footer.line1':      'Karlovac Developers ❤️ Karlovac',
    'footer.line2':      'Radili programeri, za programere.',

    /* ── Stranica: predavanje ─────────────────── */
    'page.back':         '← Natrag na naslovnicu',

    'talk.title':        'Drži predavanje',
    'talk.sub':          'Imaš nešto za podijeliti? Rado bismo čuli — bez obzira koliko velika ili mala tema bila.',
    'talk.why.title':    'Zašto predavati?',
    'talk.why.p':        'Naši meetupovi žive od ljudi koji dijele ono što znaju. Ne moraš biti stručnjak ni uglađen govornik — dovoljno je da imaš temu koja te zanima. Velika je šansa da se netko u publici pitao upravo isto.',
    'talk.what.title':   'O čemu mogu pričati?',
    'talk.what.li1':     'Alat ili biblioteka koju koristiš svaki dan',
    'talk.what.li2':     'Projekt iz slobodnog vremena, koliko god malen bio',
    'talk.what.li3':     'Lekcija naučena na teži način u produkciji',
    'talk.what.li4':     'AI, web, cloud, mobilni razvoj, .NET, DevOps, open source, embedded, umrežavanje — sve prolazi',
    'talk.what.li5':     'Demo uživo nečega što ti je zanimljivo',
    'talk.format.title': 'Formati',
    'talk.format.li1':   'Lightning talk — 5 do 10 minuta, slajdovi nisu obavezni',
    'talk.format.li2':   'Puno predavanje — 20 do 30 minuta plus pitanja',
    'talk.format.li3':   'Radionica — 45 do 90 minuta, praktično',
    'talk.format.li4':   'Show and tell — neformalno, samo otvori laptop',
    'talk.first.title':  'Prvi put pred publikom?',
    'talk.first.p':      'Savršeno — ekipa je opuštena i bez pritiska, a dobar dio naših govornika počeo je upravo ovdje. Javi nam što imaš na umu pa ćemo ti pomoći oblikovati temu, pregledati slajdove ili odraditi probu unaprijed.',
    'talk.cta.p':        'Spremni smo kad i ti. Pošalji nam poruku s temom i okvirnim trajanjem pa ćemo naći termin na nekom od sljedećih meetupova.',
    'talk.cta.btn':      'Predloži temu na Meetupu →',

    /* ── Stranica: ugosti meetup ──────────────── */
    'hostpage.title':      'Ugosti meetup',
    'hostpage.sub':        'Imaš prostor? Pomozi lokalnoj dev zajednici da raste.',
    'hostpage.why.title':  'Zašto ugostiti?',
    'hostpage.why.p':      'Ugošćivanje je najjednostavniji način da podržiš lokalnu tech scenu, a tvoj tim stavlja pred ljude koji u Karlovcu grade stvari. Košta te jednu večer i jednu prostoriju.',
    'hostpage.need.title': 'Što nam treba od tebe',
    'hostpage.need.li1':   'Prostor za otprilike 15 do 30 ljudi, s mjestom za sjedenje',
    'hostpage.need.li2':   'Ekran ili projektor',
    'hostpage.need.li3':   'Wi-Fi za govornike',
    'hostpage.need.li4':   'Večer radnim danom, obično od 18:00',
    'hostpage.need.li5':   'Idealno nešto u blizini gdje se može popiti piće poslije',
    'hostpage.give.title': 'Što mi donosimo',
    'hostpage.give.li1':   'Govornike i program za tu večer',
    'hostpage.give.li2':   'Promociju kroz Meetup i chat zajednice',
    'hostpage.give.li3':   'Publiku — na našim meetupovima obično je desetak ili više ljudi',
    'hostpage.give.li4':   'Prostor ostavljen točno onakav kakav smo ga zatekli',
    'hostpage.how.title':  'Kako to ide',
    'hostpage.how.li1':    'Javi nam se i opiši svoj prostor',
    'hostpage.how.li2':    'Dogovorimo datum koji tebi odgovara',
    'hostpage.how.li3':    'Najavimo meetup i posložimo predavanja',
    'hostpage.how.li4':    'Ti otvoriš vrata, mi rješavamo ostalo',
    'hostpage.cta.p':      'Imaš prostor na umu? Pošalji nam poruku s lokacijom, okvirnim brojem ljudi i datumima koji ti odgovaraju.',
    'hostpage.cta.btn':    'Ponudi prostor na Meetupu →',
  },
};

// ── i18n engine ────────────────────────────────────────────────

const STORAGE_KEY = 'kd-lang';

// Subpages live one directory down, so relative links inside translated
// HTML need a prefix. <body data-root="../"> sets it.
function rootPrefix() {
  return document.body.getAttribute('data-root') || '';
}

function applyLang(lang) {
  const t = translations[lang];
  const root = rootPrefix();

  // Text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // HTML nodes (e.g. a paragraph with an inline link)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) {
      el.innerHTML = t[key].replace(/href="(?!https?:|#|\/)/g, 'href="' + root);
    }
  });

  // Toggle button label shows the other language
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'en' ? 'HR' : 'EN';

  document.documentElement.lang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* file:// origins */ }

  // Content rendered by other scripts (job wall) re-translates itself here.
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

function storedLang() {
  try { return localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) { return 'en'; }
}

function toggleLang() {
  applyLang(storedLang() === 'en' ? 'hr' : 'en');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  applyLang(storedLang());
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.addEventListener('click', toggleLang);
});
