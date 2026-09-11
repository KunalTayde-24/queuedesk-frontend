import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth-cookie';
import { forwardToBackend } from '@/lib/backend-proxy';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

export async function POST() {
  const token = getSessionToken();

  try {
    await forwardToBackend('/auth/logout', { method: 'POST', token });
  } catch {
    // Best-effort: logout is stateless server-side, so a backend failure
    // should not prevent the client from clearing its session.
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
