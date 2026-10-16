import { NextResponse } from 'next/server';
import { getSessionToken } from './auth-cookie';
import { forwardToBackend } from './backend-proxy';

export async function relayBackend(res: Response) {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.startsWith('image/')) {
    const bytes = await res.arrayBuffer();
    return new NextResponse(bytes, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': res.headers.get('cache-control') ?? 'public, max-age=3600',
      },
    });
  }

  const text = await res.text();
  return new NextResponse(text.length > 0 ? text : '{}', {
    status: res.status,
    headers: { 'Content-Type': contentType || 'application/json' },
  });
}

export async function proxyPublic(path: string, init: RequestInit = {}) {
  const res = await forwardToBackend(path, init);
  return relayBackend(res);
}

export async function proxyAdmin(path: string, init: RequestInit = {}) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const res = await forwardToBackend(path, { ...init, token });
  return relayBackend(res);
}
