import { proxyPublic } from '@/lib/backend-relay';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return proxyPublic(`/tokens/${encodeURIComponent(params.id)}`, { method: 'GET' });
}
