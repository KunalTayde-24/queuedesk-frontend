import { NextRequest } from 'next/server';
import { proxyAdmin } from '@/lib/backend-relay';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const params = new URLSearchParams();
  const date = req.nextUrl.searchParams.get('date');
  const eventId = req.nextUrl.searchParams.get('eventId');
  if (date) params.set('date', date);
  if (eventId) params.set('eventId', eventId);
  const query = params.size > 0 ? `?${params.toString()}` : '';
  return proxyAdmin(`/admin/queue${query}`, { method: 'GET' });
}
