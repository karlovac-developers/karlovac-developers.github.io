import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseIcs, toEntry, slugify, summary, meetupId } from '../src/lib/meetup.ts';

/* Meetup's feed as fetched on 2026-11-05: one upcoming event. */
const ics = readFileSync(new URL('./fixtures/meetup.ics', import.meta.url), 'utf8');

test('parses the Meetup feed', () => {
  const [e, ...rest] = parseIcs(ics);
  assert.equal(rest.length, 0);
  assert.equal(e.meetupId, '317238274');
  assert.equal(e.url, 'https://www.meetup.com/karlovac-developers-meetup/events/317238274/');
  assert.equal(e.title, 'AImo pričat o AI; Novosti, projekti i ideje');
  assert.equal(e.date, '2026-11-13');
  assert.equal(e.start, '18:00');
  assert.equal(e.end, '21:00');
});

test('unfolds and unescapes the description, without the group name line', () => {
  const [e] = parseIcs(ics);
  assert.ok(e.description.startsWith('AI se mijenja iz dana u dan — novi modeli, harnessi i alati,'));
  assert.ok(e.description.includes('\n\nNa sljedećem meetupu'));
  assert.ok(e.description.endsWith('Vidimo se!'));
});

test('builds an events entry with a date-and-title id', () => {
  const entry = toEntry(parseIcs(ics)[0]);
  assert.equal(entry.id, '2026-11-13-aimo-pricat-o-ai-novosti-projekti');
  assert.equal(entry.data.date, '2026-11-13');
  assert.equal(entry.data.time, '18:00–21:00');
  assert.equal(entry.data.meetupUrl, entry.data.rsvp);
  assert.equal(entry.data.lang, 'hr');
});

test('skips events without a Meetup URL or start', () => {
  const text = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:No URL\r\nDTSTART:20261113T180000\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
  assert.deepEqual(parseIcs(text), []);
});

test('slugify drops Croatian diacritics', () => {
  assert.equal(slugify('AI alati za vođenje Grada Karlovca'), 'ai-alati-za-vodenje-grada-karlovca');
  assert.equal(slugify('Roštilj i kupanje na Korani'), 'rostilj-i-kupanje-na-korani');
  assert.equal(slugify('Prostor(i)Ja'), 'prostor-i-ja');
});

test('summary is the first paragraph as plain text, cut on a word', () => {
  assert.equal(summary('**Bold** and [a link](https://x.y).\n\nSecond.'), 'Bold and a link.');
  const cut = summary('word '.repeat(60), 20);
  assert.ok(cut.length <= 20 && cut.endsWith('…'));
});

test('meetupId reads the id from an event URL', () => {
  assert.equal(meetupId('https://www.meetup.com/g/events/312830974/'), '312830974');
  assert.equal(meetupId(undefined), undefined);
});
