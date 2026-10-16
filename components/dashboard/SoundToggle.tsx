'use client';

import clsx from 'clsx';

export function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      title={on ? 'New-token sound is on' : 'New-token sound is off'}
      className={clsx(
        'flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border-[1.5px] px-3 text-[12.5px] font-bold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        on ? 'border-amber bg-amber-light text-amber-dark' : 'border-line bg-card text-muted hover:border-amber',
      )}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {on ? (
          <>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </>
        ) : (
          <>
            <path d="M6 8a6 6 0 0 1 9.3-5M18 8c0 4 1.2 6 2 7M3 16s3-1 3-8" />
            <path d="M10 21a2 2 0 0 0 4 0M3 3l18 18" />
          </>
        )}
      </svg>
      Sound {on ? 'on' : 'off'}
    </button>
  );
}
