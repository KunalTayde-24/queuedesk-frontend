import { NextRequest } from 'next/server';
import { proxyPublic } from '@/lib/backend-relay';

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const body = await req.text();
  return proxyPublic(`/events/${params.id}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
