'use client';

import { FormEvent, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatEventDate } from '@/lib/event-time';
import { validateRegistrationForm } from '@/lib/validators';
import { EventRegistrationResult, EventSummary } from '@/types/event';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export function RegistrationDialog({
  event,
  open,
  onClose,
}: {
  event: EventSummary;
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState(validateRegistrationForm('', '91', ''));
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<EventRegistrationResult | null>(null);

  function close() {
    setResult(null);
    setFormError('');
    setSubmitted(false);
    setPending(false);
    setName('');
    setMobile('');
    setEmail('');
    onClose();
  }

  async function onSubmit(eventForm: FormEvent) {
    eventForm.preventDefault();
    setSubmitted(true);
    const nextErrors = validateRegistrationForm(name, mobile, email);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      const registration = await apiClient.registerForEvent(event.id, {
        name: name.trim(),
        mobile,
        email: email.trim(),
      });
      setResult(registration);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration could not be saved');
    } finally {
      setPending(false);
    }
  }

  const shownErrors = submitted ? errors : {};

  return (
    <Modal open={open} onClose={close} title={result ? 'You are registered' : 'Register for this event'} size="md">
      {result ? (
        <div className="grid gap-4">
          <p className="break-words text-sm leading-6 text-ink">
            {result.name}, your place is saved for {event.title}.
          </p>
          <div className="rounded-md bg-violet-soft px-4 py-3">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-muted">Confirmation number</p>
            <p className="mt-1 break-all font-serif text-xl font-bold leading-8 text-violet-dark">{result.confirmationRef}</p>
          </div>
          <Button type="button" className="min-h-11 w-full" onClick={close}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <p className="text-sm leading-6 text-muted">
            Registration closes {formatEventDate(event.registrationClosesAt)}. Use the mobile number you want us to keep on file.
          </p>
          <Input
            id="registration-name"
            label="Full name *"
            value={name}
            onChange={(eventInput) => setName(eventInput.target.value)}
            error={shownErrors.name}
            autoComplete="name"
            placeholder="Asha Patil"
            required
          />
          <Input
            id="registration-mobile"
            label="Mobile number *"
            value={mobile}
            onChange={(eventInput) => setMobile(eventInput.target.value.replace(/\D/g, '').slice(0, 10))}
            error={shownErrors.mobile}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9876543210"
            required
          />
          <Input
            id="registration-email"
            label="Email address *"
            type="email"
            value={email}
            onChange={(eventInput) => setEmail(eventInput.target.value)}
            error={shownErrors.email}
            autoComplete="email"
            placeholder="asha@example.com"
            required
          />
          {formError && (
            <p role="alert" className="break-words text-sm font-semibold leading-6 text-coral-dark">
              {formError}
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="ghost" className="min-h-11 w-full" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" className="min-h-11 w-full" disabled={pending}>
              {pending ? 'Saving registration…' : 'Register now'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
