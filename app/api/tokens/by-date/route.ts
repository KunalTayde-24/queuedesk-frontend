import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? '';
  const res = await forwardToBackend(`/tokens/queue?date=${encodeURIComponent(date)}`, { method: 'GET' });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
