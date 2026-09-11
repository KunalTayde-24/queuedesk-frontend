import { Token } from '@/types/token';

export function UpNextList({ tokens }: { tokens: Token[] }) {
  return (
    <div className="relative mt-9 w-full max-w-[290px] border-t border-dashed border-[#6552A8] pt-6">
      <p className="mb-3 text-center text-[11px] font-bold tracking-[1px] text-[#C9BCF2]">
        UP NEXT
      </p>
      {tokens.length === 0 ? (
        <p className="text-center text-xs text-[#C9BCF2]">No one waiting</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tokens.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-[11px] border border-[#6552A8] bg-white/[0.07] px-[18px] py-2.5"
            >
              <span className="token-number text-[18px] font-bold text-pink">
                {t.tokenNumber}
              </span>
              <span className="text-[13px] font-semibold text-[#E9E2FA]">{t.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
