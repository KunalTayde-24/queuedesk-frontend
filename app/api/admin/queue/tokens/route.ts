import { NextRequest } from 'next/server';
import { proxyAdmin } from '@/lib/backend-relay';

export async function POST(req: NextRequest) {
  return proxyAdmin('/admin/queue/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await req.text(),
  });
}
