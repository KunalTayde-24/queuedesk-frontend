import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('eventId');
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
  const res = await forwardToBackend(`/tokens/today${query}`, { method: 'GET' });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
