import { TopBar } from '@/components/layout/TopBar';
import { KioskClient } from '@/components/kiosk/KioskClient';
import { loadPublicEvents } from '@/lib/events-data';
import { OpenDates } from '@/types/queue';
import { Token } from '@/types/token';

// Always render against the live queue and events, never a build-time snapshot.
export const dynamic = 'force-dynamic';

async function fetchInitialTokens(): Promise<Token[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/tokens/today`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchOpenDates(): Promise<OpenDates> {
  try {
    const res = await fetch(`${process.env.API_URL}/tokens/dates`, { cache: 'no-store' });
    if (!res.ok) return { today: '', dates: [] };
    return res.json();
  } catch {
    return { today: '', dates: [] };
  }
}

export default async function HomePage() {
  const [initialTokens, openDates, { events }] = await Promise.all([
    fetchInitialTokens(),
    fetchOpenDates(),
    loadPublicEvents(),
  ]);
  const now = Date.now();
  // Next three events that have not finished yet, soonest first.
  const upcoming = events
    .filter((e) => new Date(e.endsAt).getTime() > now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 3);

  return (
    <main className="flex-1">
      <TopBar />
      <KioskClient initialTokens={initialTokens} upcomingEvents={upcoming} openDates={openDates} />
    </main>
  );
}
