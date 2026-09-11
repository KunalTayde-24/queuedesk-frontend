import { Token } from '@/types/token';

export function NowServingPanel({ current }: { current: Token | undefined }) {
  return (
    <div className="relative flex flex-col items-center gap-1 text-center">
      <p className="text-[13px] font-bold tracking-[2px] text-[#C9BCF2]">NOW SERVING</p>
      <p
        key={current?.id ?? 'none'}
        className="token-number animate-called-glow text-[56px] font-bold leading-none text-amber [text-shadow:0_8px_28px_rgba(245,166,35,0.35)] sm:text-[80px] lg:text-[104px]"
      >
        {current ? current.tokenNumber : '—'}
      </p>
      <p className="mt-2.5 text-[16px] font-semibold text-[#E9E2FA]">
        {current ? current.name : 'Waiting for the first call'}
      </p>
    </div>
  );
}
