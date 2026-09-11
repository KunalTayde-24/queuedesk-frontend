import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth-cookie';
import { forwardToBackend } from '@/lib/backend-proxy';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const res = await forwardToBackend(`/queue-actions/skip/${params.id}`, {
    method: 'POST',
    token,
  });
  const body = await res.json().catch(() => ({}));
  return NextResponse.json(body, { status: res.status });
}
