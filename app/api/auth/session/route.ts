import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth-cookie';

// The session cookie is httpOnly, so client code (the top bar) cannot read it.
// This only reports whether one is present; it never exposes the token.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ authenticated: getSessionToken() !== null }, { headers: { 'Cache-Control': 'no-store' } });
}
