'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { DatePicker } from '@/components/ui/DatePicker';
import { formatDateKey, todayKey } from '@/lib/dates';
import {
  Period,
  buildLocal,
  formatTime12,
  parseLocal,
  to12h,
  to24h,
} from '@/lib/datetime-local';

interface DateTimePickerProps {
  id: string;
  label: string;
  /** "YYYY-MM-DDTHH:mm" (Indian time), or an empty string when nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** The earliest allowed moment ("YYYY-MM-DDTHH:mm"), e.g. when registration opens. Earlier days are greyed out. */
  minValue?: string;
  /** Names that earlier field in the hint ("registration opens"). */
  minLabel?: string;
  /** Allow dates before today. Off by default: events are scheduled today or later. */
  allowPast?: boolean;
  /** Which edge of the field the pop-up lines up with (use "right" for a right-hand column). */
  align?: 'left' | 'right';
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const QUICK_TIMES: [number, number][] = [
  [9, 0],
  [12, 0],
  [16, 0],
  [18, 0],
  [20, 0],
];

const SELECT =
  'min-h-10 rounded-md border-[1.5px] border-line bg-input px-2.5 text-[13.5px] font-semibold text-ink outline-none transition-colors focus:border-amber focus:ring-4 focus:ring-amber/25';

/**
 * A calendar plus a time selector in one pop-up, replacing the browser's own
 * datetime field (whose calendar and clock are hard to use and look different
 * in every browser). It keeps the same "YYYY-MM-DDTHH:mm" value format.
 */
export function DateTimePicker({ id, label, value, onChange, error, minValue, minLabel, allowPast = false, align = 'left' }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const today = todayKey();
  // Earliest selectable day: today, or later if an earlier field in the form pushes it out.
  const minDate = minValue && parseLocal(minValue) ? minValue.slice(0, 10) : undefined;
  const floor = allowPast ? minDate : minDate && minDate > today ? minDate : today;
  const parsed = parseLocal(value);
  const beforeMin = Boolean(minValue && parsed && value < minValue);
  const { hour12, period } = parsed ? to12h(parsed.hour) : { hour12: 9, period: 'AM' as Period };
  const minute = parsed?.minute ?? 0;
  // Keep an odd existing minute (e.g. 07) selectable alongside the 5-minute steps.
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  if (!minutes.includes(minute)) minutes.push(minute), minutes.sort((a, b) => a - b);

  // Close on a click outside or Escape (and hand focus back to the field).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function pickDate(date: string) {
    const base = parsed ?? { hour: 9, minute: 0 };
    let next = buildLocal(date, base.hour, base.minute);
    // Choosing the same day as the earlier field: start from its time rather than an earlier one.
    if (minValue && next < minValue && date === minValue.slice(0, 10)) next = minValue;
    onChange(next);
  }

  function pickTime(nextHour12: number, nextPeriod: Period, nextMinute: number) {
    onChange(buildLocal(parsed?.date ?? todayKey(), to24h(nextHour12, nextPeriod), nextMinute));
  }

  const display = parsed ? `${formatDateKey(parsed.date)} · ${formatTime12(parsed.hour, parsed.minute)}` : '';

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-bold leading-4 text-ink/80">
        {label}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'flex min-h-10 w-full items-center justify-between gap-2 rounded-md border-[1.5px] bg-input px-3 py-2 text-left text-[13.5px] leading-5 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
          error ? 'border-coral-dark' : open ? 'border-amber' : 'border-line hover:border-amber',
        )}
      >
        <span className={clsx('min-w-0 truncate', !display && 'text-muted/60')}>
          {display || 'Pick date and time'}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>
      {error && (
        <span role="alert" className="text-[12px] font-semibold leading-4 text-coral-dark">
          {error}
        </span>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={`Choose ${label.replace(/\s*\*$/, '')}`}
          className={clsx(
            'absolute top-full z-40 mt-1.5 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-line bg-card p-3 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <DatePicker
            value={parsed?.date ?? null}
            onChange={pickDate}
            min={floor}
            className="mx-auto"
          />

          {beforeMin && minValue && (
            <p role="alert" className="mt-3 rounded-md bg-coral-light px-3 py-2 text-[12px] font-semibold leading-5 text-coral-dark">
              That is before {minLabel ?? 'the earlier date'} ({formatDateKey(minValue.slice(0, 10))},{' '}
              {formatTime12(Number(minValue.slice(11, 13)), Number(minValue.slice(14, 16)))}). Pick a later time.
            </p>
          )}

          <div className="mt-3 border-t border-line pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-bold text-ink/80">Time (IST)</span>
              {parsed && (
                <span className="text-[12px] font-semibold text-muted">{formatTime12(parsed.hour, parsed.minute)}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <select
                aria-label="Hour"
                value={hour12}
                onChange={(e) => pickTime(Number(e.target.value), period, minute)}
                className={SELECT}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="font-bold text-muted">
                :
              </span>
              <select
                aria-label="Minute"
                value={minute}
                onChange={(e) => pickTime(hour12, period, Number(e.target.value))}
                className={SELECT}
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <div role="group" aria-label="AM or PM" className="ml-auto flex overflow-hidden rounded-md border-[1.5px] border-line">
                {(['AM', 'PM'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={period === p}
                    onClick={() => pickTime(hour12, p, minute)}
                    className={clsx(
                      'min-h-10 px-3 text-[12.5px] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber',
                      period === p ? 'bg-violet text-white' : 'bg-card text-muted hover:bg-violet-light',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Common times">
              {QUICK_TIMES.map(([h, m]) => {
                const selected = parsed?.hour === h && parsed.minute === m;
                return (
                  <button
                    key={`${h}:${m}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      const t = to12h(h);
                      pickTime(t.hour12, t.period, m);
                    }}
                    className={clsx(
                      'min-h-8 rounded-full border px-2.5 text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
                      selected
                        ? 'border-violet bg-violet-light text-violet'
                        : 'border-line bg-card text-muted hover:border-amber hover:text-ink',
                    )}
                  >
                    {formatTime12(h, m)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="rounded px-1 text-[12.5px] font-bold text-muted underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="min-h-10 rounded-md bg-[linear-gradient(180deg,rgb(var(--color-coral)),rgb(var(--color-violet)))] px-5 text-[13px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
