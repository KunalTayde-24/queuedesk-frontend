'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type ActionKind = 'call' | 'recall' | 'skip' | 'done' | 'del';

const KIND_CLASSES: Record<ActionKind, string> = {
  call: 'border-teal text-teal-dark hover:bg-teal hover:text-white hover:border-teal',
  recall: 'border-coral text-coral-dark hover:bg-coral hover:text-white',
  skip: 'border-amber text-amber-dark hover:bg-amber hover:text-white',
  done: 'border-violet text-violet hover:bg-violet hover:text-white',
  // Fixed (non-theme-reactive) hover fill: this is a destructive action, so
  // it should stay a solid coral-red regardless of light/dark mode, the
  // same way the delete-confirmation button does.
  del: 'border-line text-muted hover:border-[#D6472A] hover:bg-[#D6472A] hover:text-white',
};

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind: ActionKind;
  icon?: ReactNode;
}

export function ActionButton({ kind, icon, className, disabled, children, ...rest }: ActionButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md border-[1.5px] bg-card px-2.5 py-1.5 text-[11px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        KIND_CLASSES[kind],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {icon && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          {icon}
        </svg>
      )}
      {children}
    </button>
  );
}
