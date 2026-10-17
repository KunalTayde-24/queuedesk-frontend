import { ReactNode } from 'react';

/** Small pagoda line icon used for empty states. */
function PagodaMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 3v5" />
      <path d="M16 14q6-1 8-6 2 5 8 6l-2 3H18z" />
      <path d="M19 17v5M29 17v5" />
      <path d="M12 26q9-1 12-8 3 7 12 8l-2 4H14z" />
      <path d="M17 30v5M31 30v5" />
      <path d="M8 40q12-1 16-10 4 9 16 10l-2 4H10z" />
    </svg>
  );
}

export function EmptyState({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-card border border-dashed border-amber/50 bg-[radial-gradient(circle_at_50%_0%,rgb(var(--color-amber-light)),transparent_65%)] bg-card px-5 py-10 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-light text-amber-dark ring-4 ring-amber/15">
        <PagodaMark />
      </div>
      <h3 className="font-serif text-[17px] font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-6 text-muted">{text}</p>
      {children && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
