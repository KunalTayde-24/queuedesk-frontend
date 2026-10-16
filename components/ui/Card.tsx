import clsx from 'clsx';
import { HTMLAttributes } from 'react';

// 'violet' / 'pink' are kept as accent names for existing callers; both render
// the temple red + gold top rule.
type Accent = 'violet' | 'pink' | 'none';

const ACCENT_BAR: Record<Accent, string> = {
  violet: 'bg-gradient-to-r from-violet via-amber to-violet',
  pink: 'bg-gradient-to-r from-violet to-amber',
  none: '',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: Accent;
}

export function Card({ className, accent = 'none', children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-card border border-line bg-card p-5 shadow-card sm:p-6',
        className,
      )}
      {...rest}
    >
      {accent !== 'none' && <div className={clsx('absolute inset-x-0 top-0 h-1', ACCENT_BAR[accent])} />}
      {children}
    </div>
  );
}
