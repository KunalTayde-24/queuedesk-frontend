import clsx from 'clsx';
import { HTMLAttributes } from 'react';

type Accent = 'violet' | 'pink' | 'none';

const ACCENT_GRADIENT: Record<Accent, string> = {
  violet: 'from-violet via-pink to-coral',
  pink: 'from-pink to-coral',
  none: '',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: Accent;
}

export function Card({ className, accent = 'none', children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-card border border-line bg-card p-7 shadow-card',
        className,
      )}
      {...rest}
    >
      {accent !== 'none' && (
        <div className={clsx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', ACCENT_GRADIENT[accent])} />
      )}
      {children}
    </div>
  );
}
