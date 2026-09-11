import { Token } from '@/types/token';

export function TicketCard({ token, ahead }: { token: Token; ahead: number }) {
  return (
    <div
      key={token.id}
      className="relative w-full max-w-[260px] animate-popIn overflow-hidden rounded-card bg-[linear-gradient(160deg,theme(colors.violet.dark),#3A2A82)] p-7 text-center text-white shadow-lg"
    >
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_70%)]" />
      <p className="text-[10.5px] font-bold tracking-[1.4px] text-[#C9BCF2]">TOKEN NUMBER</p>
      <p className="token-number my-1 text-[58px] font-bold leading-none text-amber">
        {token.tokenNumber}
      </p>
      <p className="text-[13.5px] font-semibold text-[#E9E2FA]">{token.name}</p>
      <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#7C67C2] to-transparent" />
      <p className="text-xs text-[#C9BCF2]">
        {ahead === 0
          ? "You're next in line"
          : `${ahead} ${ahead === 1 ? 'person' : 'people'} ahead of you`}
      </p>
    </div>
  );
}
