import clsx from 'clsx';
import { EventLifecycle, RegistrationState } from '@/types/event';

const REGISTRATION_LABEL: Record<RegistrationState, string> = {
  OPENS_SOON: 'Opens soon',
  OPEN: 'Open',
  CLOSED: 'Closed',
};

const REGISTRATION_CLASS: Record<RegistrationState, string> = {
  OPENS_SOON: 'bg-amber-light text-amber-dark',
  OPEN: 'bg-teal-light text-teal-dark',
  CLOSED: 'bg-violet-light text-violet-dark',
};

const LIFECYCLE_LABEL: Record<EventLifecycle, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CANCELLED: 'Cancelled',
};

const LIFECYCLE_CLASS: Record<EventLifecycle, string> = {
  DRAFT: 'bg-amber-light text-amber-dark',
  PUBLISHED: 'bg-teal-light text-teal-dark',
  CANCELLED: 'bg-coral-light text-coral-dark',
};

export function StatusPill({ className, children }: { className: string; children: string }) {
  return (
    <span
      className={clsx(
        'inline-flex max-w-full items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold leading-4',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RegistrationPill({ state }: { state: RegistrationState }) {
  return <StatusPill className={REGISTRATION_CLASS[state]}>{REGISTRATION_LABEL[state]}</StatusPill>;
}

export function LifecyclePill({ status }: { status: EventLifecycle }) {
  return <StatusPill className={LIFECYCLE_CLASS[status]}>{LIFECYCLE_LABEL[status]}</StatusPill>;
}
