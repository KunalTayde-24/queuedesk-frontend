'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';
import { countByStatus, filterTokens, FilterTab, sortByTokenNumberDesc } from '@/lib/queue-utils';
import { playChime, unlockAudio } from '@/lib/chime';
import { apiClient } from '@/lib/api-client';
import { formatDateKey, todayKey } from '@/lib/dates';
import { useToast } from '@/components/ui/Toast';
import { StatsBar } from './StatsBar';
import { SearchFilterBar } from './SearchFilterBar';
import { AddWalkInForm } from './AddWalkInForm';
import { QueueTable } from './QueueTable';
import { QueueDateBar } from './QueueDateBar';
import { RecentlyServedStrip } from './RecentlyServedStrip';
import { LogoutButton } from './LogoutButton';
import { SoundToggle } from './SoundToggle';
import { AdminQueueDays } from '@/types/queue';
import { EventSummary } from '@/types/event';
import { queuesForDate } from '@/lib/queues';
import { Token, TokenStatus } from '@/types/token';

const RECENT_SERVED_COUNT = 6;
const SOUND_KEY = 'qd-admin-sound';
// A token counts as "new" (sound + toast) only if it was taken in the last half minute.
const NEW_TOKEN_WINDOW_MS = 30_000;

export function DashboardClient({
  initialTokens,
  initialDays,
  events,
}: {
  initialTokens: Token[];
  initialDays: AdminQueueDays;
  /** Every event (the published ones with a queue appear as queues even while closed and empty). */
  events: EventSummary[];
}) {
  const { show } = useToast();
  const today = initialDays.today || todayKey();
  const [date, setDate] = useState(today);
  const [days, setDays] = useState(initialDays.days);
  const [dayBusy, setDayBusy] = useState(false);

  // Every event has its own queue: pick which one to work on ("all" lists them together).
  const [pick, setPick] = useState('');
  const queues = useMemo(() => queuesForDate(date, days, events), [date, days, events]);
  const selected = pick === 'all' ? null : (queues.find((q) => q.key === pick) ?? queues[0] ?? null);
  const selectedKey = pick === 'all' ? 'all' : (selected?.key ?? '');

  const polled = useRealtimeTokens(
    initialTokens,
    `/api/admin/queue?date=${date}${selected?.eventId ? `&eventId=${selected.eventId}` : ''}`,
  );
  // Right after switching dates or queues the list still holds the previous one for a moment; hide it.
  const tokens = useMemo(
    () =>
      polled.filter(
        (t) =>
          t.date.slice(0, 10) === date && (!selected || (t.eventId ?? null) === selected.eventId),
      ),
    [polled, date, selected],
  );

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [walkinOpen, setWalkinOpen] = useState(false);

  // New-token alert: sound is on by default and remembered per browser.
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem(SOUND_KEY) === 'off') setSoundOn(false);
    } catch {
      // storage blocked: keep the default
    }
    // Browsers need one tap/click on the page before they allow sound.
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {
      // ignore
    }
    if (next) playChime(); // preview, and a click that unlocks audio
  }

  const knownIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const known = knownIds.current;
    const fresh = tokens.filter((t) => !known.has(t.id));
    fresh.forEach((t) => known.add(t.id));
    const recent = fresh.filter((t) => Date.now() - Date.parse(t.createdAt) < NEW_TOKEN_WINDOW_MS);
    const latest = recent[recent.length - 1];
    if (!latest) return;
    if (soundOn) playChime();
    show(
      recent.length === 1
        ? `New token #${latest.tokenNumber} · ${latest.name}`
        : `${recent.length} new tokens, latest #${latest.tokenNumber} · ${latest.name}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens]);

  async function toggleOpen() {
    if (!selected?.eventId) return;
    const { eventId, open: isOpen, title } = selected;
    setDayBusy(true);
    try {
      if (isOpen) await apiClient.closeQueueDay(eventId, date);
      else await apiClient.openQueueDay(eventId, date);
      const fresh = await apiClient.listQueueDays();
      setDays(fresh.days);
      show(
        isOpen
          ? `Closed ${title} on ${formatDateKey(date)}. Visitors can no longer pick it.`
          : `Opened ${title} on ${formatDateKey(date)}. Visitors can now pick it.`,
      );
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not change that date', 'error');
    } finally {
      setDayBusy(false);
    }
  }

  const stats = useMemo(() => countByStatus(tokens), [tokens]);

  const filtered = useMemo(
    () => sortByTokenNumberDesc(filterTokens(tokens, { status: activeTab, search })),
    [tokens, activeTab, search],
  );

  const recentlyServed = useMemo(
    () =>
      sortByTokenNumberDesc(tokens.filter((t) => t.status === TokenStatus.DONE)).slice(
        0,
        RECENT_SERVED_COUNT,
      ),
    [tokens],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
        <div>
          <span className="eyebrow">
            <span className="cn" aria-hidden="true">
              今日
            </span>
            Queue
          </span>
          <h1 className="text-[24px] font-bold text-ink">
            {date === today ? "Today's queue" : `Queue for ${formatDateKey(date)}`}
            {selected ? ` · ${selected.title}` : ''}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatsBar waiting={stats.waiting} called={stats.called} served={stats.served} />
          <SoundToggle on={soundOn} onToggle={toggleSound} />
          <LogoutButton />
        </div>
      </div>

      <QueueDateBar
        date={date}
        today={today}
        days={days}
        queues={queues}
        selectedKey={selectedKey}
        onPickQueue={(key) => {
          setPick(key);
          setWalkinOpen(false);
        }}
        busy={dayBusy}
        onSelect={(next) => {
          setDate(next);
          setPick('');
          setWalkinOpen(false);
        }}
        onToggleOpen={() => void toggleOpen()}
      />

      <RecentlyServedStrip tokens={recentlyServed} />

      <div className="mb-3.5">
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onToggleWalkin={() => setWalkinOpen((o) => !o)}
        />
      </div>

      {walkinOpen && (
        <div className="mb-3.5">
          <AddWalkInForm
            date={date}
            eventId={selected?.eventId ?? null}
            eventTitle={selected?.title ?? null}
            queueOpen={Boolean(selected?.open)}
            onDone={() => setWalkinOpen(false)}
          />
        </div>
      )}

      <QueueTable tokens={filtered} showEvent={!selected} />
    </div>
  );
}
