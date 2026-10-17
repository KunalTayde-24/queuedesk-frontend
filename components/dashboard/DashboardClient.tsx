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
import { Token, TokenStatus } from '@/types/token';

const RECENT_SERVED_COUNT = 6;
const SOUND_KEY = 'qd-admin-sound';
// A token counts as "new" (sound + toast) only if it was taken in the last half minute.
const NEW_TOKEN_WINDOW_MS = 30_000;

export function DashboardClient({
  initialTokens,
  initialDays,
}: {
  initialTokens: Token[];
  initialDays: AdminQueueDays;
}) {
  const { show } = useToast();
  const today = initialDays.today || todayKey();
  const [date, setDate] = useState(today);
  const [days, setDays] = useState(initialDays.days);
  const [dayBusy, setDayBusy] = useState(false);

  const polled = useRealtimeTokens(initialTokens, `/api/admin/queue?date=${date}`);
  // Right after switching dates the list still holds the previous date for a moment; hide it.
  const tokens = useMemo(() => polled.filter((t) => t.date.slice(0, 10) === date), [polled, date]);

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
    const isOpen = days.some((d) => d.date === date && d.open);
    setDayBusy(true);
    try {
      if (isOpen) await apiClient.closeQueueDay(date);
      else await apiClient.openQueueDay(date);
      const fresh = await apiClient.listQueueDays();
      setDays(fresh.days);
      show(
        isOpen
          ? `Closed ${formatDateKey(date)}. Visitors can no longer pick it.`
          : `Opened ${formatDateKey(date)}. Visitors can now pick it.`,
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
        busy={dayBusy}
        onSelect={(next) => {
          setDate(next);
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
          <AddWalkInForm date={date} onDone={() => setWalkinOpen(false)} />
        </div>
      )}

      <QueueTable tokens={filtered} />
    </div>
  );
}
