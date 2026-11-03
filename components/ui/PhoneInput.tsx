import clsx from 'clsx';
import { COUNTRIES, maxNationalDigits } from '@/lib/phone';

interface PhoneInputProps {
  id: string;
  label?: string;
  /** Country code such as "+65". */
  country: string;
  /** National number, digits only. */
  national: string;
  onChange: (value: { country: string; national: string }) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

/** Country-code picker (Singapore +65 by default) joined to a digits-only number field. */
export function PhoneInput({ id, label, country, national, onChange, error, placeholder, className }: PhoneInputProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[12px] font-bold leading-4 text-ink/80">
          {label}
        </label>
      )}
      <div className="flex items-stretch">
        <select
          aria-label="Country code"
          value={country}
          onChange={(e) => {
            const next = e.target.value;
            onChange({ country: next, national: national.slice(0, maxNationalDigits(next)) });
          }}
          className={clsx(
            'min-h-10 rounded-l-md border-[1.5px] border-r-0 border-line bg-violet-soft px-2 text-[13px] font-extrabold text-muted outline-none transition-colors focus:border-amber focus:ring-4 focus:ring-amber/25',
            error && 'border-coral-dark',
          )}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.short} {c.code}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={national}
          onChange={(e) => onChange({ country, national: e.target.value.replace(/\D/g, '').slice(0, maxNationalDigits(country)) })}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={clsx(
            'min-h-10 w-full min-w-0 rounded-r-md border-[1.5px] border-line bg-input px-3 py-2 text-[13.5px] leading-5 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-amber focus:bg-card focus:ring-4 focus:ring-amber/25',
            error && 'border-coral-dark',
            className,
          )}
        />
      </div>
      {error && (
        <span id={errorId} className="text-[12px] font-semibold leading-4 text-coral-dark">
          {error}
        </span>
      )}
    </div>
  );
}
