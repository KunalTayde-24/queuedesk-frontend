'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { DatePicker } from '@/components/ui/DatePicker';
import { MyTicket } from './MyTicket';
import { apiClient } from '@/lib/api-client';
import { formatDateKey, relativeDayLabel, todayKey } from '@/lib/dates';
import { eventRangeLabel } from '@/lib/events';
import { validateTokenForm } from '@/lib/validators';
import { DEFAULT_COUNTRY, maskMobile } from '@/lib/phone';
import { saveMyToken, useMyTokens } from '@/lib/my-token';
import { OpenDates, OpenQueue, SendOtpResponse } from '@/types/queue';
import { Token } from '@/types/token';

interface TokenFormProps {
  /** Today's live queues (every event), used to keep issued tickets' status and "ahead of you" count current. */
  tokens: Token[];
  waitingCount: number;
  /** The event queues the admin has opened; visitors can only pick from these. */
  openDates: OpenDates;
  /** A date to start on (from an event page's "Take a queue token" link), used only if a queue is open then. */
  defaultDate?: string;
  /** An event to start on (same link), used only if its queue is open. */
  defaultEventId?: string;
}

const CARD =
  'relative flex w-full max-w-[420px] flex-col gap-3.5 rounded-[18px] border border-line border-t-4 border-t-violet bg-card p-5 text-ink shadow-card';

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong';
}

const queueKeyOf = (eventId: string, date: string) => `${eventId}|${date}`;

export function TokenForm({ tokens, waitingCount, openDates, defaultDate, defaultEventId }: TokenFormProps) {
  const tickets = useMyTokens();
  const today = openDates.today || todayKey();
  const queues = useMemo(() => openDates.queues ?? [], [openDates.queues]);
  const dateSet = useMemo(() => new Set(queues.map((q) => q.date)), [queues]);
  // One live token per phone number per event and date. Tickets saved in this browser are
  // remembered by event, date and number, so a different number (someone else) can take its own.
  const heldKeys = useMemo(
    () =>
      new Set(
        tickets
          .filter((t) => t.eventId)
          .map((t) => `${queueKeyOf(t.eventId as string, t.date)}|${t.mobile}`),
      ),
    [tickets],
  );
  // With saved tickets the page shows them; the form comes back on request.
  const [showForm, setShowForm] = useState(false);

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [national, setNational] = useState('');
  // Full international number, e.g. "+6591234567"; this is what is verified and stored.
  const mobile = `${country}${national}`;
  // Does the number typed in the form already hold a token for this event queue?
  const isHeld = (q: OpenQueue) => national.length > 0 && heldKeys.has(`${queueKeyOf(q.eventId, q.date)}|${mobile}`);
  const [agreed, setAgreed] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [date, setDate] = useState(() => {
    const preferred =
      defaultDate && dateSet.has(defaultDate)
        ? defaultDate
        : defaultEventId
          ? queues.find((q) => q.eventId === defaultEventId)?.date
          : undefined;
    return preferred ?? (dateSet.has(today) ? today : (queues[0]?.date ?? ''));
  });
  const [eventId, setEventId] = useState(defaultEventId ?? '');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; date?: string; terms?: string }>({});

  // The queues open on the chosen date, and the one the visitor is taking a token for.
  const queuesOnDate = useMemo(() => queues.filter((q) => q.date === date), [queues, date]);
  const chosen = useMemo(
    () =>
      queuesOnDate.find((q) => q.eventId === eventId && !isHeld(q)) ?? queuesOnDate.find((q) => !isHeld(q)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queuesOnDate, eventId, heldKeys, mobile, national],
  );
  const queueKey = chosen ? queueKeyOf(chosen.eventId, chosen.date) : '';

  const [code, setCode] = useState('');
  const [otpInfo, setOtpInfo] = useState<SendOtpResponse | null>(null);
  const [resendLeft, setResendLeft] = useState(0);
  // A verified phone number stays good for a few minutes, but only for the queue it was verified for.
  const [verified, setVerified] = useState<{ mobile: string; token: string; queue: string } | null>(null);
  const verifiedAt = useRef(Date.now());
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // The terms open as a full page in this same tab, so keep what was typed and bring it back
  // when the visitor returns. (Kept only for this browser tab; the Terms box is never pre-ticked.)
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('qd-token-draft') ?? 'null') as {
        name?: string;
        country?: string;
        national?: string;
        date?: string;
        eventId?: string;
        step?: string;
        otp?: { info: SendOtpResponse; sentAt: number } | null;
        verified?: { mobile: string; token: string; queue?: string; at: number } | null;
      } | null;
      if (saved) {
        if (typeof saved.name === 'string') setName(saved.name);
        if (typeof saved.country === 'string') setCountry(saved.country);
        if (typeof saved.national === 'string') setNational(saved.national);
        if (typeof saved.date === 'string' && dateSet.has(saved.date)) setDate(saved.date);
        if (typeof saved.eventId === 'string') setEventId(saved.eventId);

        // Came back to the code step: put the visitor back where they were, as long as the
        // code they were sent is still valid, so they can type it without asking for a new one.
        const now = Date.now();
        const otp = saved.otp;
        if (
          saved.step === 'otp' &&
          otp &&
          typeof otp.sentAt === 'number' &&
          now - otp.sentAt < otp.info.expiresInSeconds * 1000
        ) {
          setOtpInfo(otp.info);
          setOtpSentAt(otp.sentAt);
          setResendLeft(Math.max(0, Math.ceil((otp.sentAt + otp.info.resendAfterSeconds * 1000 - now) / 1000)));
          setAgreed(true); // they ticked the Terms to get this far, in this same tab
          setStep('otp');
          setShowForm(true);
        }
        // A number verified in the last few minutes can still be used to get the token.
        if (saved.verified && now - saved.verified.at < 9 * 60_000) {
          setVerified({
            mobile: saved.verified.mobile,
            token: saved.verified.token,
            queue: saved.verified.queue ?? '',
          });
        }
      }
    } catch {
      // Storage can be blocked; the form just starts empty.
    }
    // Saving only starts after the restore has been applied (next render). Otherwise the first
    // save would overwrite the stored draft with the empty starting values, and a second restore
    // (React dev mode runs effects twice) would read those back, e.g. the country reverting to +65.
    setDraftLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      sessionStorage.setItem(
        'qd-token-draft',
        JSON.stringify({
          name,
          country,
          national,
          date,
          eventId: chosen?.eventId ?? eventId,
          step,
          otp: step === 'otp' && otpInfo && otpSentAt ? { info: otpInfo, sentAt: otpSentAt } : null,
          verified: verified ? { ...verified, at: verifiedAt.current } : null,
        }),
      );
    } catch {
      // ignore
    }
  }, [draftLoaded, name, country, national, date, eventId, chosen, step, otpInfo, otpSentAt, verified]);

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
    setOtpSentAt(null);
    setVerified(null);
    setApiError(null);
    setErrors({});
  }

  /** A failed attempt (other than a dropped connection) needs a fresh code next time. */
  function afterFailure(err: unknown) {
    if (!(err instanceof TypeError)) setVerified(null);
    setApiError(errorMessage(err));
  }

  async function createWithVerification(verificationToken: string) {
    if (!chosen) throw new Error('Pick an event queue first');
    const token = await apiClient.createToken({
      name: name.trim(),
      mobile,
      eventId: chosen.eventId,
      date,
      verificationToken,
    });
    saveMyToken(token); // remembered in this browser, so a refresh keeps the ticket
    try {
      sessionStorage.removeItem('qd-token-draft');
    } catch {
      // ignore
    }
    resetForm();
    setShowForm(false);
  }

  async function sendCode() {
    setSubmitting(true);
    setApiError(null);
    try {
      const info = await apiClient.sendOtp(mobile);
      setOtpInfo(info);
      setOtpSentAt(Date.now());
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
    else if (!chosen) found.date = 'Pick an event you do not have a token for yet';
    if (!agreed) found.terms = 'Please agree to the Terms & Conditions to continue';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Already verified this number for this queue moments ago: skip the code.
    if (verified && verified.mobile === mobile && verified.queue === queueKey) {
      setSubmitting(true);
      setApiError(null);
      try {
        await createWithVerification(verified.token);
      } catch (err) {
        afterFailure(err);
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
      let proof = verified?.mobile === mobile && verified.queue === queueKey ? verified.token : null;
      if (!proof) {
        const result = await apiClient.verifyOtp(mobile, code);
        proof = result.verificationToken;
        verifiedAt.current = Date.now();
        setVerified({ mobile, token: proof, queue: queueKey });
      }
      await createWithVerification(proof);
    } catch (err) {
      afterFailure(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (tickets.length > 0 && !showForm) {
    return (
      <div id="my-ticket" className="flex w-full max-w-[420px] scroll-mt-24 flex-col gap-4">
        {/* One ticket per event: each follows its own event's queue. */}
        {tickets.map((ticket) => (
          <MyTicket
            key={ticket.id}
            mine={ticket}
            today={today}
            todayTokens={tokens}
            removable={tickets.length > 1}
          />
        ))}
        {queues.length > 0 && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex min-h-11 items-center justify-center rounded-md border-[1.5px] border-[#F2C66D]/70 bg-black/20 px-4 text-[13px] font-bold text-[#FFE3A1] transition-colors hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C66D]"
          >
            Get a token for someone else or another event
          </button>
        )}
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
          {chosen && (
            <p className="mt-1 text-[12.5px] font-semibold leading-5 text-amber-dark">
              Token for: {chosen.title} · {formatDateKey(chosen.date)}
            </p>
          )}
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
            Change number, event or date
          </button>
        </div>
      </form>
    );
  }

  const noDates = queues.length === 0;
  // The button stays disabled until the name, mobile number, an event and the Terms box are all done.
  const canSubmit = !noDates && Boolean(chosen) && name.trim().length > 0 && national.length > 0 && agreed;
  const relative = date ? relativeDayLabel(date, today) : '';

  return (
    <form onSubmit={handleDetails} noValidate className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-bold">Get your token</h2>
        <span className="inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-full bg-amber-light px-2.5 py-1 text-[11px] font-extrabold text-amber-dark">
          {waitingCount} in line today
        </span>
      </div>
      {tickets.length > 0 && (
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="-mt-1.5 self-start rounded text-[12.5px] font-bold text-violet underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          ← Back to my tickets
        </button>
      )}

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
                setEventId('');
                setCalendarOpen(false);
                setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              isEnabled={(key) => dateSet.has(key)}
              isMarked={(key) => dateSet.has(key)}
              legend="Gold dots are the dates a queue is open. Other dates are closed."
            />
          </div>
        )}
        {errors.date && (
          <span role="alert" className="text-[12px] font-semibold leading-4 text-coral-dark">
            {errors.date}
          </span>
        )}
        {noDates && (
          <p role="note" className="rounded-md bg-violet-soft px-3 py-2 text-[12.5px] leading-5 text-muted">
            No queue is open on any upcoming date right now. Please check back soon.
          </p>
        )}
      </div>

      {queuesOnDate.length > 0 && (
        <fieldset className="flex min-w-0 flex-col gap-1.5">
          <legend className="mb-1.5 text-[12px] font-bold leading-4 text-ink/80">Event</legend>
          {queuesOnDate.map((q) => {
            const held = isHeld(q);
            const selected = chosen?.eventId === q.eventId;
            return (
              <label
                key={q.eventId}
                className={clsx(
                  'flex min-w-0 items-start gap-2.5 rounded-md border-[1.5px] px-3 py-2 text-[13px] leading-5',
                  selected ? 'border-violet bg-violet-soft' : 'border-line bg-input',
                  held ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                )}
              >
                <input
                  type="radio"
                  name="event-queue"
                  value={q.eventId}
                  checked={selected}
                  disabled={held}
                  onChange={() => {
                    setEventId(q.eventId);
                    setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  className="mt-1 h-4 w-4 flex-shrink-0 accent-[#B8262B]"
                />
                <span className="min-w-0">
                  <b className="block break-words">{q.title}</b>
                  <span className="block text-[12px] text-muted">
                    {eventRangeLabel(q.startsAt, q.endsAt)}
                    {held ? ' · this number already has a token for this event' : ''}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

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
          Fill in your name and mobile number, pick an event and tick the box to continue.
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
