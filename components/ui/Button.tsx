'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'gold';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[linear-gradient(180deg,rgb(var(--color-coral)),rgb(var(--color-violet)))] text-white shadow-[inset_0_0_0_1px_rgba(242,198,109,0.5),0_6px_14px_-8px_rgba(184,38,43,0.8)] hover:shadow-[inset_0_0_0_1px_rgba(242,198,109,0.9),0_8px_18px_-8px_rgba(184,38,43,0.9)]',
  ghost:
    'bg-card text-ink border border-line hover:bg-violet-light hover:border-amber hover:text-violet-dark',
  gold: 'bg-[linear-gradient(180deg,#F2C66D,#D9A441)] text-[#3B2506] hover:brightness-105',
};

export function Button({ variant = 'primary', className, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-4 py-2 text-[13px] font-bold leading-5 transition-all active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        VARIANT_CLASSES[variant],
        className,
      )}
      disabled={disabled}
      {...rest}
    />
  );
}
