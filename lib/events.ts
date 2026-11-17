import { EventFormValues, EventSummary } from '@/types/event';
import { sgtLocalToIso } from './event-time';

export const MAX_EVENT_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function eventImageSrc(event: Pick<EventSummary, 'id' | 'hasImage'>, scope: 'public' | 'admin') {
  if (!event.hasImage) return null;
  return scope === 'admin' ? `/api/admin/events/${event.id}/image` : `/api/events/${event.id}/image`;
}

export function validateEventImage(file: File): string | null {
  if (!IMAGE_TYPES.has(file.type)) {
    return 'Image must be JPEG, PNG, or WebP';
  }
  if (file.size > MAX_EVENT_IMAGE_BYTES) {
    return 'Image must be 2 MB or smaller';
  }
  return null;
}

export function eventToFormData(values: EventFormValues, image: File | null, removeImage: boolean) {
  const form = new FormData();
  form.set('title', values.title.trim());
  form.set('description', values.description.trim());
  form.set('venue', values.venue.trim());
  form.set('startsAt', sgtLocalToIso(values.startsAt));
  form.set('endsAt', sgtLocalToIso(values.endsAt));
  form.set('needsQueue', values.needsQueue ? 'true' : 'false');
  if (image) form.set('image', image);
  if (removeImage) form.set('removeImage', 'true');
  return form;
}

const SGT = 'Asia/Singapore';

/** "20 Nov, 9:00 am to 12:00 pm" (same day) or "20 Nov, 9:00 am to 21 Nov, 5:00 pm", in Singapore time. */
export function eventRangeLabel(startsAt: string, endsAt: string): string {
  const day = (iso: string) =>
    new Intl.DateTimeFormat('en-SG', { timeZone: SGT, day: 'numeric', month: 'short' }).format(new Date(iso));
  const time = (iso: string) =>
    new Intl.DateTimeFormat('en-SG', { timeZone: SGT, hour: 'numeric', minute: '2-digit', hour12: true })
      .format(new Date(iso))
      .replace(/\s?(am|pm)/i, (_, m: string) => ` ${m.toLowerCase()}`);
  return day(startsAt) === day(endsAt)
    ? `${day(startsAt)}, ${time(startsAt)} to ${time(endsAt)}`
    : `${day(startsAt)}, ${time(startsAt)} to ${day(endsAt)}, ${time(endsAt)}`;
}

/**
 * The published event (other than `selfId`) that runs at any moment between
 * `startsAt` and `endsAt` (ISO strings), or null. Back-to-back events do not overlap.
 */
export function findOverlap(
  startsAt: string,
  endsAt: string,
  events: Pick<EventSummary, 'id' | 'title' | 'status' | 'startsAt' | 'endsAt'>[],
  selfId?: string,
) {
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  if (Number.isNaN(start) || Number.isNaN(end) || !(start < end)) return null;
  return (
    events.find(
      (other) =>
        other.status === 'PUBLISHED' &&
        other.id !== selfId &&
        Date.parse(other.startsAt) < end &&
        Date.parse(other.endsAt) > start,
    ) ?? null
  );
}

/** Upcoming and ongoing events first (soonest start first), then past events (most recent first). */
export function sortEventsByDate<T extends Pick<EventSummary, 'startsAt' | 'endsAt'>>(events: T[], now = Date.now()): T[] {
  const start = (e: T) => Date.parse(e.startsAt);
  const upcoming = events.filter((e) => Date.parse(e.endsAt) >= now).sort((a, b) => start(a) - start(b));
  const past = events.filter((e) => Date.parse(e.endsAt) < now).sort((a, b) => start(b) - start(a));
  return [...upcoming, ...past];
}
