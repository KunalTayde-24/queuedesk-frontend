import { NextRequest } from 'next/server';
import { proxyPublic } from '@/lib/backend-relay';

export async function POST(req: NextRequest) {
  return proxyPublic('/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await req.text(),
  });
}
