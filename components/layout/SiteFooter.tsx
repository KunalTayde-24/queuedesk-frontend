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
            <span
              aria-hidden="true"
              className="deva flex h-9 w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(150deg,#D9412E,#B8262B)] text-[19px] leading-[1.6] text-[#F2C66D] shadow-[inset_0_0_0_2px_rgba(242,198,109,0.55)]"
            >
              ॐ
            </span>
            <span className="text-[15px] font-extrabold tracking-tight">QueueDesk</span>
          </Link>
          <p className="mt-3 max-w-[34ch] text-[13px] leading-6 text-muted">
            Skip the line, keep the calm. Get a token from your phone, watch the live board and register for temple
            festivals.
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
          <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[13px] text-muted">
            <li>Open daily</li>
            <li>All times shown in IST</li>
            <li>
              <Link href="/admin/login" className={LINK}>
                Staff sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-4 text-[12px] text-muted sm:px-5">
          <span>© {year} QueueDesk · Temple queue &amp; events</span>
          <span className="deva text-[13px] text-amber-dark" aria-hidden="true">
            ॐ शांति शांति शांति
          </span>
        </div>
      </div>
    </footer>
  );
}
