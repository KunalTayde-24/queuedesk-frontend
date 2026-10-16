import { EventFormValues, EventSummary } from '@/types/event';
import { kolkataLocalToIso } from './event-time';

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
  form.set('registrationOpensAt', kolkataLocalToIso(values.registrationOpensAt));
  form.set('registrationClosesAt', kolkataLocalToIso(values.registrationClosesAt));
  form.set('startsAt', kolkataLocalToIso(values.startsAt));
  form.set('endsAt', kolkataLocalToIso(values.endsAt));
  if (image) form.set('image', image);
  if (removeImage) form.set('removeImage', 'true');
  return form;
}
