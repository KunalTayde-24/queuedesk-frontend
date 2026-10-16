import { Token } from '@/types/token';

export function NowServingPanel({ current }: { current: Token | undefined }) {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 py-6 text-center" aria-live="assertive">
      <p className="flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.2em] text-[#F2C66D]">
        <span className="deva text-[22px] normal-case tracking-[0.15em]" aria-hidden="true">
          अभी सेवा में
        </span>
        Now serving
      </p>
      <p
        key={current?.id ?? 'none'}
        className={`token-number animate-called-glow text-[96px] font-black leading-none text-[#FFE3A1] [text-shadow:0_4px_0_rgba(0,0,0,0.25),0_0_50px_rgba(242,198,109,0.35)] sm:text-[150px] lg:text-[190px] ${
          current ? '' : 'opacity-40'
        }`}
      >
        {current ? current.tokenNumber : '—'}
      </p>
      <p className="max-w-full truncate px-2 text-[20px] font-extrabold sm:text-[24px]">
        {current ? current.name : 'The counter is free'}
      </p>
      <p className="text-[13px] opacity-75">
        {current ? 'Please go to the counter' : 'Please wait for your number to be called'}
      </p>
    </div>
  );
}
