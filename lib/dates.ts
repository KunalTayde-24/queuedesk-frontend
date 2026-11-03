// Queue dates are plain "YYYY-MM-DD" keys in Singapore time, the same as the backend.
// Working with keys (never local Date objects) keeps a date from shifting with
// the visitor's or the server's timezone.
const QUEUE_TIME_ZONE = 'Asia/Singapore';

/** Today's date in Singapore, e.g. "2026-10-17". */
export function todayKey(now: Date = new Date()): string {
  // The en-CA locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: QUEUE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function fromKey(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

function toKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysToKey(key: string, days: number): string {
  const date = fromKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return toKey(date);
}

export function addMonthsToKey(key: string, months: number): string {
  const date = fromKey(key);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  return toKey(date);
}

/** "Sat, 24 Oct 2026" */
export function formatDateKey(key: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fromKey(key));
}

/** "24 Oct" */
export function formatShortDateKey(key: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
  }).format(fromKey(key));
}

/** "October 2026" */
export function formatMonthKey(key: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(fromKey(key));
}

/** "Today", "Tomorrow", or empty. */
export function relativeDayLabel(key: string, today: string = todayKey()): string {
  if (key === today) return 'Today';
  if (key === addDaysToKey(today, 1)) return 'Tomorrow';
  return '';
}

/** Cells for a month grid: leading blanks (Sunday first), then every day key. */
export function monthGrid(monthKey: string): (string | null)[] {
  const first = fromKey(monthKey);
  first.setUTCDate(1);
  const blanks = first.getUTCDay();
  const daysInMonth = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: blanks }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), d));
    cells.push(toKey(date));
  }
  return cells;
}

/**
 * The queue days an event covers, from its start/end as "YYYY-MM-DDTHH:mm" (Singapore time):
 * every day from the start day to the end day (an end at exactly 00:00 does not claim that day).
 * Capped at 14 days, the same as the server.
 */
export function eventDaysFromLocal(startsAt: string, endsAt: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startsAt) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(endsAt)) return [];
  const first = startsAt.slice(0, 10);
  let last = endsAt.slice(0, 10);
  if (endsAt.slice(11, 16) === '00:00') last = addDaysToKey(last, -1);
  const days: string[] = [];
  for (let key = first; key <= last && days.length < 14; key = addDaysToKey(key, 1)) days.push(key);
  return days;
}
