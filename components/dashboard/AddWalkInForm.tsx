'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api-client';
import { validateTokenForm } from '@/lib/validators';
import { useToast } from '@/components/ui/Toast';

export function AddWalkInForm({ onDone }: { onDone: () => void }) {
  const { show } = useToast();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateTokenForm(name, mobile);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const token = await apiClient.createToken({ name: name.trim(), mobile });
      show(`Token #${token.tokenNumber} created for ${token.name}`);
      setName('');
      setMobile('');
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
          placeholder="Walk-in customer name"
          className="min-w-[170px] flex-1 bg-card"
        />
        <Input
          id="walkin-mobile"
          label="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
          error={errors.mobile}
          placeholder="98765 43210"
          inputMode="numeric"
          className="min-w-[170px] flex-1 bg-card"
        />
        <Button type="submit" disabled={submitting} className="h-[42px] w-auto">
          {submitting ? 'Adding…' : 'Add token'}
        </Button>
      </form>
    </div>
  );
}
