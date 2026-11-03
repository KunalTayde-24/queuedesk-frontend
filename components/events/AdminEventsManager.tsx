'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { eventImageSrc } from '@/lib/events';
import { addDaysToKey, formatShortDateKey, todayKey } from '@/lib/dates';
import { TokenStatus } from '@/types/token';
import { useAutoRefresh } from '@/lib/use-auto-refresh';
import { EventSummary } from '@/types/event';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { EventCard } from './EventCard';

const ACTION_LINK =
  'inline-flex min-h-11 items-center rounded-md border border-line bg-card px-3 text-sm font-bold leading-5 text-ink hover:border-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

/** "24 Oct" or "24 Oct – 26 Oct": the queue days a published event opens. */
function queueDaysLabel(event: EventSummary) {
  const first = todayKey(new Date(event.startsAt));
  const last = todayKey(new Date(new Date(event.endsAt).getTime() - 1));
  return first === last ? formatShortDateKey(first) : `${formatShortDateKey(first)} – ${formatShortDateKey(last)}`;
}

type ConfirmAction = { id: string; title: string; kind: 'delete' };

/** Upcoming Singapore days an event covers (today or later), the same days publishing opens in the queue. */
function upcomingEventDays(event: EventSummary): string[] {
  const today = todayKey();
  const first = todayKey(new Date(event.startsAt));
  const last = todayKey(new Date(new Date(event.endsAt).getTime() - 1));
  const days: string[] = [];
  for (let key = first; key <= last && days.length < 14; key = addDaysToKey(key, 1)) {
    if (key >= today) days.push(key);
  }
  return days;
}

interface UnpublishPlan {
  event: EventSummary;
  booked: { date: string; waiting: number; total: number }[];
  targets: string[];
  choice: 'leave' | 'move';
  target: string;
}

export function AdminEventsManager({ events, error }: { events: EventSummary[]; error: boolean }) {
  const router = useRouter();
  useAutoRefresh();
  const { show } = useToast();
  const [items, setItems] = useState(events);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [plan, setPlan] = useState<UnpublishPlan | null>(null);

  useEffect(() => {
    setItems(events);
  }, [events]);

  async function run(id: string, action: 'publish' | 'unpublish' | 'delete') {
    setPendingId(id);
    try {
      if (action === 'delete') {
        await apiClient.deleteEvent(id);
        setItems((current) => current.filter((event) => event.id !== id));
        show('Event deleted');
      } else if (action === 'publish') {
        const updated = await apiClient.publishEvent(id);
        setItems((current) => current.map((event) => (event.id === id ? updated : event)));
        show('Event published');
      } else if (action === 'unpublish') {
        const updated = await apiClient.unpublishEvent(id);
        setItems((current) => current.map((event) => (event.id === id ? updated : event)));
        show('Event moved back to draft');
      }
      setConfirm(null);
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : 'That action could not be completed', 'error');
    } finally {
      setPendingId(null);
    }
  }

  /** Unpublish: if tokens are booked on days that will close, ask what to do with them first. */
  async function startUnpublish(event: EventSummary) {
    setPendingId(event.id);
    try {
      const covered = new Set(
        items.filter((e) => e.status === 'PUBLISHED' && e.id !== event.id).flatMap((e) => upcomingEventDays(e)),
      );
      const dropped = upcomingEventDays(event).filter((day) => !covered.has(day));
      const rows = await Promise.all(
        dropped.map(async (date) => {
          const queue = await apiClient.fetchAdminQueue(date).catch(() => []);
          return {
            date,
            waiting: queue.filter((t) => t.status === TokenStatus.WAITING).length,
            total: queue.length,
          };
        }),
      );
      const booked = rows.filter((row) => row.total > 0);
      if (booked.length === 0) {
        await run(event.id, 'unpublish');
        return;
      }
      const week = await apiClient.listQueueDays().catch(() => null);
      const targets = (week?.days ?? [])
        .filter((d) => d.open && d.date >= todayKey() && !dropped.includes(d.date))
        .map((d) => d.date);
      setPlan({ event, booked, targets, choice: 'leave', target: targets[0] ?? '' });
    } catch (err) {
      show(err instanceof Error ? err.message : 'That action could not be completed', 'error');
    } finally {
      setPendingId(null);
    }
  }

  async function confirmUnpublish() {
    if (!plan) return;
    const { event, booked, choice, target } = plan;
    setPendingId(event.id);
    try {
      const updated = await apiClient.unpublishEvent(event.id);
      setItems((current) => current.map((e) => (e.id === event.id ? updated : e)));
      let message = 'Event moved back to draft';
      if (choice === 'move' && target) {
        let moved = 0;
        let skipped = 0;
        for (const row of booked.filter((r) => r.waiting > 0)) {
          const result = await apiClient.moveTokens(row.date, target);
          moved += result.moved;
          skipped += result.skipped;
        }
        message = `Event moved back to draft. Moved ${moved} ${moved === 1 ? 'token' : 'tokens'} to ${formatShortDateKey(target)}${skipped ? ` (${skipped} skipped: already have a token that day)` : ''}`;
      }
      show(message);
      setPlan(null);
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : 'That action could not be completed', 'error');
    } finally {
      setPendingId(null);
    }
  }

  const planWaiting = plan ? plan.booked.reduce((sum, row) => sum + row.waiting, 0) : 0;

  return (
    <section className="grid min-w-0 gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">Events</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Post a celebration and publish it. Publishing shows it on the events page and opens its dates in the queue.
          </p>
        </div>
        <Link href="/admin/dashboard/events/new" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[linear-gradient(180deg,#D9412E,#B8262B)] px-4 text-center text-[13px] font-bold leading-5 text-white shadow-[inset_0_0_0_1px_rgba(242,198,109,0.5),0_6px_14px_-8px_rgba(184,38,43,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
          New event
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-card border border-coral/40 bg-coral-light px-4 py-3 text-sm font-semibold leading-6 text-coral-dark">
          Events could not be loaded. Refresh the page and try again.
        </p>
      )}

      {!error && items.length === 0 && (
        <EmptyState title="No events yet" text="Create the first event, then publish it to open its date in the queue.">
          <Link href="/admin/dashboard/events/new" className="inline-flex min-h-10 items-center rounded-md bg-violet px-4 text-[13px] font-bold text-white hover:bg-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
            Create an event
          </Link>
        </EmptyState>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((event) => (
          <div key={event.id} className="grid min-w-0 gap-3">
            <EventCard event={event} imageSrc={eventImageSrc(event, 'admin')} showLifecycle />
            {event.status === 'PUBLISHED' && (
              <p className="px-1 text-sm font-semibold leading-5 text-ink">Queue open: {queueDaysLabel(event)}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/dashboard/events/${event.id}`} className={ACTION_LINK}>
                Edit
              </Link>
              {event.status === 'PUBLISHED' ? (
                <Button type="button" variant="ghost" className="min-h-11" disabled={pendingId === event.id} onClick={() => void startUnpublish(event)}>
                  Unpublish
                </Button>
              ) : (
                <Button type="button" className="min-h-11" disabled={pendingId === event.id || event.status === 'CANCELLED'} onClick={() => void run(event.id, 'publish')}>
                  Publish event
                </Button>
              )}
              <Button type="button" variant="ghost" className="min-h-11" onClick={() => setConfirm({ id: event.id, title: event.title, kind: 'delete' })}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={Boolean(confirm)} title="Delete this event?" onClose={() => setConfirm(null)}>
        <p className="break-words text-sm leading-6 text-ink">
          {confirm ? `${confirm.title} will be removed, and its dates close in the queue unless another event uses them. Tokens already taken stay. Events that have old registrations cannot be deleted; unpublish them instead.` : ''}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="ghost" className="min-h-11 w-full" onClick={() => setConfirm(null)}>
            Keep event
          </Button>
          <Button
            type="button"
            className="min-h-11 w-full"
            disabled={!confirm || pendingId === confirm.id}
            onClick={() => confirm && void run(confirm.id, confirm.kind)}
          >
            Delete event
          </Button>
        </div>
      </Modal>

      <Modal open={Boolean(plan)} title="Unpublish this event?" onClose={() => setPlan(null)}>
        {plan && (
          <div className="grid gap-3 text-sm leading-6 text-ink">
            <p className="break-words">
              <b>{plan.event.title}</b> will go back to a draft and its queue dates close to new tokens. Tokens are already booked on:
            </p>
            <ul className="grid gap-0.5">
              {plan.booked.map((row) => (
                <li key={row.date}>
                  <b>{formatShortDateKey(row.date)}</b>: {row.waiting} waiting ({row.total} in total)
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-muted">The visitors are not notified. You can still call the tokens on those dates.</p>
            {planWaiting > 0 && plan.targets.length > 0 && (
              <fieldset className="grid gap-2 border-0 p-0 text-[13px]">
                <legend className="mb-1 font-bold">What should happen to the waiting tokens?</legend>
                <label className="flex items-start gap-2">
                  <input type="radio" name="unpublish-choice" checked={plan.choice === 'leave'} onChange={() => setPlan({ ...plan, choice: 'leave' })} className="mt-1 accent-[#B8262B]" />
                  <span>Leave them on their dates</span>
                </label>
                <label className="flex flex-wrap items-center gap-2">
                  <input type="radio" name="unpublish-choice" checked={plan.choice === 'move'} onChange={() => setPlan({ ...plan, choice: 'move' })} className="accent-[#B8262B]" />
                  <span>Move the {planWaiting} waiting {planWaiting === 1 ? 'token' : 'tokens'} to</span>
                  <select
                    aria-label="New date for the tokens"
                    value={plan.target}
                    disabled={plan.choice !== 'move'}
                    onChange={(e) => setPlan({ ...plan, target: e.target.value })}
                    className="min-h-9 rounded-md border-[1.5px] border-line bg-input px-2 text-[13px] font-semibold"
                  >
                    {plan.targets.map((day) => (
                      <option key={day} value={day}>
                        {formatShortDateKey(day)}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
            )}
            {planWaiting > 0 && plan.targets.length === 0 && (
              <p className="text-[13px] text-muted">No other date is open to move them to. Open another date on the dashboard first if you want to move them.</p>
            )}
          </div>
        )}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="ghost" className="min-h-11 w-full" onClick={() => setPlan(null)}>
            Keep it published
          </Button>
          <Button type="button" className="min-h-11 w-full" disabled={!plan || pendingId === plan.event.id} onClick={() => void confirmUnpublish()}>
            {plan && pendingId === plan.event.id ? 'Working…' : plan?.choice === 'move' ? 'Unpublish and move' : 'Unpublish'}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
