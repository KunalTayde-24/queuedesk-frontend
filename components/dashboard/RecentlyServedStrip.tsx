import { Token } from '@/types/token';

export function RecentlyServedStrip({ tokens }: { tokens: Token[] }) {
  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-xl border border-line bg-card px-3.5 py-3 shadow-sm">
      <span className="flex items-center gap-1.5 whitespace-nowrap text-[10.5px] font-bold tracking-wide text-muted">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5M12 7v5l4 2" />
        </svg>
        RECENTLY SERVED
      </span>
      {tokens.length === 0 ? (
        <span className="text-[11.5px] text-[#B0A8CC]">Nothing served yet today</span>
      ) : (
        tokens.map((t) => (
          <span
            key={t.id}
            className="flex-shrink-0 whitespace-nowrap rounded-full border border-[#B7E9D0] bg-teal-light px-3 py-1 text-xs font-bold text-teal-dark"
          >
            #{t.tokenNumber} {t.name}
          </span>
        ))
      )}
    </div>
  );
}
