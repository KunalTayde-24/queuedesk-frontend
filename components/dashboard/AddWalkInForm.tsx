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

export function AddWalkInForm({ date, onDone }: { date: string; onDone: () => void }) {
  const { show } = useToast();
  const [name, setName] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [national, setNational] = useState('');
  const mobile = `${country}${national}`;
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateTokenForm(name, mobile);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const token = await apiClient.createWalkIn({ name: name.trim(), mobile, date });
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
        <Button type="submit" disabled={submitting} className="h-[42px] w-auto">
          {submitting ? 'Adding…' : 'Add token'}
        </Button>
      </form>
    </div>
  );
}
