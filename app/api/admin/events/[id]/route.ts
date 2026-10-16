import { NextRequest } from 'next/server';
import { proxyAdmin } from '@/lib/backend-relay';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  return proxyAdmin(`/admin/events/${params.id}`, { method: 'GET' });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const form = await req.formData();
  return proxyAdmin(`/admin/events/${params.id}`, { method: 'PATCH', body: form });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  return proxyAdmin(`/admin/events/${params.id}`, { method: 'DELETE' });
}
