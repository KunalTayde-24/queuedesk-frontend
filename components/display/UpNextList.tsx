import clsx from 'clsx';
import { Token } from '@/types/token';

export function UpNextList({ tokens }: { tokens: Token[] }) {
  return (
    <div className="relative z-10 rounded-[18px] border border-[#F2C66D]/30 bg-black/20 p-3.5 sm:p-4">
      <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#F2C66D]">Up next</p>
      {tokens.length === 0 ? (
        <p className="text-[13px] opacity-70">No one is waiting</p>
      ) : (
        <ul className="grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-4">
          {tokens.map((t, i) => (
            <li
              key={t.id}
              className={clsx(
                'min-w-0 rounded-[12px] px-2 py-2.5 text-center',
                i === 0 ? 'bg-[#F2C66D]/20 shadow-[inset_0_0_0_1.5px_#F2C66D]' : 'bg-white/[0.07]',
              )}
            >
              <b className="token-number block text-[28px] font-black leading-tight text-[#FFE3A1]">{t.tokenNumber}</b>
              <span className="block truncate text-[12px] opacity-85">{t.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
