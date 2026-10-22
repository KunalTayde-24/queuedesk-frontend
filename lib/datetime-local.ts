// Helpers for the "YYYY-MM-DDTHH:mm" strings the event form stores (the same
// format a browser datetime-local field uses, in Indian time). No imports, so
// these stay trivial to test.

export interface LocalParts {
  /** "YYYY-MM-DD" */
  date: string;
  /** 0-23 */
  hour: number;
  /** 0-59 */
  minute: number;
}

export type Period = 'AM' | 'PM';

export function parseLocal(value: string): LocalParts | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(value ?? '');
  if (!m) return null;
  const hour = Number(m[2]);
  const minute = Number(m[3]);
  if (hour > 23 || minute > 59) return null;
  return { date: m[1] as string, hour, minute };
}

export function buildLocal(date: string, hour: number, minute: number): string {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${date}T${hh}:${mm}`;
}

/** 0 -> 12 AM, 12 -> 12 PM, 15 -> 3 PM */
export function to12h(hour24: number): { hour12: number; period: Period } {
  return { hour12: hour24 % 12 === 0 ? 12 : hour24 % 12, period: hour24 >= 12 ? 'PM' : 'AM' };
}

export function to24h(hour12: number, period: Period): number {
  const base = hour12 % 12;
  return period === 'PM' ? base + 12 : base;
}

/** "6:30 PM" */
export function formatTime12(hour24: number, minute: number): string {
  const { hour12, period } = to12h(hour24);
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

/** True when `value` is a real calendar date and clock time (no 31 Feb, no 25:00). */
export function isRealLocal(value: string): boolean {
  const p = parseLocal(value);
  if (!p) return false;
  const [y, m, d] = p.date.split('-').map(Number) as [number, number, number];
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** The current moment in Indian time as "YYYY-MM-DDTHH:mm". */
export function nowLocalIst(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
}

/** The same date and time `years` later (used only to compare against a limit). */
export function addYearsLocal(value: string, years: number): string {
  const p = parseLocal(value);
  if (!p) return value;
  return `${String(Number(p.date.slice(0, 4)) + years).padStart(4, '0')}${value.slice(4)}`;
}
