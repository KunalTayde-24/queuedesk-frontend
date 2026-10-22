'use client';

import { TempleLogo } from '@/components/brand/TempleLogo';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useMyToken } from '@/lib/my-token';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  {
    href: '/',
    label: 'Home',
    match: (p: string) => p === '/',
    icon: (
      <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5Zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5Z" />
    ),
  },
  {
    href: '/events',
    label: 'Events',
    match: (p: string) => p.startsWith('/events'),
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [today, setToday] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const myToken = useMyToken();

  // Re-check on every navigation, so the tab appears right after sign-in and
  // disappears right after log-out.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled) setSignedIn(Boolean(data.authenticated));
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Visitors never see an admin link on public pages. It shows once you are
  // signed in (on any page, so you can always get back), or while you are on
  // an /admin page such as the login form.
  const onAdminPage = pathname.startsWith('/admin');
  // On admin pages the public tabs (Home, Events, Now serving) are hidden.
  const visibleNav = NAV.filter((item) =>
    onAdminPage ? item.href === '/admin/login' : item.href !== '/admin/login' || signedIn,
  ).map((item) =>
    item.href === '/admin/login' && signedIn ? { ...item, href: '/admin/dashboard' } : item,
  );

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    );
  }, []);

  return (
    <header className="sticky top-0 z-30 mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-4 pb-0 pt-3 sm:px-5">
      <div
        className={clsx(
          'flex flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-line bg-card/85 p-2 shadow-card backdrop-blur-md',
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            aria-label="Go back"
            onClick={() => router.back()}
            className={clsx(
              'hidden h-8 w-8 items-center justify-center rounded-lg text-muted sm:flex transition-colors hover:bg-violet-soft hover:text-violet-dark',
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
              'hidden h-8 w-8 items-center justify-center rounded-lg text-muted sm:flex transition-colors hover:bg-violet-soft hover:text-violet-dark',
              FOCUS_RING,
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <Link href="/" className={clsx('flex min-w-0 items-center gap-2.5 rounded-lg sm:ml-1.5', FOCUS_RING)}>
            <TempleLogo className="h-12" />
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight">QueueDesk</span>
              <span className="block min-h-[15px] text-[11px] font-semibold text-muted">{today}</span>
            </span>
          </Link>
        </div>

        <nav
          aria-label="Main"
          className="order-3 flex w-full gap-1 rounded-xl bg-violet-soft p-1 sm:order-none sm:w-auto"
        >
          {visibleNav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex min-h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-bold leading-5 transition-colors sm:flex-none',
                  FOCUS_RING,
                  active
                    ? 'bg-violet text-white shadow-[0_4px_10px_-3px_rgba(184,38,43,0.6)]'
                    : 'text-muted hover:bg-card hover:text-violet-dark',
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

        <div className="flex items-center gap-1.5">
          {myToken && !onAdminPage && (
            <Link
              href="/#my-ticket"
              aria-label={`My token, number ${myToken.tokenNumber}`}
              className={clsx(
                "flex h-9 items-center gap-1.5 rounded-lg bg-amber-light px-2.5 text-[12px] font-extrabold text-amber-dark transition-colors hover:bg-amber/30",
                FOCUS_RING,
              )}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3v2Z" />
                <path d="M13 6v12" strokeDasharray="2 2" />
              </svg>
              <span className="hidden min-[430px]:inline">My token</span>
              <span className="font-serif text-[13px]">#{myToken.tokenNumber}</span>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
