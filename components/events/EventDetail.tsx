'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { eventImageSrc } from '@/lib/events';
import { formatEventDate } from '@/lib/event-time';
import { downloadIcs, googleCalendarUrl, mapsDirectionsUrl, mapsEmbedUrl, mapsSearchUrl } from '@/lib/calendar';
import { EventSummary } from '@/types/event';
import { Button } from '@/components/ui/Button';
import { EventBanner } from './EventBanner';
import { RegistrationPill } from './EventStatus';
import { RegistrationDialog } from './RegistrationDialog';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const SECONDARY_LINK =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-line bg-card px-3 text-[13px] font-bold leading-5 text-ink transition-colors hover:border-amber hover:bg-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

function countdown(event: EventSummary, now: number): { text: string; tone: 'soon' | 'live' | 'over' } | null {
  const start = Date.parse(event.startsAt);
  const end = Date.parse(event.endsAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  if (now >= end) return { text: 'This event has ended', tone: 'over' };
  if (now >= start) return { text: 'Happening now', tone: 'live' };
  const diff = start - now;
  if (diff >= DAY_MS) {
    const days = Math.ceil(diff / DAY_MS);
    return { text: `Starts in ${days} ${days === 1 ? 'day' : 'days'}`, tone: 'soon' };
  }
  const hours = Math.max(1, Math.round(diff / HOUR_MS));
  return { text: `Starts in ${hours} ${hours === 1 ? 'hour' : 'hours'}`, tone: 'soon' };
}

interface TimelineItem {
  label: string;
  iso: string;
}

function Timeline({ items, now }: { items: TimelineItem[]; now: number | null }) {
  return (
    <ol className="m-0 list-none p-0">
      {items.map((item, i) => {
        const passed = now !== null && Date.parse(item.iso) <= now;
        const last = i === items.length - 1;
        return (
          <li key={item.label} className="relative grid grid-cols-[18px_minmax(0,1fr)] gap-3 pb-4 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute left-[8px] top-4 h-[calc(100%-8px)] w-px bg-line" />}
            <span
              aria-hidden="true"
              className={clsx(
                'relative z-10 mt-[3px] h-[17px] w-[17px] rounded-full border-[2.5px]',
                passed ? 'border-teal bg-teal' : 'border-line bg-card',
              )}
            />
            <span className="min-w-0 leading-5">
              <b className="block text-[13px] font-bold text-ink">{item.label}</b>
              <small className="block break-words text-[12.5px] text-muted">{formatEventDate(item.iso)}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function EventDetail({ event }: { event: EventSummary }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [pageUrl, setPageUrl] = useState('');
  const imageSrc = eventImageSrc(event, 'public');

  // Time-dependent text is computed after mount so server and browser output always match.
  useEffect(() => {
    setNow(Date.now());
    setPageUrl(window.location.href);
  }, []);

  const when = now === null ? null : countdown(event, now);
  const statusCopy = event.canRegister
    ? 'Registration is open'
    : event.registrationState === 'OPENS_SOON'
      ? `Registration opens ${formatEventDate(event.registrationOpensAt)}`
      : 'Registration is closed';
  const hasVenue = event.venue.trim().length > 1;

  return (
    <article className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:items-start">
      <div className="grid min-w-0 gap-6">
        <div className="min-w-0 overflow-hidden rounded-card border border-line bg-card shadow-card">
          <EventBanner src={imageSrc} alt={imageSrc ? event.title : ''} seed={event.id} startsAt={event.startsAt} />
          <div className="grid gap-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <RegistrationPill state={event.registrationState} />
              {when && (
                <span
                  className={clsx(
                    'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-4',
                    when.tone === 'live' && 'bg-teal-light text-teal-dark',
                    when.tone === 'soon' && 'bg-amber-light text-amber-dark',
                    when.tone === 'over' && 'bg-violet-soft text-muted',
                  )}
                >
                  {when.text}
                </span>
              )}
            </div>
            <div>
              <h1 className="break-words font-serif text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">
                {event.title}
              </h1>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-ink sm:text-[14px]">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {hasVenue && (
          <section aria-labelledby="location-heading" className="min-w-0 overflow-hidden rounded-card border border-line bg-card shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
              <div className="min-w-0">
                <h2 id="location-heading" className="font-serif text-[1.0625rem] font-bold leading-6 text-violet-dark">
                  Location
                </h2>
                <p className="mt-1 flex items-start gap-1.5 break-words text-[13px] leading-5 text-ink">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-violet" aria-hidden="true">
                    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {event.venue}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={mapsSearchUrl(event.venue)} target="_blank" rel="noopener noreferrer" className={SECONDARY_LINK}>
                  Open in Maps
                </a>
                <a href={mapsDirectionsUrl(event.venue)} target="_blank" rel="noopener noreferrer" className={SECONDARY_LINK}>
                  Get directions
                </a>
              </div>
            </div>
            <iframe
              title={`Map showing ${event.venue}`}
              src={mapsEmbedUrl(event.venue)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[240px] w-full border-0 border-t border-line bg-violet-soft sm:h-[280px]"
            />
          </section>
        )}
      </div>

      <aside className="grid min-w-0 gap-4 lg:sticky lg:top-24">
        <div className="rounded-card border border-line bg-card p-4 shadow-card sm:p-5">
          <h2 className="font-serif text-[1.0625rem] font-bold leading-6 text-violet-dark">Timings</h2>
          <p className="mb-4 mt-0.5 text-[12px] leading-5 text-muted">All times are in India Standard Time.</p>
          <Timeline
            now={now}
            items={[
              { label: 'Registration opens', iso: event.registrationOpensAt },
              { label: 'Registration closes', iso: event.registrationClosesAt },
              { label: 'Event starts', iso: event.startsAt },
              { label: 'Event ends', iso: event.endsAt },
            ]}
          />
          <p className="mt-5 text-sm font-semibold leading-6 text-ink">{statusCopy}</p>
          {event.canRegister ? (
            <Button type="button" className="mt-3 hidden min-h-11 w-full lg:inline-flex" onClick={() => setOpen(true)}>
              Register now
            </Button>
          ) : (
            <Button type="button" className="mt-3 hidden min-h-11 w-full lg:inline-flex" disabled>
              {event.registrationState === 'OPENS_SOON' ? 'Registration not open' : 'Registration closed'}
            </Button>
          )}
        </div>

        <div className="rounded-card border border-line bg-card p-4 shadow-card sm:p-5">
          <h2 className="font-serif text-[1.0625rem] font-bold leading-6 text-violet-dark">Add to calendar</h2>
          <p className="mb-3 mt-0.5 text-[12px] leading-5 text-muted">Get a reminder on your phone.</p>
          <div className="grid gap-2 min-[420px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <a
              href={googleCalendarUrl(event, pageUrl || '')}
              target="_blank"
              rel="noopener noreferrer"
              className={SECONDARY_LINK}
            >
              Google Calendar
            </a>
            <button type="button" onClick={() => downloadIcs(event, pageUrl || '')} className={SECONDARY_LINK}>
              Apple / Outlook (.ics)
            </button>
          </div>
        </div>

        <Link href="/events" className="inline-flex min-h-11 items-center px-1 text-sm font-bold text-violet">
          ← Back to events
        </Link>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-2 min-[420px]:flex-row min-[420px]:items-center">
          <p className="min-w-0 flex-1 break-words text-xs font-semibold leading-5 text-ink">{statusCopy}</p>
          <Button type="button" className="min-h-11 w-full shrink-0 min-[420px]:w-auto" disabled={!event.canRegister} onClick={() => setOpen(true)}>
            {event.canRegister ? 'Register now' : event.registrationState === 'OPENS_SOON' ? 'Opens soon' : 'Closed'}
          </Button>
        </div>
      </div>

      <RegistrationDialog event={event} open={open} onClose={() => setOpen(false)} />
    </article>
  );
}
