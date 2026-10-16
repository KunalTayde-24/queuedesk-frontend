import { proxyAdmin } from '@/lib/backend-relay';

interface RouteContext {
  params: { id: string };
}

export async function POST(_req: Request, { params }: RouteContext) {
  return proxyAdmin(`/admin/events/${params.id}/cancel`, { method: 'POST' });
}
