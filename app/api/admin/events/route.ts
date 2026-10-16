import { NextRequest } from 'next/server';
import { proxyAdmin } from '@/lib/backend-relay';

export async function GET() {
  return proxyAdmin('/admin/events', { method: 'GET' });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  return proxyAdmin('/admin/events', { method: 'POST', body: form });
}
