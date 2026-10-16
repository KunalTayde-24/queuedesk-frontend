'use client';

import Link from 'next/link';
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';
import { countByStatus, sortByTokenNumberAsc } from '@/lib/queue-utils';
import { Token, TokenStatus } from '@/types/token';
import { EventCard } from '@/components/events/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { eventImageSrc } from '@/lib/events';
import { EventSummary } from '@/types/event';
import { TokenForm } from './TokenForm';

// Rough per-person service time, used only for the "estimated wait" hint.
const AVG_MIN = 5;

const STEPS = [
  {
    deva: '1',
    title: 'Get a token',
    text: 'Enter your name and mobile number. Your number appears right away and shows how many people are ahead of you.',
  },
  {
    deva: '2',
    title: 'Look around while you wait',
    text: 'Visit the shrine, light incense or relax in the garden. The live board and your ticket update on their own.',
  },
  {
    deva: '3',
    title: "Come when you're called",
    text: "When it's your turn we send you a WhatsApp message and your number lights up on the board.",
  },
];

function Stat({
  label,
  value,
  tone,
  children,
}: {
  label: string;
  value: string;
  tone: 'red' | 'gold' | 'jade';
  children: React.ReactNode;
}) {
  const toneClass = {
    red: 'bg-violet-light text-violet',
    gold: 'bg-amber-light text-amber-dark',
    jade: 'bg-teal-light text-teal-dark',
  }[tone];
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3">
      <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {children}
        </svg>
      </span>
      <div className="min-w-0">
        <b className="block truncate font-serif text-[19px] font-bold leading-tight">{value}</b>
        <span className="block truncate text-[11.5px] font-bold text-muted">{label}</span>
      </div>
    </div>
  );
}

export function KioskClient({
  initialTokens,
  upcomingEvents,
}: {
  initialTokens: Token[];
  upcomingEvents: EventSummary[];
}) {
  const tokens = useRealtimeTokens(initialTokens);
  const { waiting } = countByStatus(tokens);
  const called = sortByTokenNumberAsc(tokens.filter((t) => t.status === TokenStatus.CALLED)).at(-1);

  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-14 pt-3 sm:px-5">
      <section
        className="temple-photo relative grid overflow-hidden rounded-[24px] border border-line shadow-lg [background-position:28%_0] [background-size:auto_380px] lg:min-h-[520px] lg:grid-cols-2 lg:[background-position:28%_40%] lg:[background-size:cover]"
        aria-label="Welcome"
      >
        {/* Darkening layer: heavy behind the text, clear over the temple. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,6,3,0)_0px,rgba(18,6,3,0)_170px,rgba(18,6,3,1)_380px)] lg:bg-[linear-gradient(270deg,rgba(18,6,3,0.92)_0%,rgba(18,6,3,0.78)_40%,rgba(18,6,3,0.05)_75%)]"
        />
        <div className="relative z-10 flex min-w-0 flex-col justify-center gap-4 px-5 pb-6 pt-[250px] text-[#FFF3DA] sm:px-8 sm:pb-8 sm:pt-[250px] lg:col-start-2 lg:px-9 lg:py-10">
          <span className="eyebrow !text-[#FFC86B]">
            <span className="deva !text-[#F2C66D]" aria-hidden="true">
              स्वागतम्
            </span>
            Welcome to the temple
          </span>
          <h1 className="text-[28px] font-black tracking-tight sm:text-[34px] lg:text-[38px]">
            Skip the line.
            <br />
            <em className="not-italic text-[#FFC86B]">Keep the calm.</em>
          </h1>
          <p className="max-w-[46ch] text-[14px] leading-6 text-[#FFF3DA]/85">
            Get a token in seconds and look around the temple grounds while you wait. We&apos;ll send you a WhatsApp
            message the moment it&apos;s your turn.
          </p>
          <TokenForm tokens={tokens} waitingCount={waiting} />
        </div>
      </section>

      <section aria-live="polite" className="mt-4 grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        <Stat label="Now serving" value={called ? `#${called.tokenNumber}` : '—'} tone="red">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </Stat>
        <Stat label="Waiting in line" value={String(waiting)} tone="gold">
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
          <path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20c0-3-2-5-5-5.8" />
        </Stat>
        <Stat label="Estimated wait" value={waiting ? `~${waiting * AVG_MIN} min` : 'No wait'} tone="jade">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </Stat>
        <Link
          href="/display"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 text-[13px] font-bold transition-colors hover:border-amber hover:bg-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber min-[460px]:col-span-2 lg:col-span-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="13" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          Live board
        </Link>
      </section>

      <section id="how-it-works" className="mt-10 scroll-mt-24">
        <div className="orn" aria-hidden="true">
          <i />
        </div>
        <h2 className="mb-6 text-[22px] font-bold text-ink">How it works</h2>
        <ol className="grid list-none gap-x-4 gap-y-8 p-0 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.title} className="relative rounded-card border border-line bg-card px-5 pb-5 pt-7 shadow-card">
              <span
                aria-hidden="true"
                className="deva absolute -top-4 left-5 flex h-9 w-9 items-center justify-center rounded-full bg-violet text-[20px] leading-none text-[#F2C66D] ring-4 ring-[rgb(var(--color-paper))]"
              >
                {s.deva}
              </span>
              <h3 className="mb-1.5 text-[16px] font-bold">{s.title}</h3>
              <p className="text-[13px] leading-6 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 scroll-mt-24" aria-labelledby="upcoming-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="orn" aria-hidden="true">
              <i />
            </div>
            <h2 id="upcoming-heading" className="text-[22px] font-bold text-ink">
              Upcoming events
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex min-h-9 items-center rounded-md border border-line bg-card px-3 text-[12.5px] font-bold transition-colors hover:border-amber hover:bg-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            All events →
          </Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                imageSrc={eventImageSrc(event, 'public')}
                href={`/events/${event.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming events right now"
            text="New festivals, pujas and gatherings will appear here as soon as they are published. Check back soon."
          >
            <Link
              href="/events"
              className="inline-flex min-h-10 items-center rounded-md border border-line bg-card px-4 text-[13px] font-bold transition-colors hover:border-amber hover:bg-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            >
              Browse all events
            </Link>
          </EmptyState>
        )}
      </section>
    </div>
  );
}
