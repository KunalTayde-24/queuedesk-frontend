'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const ITEMS = [
  {
    href: '/admin/dashboard',
    label: 'Queue',
    match: (path: string) => path === '/admin/dashboard',
  },
  {
    href: '/admin/dashboard/events',
    label: 'Events',
    match: (path: string) => path.startsWith('/admin/dashboard/events'),
  },
];

export function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="mb-5 flex w-full flex-wrap gap-1 rounded-xl bg-violet-soft p-1">
      {ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'inline-flex min-h-10 flex-1 items-center justify-center rounded-lg px-4 text-[12.5px] font-bold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:flex-none',
              active
                ? 'bg-violet text-white shadow-[0_4px_10px_-3px_rgba(184,38,43,0.6)]'
                : 'text-muted hover:bg-card hover:text-violet-dark',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
