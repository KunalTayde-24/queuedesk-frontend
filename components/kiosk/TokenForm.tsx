'use client';

import { FormEvent, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TicketCard } from './TicketCard';
import { apiClient } from '@/lib/api-client';
import { validateTokenForm } from '@/lib/validators';
import { computeAheadCount } from '@/lib/queue-utils';
import { Token } from '@/types/token';

export function TokenForm() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<{ token: Token; ahead: number } | null>(
    null,
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateTokenForm(name, mobile);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const token = await apiClient.createToken({ name: name.trim(), mobile });
      const today = await apiClient.fetchToday();
      setResult({ token, ahead: computeAheadCount(today, token) });
      setName('');
      setMobile('');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-8 md:flex-row md:items-start">
      <Card accent="violet" className="min-w-[280px] flex-1 basis-[330px]">
        <h1 className="mb-1 text-[23px] text-violet-dark">Join the queue</h1>
        <p className="mb-6 text-[13.5px] text-muted">
          Enter your details to get today&apos;s token number.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Asha Patil"
          />
          <Input
            id="mobile"
            label="Mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={errors.mobile}
            placeholder="98765 43210"
            inputMode="numeric"
          />
          {apiError && <p className="text-[13px] font-semibold text-coral-dark">{apiError}</p>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Getting your token…' : 'Get my token'}
          </Button>
        </form>
      </Card>
      <div className="flex min-w-[250px] flex-1 basis-[250px] flex-col items-center gap-4 border-t border-line pt-8 md:border-t-0 md:border-l md:pl-8 md:pt-2">
        {result && <TicketCard token={result.token} ahead={result.ahead} />}
        <p className="flex max-w-[230px] items-center gap-1.5 text-center text-xs leading-relaxed text-muted">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="flex-shrink-0 text-teal"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 4 3 11l6 2 2 6 9-15Z" />
          </svg>
          You&apos;ll get a WhatsApp message the moment it&apos;s your turn.
        </p>
      </div>
    </div>
  );
}
