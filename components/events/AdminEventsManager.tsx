'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { eventImageSrc } from '@/lib/events';
import { EventSummary } from '@/types/event';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { EventCard } from './EventCard';

const ACTION_LINK =
  'inline-flex min-h-11 items-center rounded-md border border-line bg-card px-3 text-sm font-bold leading-5 text-ink hover:border-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

type ConfirmAction = { id: string; title: string; kind: 'delete' | 'cancel' };

export function AdminEventsManager({ events, error }: { events: EventSummary[]; error: boolean }) {
  const router = useRouter();
  const { show } = useToast();
  const [items, setItems] = useState(events);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  useEffect(() => {
    setItems(events);
  }, [events]);

  async function run(id: string, action: 'publish' | 'unpublish' | 'cancel' | 'delete') {
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
      } else {
        const updated = await apiClient.cancelEvent(id);
        setItems((current) => current.map((event) => (event.id === id ? updated : event)));
        show('Event cancelled');
      }
      setConfirm(null);
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : 'That action could not be completed', 'error');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="grid min-w-0 gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">Events</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Post a celebration, set when guests can register, and publish it when it should appear on the events page.
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
        <EmptyState title="No events yet" text="Create the first event, then publish it for guests to register.">
          <Link href="/admin/dashboard/events/new" className="inline-flex min-h-10 items-center rounded-md bg-violet px-4 text-[13px] font-bold text-white hover:bg-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
            Create an event
          </Link>
        </EmptyState>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((event) => (
          <div key={event.id} className="grid min-w-0 gap-3">
            <EventCard event={event} imageSrc={eventImageSrc(event, 'admin')} showLifecycle />
            <p className="px-1 text-sm font-semibold leading-5 text-ink">
              {event.registrationCount} {event.registrationCount === 1 ? 'registration' : 'registrations'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/dashboard/events/${event.id}`} className={ACTION_LINK}>
                Edit
              </Link>
              <Link href={`/admin/dashboard/events/${event.id}/registrants`} className={ACTION_LINK}>
                Registrations
              </Link>
              {event.status === 'PUBLISHED' ? (
                <Button type="button" variant="ghost" className="min-h-11" disabled={pendingId === event.id} onClick={() => void run(event.id, 'unpublish')}>
                  Unpublish
                </Button>
              ) : (
                <Button type="button" className="min-h-11" disabled={pendingId === event.id || event.status === 'CANCELLED'} onClick={() => void run(event.id, 'publish')}>
                  Publish event
                </Button>
              )}
              {event.status !== 'CANCELLED' && (
                <Button type="button" variant="ghost" className="min-h-11" onClick={() => setConfirm({ id: event.id, title: event.title, kind: 'cancel' })}>
                  Cancel event
                </Button>
              )}
              <Button type="button" variant="ghost" className="min-h-11" onClick={() => setConfirm({ id: event.id, title: event.title, kind: 'delete' })}>
                Delete
              </Button>
              {event.status === 'PUBLISHED' && (
                <Link href={`/events/${event.id}`} className="inline-flex min-h-11 items-center px-1 text-sm font-bold text-violet">
                  View public page
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={Boolean(confirm)} title={confirm?.kind === 'delete' ? 'Delete this event?' : 'Cancel this event?'} onClose={() => setConfirm(null)}>
        <p className="break-words text-sm leading-6 text-ink">
          {confirm?.kind === 'delete'
            ? `${confirm.title} will be removed. Events that already have registrations need to be cancelled instead.`
            : `${confirm?.title ?? 'This event'} will be hidden from guests. Existing registrations stay on record.`}
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
            {confirm?.kind === 'delete' ? 'Delete event' : 'Cancel event'}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
