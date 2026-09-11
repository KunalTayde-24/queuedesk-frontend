'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const NAV = [
  {
    href: '/',
    label: 'Customer kiosk',
    match: (p: string) => p === '/',
    icon: (
      <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5Zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5Z" />
    ),
  },
  {
    href: '/display',
    label: 'Now serving',
    match: (p: string) => p.startsWith('/display'),
    icon: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
  },
  {
    href: '/admin/login',
    label: 'Admin',
    match: (p: string) => p.startsWith('/admin'),
    icon: (
      <>
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
];

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    );
  }, []);

  return (
    <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-5 pb-0 pt-5">
      <div
        className={clsx(
          'flex flex-1 flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white/70 p-2.5 shadow-sm backdrop-blur-md',
        )}
      >
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Go back"
            onClick={() => router.back()}
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-violet-soft hover:text-violet-dark',
              FOCUS_RING,
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Go forward"
            onClick={() => router.forward()}
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-violet-soft hover:text-violet-dark',
              FOCUS_RING,
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <div className="ml-1.5 flex items-center gap-2.5">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-[linear-gradient(155deg,theme(colors.violet.DEFAULT),#8A6AF0)] font-serif text-base font-bold text-white shadow-[0_4px_10px_rgba(108,79,224,0.35)]">
              Q
            </div>
            <div>
              <div className="text-[15.5px] font-extrabold tracking-tight">QueueDesk</div>
              <div className="text-[11.5px] font-semibold text-muted">{today}</div>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 rounded-[11px] bg-violet-soft p-1">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold transition-colors',
                  FOCUS_RING,
                  active
                    ? 'bg-violet text-white shadow-[0_3px_8px_rgba(108,79,224,0.35)]'
                    : 'text-muted hover:bg-white hover:text-violet-dark',
                )}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="flex-shrink-0"
                >
                  {item.icon}
                </svg>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
