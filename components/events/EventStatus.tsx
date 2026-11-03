import clsx from 'clsx';
import { EventLifecycle } from '@/types/event';

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

export function LifecyclePill({ status }: { status: EventLifecycle }) {
  return <StatusPill className={LIFECYCLE_CLASS[status]}>{LIFECYCLE_LABEL[status]}</StatusPill>;
}
