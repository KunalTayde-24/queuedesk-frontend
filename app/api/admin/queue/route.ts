import { NextRequest } from 'next/server';
import { proxyAdmin } from '@/lib/backend-relay';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return proxyAdmin(`/admin/queue${query}`, { method: 'GET' });
}
