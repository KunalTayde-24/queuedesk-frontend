'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { eventImageSrc } from '@/lib/events';
import { EventSummary, RegistrationState } from '@/types/event';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventCard } from './EventCard';

const FILTERS: { id: 'all' | RegistrationState; label: string }[] = [
  { id: 'all', label: 'All events' },
  { id: 'OPEN', label: 'Open' },
  { id: 'OPENS_SOON', label: 'Opening soon' },
  { id: 'CLOSED', label: 'Closed' },
];

export function EventCatalog({ events, error }: { events: EventSummary[]; error: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const visible = useMemo(
    () => (filter === 'all' ? events : events.filter((event) => event.registrationState === filter)),
    [events, filter],
  );
  const featured = visible.find((event) => event.registrationState !== 'CLOSED') ?? visible[0];
  const rest = featured ? visible.filter((event) => event.id !== featured.id) : [];

  return (
    <section className="grid min-w-0 gap-6">
      <header className="max-w-2xl">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-coral-dark">Celebrations</p>
        <h1 className="mt-2 font-serif text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">
          Upcoming events
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-[14px]">
          See what is coming up, then register with your name, mobile number, and email while a spot is open.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events">
        {FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item.id)}
              className={clsx(
                'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
                active ? 'bg-violet text-white' : 'border border-line bg-card text-ink hover:border-violet',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="rounded-card border border-coral/40 bg-coral-light px-4 py-3 text-sm font-semibold leading-6 text-coral-dark">
          Events could not be loaded. Refresh the page and try again.
        </p>
      )}

      {!error && visible.length === 0 && (
        <EmptyState
          title={filter === 'all' ? 'No events yet' : 'No events match this filter'}
          text={
            filter === 'all'
              ? 'When an event is published, it will appear here with the dates and a registration button.'
              : 'Try another filter to see more events.'
          }
        >
          {filter !== 'all' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="inline-flex min-h-10 items-center rounded-md border border-line bg-card px-4 text-[13px] font-bold transition-colors hover:border-amber hover:bg-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            >
              Show all events
            </button>
          )}
        </EmptyState>
      )}

      {featured && (
        <EventCard event={featured} imageSrc={eventImageSrc(featured, 'public')} href={`/events/${featured.id}`} featured />
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((event) => (
            <EventCard key={event.id} event={event} imageSrc={eventImageSrc(event, 'public')} href={`/events/${event.id}`} />
          ))}
        </div>
      )}
    </section>
  );
}
