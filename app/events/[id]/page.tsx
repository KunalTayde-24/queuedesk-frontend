import { notFound } from 'next/navigation';
import { EventDetail } from '@/components/events/EventDetail';
import { loadPublicEvent } from '@/lib/events-data';

interface EventPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: EventPageProps) {
  const event = await loadPublicEvent(params.id);
  return {
    title: event ? `${event.title} · QueueDesk` : 'Event · QueueDesk',
    description: event?.description ?? 'Event registration',
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await loadPublicEvent(params.id);
  if (!event) notFound();

  return (
    <div className="pb-28 lg:pb-16">
      <EventDetail event={event} />
    </div>
  );
}
