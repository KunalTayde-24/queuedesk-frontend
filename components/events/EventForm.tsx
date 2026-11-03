'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { eventImageSrc, eventToFormData, validateEventImage } from '@/lib/events';
import { isoToSgtInput, sgtLocalToIso } from '@/lib/event-time';
import { eventDaysFromLocal, formatShortDateKey, todayKey } from '@/lib/dates';
import { TokenStatus } from '@/types/token';
import { validateEventForm } from '@/lib/validators';
import { EventFormValues, EventSummary } from '@/types/event';
import { Button } from '@/components/ui/Button';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useToast } from '@/components/ui/Toast';
import { EventCard } from './EventCard';

const EMPTY: EventFormValues = {
  title: '',
  description: '',
  venue: '',
  startsAt: '',
  endsAt: '',
};

// Form field -> input id, in the order they appear on the page (used to jump to the first error).
const FIELD_IDS = {
  title: 'event-title',
  description: 'event-description',
  venue: 'event-venue',
  startsAt: 'event-starts',
  endsAt: 'event-ends',
  schedule: 'event-starts',
} as const;

function fromEvent(event: EventSummary): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    venue: event.venue,
    startsAt: isoToSgtInput(event.startsAt),
    endsAt: isoToSgtInput(event.endsAt),
  };
}

function safeIso(value: string) {
  try {
    return value ? sgtLocalToIso(value) : '';
  } catch {
    return '';
  }
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
  // Set once the event is published so Publish cannot be pressed twice while the page changes.
  const [published, setPublished] = useState(false);
  const wasPublished = event?.status === 'PUBLISHED';
  const alreadyPublished = published || wasPublished;
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

  // Changing the dates of a live event: find tokens already booked on days it will no longer cover.
  type Booked = { date: string; waiting: number; total: number };
  const [booked, setBooked] = useState<Booked[]>([]);
  const [moveChoice, setMoveChoice] = useState<'leave' | 'move'>('leave');
  const [moveTarget, setMoveTarget] = useState('');
  const today = todayKey();
  const oldDays = useMemo(
    () => (event && wasPublished ? eventDaysFromLocal(fromEvent(event).startsAt, fromEvent(event).endsAt) : []),
    [event, wasPublished],
  );
  const newDays = useMemo(() => eventDaysFromLocal(values.startsAt, values.endsAt), [values.startsAt, values.endsAt]);
  const droppedDays = useMemo(
    () => (wasPublished ? oldDays.filter((day) => day >= today && !newDays.includes(day)) : []),
    [wasPublished, oldDays, newDays, today],
  );
  const droppedKey = droppedDays.join(',');
  const targetDays = useMemo(() => newDays.filter((day) => day >= today), [newDays, today]);

  useEffect(() => {
    if (!droppedKey) {
      setBooked([]);
      return;
    }
    let cancelled = false;
    void Promise.all(
      droppedKey.split(',').map(async (date) => {
        try {
          const queue = await apiClient.fetchAdminQueue(date);
          return {
            date,
            waiting: queue.filter((t) => t.status === TokenStatus.WAITING).length,
            total: queue.length,
          };
        } catch {
          return { date, waiting: 0, total: 0 };
        }
      }),
    ).then((rows) => {
      if (!cancelled) setBooked(rows.filter((row) => row.total > 0));
    });
    return () => {
      cancelled = true;
    };
  }, [droppedKey]);

  // Keep the chosen target valid as the dates change.
  useEffect(() => {
    if (!targetDays.includes(moveTarget)) setMoveTarget(targetDays[0] ?? '');
  }, [targetDays, moveTarget]);
  const waitingTotal = booked.reduce((sum, row) => sum + row.waiting, 0);

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
      startsAt: safeIso(values.startsAt),
      endsAt: safeIso(values.endsAt),
      status: event?.status ?? 'DRAFT',
      createdAt: event?.createdAt ?? new Date().toISOString(),
      updatedAt: event?.updatedAt ?? new Date().toISOString(),
    }),
    [event, previewImage, values],
  );

  function update<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function persist(publish: boolean) {
    // When editing, only dates that were changed are checked against today.
    const nextErrors = validateEventForm(values, { original: event ? fromEvent(event) : undefined });
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
        let message = 'Event saved';
        if (moveChoice === 'move' && moveTarget && booked.some((row) => row.waiting > 0)) {
          try {
            let moved = 0;
            let skipped = 0;
            for (const row of booked.filter((r) => r.waiting > 0)) {
              const result = await apiClient.moveTokens(row.date, moveTarget);
              moved += result.moved;
              skipped += result.skipped;
            }
            message = `Event saved. Moved ${moved} ${moved === 1 ? 'token' : 'tokens'} to ${formatShortDateKey(moveTarget)}${skipped ? ` (${skipped} skipped: already have a token that day)` : ''}`;
          } catch (err) {
            show(err instanceof Error ? err.message : 'The event was saved, but the tokens could not be moved', 'error');
            router.push(`/admin/dashboard/events/${saved.id}`);
            router.refresh();
            return;
          }
        }
        show(message);
        router.push(`/admin/dashboard/events/${saved.id}`);
        router.refresh();
        return;
      }
      try {
        await apiClient.publishEvent(saved.id);
      } catch (err) {
        show(err instanceof Error ? err.message : 'The event was saved, but it could not be published', 'error');
        router.push(`/admin/dashboard/events/${saved.id}`);
        router.refresh();
        return;
      }
      setPublished(true);
      show('Event published');
      router.push('/admin/dashboard/events');
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

  // Date problems show as soon as a date is picked (not only after pressing Save), and update
  // as the other dates change. Everything else waits until the first Save/Publish attempt.
  const live = validateEventForm(values, { original: event ? fromEvent(event) : undefined });
  const scheduleFields = ['startsAt', 'endsAt'] as const;
  const visible: typeof live = showErrors ? { ...live } : {};
  for (const field of scheduleFields) {
    if (live[field] && values[field]) visible[field] = live[field];
  }

  return (
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <form onSubmit={onSubmit} className="grid min-w-0 gap-4" noValidate>
        <div>
          <h1 className="break-words font-serif text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">
            {event ? 'Edit event' : 'New event'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Drafts stay hidden. Publishing the event shows it to guests and opens its dates in the queue, so they can take a token for those days.
          </p>
        </div>

        <Input id="event-title" label="Title *" value={values.title} onChange={(item) => update('title', item.target.value)} error={visible.title} maxLength={120} required />
        <TextArea id="event-description" label="Description (optional)" value={values.description} onChange={(item) => update('description', item.target.value)} error={visible.description} maxLength={4000} />
        <div className="grid gap-1.5">
          <Input id="event-venue" label="Venue (optional)" value={values.venue} onChange={(item) => update('venue', item.target.value)} error={visible.venue} maxLength={200} placeholder="e.g. Main Hall, Lotus Temple, 12 Temple Road, City" />
          <p className="text-[12px] leading-5 text-muted">Include the full address. Visitors see it on a map on the event page.</p>
        </div>

        <div className="grid gap-4 rounded-card border border-line bg-card p-4">
          <div>
            <h2 className="text-sm font-bold leading-5 text-ink">Schedule</h2>
            <p className="mt-1 text-[12.5px] leading-5 text-muted">All times are in Singapore Time (SGT). The queue opens on every day from the start to the end of the event.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimePicker id="event-starts" label="Event starts *" value={values.startsAt} onChange={(v) => update('startsAt', v)} error={visible.startsAt}  />
            <DateTimePicker id="event-ends" label="Event ends *" value={values.endsAt} onChange={(v) => update('endsAt', v)} error={visible.endsAt} minValue={values.startsAt} minLabel="the event start" align="right" />
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

        {booked.length > 0 && (
          <div role="alert" className="grid gap-3 rounded-card border border-amber bg-amber-light p-4 text-[13px] leading-5 text-ink">
            <div>
              <p className="font-bold text-amber-dark">Tokens are booked on dates this event will no longer cover</p>
              <ul className="mt-1.5 grid gap-0.5">
                {booked.map((row) => (
                  <li key={row.date}>
                    <b>{formatShortDateKey(row.date)}</b>: {row.waiting} waiting ({row.total} in total)
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-muted">
                Saving does not move these tokens or tell the visitors. Those dates close to new tokens, but you can still call the tokens there.
              </p>
            </div>
            {waitingTotal > 0 && targetDays.length > 0 && (
              <fieldset className="grid gap-2 border-0 p-0">
                <legend className="mb-1 font-bold">What should happen to the waiting tokens?</legend>
                <label className="flex items-start gap-2">
                  <input type="radio" name="move-choice" checked={moveChoice === 'leave'} onChange={() => setMoveChoice('leave')} className="mt-1 accent-[#B8262B]" />
                  <span>Leave them on the old dates</span>
                </label>
                <label className="flex flex-wrap items-center gap-2">
                  <input type="radio" name="move-choice" checked={moveChoice === 'move'} onChange={() => setMoveChoice('move')} className="accent-[#B8262B]" />
                  <span>Move the {waitingTotal} waiting {waitingTotal === 1 ? 'token' : 'tokens'} to</span>
                  <select
                    aria-label="New date for the tokens"
                    value={moveTarget}
                    disabled={moveChoice !== 'move'}
                    onChange={(e) => setMoveTarget(e.target.value)}
                    className="min-h-9 rounded-md border-[1.5px] border-line bg-input px-2 text-[13px] font-semibold"
                  >
                    {targetDays.map((day) => (
                      <option key={day} value={day}>
                        {formatShortDateKey(day)}
                      </option>
                    ))}
                  </select>
                </label>
                {moveChoice === 'move' && (
                  <p className="text-[12px] text-muted">
                    They keep their order and get the next numbers on that date. Their tickets update by themselves. Called and finished tokens stay put.
                  </p>
                )}
              </fieldset>
            )}
          </div>
        )}

        <div className="grid gap-2">
          {wasPublished && (
            <p className="text-[12.5px] leading-5 text-muted">
              This event is live. Save changes to update it, and its queue days follow the new dates.
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="submit"
              variant={wasPublished ? 'primary' : 'ghost'}
              className="min-h-11 w-full sm:w-auto"
              disabled={pending !== null || published}
            >
              {pending === 'save' ? 'Saving…' : event ? 'Save changes' : 'Save draft'}
            </Button>
            {!wasPublished && (
              <Button type="button" className="min-h-11 w-full sm:w-auto" disabled={pending !== null || alreadyPublished || event?.status === 'CANCELLED'} onClick={() => void persist(true)}>
                {pending === 'publish' ? 'Publishing…' : alreadyPublished ? 'Published' : 'Publish event'}
              </Button>
            )}
          </div>
        </div>
      </form>

      <aside className="min-w-0 lg:sticky lg:top-4">
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-muted">Public preview</p>
        <EventCard event={preview} imageSrc={previewImage} showLifecycle />
      </aside>
    </div>
  );
}
