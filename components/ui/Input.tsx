import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[11.5px] font-bold tracking-wide text-ink/75">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'rounded-md border-[1.5px] border-line bg-input px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-violet focus:bg-card focus:ring-4 focus:ring-violet-light',
          error && 'border-coral-dark',
          className,
        )}
        {...rest}
      />
      {error && <span className="text-[11.5px] font-semibold text-coral-dark">{error}</span>}
    </div>
  );
}
