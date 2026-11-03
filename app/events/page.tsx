import { EventCatalog } from '@/components/events/EventCatalog';
import { loadPublicEvents } from '@/lib/events-data';

export const metadata = {
  title: 'Events · QueueDesk',
  description: 'Browse upcoming temple events and take a queue token for the day.',
};

export default async function EventsPage() {
  const { events, error } = await loadPublicEvents();

  return (
    <div className="pb-16">
      <EventCatalog events={events} error={error} />
    </div>
  );
}
