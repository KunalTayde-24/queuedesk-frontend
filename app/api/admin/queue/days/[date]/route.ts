import { proxyAdmin } from '@/lib/backend-relay';

interface RouteContext {
  params: { date: string };
}

export async function PUT(_req: Request, { params }: RouteContext) {
  return proxyAdmin(`/admin/queue/days/${encodeURIComponent(params.date)}`, { method: 'PUT' });
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  return proxyAdmin(`/admin/queue/days/${encodeURIComponent(params.date)}`, { method: 'DELETE' });
}
