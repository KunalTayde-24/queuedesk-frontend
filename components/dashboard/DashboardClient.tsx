'use client';

import { useMemo, useState } from 'react';
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';
import { countByStatus, filterTokens, FilterTab, sortByTokenNumberDesc } from '@/lib/queue-utils';
import { StatsBar } from './StatsBar';
import { SearchFilterBar } from './SearchFilterBar';
import { AddWalkInForm } from './AddWalkInForm';
import { QueueTable } from './QueueTable';
import { RecentlyServedStrip } from './RecentlyServedStrip';
import { LogoutButton } from './LogoutButton';
import { Token, TokenStatus } from '@/types/token';

const RECENT_SERVED_COUNT = 6;

export function DashboardClient({ initialTokens }: { initialTokens: Token[] }) {
  const tokens = useRealtimeTokens(initialTokens);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [walkinOpen, setWalkinOpen] = useState(false);

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <h2 className="text-[20px] text-violet-dark">Today&apos;s queue</h2>
        <div className="flex items-center gap-3.5">
          <StatsBar waiting={stats.waiting} called={stats.called} served={stats.served} />
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
