import { proxyAdmin } from '@/lib/backend-relay';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  return proxyAdmin(`/admin/events/${params.id}/image`, { method: 'GET' });
}
