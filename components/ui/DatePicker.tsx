'use client';

import clsx from 'clsx';
import { useState } from 'react';
import {
  addMonthsToKey,
  formatDateKey,
  formatMonthKey,
  monthGrid,
  todayKey,
} from '@/lib/dates';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DatePickerProps {
  /** Selected date as "YYYY-MM-DD", or null. */
  value: string | null;
  onChange: (key: string) => void;
  /** Which dates can be chosen. Everything is selectable when omitted. */
  isEnabled?: (key: string) => boolean;
  /** Dates that get a small gold dot (for example, dates that are open). */
  isMarked?: (key: string) => boolean;
  /** Small caption shown under the grid, explaining the dot. */
  legend?: string;
  className?: string;
}

/**
 * A month calendar. The browser's own date input cannot grey out an arbitrary
 * set of dates, and "only these dates are open" is the whole point here.
 */
export function DatePicker({ value, onChange, isEnabled, isMarked, legend, className }: DatePickerProps) {
  const today = todayKey();
  const [month, setMonth] = useState(() => (value ?? today).slice(0, 7) + '-01');
  const cells = monthGrid(month);

  return (
    <div className={clsx('w-full max-w-[320px] select-none', className)}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setMonth((m) => addMonthsToKey(m, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-violet-soft hover:text-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="font-serif text-[14px] font-bold" aria-live="polite">
          {formatMonthKey(month)}
        </div>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonth((m) => addMonthsToKey(m, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-violet-soft hover:text-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="py-1 text-[11px] font-extrabold uppercase text-muted" aria-hidden="true">
            {d}
          </div>
        ))}
        {cells.map((key, i) => {
          if (!key) return <div key={`blank-${i}`} />;
          const enabled = isEnabled ? isEnabled(key) : true;
          const selected = key === value;
          const marked = isMarked?.(key) ?? false;
          return (
            <button
              key={key}
              type="button"
              disabled={!enabled}
              aria-pressed={selected}
              aria-label={`${formatDateKey(key)}${enabled ? '' : ', not available'}${marked ? ', open' : ''}`}
              onClick={() => onChange(key)}
              className={clsx(
                'relative flex h-10 items-center justify-center rounded-lg text-[13px] font-bold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
                selected
                  ? 'bg-violet text-white shadow-[0_4px_10px_-3px_rgba(184,38,43,0.6)]'
                  : enabled
                    ? 'text-ink hover:bg-violet-light'
                    : 'cursor-not-allowed text-muted/40',
                key === today && !selected && 'ring-1 ring-amber',
              )}
            >
              {Number(key.slice(8))}
              {marked && (
                <span
                  aria-hidden="true"
                  className={clsx(
                    'absolute bottom-1 h-1 w-1 rounded-full',
                    selected ? 'bg-white' : 'bg-amber',
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {legend && (
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber" />
          {legend}
        </p>
      )}
    </div>
  );
}
