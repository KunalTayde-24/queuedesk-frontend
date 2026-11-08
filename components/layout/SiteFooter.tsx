import { TempleLogo } from '@/components/brand/TempleLogo';
import Link from 'next/link';

const LINK =
  'inline-flex min-h-8 items-center text-[13px] text-muted transition-colors hover:text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded';

const EXPLORE = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/display', label: 'Now serving' },
];

const VISITORS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#upcoming-heading', label: 'Upcoming events' },
  { href: '/about', label: 'About & contact' },
  { href: '/terms', label: 'Terms & Conditions' },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-line bg-violet-soft print:hidden">
      {/* gold ornament sitting on the top edge */}
      <div aria-hidden="true" className="absolute inset-x-0 -top-px flex items-center justify-center">
        <span className="h-px w-full max-w-[1080px] bg-gradient-to-r from-transparent via-amber to-transparent" />
        <span className="absolute h-2.5 w-2.5 rotate-45 bg-amber ring-4 ring-[rgb(var(--color-violet-soft))]" />
      </div>

      <div className="mx-auto grid max-w-[1080px] gap-8 px-4 pb-6 pt-12 sm:px-5 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="min-w-0">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber">
            <TempleLogo className="h-[72px]" />
          </Link>
          <p className="mt-3 max-w-[34ch] text-[13px] leading-6 text-muted">
            Skip the line, keep the calm. Get a token from your phone, watch the live board and see temple
            events.
          </p>
        </div>

        <nav aria-label="Explore">
          <h2 className="mb-2 font-sans text-[11px] font-extrabold uppercase tracking-[0.1em] text-violet">Explore</h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="For visitors">
          <h2 className="mb-2 font-sans text-[11px] font-extrabold uppercase tracking-[0.1em] text-violet">Visitors</h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {VISITORS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-2 font-sans text-[11px] font-extrabold uppercase tracking-[0.1em] text-violet">Temple</h2>
          <ul className="m-0 flex list-none flex-col p-0 text-[13px] text-muted">
            <li className="inline-flex min-h-8 items-center font-bold text-ink">Ci Lei Gong Ltd</li>
            <li className="leading-6">UEN: 202557151C</li>
            <li>
              <address className="not-italic leading-6">
                50 Gambas Cresent, 10-44B,
                <br />
                Singapore 757022
              </address>
            </li>
            <li className="mt-2 leading-6">All times shown in Singapore time (SGT)</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-4 text-[12px] text-muted sm:px-5">
          <span>© {year} Ci Lei Gong Ltd · QueueDesk temple queue &amp; events</span>
          <span className="cn text-[13px] text-amber-dark" aria-hidden="true">
            平安
          </span>
        </div>
      </div>
    </footer>
  );
}
