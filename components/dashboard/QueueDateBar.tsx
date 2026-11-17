'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { addDaysToKey, formatDateKey, relativeDayLabel } from '@/lib/dates';
import { QueueDaySummary } from '@/types/queue';
import { DashboardQueue } from '@/lib/queues';

interface QueueDateBarProps {
  date: string;
  today: string;
  days: QueueDaySummary[];
  /** The event queues on this date. */
  queues: DashboardQueue[];
  /** Key of the selected queue, or "all" for every queue together. */
  selectedKey: string;
  onPickQueue: (key: string) => void;
  busy: boolean;
  onSelect: (date: string) => void;
  onToggleOpen: () => void;
}

const ICON_BUTTON =
  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-card text-muted transition-colors hover:border-amber hover:text-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber';

/** Pick which date's queue to look at, and open or close that date for visitors. */
export function QueueDateBar({ date, today, days, queues, selectedKey, onPickQueue, busy, onSelect, onToggleOpen }: QueueDateBarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setCalendarOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCalendarOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [calendarOpen]);
  const openSet = useMemo(() => new Set(days.filter((d) => d.open).map((d) => d.date)), [days]);
  const selected = queues.find((q) => q.key === selectedKey) ?? null;
  const isOpen = Boolean(selected?.open);
  const isPast = date < today;
  const canToggle = Boolean(selected?.eventId) && !isPast;
  const relative = relativeDayLabel(date, today);

  return (
    <section ref={barRef} aria-label="Queue date" className="mb-4 rounded-card border border-line bg-card p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label="Previous day"
          disabled={date <= today}
          onClick={() => onSelect(addDaysToKey(date, -1))}
          className={clsx(ICON_BUTTON, 'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-muted')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen((o) => !o)}
          className="flex min-h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border-[1.5px] border-line bg-input px-3 text-[13.5px] font-bold transition-colors hover:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber sm:max-w-[290px] sm:flex-none"
        >
          <span className="flex min-w-0 items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-violet" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            <span className="truncate">{formatDateKey(date)}</span>
            {relative && (
              <span className="flex-shrink-0 rounded-full bg-amber-light px-2 py-0.5 text-[10.5px] font-extrabold uppercase text-amber-dark">
                {relative}
              </span>
            )}
          </span>
        </button>

        <button type="button" aria-label="Next day" onClick={() => onSelect(addDaysToKey(date, 1))} className={ICON_BUTTON}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        {date !== today && (
          <Button type="button" variant="ghost" className="min-h-10" onClick={() => onSelect(today)}>
            Today
          </Button>
        )}

        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <span
            className={clsx(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold',
              isOpen ? 'bg-teal-light text-teal-dark' : 'bg-violet-soft text-muted',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {!selected ? 'Pick an event queue' : isOpen ? 'Open for tokens' : 'Closed to visitors'}
          </span>
          {canToggle && (
            <Button
              type="button"
              variant={isOpen ? 'ghost' : 'primary'}
              className="min-h-10"
              disabled={busy}
              onClick={onToggleOpen}
            >
              {busy ? 'Saving…' : isOpen ? 'Close this queue' : 'Open this queue'}
            </Button>
          )}
        </div>
      </div>

      {queues.length > 0 && (
        <div role="group" aria-label="Event queues" className="mt-3 flex flex-wrap gap-2">
          {queues.map((q) => (
            <button
              key={q.key}
              type="button"
              aria-pressed={selectedKey === q.key}
              onClick={() => onPickQueue(q.key)}
              className={clsx(
                'flex min-h-9 max-w-full items-center gap-2 rounded-lg border-[1.5px] px-3 py-1.5 text-left text-[12.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
                selectedKey === q.key ? 'border-violet bg-violet-soft text-violet-dark' : 'border-line bg-card text-ink hover:border-amber',
              )}
            >
              <span className="min-w-0 truncate">{q.title}</span>
              <span className={clsx('flex-shrink-0 text-[10.5px] font-extrabold uppercase', q.open ? 'text-teal-dark' : 'text-muted')}>
                {q.open ? 'open' : 'closed'}
                {q.tokenCount > 0 ? ` · ${q.tokenCount}` : ''}
              </span>
            </button>
          ))}
          {queues.length > 1 && (
            <button
              type="button"
              aria-pressed={selectedKey === 'all'}
              onClick={() => onPickQueue('all')}
              className={clsx(
                'min-h-9 rounded-lg border-[1.5px] px-3 py-1.5 text-[12.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
                selectedKey === 'all' ? 'border-violet bg-violet-soft text-violet-dark' : 'border-line bg-card text-ink hover:border-amber',
              )}
            >
              All events
            </button>
          )}
        </div>
      )}
      <p className="mt-2 text-[12px] leading-5 text-muted">
        {queues.length === 0
          ? 'No event queue runs on this date.'
          : isPast
            ? 'This date has passed, so it is view-only.'
            : !selected
              ? 'Pick one event queue to open or close it, or to add a walk-in.'
              : isOpen
                ? 'Visitors can pick this event on this date, and staff can add walk-ins.'
                : 'Visitors cannot pick this event on this date until you open its queue. Walk-ins cannot be added while it is closed.'}
        {selected && selected.tokenCount > 0
          ? ` ${selected.tokenCount} ${selected.tokenCount === 1 ? 'token' : 'tokens'} so far.`
          : ''}
      </p>

      {calendarOpen && (
        <div className="mt-3 w-fit max-w-full rounded-xl border border-line bg-paper p-3">
          <DatePicker
            value={date}
            onChange={(key) => {
              onSelect(key);
              setCalendarOpen(false);
            }}
            min={today}
            isMarked={(key) => openSet.has(key)}
            legend="Gold dots are dates open for visitors."
          />
        </div>
      )}
    </section>
  );
}
