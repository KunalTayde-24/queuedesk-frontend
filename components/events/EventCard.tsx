import Link from 'next/link';
import clsx from 'clsx';
import { EventSummary } from '@/types/event';
import { formatEventDate } from '@/lib/event-time';
import { EventBanner } from './EventBanner';
import { LifecyclePill, RegistrationPill } from './EventStatus';

interface EventCardProps {
  event: EventSummary;
  imageSrc: string | null;
  href?: string;
  featured?: boolean;
  showLifecycle?: boolean;
}

function whenLabel(iso: string) {
  return iso ? formatEventDate(iso) : 'Not set';
}

export function EventCard({ event, imageSrc, href, featured = false, showLifecycle = false }: EventCardProps) {
  const body = (
    <>
      <div className={clsx('min-w-0', featured && 'md:w-[46%] md:shrink-0')}>
        <div className={clsx(featured && 'md:h-full')}>
          <EventBanner
            src={imageSrc}
            alt={imageSrc ? event.title : ''}
            fill={featured}
            seed={event.id}
            startsAt={event.startsAt}
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <RegistrationPill state={event.registrationState} />
          {showLifecycle && <LifecyclePill status={event.status} />}
        </div>
        <div className="min-w-0">
          <h2 className={clsx('break-words font-serif leading-tight text-violet-dark', featured ? 'text-[1.375rem] font-bold sm:text-[1.625rem]' : 'text-[1.0625rem] font-bold')}>
            {event.title || 'Untitled event'}
          </h2>
          <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-muted">
            {event.description || 'Add a short description so guests know what to expect.'}
          </p>
        </div>
        <dl className="grid gap-2 text-sm leading-5">
          <div className="grid grid-cols-1 gap-0.5 min-[440px]:grid-cols-[6.5rem_minmax(0,1fr)] min-[440px]:gap-x-3">
            <dt className="font-semibold text-muted">Venue</dt>
            <dd className="min-w-0 break-words text-ink">{event.venue || 'Not set'}</dd>
          </div>
          <div className="grid grid-cols-1 gap-0.5 min-[440px]:grid-cols-[6.5rem_minmax(0,1fr)] min-[440px]:gap-x-3">
            <dt className="font-semibold text-muted">Starts</dt>
            <dd className="min-w-0 break-words text-ink">{whenLabel(event.startsAt)}</dd>
          </div>
          <div className="grid grid-cols-1 gap-0.5 min-[440px]:grid-cols-[6.5rem_minmax(0,1fr)] min-[440px]:gap-x-3">
            <dt className="font-semibold text-muted">Register by</dt>
            <dd className="min-w-0 break-words text-ink">{whenLabel(event.registrationClosesAt)}</dd>
          </div>
        </dl>
        {href && (
          <span className="mt-auto inline-flex min-h-11 items-center text-sm font-bold text-violet">
            {event.canRegister ? 'View and register' : 'View details'}
          </span>
        )}
      </div>
    </>
  );

  const className = clsx(
    'flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-card text-left shadow-card transition-shadow',
    featured ? 'md:flex-row' : 'h-full',
    href && 'hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}
