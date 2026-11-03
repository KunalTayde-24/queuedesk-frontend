const TIME_ZONE = 'Asia/Singapore';
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((item) => item.type === type)?.value ?? '';
}

export function sgtLocalToDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
    ) - SGT_OFFSET_MS,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function sgtLocalToIso(value: string): string {
  const date = sgtLocalToDate(value);
  if (!date) {
    throw new Error('Enter a valid date and time');
  }
  return date.toISOString();
}

export function isoToSgtInput(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const hour = part(parts, 'hour');
  return `${part(parts, 'year')}-${part(parts, 'month')}-${part(parts, 'day')}T${hour === '24' ? '00' : hour}:${part(parts, 'minute')}`;
}

/** Day number and short month in Singapore time, for the date seal on event cards. */
export function eventDayMonth(iso: string): { day: string; month: string } | null {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return null;
  return {
    day: new Intl.DateTimeFormat('en-IN', { timeZone: TIME_ZONE, day: 'numeric' }).format(date),
    month: new Intl.DateTimeFormat('en-IN', { timeZone: TIME_ZONE, month: 'short' }).format(date),
  };
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}
