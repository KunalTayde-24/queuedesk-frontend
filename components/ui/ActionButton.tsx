'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type ActionKind = 'call' | 'recall' | 'skip' | 'done' | 'del';

const KIND_CLASSES: Record<ActionKind, string> = {
  call: 'border-violet bg-violet text-white shadow-[0_6px_14px_-8px_rgba(184,38,43,0.9)] hover:bg-violet-dark hover:border-violet-dark',
  recall: 'border-line text-ink hover:border-amber hover:bg-amber-light',
  skip: 'border-line text-ink hover:border-amber hover:bg-amber-light',
  done: 'border-teal bg-teal text-white hover:brightness-110',
  // Fixed (non-theme-reactive) hover fill: this is a destructive action, so
  // it stays a solid red in both light and dark mode.
  del: 'border-line text-violet hover:border-[#B8262B] hover:bg-[#B8262B] hover:text-white',
};

// Call is the main action on a busy counter, so it is the largest touch target;
// the rest are still comfortably tappable (36px high).
const SIZE_CLASSES: Record<ActionKind, string> = {
  call: 'min-h-11 px-5 text-[14px]',
  recall: 'min-h-9 px-3 text-[12.5px]',
  skip: 'min-h-9 px-3 text-[12.5px]',
  done: 'min-h-11 px-5 text-[14px]',
  del: 'min-h-9 px-3 text-[12.5px]',
};

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind: ActionKind;
  icon?: ReactNode;
}

export function ActionButton({ kind, icon, className, disabled, children, ...rest }: ActionButtonProps) {
  const large = kind === 'call' || kind === 'done';
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-[1.5px] bg-card font-extrabold leading-4 transition-all active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        SIZE_CLASSES[kind],
        KIND_CLASSES[kind],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {icon && (
        <svg
          width={large ? 16 : 13}
          height={large ? 16 : 13}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="flex-shrink-0"
        >
          {icon}
        </svg>
      )}
      {children}
    </button>
  );
}
