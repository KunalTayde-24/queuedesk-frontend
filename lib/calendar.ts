import { EventSummary } from '@/types/event';

type CalendarEvent = Pick<EventSummary, 'id' | 'title' | 'description' | 'venue' | 'startsAt' | 'endsAt'>;

/** 2026-10-22T14:35:52.000Z -> 20261022T143552Z (the format calendars expect, in UTC). */
function stamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
}

function icsEscape(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

/** RFC 5545 asks for lines to be folded at 75 octets. */
function fold(line: string) {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  parts.push(rest);
  return parts.join('\r\n');
}

export function googleCalendarUrl(event: CalendarEvent, pageUrl: string) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stamp(event.startsAt)}/${stamp(event.endsAt)}`,
    details: `${event.description}\n\nDetails and registration: ${pageUrl}`,
    location: event.venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcs(event: CalendarEvent, pageUrl: string) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QueueDesk//Temple Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@queuedesk`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(event.startsAt)}`,
    `DTEND:${stamp(event.endsAt)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(`${event.description}\n\nDetails and registration: ${pageUrl}`)}`,
    `LOCATION:${icsEscape(event.venue)}`,
    `URL:${pageUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/** Downloads an .ics file, which opens in Apple Calendar, Outlook and most other calendar apps. */
export function downloadIcs(event: CalendarEvent, pageUrl: string) {
  const blob = new Blob([buildIcs(event, pageUrl)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event';
  link.href = url;
  link.download = `${slug}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mapsSearchUrl(venue: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

export function mapsDirectionsUrl(venue: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue)}`;
}

export function mapsEmbedUrl(venue: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(venue)}&output=embed`;
}
