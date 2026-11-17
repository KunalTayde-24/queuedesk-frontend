'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { DEFAULT_COUNTRY } from '@/lib/phone';
import { apiClient } from '@/lib/api-client';
import { validateTokenForm } from '@/lib/validators';
import { useToast } from '@/components/ui/Toast';
import { formatDateKey } from '@/lib/dates';

export function AddWalkInForm({
  date,
  eventId,
  eventTitle,
  queueOpen,
  onDone,
}: {
  date: string;
  /** The event queue the walk-in joins (null when no single event queue is selected). */
  eventId: string | null;
  eventTitle: string | null;
  queueOpen: boolean;
  onDone: () => void;
}) {
  const { show } = useToast();
  const [name, setName] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [national, setNational] = useState('');
  const mobile = `${country}${national}`;
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!queueOpen || !eventId) return;
    const validation = validateTokenForm(name, mobile);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const token = await apiClient.createWalkIn({ name: name.trim(), mobile, date, eventId });
      show(`Token #${token.tokenNumber} created for ${token.name} (${formatDateKey(date)})`);
      setName('');
      setNational('');
      onDone();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to create token', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fadeIn rounded-2xl border-[1.5px] border-dashed border-violet bg-violet-soft p-5">
      {!eventId ? (
        <p role="alert" className="mb-3 rounded-lg border border-coral/40 bg-coral-light px-3 py-2 text-[13px] leading-5 text-ink">
          Pick one event queue above to add a walk-in to it.
        </p>
      ) : !queueOpen ? (
        <p role="alert" className="mb-3 rounded-lg border border-coral/40 bg-coral-light px-3 py-2 text-[13px] leading-5 text-ink">
          The queue for {eventTitle ?? 'this event'} is closed on {formatDateKey(date)}, so a walk-in cannot be added.
          Open the queue first.
        </p>
      ) : (
        <p className="mb-3 text-[12.5px] font-semibold leading-5 text-violet-dark">Adding to: {eventTitle}</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <Input
          id="walkin-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="e.g. Lim Mei Ling"
          className="min-w-[170px] flex-1 bg-card"
        />
        <div className="min-w-[230px] flex-1">
          <PhoneInput
            id="walkin-mobile"
            label="Mobile"
            country={country}
            national={national}
            onChange={(v) => {
              setCountry(v.country);
              setNational(v.national);
            }}
            error={errors.mobile}
            placeholder="9123 4567"
          />
        </div>
        <Button type="submit" disabled={submitting || !queueOpen || !eventId} className="h-[42px] w-auto">
          {submitting ? 'Adding…' : 'Add token'}
        </Button>
      </form>
    </div>
  );
}
