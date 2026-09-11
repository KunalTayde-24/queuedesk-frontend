'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[linear-gradient(155deg,theme(colors.violet.DEFAULT),#7C5BEA)] text-white shadow-[0_6px_16px_rgba(108,79,224,0.32)] hover:shadow-[0_8px_20px_rgba(108,79,224,0.42)]',
  ghost:
    'bg-card text-ink border border-line hover:bg-violet-light hover:border-violet hover:text-violet-dark',
};

export function Button({ variant = 'primary', className, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-[13.5px] font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        VARIANT_CLASSES[variant],
        className,
      )}
      disabled={disabled}
      {...rest}
    />
  );
}
