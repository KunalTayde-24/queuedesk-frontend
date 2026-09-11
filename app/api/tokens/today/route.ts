import { NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend-proxy';

export async function GET() {
  const res = await forwardToBackend('/tokens/today', { method: 'GET' });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
