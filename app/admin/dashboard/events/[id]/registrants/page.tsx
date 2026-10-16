import { notFound } from 'next/navigation';
import { RegistrantsPanel } from '@/components/events/RegistrantsPanel';
import { loadAdminEvent, loadRegistrants } from '@/lib/events-data';

interface RegistrantsPageProps {
  params: { id: string };
}

export const metadata = {
  title: 'Registrations · QueueDesk',
};

export default async function RegistrantsPage({ params }: RegistrantsPageProps) {
  const event = await loadAdminEvent(params.id);
  if (!event) notFound();
  const result = await loadRegistrants(params.id);

  return <RegistrantsPanel event={event} registrants={result.registrants} error={result.error} />;
}
