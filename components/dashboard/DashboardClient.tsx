'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';
import { countByStatus, filterTokens, FilterTab, sortByTokenNumberDesc } from '@/lib/queue-utils';
import { playChime, unlockAudio } from '@/lib/chime';
import { useToast } from '@/components/ui/Toast';
import { StatsBar } from './StatsBar';
import { SearchFilterBar } from './SearchFilterBar';
import { AddWalkInForm } from './AddWalkInForm';
import { QueueTable } from './QueueTable';
import { RecentlyServedStrip } from './RecentlyServedStrip';
import { LogoutButton } from './LogoutButton';
import { SoundToggle } from './SoundToggle';
import { Token, TokenStatus } from '@/types/token';

const RECENT_SERVED_COUNT = 6;
const SOUND_KEY = 'qd-admin-sound';

export function DashboardClient({ initialTokens }: { initialTokens: Token[] }) {
  const tokens = useRealtimeTokens(initialTokens);
  const { show } = useToast();
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

  // Tokens already on screen at load are not "new"; only ones that arrive afterwards are.
  const knownIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (knownIds.current === null) {
      knownIds.current = new Set(tokens.map((t) => t.id));
      return;
    }
    const known = knownIds.current;
    const fresh = tokens.filter((t) => !known.has(t.id));
    const latest = fresh[fresh.length - 1];
    if (!latest) return;
    fresh.forEach((t) => known.add(t.id));
    if (soundOn) playChime();
    show(
      fresh.length === 1
        ? `New token #${latest.tokenNumber} · ${latest.name}`
        : `${fresh.length} new tokens, latest #${latest.tokenNumber} · ${latest.name}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens]);

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
            <span className="deva" aria-hidden="true">
              आज
            </span>
            Today
          </span>
          <h1 className="text-[24px] font-bold text-ink">Today&apos;s queue</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatsBar waiting={stats.waiting} called={stats.called} served={stats.served} />
          <SoundToggle on={soundOn} onToggle={toggleSound} />
          <LogoutButton />
        </div>
      </div>

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
          <AddWalkInForm onDone={() => setWalkinOpen(false)} />
        </div>
      )}

      <QueueTable tokens={filtered} />
    </div>
  );
}
