import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getSessionToken } from '@/lib/auth-cookie';
import { forwardToBackend } from '@/lib/backend-proxy';
import { Token } from '@/types/token';

async function fetchInitialTokens(): Promise<Token[]> {
  const token = getSessionToken();
  try {
    const res = await forwardToBackend('/tokens/today', { method: 'GET', token });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const initialTokens = await fetchInitialTokens();
  return <DashboardClient initialTokens={initialTokens} />;
}
