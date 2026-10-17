import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getSessionToken } from '@/lib/auth-cookie';
import { forwardToBackend } from '@/lib/backend-proxy';
import { AdminQueueDays } from '@/types/queue';
import { Token } from '@/types/token';

// Always read the live queue, never a build-time snapshot.
export const dynamic = 'force-dynamic';

async function fetchAdmin<T>(path: string, fallback: T): Promise<T> {
  const token = getSessionToken();
  try {
    const res = await forwardToBackend(path, { method: 'GET', token });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export default async function DashboardPage() {
  const [initialTokens, initialDays] = await Promise.all([
    fetchAdmin<Token[]>('/admin/queue', []),
    fetchAdmin<AdminQueueDays>('/admin/queue/days', { today: '', days: [] }),
  ]);
  return <DashboardClient initialTokens={initialTokens} initialDays={initialDays} />;
}
