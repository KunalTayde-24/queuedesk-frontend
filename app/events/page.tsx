import { EventCatalog } from '@/components/events/EventCatalog';
import { loadPublicEvents } from '@/lib/events-data';

export const metadata = {
  title: 'Events · QueueDesk',
  description: 'Browse upcoming events and register while registration is open.',
};

export default async function EventsPage() {
  const { events, error } = await loadPublicEvents();

  return (
    <div className="pb-16">
      <EventCatalog events={events} error={error} />
    </div>
  );
}
