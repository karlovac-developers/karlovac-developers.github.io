/** Event dates in Karlovac time.
 *
 *  A date-only front matter value is read as midnight UTC, and the theme's
 *  `date >= now` test would move an event to "past" at the 03:00 UTC build on
 *  its own day. An event is upcoming until the end of its day in Zagreb.
 *
 *  Loaded by Node for tests: no imports. */

const zagrebDayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Zagreb',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** The calendar day of `date` in Europe/Zagreb, as YYYY-MM-DD. */
export function zagrebDay(date: Date): string {
  return zagrebDayFormat.format(date);
}

export function isUpcoming(date: Date, now: Date): boolean {
  return zagrebDay(date) >= zagrebDay(now);
}
