import clsx from 'clsx';
import { Token, TokenStatus } from '@/types/token';

const AVG_MIN = 5;

interface TicketCardProps {
  token: Token;
  ahead: number;
  /** True when the token is no longer in today's queue (e.g. removed by staff). */
  gone?: boolean;
  onNew?: () => void;
}

function statusLine(status: TokenStatus, ahead: number) {
  if (status === TokenStatus.CALLED) return "It's your turn! Please go to the counter.";
  if (status === TokenStatus.DONE) return 'All done. Thank you for visiting · धन्यवाद';
  if (ahead === 0) return "You're next. Please stay close to the counter.";
  return `You're in line · ${ahead} ahead of you`;
}

export function TicketCard({ token, ahead, gone = false, onNew }: TicketCardProps) {
  if (gone) {
    return (
      <div className="w-full max-w-[420px] rounded-[18px] border border-line bg-card p-5 text-ink shadow-card">
        <h2 className="text-[17px] font-bold">Your token is no longer in today&apos;s queue</h2>
        <p className="mt-1 text-[13px] text-muted">Please check with the front desk.</p>
        {onNew && (
          <button
            type="button"
            onClick={onNew}
            className="mt-4 inline-flex min-h-10 items-center rounded-md bg-violet px-4 text-[13px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2"
          >
            Get a new token
          </button>
        )}
      </div>
    );
  }

  const waiting = token.status === TokenStatus.WAITING;
  const called = token.status === TokenStatus.CALLED;

  return (
    <div
      role="status"
      className="print-ticket relative w-full max-w-[420px] animate-popIn rounded-[20px] bg-[radial-gradient(circle_at_85%_10%,rgba(242,198,109,0.35),transparent_40%),linear-gradient(160deg,#C9302C,#9C1D22)] p-5 pb-4 text-[#FFF6E3] shadow-[inset_0_0_0_2px_rgba(242,198,109,0.7),inset_0_0_0_7px_#9C1D22,inset_0_0_0_8px_rgba(242,198,109,0.45),0_20px_40px_-18px_rgba(156,29,34,0.9)] sm:p-6"
    >
      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.08em] opacity-90">
        <span className="deva text-[22px] normal-case leading-[1.6] tracking-normal text-[#F7D27E]" aria-hidden="true">
          ॐ
        </span>
        <span>Your token</span>
      </div>
      <p className="token-number my-1 text-center text-[72px] font-black leading-none text-[#FFE3A1] [text-shadow:0_3px_0_rgba(0,0,0,0.2)] sm:text-[84px]">
        {token.tokenNumber}
      </p>
      <p className="truncate text-center text-[14px] font-bold opacity-90">{token.name}</p>
      <p
        className={clsx(
          'my-3.5 rounded-xl px-3 py-2.5 text-center text-[13px] font-extrabold leading-5',
          called ? 'animate-pulseRing bg-[#FFE3A1] text-[#7A1418]' : 'bg-black/20',
        )}
      >
        {statusLine(token.status, ahead)}
      </p>
      <dl className="grid grid-cols-3 gap-2 border-t-[1.5px] border-dashed border-[#F2C66D]/55 pt-3.5 text-center">
        <div>
          <dd className="text-[15px] font-bold leading-5">{waiting ? ahead : '—'}</dd>
          <dt className="text-[11px] font-semibold opacity-80">ahead of you</dt>
        </div>
        <div>
          <dd className="text-[15px] font-bold leading-5">{!waiting ? '—' : ahead ? `~${ahead * AVG_MIN} min` : 'Next'}</dd>
          <dt className="text-[11px] font-semibold opacity-80">est. wait</dt>
        </div>
        <div>
          <dd className="text-[15px] font-bold leading-5">••{token.mobile.slice(-4)}</dd>
          <dt className="text-[11px] font-semibold opacity-80">WhatsApp</dt>
        </div>
      </dl>
      <div className="mt-4 flex gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-[#F2C66D]/50 bg-white/10 text-[13px] font-bold text-[#FFF6E3] transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C66D]"
        >
          Print
        </button>
        {onNew && (
          <button
            type="button"
            onClick={onNew}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md bg-[linear-gradient(180deg,#F2C66D,#D9A441)] text-[13px] font-bold text-[#3B2506] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C66D]"
          >
            New token
          </button>
        )}
      </div>
    </div>
  );
}
