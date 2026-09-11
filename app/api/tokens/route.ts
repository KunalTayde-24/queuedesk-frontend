import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend-proxy';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await forwardToBackend('/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
