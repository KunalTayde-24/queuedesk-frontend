'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatShortDateKey, relativeDayLabel } from '@/lib/dates';
import { sortByTokenNumberAsc } from '@/lib/queue-utils';
import { OpenDates } from '@/types/queue';
import { Token, TokenStatus } from '@/types/token';

const POLL_MS = 5000;
const MAX_DAYS = 8; // open days after today that are read each time
const MAX_GROUPS = 3;
const SHOW_WAITING = 3;
const SHOW_DONE = 3;

interface UpcomingDay {
  date: string;
  eventIds: string[];
  tokens: Token[];
}

interface Group {
  key: string;
  title: string;
  days: UpcomingDay[];
}

/** The next open dates after today (the days of upcoming events), each with its own queue. */
function useUpcoming(): { today: string; days: UpcomingDay[]; titles: Map<string, string>; loaded: boolean } {
  const [state, setState] = useState<{
    today: string;
    days: UpcomingDay[];
    titles: Map<string, string>;
    loaded: boolean;
  }>({ today: '', days: [], titles: new Map(), loaded: false });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/tokens/dates', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const open = (await res.json()) as Partial<OpenDates>;
        const today = open.today ?? '';
        const dates = (open.dates ?? []).filter((d) => d > today).slice(0, MAX_DAYS);
        const events = open.events ?? [];
        const titles = new Map(events.map((e) => [e.id, e.title] as const));
        const days = await Promise.all(
          dates.map(async (date) => {
            let tokens: Token[] = [];
            try {
              const q = await fetch(`/api/tokens/by-date?date=${encodeURIComponent(date)}`, { cache: 'no-store' });
              if (q.ok) tokens = (await q.json()) as Token[];
            } catch {
              // Keep the day listed even if its queue could not be read this time.
            }
            return { date, eventIds: events.filter((e) => e.date === date).map((e) => e.id), tokens };
          }),
        );
        if (!cancelled) setState({ today, days, titles, loaded: true });
      } catch {
        // Ignore transient network errors; the next poll will catch up.
      }
    };
    void load();
    const timer = setInterval(load, POLL_MS);
    const onShow = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onShow);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onShow);
    };
  }, []);

  return state;
}

/** One group per event (all its days together); open days with no event stay on their own. */
function groupByEvent(days: UpcomingDay[], titles: Map<string, string>): Group[] {
  const groups = new Map<string, Group>();
  for (const day of days) {
    const keys = day.eventIds.length > 0 ? day.eventIds : [`date:${day.date}`];
    for (const key of keys) {
      const group = groups.get(key) ?? {
        key,
        title: key.startsWith('date:') ? 'Open queue' : (titles.get(key) ?? 'Event'),
        days: [],
      };
      group.days.push(day);
      groups.set(key, group);
    }
  }
  return [...groups.values()].sort((a, b) => a.days[0]!.date.localeCompare(b.days[0]!.date));
}

function dayLabel(days: UpcomingDay[]): string {
  const first = days[0]!.date;
  const last = days[days.length - 1]!.date;
  return first === last ? formatShortDateKey(first) : `${formatShortDateKey(first)} – ${formatShortDateKey(last)}`;
}

export function UpcomingQueues() {
  const { today, days, titles, loaded } = useUpcoming();
  const groups = useMemo(() => groupByEvent(days, titles).slice(0, MAX_GROUPS), [days, titles]);
  if (!loaded || groups.length === 0) return null;

  return (
    <div className="relative z-10 mt-4 rounded-[18px] border border-[#F2C66D]/30 bg-black/20 p-3.5 sm:p-4">
      <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#F2C66D]">Upcoming events</p>
      <ul className={`grid list-none gap-2.5 p-0 ${groups.length >= 3 ? 'md:grid-cols-3' : groups.length === 2 ? 'md:grid-cols-2' : ''}`}>
        {groups.map((group) => {
          const totalWaiting = group.days.reduce(
            (sum, day) => sum + day.tokens.filter((t) => t.status === TokenStatus.WAITING).length,
            0,
          );
          return (
            <li key={group.key} className="min-w-0 rounded-[12px] bg-white/[0.07] p-3">
              <p className="truncate text-[14px] font-extrabold text-[#FFE3A1]">{group.title}</p>
              <p className="text-[12px] opacity-80">
                {dayLabel(group.days)} · {totalWaiting} waiting
              </p>
              <ul className={`mt-2 grid list-none gap-2 p-0 ${groups.length === 1 ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
                {group.days.map((day) => {
                  const sorted = sortByTokenNumberAsc(day.tokens);
                  const called = sorted.filter((t) => t.status === TokenStatus.CALLED).at(-1);
                  const waiting = sorted.filter((t) => t.status === TokenStatus.WAITING);
                  const done = sorted.filter((t) => t.status === TokenStatus.DONE);
                  const relative = relativeDayLabel(day.date, today);
                  return (
                    <li key={day.date} className="rounded-[10px] bg-black/15 px-2.5 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-x-2 text-[12px]">
                        <b className="text-[#FFE3A1]">
                          {formatShortDateKey(day.date)}
                          {relative ? ` · ${relative}` : ''}
                        </b>
                        <span className="opacity-85">
                          {called ? `serving #${called.tokenNumber} · ` : ''}
                          {waiting.length} waiting
                          {done.length > 0 ? ` · ${done.length} done` : ''}
                        </span>
                      </div>
                      {called && (
                        <p className="mt-1.5 rounded-[9px] bg-[#F2C66D]/25 px-2 py-1 text-[12px] font-bold text-[#FFE3A1]">
                          Now serving #{called.tokenNumber} · {called.name}
                        </p>
                      )}
                      {waiting.length === 0 ? (
                        <p className="mt-1 text-[11.5px] opacity-70">
                          {sorted.length === 0 ? 'No tokens booked yet' : 'No one is waiting'}
                        </p>
                      ) : (
                        <ul className="mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
                          {waiting.slice(0, SHOW_WAITING).map((t) => (
                            <li key={t.id} className="min-w-0 rounded-[9px] bg-[#F2C66D]/15 px-2 py-1 text-center">
                              <b className="token-number text-[15px] font-black text-[#FFE3A1]">{t.tokenNumber}</b>
                              <span className="block max-w-[5rem] truncate text-[10px] opacity-85">{t.name}</span>
                            </li>
                          ))}
                          {waiting.length > SHOW_WAITING && (
                            <li className="self-center text-[11.5px] opacity-80">+{waiting.length - SHOW_WAITING} more</li>
                          )}
                        </ul>
                      )}
                      {done.length > 0 && (
                        <p className="mt-1.5 truncate text-[11px] opacity-70">
                          Done:{' '}
                          {done
                            .slice(-SHOW_DONE)
                            .map((t) => `#${t.tokenNumber}`)
                            .join(', ')}
                          {done.length > SHOW_DONE ? ` +${done.length - SHOW_DONE} more` : ''}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
