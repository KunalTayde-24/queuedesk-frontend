import { notFound } from 'next/navigation';
import { EventForm } from '@/components/events/EventForm';
import { loadAdminEvent } from '@/lib/events-data';

interface EditEventPageProps {
  params: { id: string };
}

export const metadata = {
  title: 'Edit event · QueueDesk',
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await loadAdminEvent(params.id);
  if (!event) notFound();
  return <EventForm event={event} />;
}
