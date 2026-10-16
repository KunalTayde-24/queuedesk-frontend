'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatEventDate } from '@/lib/event-time';
import { EventSummary, Registrant } from '@/types/event';
import { Input } from '@/components/ui/Input';

export function RegistrantsPanel({
  event,
  registrants,
  error,
}: {
  event: EventSummary;
  registrants: Registrant[];
  error: boolean;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return registrants;
    return registrants.filter((person) =>
      [person.name, person.mobile, person.email, person.confirmationRef].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [query, registrants]);

  return (
    <section className="grid min-w-0 gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href={`/admin/dashboard/events/${event.id}`} className="inline-flex min-h-11 items-center text-sm font-bold text-violet">
            Back to event
          </Link>
          <h1 className="break-words font-serif text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">Registrations</h1>
          <p className="mt-2 break-words text-sm leading-6 text-muted">{event.title}</p>
        </div>
        <p className="rounded-full bg-violet-soft px-4 py-2 text-sm font-bold leading-5 text-violet-dark">
          {registrants.length} {registrants.length === 1 ? 'person' : 'people'} registered
        </p>
      </div>

      <Input
        id="registrant-search"
        label="Search registrations"
        value={query}
        onChange={(item) => setQuery(item.target.value)}
        placeholder="Search by name, mobile, or email"
      />

      {error && (
        <p role="alert" className="rounded-card border border-coral/40 bg-coral-light px-4 py-3 text-sm font-semibold leading-6 text-coral-dark">
          Registrations could not be loaded. Refresh the page and try again.
        </p>
      )}

      {!error && registrants.length === 0 && (
        <div className="rounded-card border border-dashed border-line bg-card px-5 py-10 text-center">
          <h2 className="font-serif text-xl font-bold text-violet-dark">No registrations yet</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Guests who register will show up here.</p>
        </div>
      )}

      {!error && registrants.length > 0 && filtered.length === 0 && (
        <p className="text-sm leading-6 text-muted">No one matches that search.</p>
      )}

      <div className="grid gap-3 md:hidden">
        {filtered.map((person) => (
          <article key={person.id} className="rounded-card border border-line bg-card p-4 shadow-sm">
            <h2 className="break-words text-base font-bold leading-6 text-ink">{person.name}</h2>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-sm leading-5 min-[380px]:grid-cols-[7.25rem_minmax(0,1fr)]">
              <dt className="font-semibold text-muted">Mobile</dt>
              <dd className="min-w-0 break-all">{person.mobile}</dd>
              <dt className="font-semibold text-muted">Email</dt>
              <dd className="min-w-0 break-all">{person.email}</dd>
              <dt className="font-semibold text-muted">Reference</dt>
              <dd className="min-w-0 break-all">{person.confirmationRef}</dd>
              <dt className="font-semibold text-muted">Registered</dt>
              <dd className="min-w-0 break-words">{formatEventDate(person.registeredAt)}</dd>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-card border border-line bg-card md:block">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm leading-5">
          <thead className="bg-violet-soft text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Mobile</th>
              <th className="px-4 py-3 font-bold">Email</th>
              <th className="px-4 py-3 font-bold">Reference</th>
              <th className="px-4 py-3 font-bold">Registered</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((person) => (
              <tr key={person.id} className="border-t border-line align-top">
                <td className="break-words px-4 py-3 font-semibold text-ink">{person.name}</td>
                <td className="whitespace-nowrap px-4 py-3">{person.mobile}</td>
                <td className="max-w-[16rem] break-all px-4 py-3">{person.email}</td>
                <td className="whitespace-nowrap px-4 py-3">{person.confirmationRef}</td>
                <td className="px-4 py-3">{formatEventDate(person.registeredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
