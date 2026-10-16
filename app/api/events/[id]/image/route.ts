import { proxyPublic } from '@/lib/backend-relay';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  return proxyPublic(`/events/${params.id}/image`, { method: 'GET' });
}
