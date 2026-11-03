'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { DatePicker } from '@/components/ui/DatePicker';
import { TicketCard } from './TicketCard';
import { useRealtimeQueue } from '@/hooks/useRealtimeTokens';
import { apiClient } from '@/lib/api-client';
import { formatDateKey, relativeDayLabel, todayKey } from '@/lib/dates';
import { validateTokenForm } from '@/lib/validators';
import { DEFAULT_COUNTRY, maskMobile } from '@/lib/phone';
import { clearMyToken, saveMyToken, useMyToken } from '@/lib/my-token';
import { OpenDates, SendOtpResponse } from '@/types/queue';
import { Token, TokenStatus } from '@/types/token';

interface TokenFormProps {
  /** Today's live queue, used to keep the issued ticket's status and "ahead of you" count current. */
  tokens: Token[];
  waitingCount: number;
  /** Dates the admin has opened; visitors can only pick from these. */
  openDates: OpenDates;
  /** A date to start on (from an event page's "Take a queue token" link), used only if it is open. */
  defaultDate?: string;
}

// How long after creating a token we trust the polled list to already contain it.
const SETTLE_MS = 15_000;

const CARD =
  'relative flex w-full max-w-[420px] flex-col gap-3.5 rounded-[18px] border border-line border-t-4 border-t-violet bg-card p-5 text-ink shadow-card';

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export function TokenForm({ tokens, waitingCount, openDates, defaultDate }: TokenFormProps) {
  const mine = useMyToken();
  const today = openDates.today || todayKey();
  // If staff move the token to another date, its date and number change on the server.
  // Keep the saved ticket in step, so it keeps following the right queue.
  const mineId = mine?.id;
  const mineDate = mine?.date;
  const mineNumber = mine?.tokenNumber;
  const mineMobile = mine?.mobile;
  useEffect(() => {
    if (!mineId) return;
    let cancelled = false;
    const sync = async () => {
      try {
        const res = await fetch(`/api/tokens/${mineId}`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const server = (await res.json()) as Token;
        if (server.date.slice(0, 10) !== mineDate || server.tokenNumber !== mineNumber) {
          saveMyToken({ ...server, mobile: mineMobile ?? '' });
        }
      } catch {
        // Ignore transient network errors; the next check will catch up.
      }
    };
    void sync();
    const timer = setInterval(sync, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [mineId, mineDate, mineNumber, mineMobile]);

  // A token booked for a later date is followed on that date's own queue, so "called" shows up too.
  const { tokens: laterQueue, loaded: laterLoaded } = useRealtimeQueue(
    [],
    mine && mine.date !== today ? `/api/tokens/by-date?date=${encodeURIComponent(mine.date)}` : null,
  );
  const dateSet = useMemo(() => new Set(openDates.dates), [openDates.dates]);

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [national, setNational] = useState('');
  // Full international number, e.g. "+6591234567"; this is what is verified and stored.
  const mobile = `${country}${national}`;
  const [agreed, setAgreed] = useState(false);
  const draftLoaded = useRef(false);
  const [date, setDate] = useState(() =>
    defaultDate && openDates.dates.includes(defaultDate)
      ? defaultDate
      : openDates.dates.includes(today)
        ? today
        : (openDates.dates[0] ?? ''),
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; date?: string; terms?: string }>({});

  const [code, setCode] = useState('');
  const [otpInfo, setOtpInfo] = useState<SendOtpResponse | null>(null);
  const [resendLeft, setResendLeft] = useState(0);
  // A verified phone number stays good for a few minutes, so a failed token request can be retried.
  const [verified, setVerified] = useState<{ mobile: string; token: string } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const seenLive = useRef(false);

  // The terms open as a full page in this same tab, so keep what was typed and bring it back
  // when the visitor returns. (Kept only for this browser tab; the Terms box is never pre-ticked.)
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('qd-token-draft') ?? 'null') as {
        name?: string;
        country?: string;
        national?: string;
        date?: string;
      } | null;
      if (saved) {
        if (typeof saved.name === 'string') setName(saved.name);
        if (typeof saved.country === 'string') setCountry(saved.country);
        if (typeof saved.national === 'string') setNational(saved.national);
        if (typeof saved.date === 'string' && dateSet.has(saved.date)) setDate(saved.date);
      }
    } catch {
      // Storage can be blocked; the form just starts empty.
    }
    draftLoaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftLoaded.current) return;
    try {
      sessionStorage.setItem('qd-token-draft', JSON.stringify({ name, country, national, date }));
    } catch {
      // ignore
    }
  }, [name, country, national, date]);

  useEffect(() => {
    if (resendLeft <= 0) return;
    const id = setTimeout(() => setResendLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [resendLeft]);

  function resetForm() {
    setStep('details');
    setName('');
    setNational('');
    setAgreed(false);
    setCode('');
    setOtpInfo(null);
    setVerified(null);
    setApiError(null);
    setErrors({});
  }

  async function createWithVerification(verificationToken: string) {
    const token = await apiClient.createToken({ name: name.trim(), mobile, date, verificationToken });
    seenLive.current = false;
    saveMyToken(token); // remembered in this browser, so a refresh keeps the ticket
    try {
      sessionStorage.removeItem('qd-token-draft');
    } catch {
      // ignore
    }
    resetForm();
  }

  async function sendCode() {
    setSubmitting(true);
    setApiError(null);
    try {
      const info = await apiClient.sendOtp(mobile);
      setOtpInfo(info);
      setResendLeft(info.resendAfterSeconds);
      setCode('');
      setStep('otp');
    } catch (err) {
      setApiError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDetails(e: FormEvent) {
    e.preventDefault();
    const found: { name?: string; mobile?: string; date?: string; terms?: string } = { ...validateTokenForm(name, mobile) };
    if (!date) found.date = 'Pick a date for your token';
    if (!agreed) found.terms = 'Please agree to the Terms & Conditions to continue';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Already verified this number moments ago (e.g. the date was just full or closed): skip the code.
    if (verified && verified.mobile === mobile) {
      setSubmitting(true);
      setApiError(null);
      try {
        await createWithVerification(verified.token);
      } catch (err) {
        setApiError(errorMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }
    await sendCode();
  }

  async function handleCode(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(code)) {
      setApiError('Enter the digits from your code');
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      let proof = verified?.mobile === mobile ? verified.token : null;
      if (!proof) {
        const result = await apiClient.verifyOtp(mobile, code);
        proof = result.verificationToken;
        setVerified({ mobile, token: proof });
      }
      await createWithVerification(proof);
    } catch (err) {
      setApiError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (mine) {
    const isToday = mine.date === today;
    if (!isToday) {
      const live = laterQueue.find((t) => t.id === mine.id);
      const progressed = live && live.status !== TokenStatus.WAITING;
      // Removed by staff: that date's queue loaded and our token is not in it. Right after
      // booking, allow a short settling time first.
      const goneLater = laterLoaded && !live && Date.now() - Date.parse(mine.createdAt) > SETTLE_MS;
      const stored: Token = {
        id: mine.id,
        date: mine.date,
        tokenNumber: mine.tokenNumber,
        name: live?.name ?? mine.name,
        mobile: mine.mobile,
        status: live?.status ?? TokenStatus.WAITING,
        createdAt: mine.createdAt,
      };
      const aheadLater = live
        ? laterQueue.filter((t) => t.status === TokenStatus.WAITING && t.tokenNumber < mine.tokenNumber).length
        : 0;
      return (
        <div id="my-ticket" className="w-full max-w-[420px] scroll-mt-24">
          {/* Booked for a later date: shows the booking until staff start calling it, then the live status. */}
          <TicketCard
            token={stored}
            ahead={aheadLater}
            gone={goneLater}
            date={mine.date}
            upcoming={!progressed}
            onNew={clearMyToken}
          />
        </div>
      );
    }

    // Prefer the polled copy so the ticket reflects "called" / "done" live.
    const live = tokens.find((t) => t.id === mine.id);
    if (live) seenLive.current = true;
    const current: Token = {
      id: mine.id,
      date: mine.date,
      tokenNumber: mine.tokenNumber,
      name: live?.name ?? mine.name,
      // The public queue never carries phone numbers, so always use our own copy.
      mobile: mine.mobile,
      status: live?.status ?? TokenStatus.WAITING,
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
          date={mine.date}
          onNew={() => {
            seenLive.current = false;
            clearMyToken();
          }}
        />
      </div>
    );
  }

  if (step === 'otp') {
    const maskedMobile = maskMobile(mobile, country);
    return (
      <form onSubmit={handleCode} noValidate className={CARD}>
        <div>
          <h2 className="text-[19px] font-bold">Enter your code</h2>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            We sent a verification code to <b className="text-ink">{maskedMobile}</b>. It stays valid for{' '}
            {Math.max(1, Math.round((otpInfo?.expiresInSeconds ?? 300) / 60))} minutes.
          </p>
        </div>

        {otpInfo?.devCode && (
          <p role="note" className="rounded-md border border-dashed border-amber bg-amber-light px-3 py-2 text-[12.5px] leading-5 text-amber-dark">
            Temporary: sending the code by WhatsApp is not switched on yet, so it is shown here. Your code is{' '}
            <b className="font-serif text-[16px] tracking-[0.2em]">{otpInfo.devCode}</b>
          </p>
        )}

        <Input
          id="otp"
          label="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="••••••"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          className="text-center font-serif text-[22px] font-bold tracking-[0.4em]"
        />

        {apiError && (
          <p role="alert" className="text-[12.5px] font-semibold leading-5 text-coral-dark">
            {apiError}
          </p>
        )}

        <Button type="submit" disabled={submitting || code.length < 4} className="min-h-11 w-full text-[14px]">
          {submitting ? 'Checking…' : 'Verify & get my token'}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
          <button
            type="button"
            disabled={resendLeft > 0 || submitting}
            onClick={() => void sendCode()}
            className="rounded font-bold text-violet underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          >
            {resendLeft > 0 ? `Resend code in ${resendLeft}s` : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('details');
              setApiError(null);
              setCode('');
            }}
            className="rounded font-bold text-muted underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            Change number or date
          </button>
        </div>
      </form>
    );
  }

  const noDates = openDates.dates.length === 0;
  // The button stays disabled until the name, mobile number and Terms box are all done.
  const canSubmit = !noDates && name.trim().length > 0 && national.length > 0 && agreed;
  const relative = date ? relativeDayLabel(date, today) : '';

  return (
    <form onSubmit={handleDetails} noValidate className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-bold">Get your token</h2>
        <span className="inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-full bg-amber-light px-2.5 py-1 text-[11px] font-extrabold text-amber-dark">
          {waitingCount} in line today
        </span>
      </div>

      <Input
        id="name"
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Tan Wei Ming"
        autoComplete="name"
        maxLength={80}
      />
      <PhoneInput
        id="mobile"
        label="Mobile number (WhatsApp)"
        country={country}
        national={national}
        onChange={(v) => {
          setCountry(v.country);
          setNational(v.national);
          setVerified(null); // a different number needs its own code
        }}
        error={errors.mobile}
        placeholder="9123 4567"
      />

      <div className="flex flex-col gap-1.5">
        <span id="date-label" className="text-[12px] font-bold leading-4 text-ink/80">
          Date
        </span>
        <button
          type="button"
          aria-labelledby="date-label"
          aria-expanded={calendarOpen}
          disabled={noDates}
          onClick={() => setCalendarOpen((o) => !o)}
          className={clsx(
            'flex min-h-10 w-full items-center justify-between gap-2 rounded-md border-[1.5px] bg-input px-3 py-2 text-left text-[13.5px] leading-5 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
            errors.date ? 'border-coral-dark' : 'border-line hover:border-amber',
            noDates && 'cursor-not-allowed text-muted',
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{date ? formatDateKey(date) : 'No dates open'}</span>
            {relative && (
              <span className="flex-shrink-0 rounded-full bg-amber-light px-2 py-0.5 text-[10.5px] font-extrabold uppercase text-amber-dark">
                {relative}
              </span>
            )}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </button>
        {calendarOpen && !noDates && (
          <div className="rounded-xl border border-line bg-paper p-3">
            <DatePicker
              value={date || null}
              onChange={(key) => {
                setDate(key);
                setCalendarOpen(false);
                setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              isEnabled={(key) => dateSet.has(key)}
              isMarked={(key) => dateSet.has(key)}
              legend="Gold dots are the dates the queue is open. Other dates are closed."
            />
          </div>
        )}
        {errors.date && (
          <span role="alert" className="text-[12px] font-semibold leading-4 text-coral-dark">
            {errors.date}
          </span>
        )}
        {date && openDates.events.filter((e) => e.date === date).length > 0 && (
          <p className="text-[12.5px] font-semibold leading-5 text-amber-dark">
            Event: {openDates.events.filter((e) => e.date === date).map((e) => e.title).join(', ')}
          </p>
        )}
        {noDates && (
          <p role="note" className="rounded-md bg-violet-soft px-3 py-2 text-[12.5px] leading-5 text-muted">
            The queue is not open on any upcoming date right now. Please check back soon.
          </p>
        )}
      </div>

      {apiError && (
        <p role="alert" className="text-[12.5px] font-semibold leading-5 text-coral-dark">
          {apiError}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-2.5 text-[13px] leading-5 text-ink">
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }));
            }}
            aria-invalid={errors.terms ? true : undefined}
            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#B8262B]"
          />
          <span>
            I have read and agree to the{' '}
            <Link
              href="/terms"
              className="font-bold text-violet underline underline-offset-2 hover:text-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            >
              Terms &amp; Conditions
            </Link>
            .
          </span>
        </label>
        {errors.terms && (
          <span role="alert" className="text-[12px] font-semibold leading-4 text-coral-dark">
            {errors.terms}
          </span>
        )}
      </div>
      <Button type="submit" disabled={submitting || !canSubmit} className="min-h-11 w-full text-[14px]">
        {submitting ? 'Sending code…' : 'Send verification code'}
      </Button>
      {!canSubmit && !noDates && (
        <p className="-mt-1.5 text-[11.5px] leading-4 text-muted">
          Fill in your name and mobile number and tick the box to continue.
        </p>
      )}
      <p className="flex items-start gap-2 text-[12px] leading-5 text-muted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mt-[3px] flex-shrink-0 text-teal" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 4 3 11l6 2 2 6 9-15Z" />
        </svg>
        We send a one-time code to confirm your number. We only use it to tell you when it&apos;s your turn.
      </p>
    </form>
  );
}
