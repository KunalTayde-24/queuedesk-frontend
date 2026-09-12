'use client';

import { TopBar } from '@/components/layout/TopBar';
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';
import { sortByTokenNumberAsc } from '@/lib/queue-utils';
import { Token, TokenStatus } from '@/types/token';
import { NowServingPanel } from './NowServingPanel';
import { UpNextList } from './UpNextList';

const UP_NEXT_COUNT = 4;

export function DisplayClient({ initialTokens }: { initialTokens: Token[] }) {
  const tokens = useRealtimeTokens(initialTokens);

  const current = sortByTokenNumberAsc(
    tokens.filter((t) => t.status === TokenStatus.CALLED),
  ).at(-1);

  const upNext = sortByTokenNumberAsc(
    tokens.filter((t) => t.status === TokenStatus.WAITING),
  ).slice(0, UP_NEXT_COUNT);

  return (
    <main className="min-h-screen">
      <TopBar />
      <div className="flex justify-center px-5 pb-16 pt-4">
        <div className="relative w-full max-w-[560px] overflow-hidden rounded-card bg-[linear-gradient(165deg,#4E36AD,#3A2A82_60%,#2E1F6B)] px-8 py-12 text-center shadow-lg">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_70%)]" />
          <NowServingPanel current={current} />
          <UpNextList tokens={upNext} />
        </div>
      </div>
    </main>
  );
}
