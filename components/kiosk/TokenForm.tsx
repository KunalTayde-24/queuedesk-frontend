'use client';

import { FormEvent, useRef, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TicketCard } from './TicketCard';
import { apiClient } from '@/lib/api-client';
import { validateTokenForm } from '@/lib/validators';
import { clearMyToken, saveMyToken, useMyToken } from '@/lib/my-token';
import { Token, TokenStatus } from '@/types/token';

interface TokenFormProps {
  /** Live queue, used to keep the issued ticket's status and "ahead of you" count current. */
  tokens: Token[];
  waitingCount: number;
}

// How long after creating a token we trust the polled list to already contain it.
const SETTLE_MS = 15_000;

export function TokenForm({ tokens, waitingCount }: TokenFormProps) {
  const mine = useMyToken();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const seenLive = useRef(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateTokenForm(name, mobile);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const token = await apiClient.createToken({ name: name.trim(), mobile });
      seenLive.current = false;
      saveMyToken(token); // remembered in this browser, so a refresh keeps the ticket
      setName('');
      setMobile('');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (mine) {
    // Prefer the polled copy so the ticket reflects "called" / "done" live.
    const live = tokens.find((t) => t.id === mine.id);
    if (live) seenLive.current = true;
    const current: Token = live ?? {
      id: mine.id,
      date: '',
      tokenNumber: mine.tokenNumber,
      name: mine.name,
      mobile: mine.mobile,
      status: TokenStatus.WAITING,
      createdAt: mine.createdAt,
    };
    const ahead = tokens.filter(
      (t) => t.status === TokenStatus.WAITING && t.tokenNumber < mine.tokenNumber,
    ).length;
    // Removed by staff: the queue has entries but ours is not among them. Right after
    // creation the next poll may not include it yet, so allow a short settling time.
    const settled = seenLive.current || Date.now() - Date.parse(mine.createdAt) > SETTLE_MS;
    const gone = !live && tokens.length > 0 && settled;

    return (
      <div id="my-ticket" className="w-full max-w-[420px] scroll-mt-24">
        <TicketCard
          token={current}
          ahead={ahead}
          gone={gone}
          onNew={() => {
            seenLive.current = false;
            clearMyToken();
          }}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative flex w-full max-w-[420px] flex-col gap-3.5 rounded-[18px] border border-line border-t-4 border-t-violet bg-card p-5 text-ink shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-bold">Get your token</h2>
        <span className="inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-full bg-amber-light px-2.5 py-1 text-[11px] font-extrabold text-amber-dark">
          {waitingCount} in line
        </span>
      </div>
      <Input
        id="name"
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Asha Patil"
        autoComplete="name"
        maxLength={80}
      />
      <Input
        id="mobile"
        label="Mobile number (WhatsApp)"
        prefix="+91"
        value={mobile}
        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
        error={errors.mobile}
        placeholder="98765 43210"
        inputMode="numeric"
        autoComplete="tel-national"
      />
      {apiError && (
        <p role="alert" className="text-[12.5px] font-semibold leading-5 text-coral-dark">
          {apiError}
        </p>
      )}
      <Button type="submit" disabled={submitting} className="min-h-11 w-full text-[14px]">
        {submitting ? 'Getting your token…' : 'Get my token'}
      </Button>
      <p className="flex items-start gap-2 text-[12px] leading-5 text-muted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mt-[3px] flex-shrink-0 text-teal" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 4 3 11l6 2 2 6 9-15Z" />
        </svg>
        We only use your number to tell you when it&apos;s your turn.
      </p>
    </form>
  );
}
