import { AdminEventsManager } from '@/components/events/AdminEventsManager';
import { loadAdminEvents } from '@/lib/events-data';

export const metadata = {
  title: 'Manage events · QueueDesk',
};

export default async function AdminEventsPage() {
  const { events, error } = await loadAdminEvents();
  return <AdminEventsManager events={events} error={error} />;
}
