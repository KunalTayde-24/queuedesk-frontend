import { ReactNode } from 'react';

/** Small gopuram (temple tower) line icon used for empty states. */
function GopuramMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 4v4M20 8h8" />
      <path d="M19 14h10l2 5H17l2-5Z" />
      <path d="M15 19h18l2 6H13l2-6Z" />
      <path d="M11 25h26l2 7H9l2-7Z" />
      <path d="M7 32h34v10H7z" />
      <path d="M21 42v-6a3 3 0 0 1 6 0v6" />
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
        <GopuramMark />
      </div>
      <h3 className="font-serif text-[17px] font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-6 text-muted">{text}</p>
      {children && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
