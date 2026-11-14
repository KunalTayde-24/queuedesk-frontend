import { EventForm } from '@/components/events/EventForm';
import { loadAdminEvents } from '@/lib/events-data';

export const metadata = {
  title: 'New event · QueueDesk',
};

export default async function NewEventPage() {
  const { events } = await loadAdminEvents();
  return <EventForm otherEvents={events.filter((e) => e.status === 'PUBLISHED')} />;
}
