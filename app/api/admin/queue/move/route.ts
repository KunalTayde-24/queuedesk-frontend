import { NextRequest } from 'next/server';
import { proxyAdmin } from '@/lib/backend-relay';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyAdmin('/admin/queue/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
