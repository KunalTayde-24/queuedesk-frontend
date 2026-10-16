'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { eventImageSrc, eventToFormData, validateEventImage } from '@/lib/events';
import { isoToKolkataInput, kolkataLocalToIso } from '@/lib/event-time';
import { validateEventForm } from '@/lib/validators';
import { EventFormValues, EventSummary, RegistrationState } from '@/types/event';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useToast } from '@/components/ui/Toast';
import { EventCard } from './EventCard';

const EMPTY: EventFormValues = {
  title: '',
  description: '',
  venue: '',
  registrationOpensAt: '',
  registrationClosesAt: '',
  startsAt: '',
  endsAt: '',
};

// Form field -> input id, in the order they appear on the page (used to jump to the first error).
const FIELD_IDS = {
  title: 'event-title',
  description: 'event-description',
  venue: 'event-venue',
  registrationOpensAt: 'registration-opens',
  registrationClosesAt: 'registration-closes',
  startsAt: 'event-starts',
  endsAt: 'event-ends',
  schedule: 'registration-opens',
} as const;

function fromEvent(event: EventSummary): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    venue: event.venue,
    registrationOpensAt: isoToKolkataInput(event.registrationOpensAt),
    registrationClosesAt: isoToKolkataInput(event.registrationClosesAt),
    startsAt: isoToKolkataInput(event.startsAt),
    endsAt: isoToKolkataInput(event.endsAt),
  };
}

function safeIso(value: string) {
  try {
    return value ? kolkataLocalToIso(value) : '';
  } catch {
    return '';
  }
}

function previewState(opens: string, closes: string): RegistrationState {
  const openAt = Date.parse(opens);
  const closeAt = Date.parse(closes);
  const now = Date.now();
  if (!opens || !closes || Number.isNaN(openAt) || Number.isNaN(closeAt)) return 'OPENS_SOON';
  if (now < openAt) return 'OPENS_SOON';
  if (now <= closeAt) return 'OPEN';
  return 'CLOSED';
}

export function EventForm({ event }: { event?: EventSummary }) {
  const router = useRouter();
  const { show } = useToast();
  const [values, setValues] = useState<EventFormValues>(event ? fromEvent(event) : EMPTY);
  const [errors, setErrors] = useState(validateEventForm(EMPTY));
  const [showErrors, setShowErrors] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [pending, setPending] = useState<'save' | 'publish' | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const savedImage = event && !removeImage ? eventImageSrc(event, 'admin') : null;
  const previewImage = localPreview ?? savedImage;

  const preview = useMemo<EventSummary>(
    () => ({
      id: event?.id ?? 'preview',
      title: values.title,
      description: values.description,
      venue: values.venue,
      hasImage: Boolean(previewImage),
      imageUrl: null,
      registrationOpensAt: safeIso(values.registrationOpensAt),
      registrationClosesAt: safeIso(values.registrationClosesAt),
      startsAt: safeIso(values.startsAt),
      endsAt: safeIso(values.endsAt),
      status: event?.status ?? 'DRAFT',
      registrationState: previewState(safeIso(values.registrationOpensAt), safeIso(values.registrationClosesAt)),
      canRegister: false,
      registrationCount: event?.registrationCount ?? 0,
      createdAt: event?.createdAt ?? new Date().toISOString(),
      updatedAt: event?.updatedAt ?? new Date().toISOString(),
    }),
    [event, previewImage, values],
  );

  function update<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function persist(publish: boolean) {
    const nextErrors = validateEventForm(values);
    setErrors(nextErrors);
    setShowErrors(true);
    if (Object.keys(nextErrors).length > 0 || imageError) {
      // Without this the button looks dead: the messages sit up the page, out of view.
      show(nextErrors.schedule ?? 'Please fix the highlighted fields before saving', 'error');
      const firstKey = (Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[]).find((key) => nextErrors[key]);
      const target = firstKey ? document.getElementById(FIELD_IDS[firstKey]) : document.getElementById('event-image');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (target instanceof HTMLElement && firstKey) target.focus({ preventScroll: true });
      return;
    }

    setPending(publish ? 'publish' : 'save');
    try {
      const saved = await apiClient.saveEvent(event?.id ?? null, eventToFormData(values, image, removeImage));
      if (!publish) {
        show('Event saved');
        router.push(`/admin/dashboard/events/${saved.id}`);
        router.refresh();
        return;
      }
      try {
        await apiClient.publishEvent(saved.id);
        show('Event published');
      } catch (err) {
        show(err instanceof Error ? err.message : 'The event was saved, but it could not be published', 'error');
      }
      router.push(`/admin/dashboard/events/${saved.id}`);
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : 'The event could not be saved', 'error');
    } finally {
      setPending(null);
    }
  }

  function onSubmit(formEvent: FormEvent) {
    formEvent.preventDefault();
    void persist(false);
  }

  const visible = showErrors ? errors : {};

  return (
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <form onSubmit={onSubmit} className="grid min-w-0 gap-4" noValidate>
        <div>
          <h1 className="break-words font-serif text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">
            {event ? 'Edit event' : 'New event'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Drafts stay hidden. Publish the event when guests should be able to register.
          </p>
        </div>

        <Input id="event-title" label="Title *" value={values.title} onChange={(item) => update('title', item.target.value)} error={visible.title} maxLength={120} required />
        <TextArea id="event-description" label="Description *" value={values.description} onChange={(item) => update('description', item.target.value)} error={visible.description} maxLength={4000} required />
        <div className="grid gap-1.5">
          <Input id="event-venue" label="Venue *" value={values.venue} onChange={(item) => update('venue', item.target.value)} error={visible.venue} maxLength={200} placeholder="e.g. Main Hall, Shri Ram Mandir, Station Road, Pune" required />
          <p className="text-[12px] leading-5 text-muted">Include the full address. Visitors see it on a map on the event page.</p>
        </div>

        <div className="grid gap-4 rounded-card border border-line bg-card p-4">
          <div>
            <h2 className="text-sm font-bold leading-5 text-ink">Schedule</h2>
            <p className="mt-1 text-[12.5px] leading-5 text-muted">All times are in India Standard Time (IST).</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="registration-opens" label="Registration opens *" type="datetime-local" value={values.registrationOpensAt} onChange={(item) => update('registrationOpensAt', item.target.value)} error={visible.registrationOpensAt} required />
            <Input id="registration-closes" label="Registration closes *" type="datetime-local" value={values.registrationClosesAt} onChange={(item) => update('registrationClosesAt', item.target.value)} error={visible.registrationClosesAt} required />
            <Input id="event-starts" label="Event starts *" type="datetime-local" value={values.startsAt} onChange={(item) => update('startsAt', item.target.value)} error={visible.startsAt} required />
            <Input id="event-ends" label="Event ends *" type="datetime-local" value={values.endsAt} onChange={(item) => update('endsAt', item.target.value)} error={visible.endsAt} required />
          </div>
          {visible.schedule && <p className="text-[12px] font-semibold leading-5 text-coral-dark">{visible.schedule}</p>}
        </div>

        <div className="grid gap-2">
          <span id="event-image-label" className="text-[11.5px] font-bold leading-4 tracking-wide text-ink/75">
            Banner image
          </span>
          <label
            htmlFor="event-image"
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-bold leading-5 text-ink hover:border-violet focus-within:ring-2 focus-within:ring-violet focus-within:ring-offset-2 focus-within:ring-offset-paper sm:w-fit"
          >
            Choose image
            <input
              id="event-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-labelledby="event-image-label"
              className="sr-only"
              onChange={(item) => {
                const file = item.target.files?.[0] ?? null;
                item.target.value = '';
                if (!file) {
                  setImageError('');
                  return;
                }
                const message = validateEventImage(file);
                setImageError(message ?? '');
                setImage(message ? null : file);
                if (!message) setRemoveImage(false);
              }}
            />
          </label>
          {image && <p className="break-all text-sm leading-5 text-ink">{image.name}</p>}
          <p className="text-[12.5px] leading-5 text-muted">JPEG, PNG, or WebP. Maximum size 2 MB.</p>
          {imageError && <p className="text-[12px] font-semibold leading-5 text-coral-dark">{imageError}</p>}
          {previewImage && (
            <button
              type="button"
              className="inline-flex min-h-11 w-fit items-center text-sm font-bold text-coral-dark"
              onClick={() => {
                setImage(null);
                setRemoveImage(true);
                setImageError('');
              }}
            >
              Remove image
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="submit" variant="ghost" className="min-h-11 w-full sm:w-auto" disabled={pending !== null}>
            {pending === 'save' ? 'Saving…' : event ? 'Save changes' : 'Save draft'}
          </Button>
          <Button type="button" className="min-h-11 w-full sm:w-auto" disabled={pending !== null || event?.status === 'CANCELLED'} onClick={() => void persist(true)}>
            {pending === 'publish' ? 'Publishing…' : 'Publish event'}
          </Button>
        </div>
      </form>

      <aside className="min-w-0 lg:sticky lg:top-4">
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-muted">Public preview</p>
        <EventCard event={preview} imageSrc={previewImage} showLifecycle />
      </aside>
    </div>
  );
}
