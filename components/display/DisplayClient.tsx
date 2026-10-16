'use client';

import { useEffect, useRef, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';
import { countByStatus, sortByTokenNumberAsc } from '@/lib/queue-utils';
import { Token, TokenStatus } from '@/types/token';
import { NowServingPanel } from './NowServingPanel';
import { UpNextList } from './UpNextList';

const UP_NEXT_COUNT = 4;
const AVG_MIN = 5;

function Clock() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);
  return <span className="min-w-[4.5rem] text-right font-serif text-[18px] font-bold text-[#FFE3A1]">{now}</span>;
}

export function DisplayClient({ initialTokens }: { initialTokens: Token[] }) {
  const tokens = useRealtimeTokens(initialTokens);
  const boardRef = useRef<HTMLElement>(null);

  const current = sortByTokenNumberAsc(tokens.filter((t) => t.status === TokenStatus.CALLED)).at(-1);
  const waitingList = sortByTokenNumberAsc(tokens.filter((t) => t.status === TokenStatus.WAITING));
  const upNext = waitingList.slice(0, UP_NEXT_COUNT);
  const { waiting } = countByStatus(tokens);

  function toggleFullscreen() {
    const el = boardRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }

  return (
    <main className="flex-1">
      <TopBar />
      <div className="mx-auto max-w-[1080px] px-4 pb-10 pt-3 sm:px-5">
        <section
          ref={boardRef}
          aria-label="Now serving board"
          className="temple-photo relative flex min-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-[24px] p-4 text-[#FFF3DA] shadow-[inset_0_0_0_3px_rgba(242,198,109,0.55),inset_0_0_0_10px_#5E0F14,inset_0_0_0_11px_rgba(242,198,109,0.35),0_20px_40px_-18px_rgba(90,30,10,0.55)] sm:p-6 [&:fullscreen]:min-h-screen [&:fullscreen]:rounded-none"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(242,198,109,0.16),transparent_48%),linear-gradient(170deg,rgba(125,20,26,0.9),rgba(70,12,16,0.93)_60%,rgba(40,8,10,0.96))]"
          />

          <div className="relative z-10 flex items-center justify-between gap-3 px-1.5 pt-1.5">
            <div className="flex items-center gap-2.5 text-[16px] font-extrabold">
              <span
                aria-hidden="true"
                className="deva flex h-9 w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(150deg,#D9412E,#B8262B)] text-[19px] leading-[1.6] text-[#F2C66D] shadow-[inset_0_0_0_2px_rgba(242,198,109,0.55)]"
              >
                ॐ
              </span>
              QueueDesk
            </div>
            <div className="flex items-center gap-2">
              <Clock />
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Toggle full screen"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#F2C66D]/40 bg-white/10 text-[#FFF3DA] transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C66D]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                </svg>
              </button>
            </div>
          </div>

          <NowServingPanel current={current} />
          <UpNextList tokens={upNext} />

          <div className="relative z-10 mt-4 flex flex-wrap justify-between gap-x-4 gap-y-1 px-1.5 text-[12px] opacity-80">
            <span>
              {waiting} waiting · ~{waiting * AVG_MIN} min
            </span>
            <span>Get your token at the entrance desk or on this website · You&apos;ll get a WhatsApp message when it&apos;s your turn</span>
          </div>
        </section>
      </div>
    </main>
  );
}
