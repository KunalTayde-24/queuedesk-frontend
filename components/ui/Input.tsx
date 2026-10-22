import clsx from 'clsx';
import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Fixed prefix shown inside the field, e.g. "+91". */
  prefix?: string;
  /** Element rendered inside the right edge of the field, e.g. a show/hide button. */
  endAdornment?: ReactNode;
}

export function Input({ label, error, prefix, endAdornment, className, id, ...rest }: InputProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  const input = (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
      className={clsx(
        'min-h-10 w-full border-[1.5px] border-line bg-input px-3 py-2 text-[13.5px] leading-5 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-amber focus:bg-card focus:ring-4 focus:ring-amber/25',
        prefix ? 'rounded-r-md border-l-0' : 'rounded-md',
        endAdornment && 'pr-11',
        error && 'border-coral-dark',
        className,
      )}
      {...rest}
    />
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[12px] font-bold leading-4 text-ink/80">
          {label}
        </label>
      )}
      {prefix ? (
        <div className="flex items-stretch">
          <span className="flex items-center rounded-l-md border-[1.5px] border-r-0 border-line bg-violet-soft px-3 text-[13px] font-extrabold text-muted">
            {prefix}
          </span>
          {input}
        </div>
      ) : endAdornment ? (
        <div className="relative">
          {input}
          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{endAdornment}</div>
        </div>
      ) : (
        input
      )}
      {error && (
        <span id={errorId} className="text-[12px] font-semibold leading-4 text-coral-dark">
          {error}
        </span>
      )}
    </div>
  );
}
