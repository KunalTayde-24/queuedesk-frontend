import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const backendRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!backendRes.ok) {
    const body = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: body?.message ?? 'Invalid credentials' },
      { status: backendRes.status },
    );
  }

  const { accessToken, expiresIn } = await backendRes.json();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn ?? 3600,
  });

  return res;
}
