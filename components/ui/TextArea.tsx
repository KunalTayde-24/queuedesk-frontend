import clsx from 'clsx';
import { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className, id, ...rest }: TextAreaProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[12px] font-bold leading-4 text-ink/80">
          {label}
        </label>
      )}
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={clsx(
          'min-h-28 w-full resize-y rounded-md border-[1.5px] border-line bg-input px-3 py-2 text-[13.5px] leading-6 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-amber focus:bg-card focus:ring-4 focus:ring-amber/25',
          error && 'border-coral-dark',
          className,
        )}
        {...rest}
      />
      {error && (
        <span id={errorId} className="text-[12px] font-semibold leading-4 text-coral-dark">
          {error}
        </span>
      )}
    </div>
  );
}
