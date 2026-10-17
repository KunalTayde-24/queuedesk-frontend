import { proxyPublic } from '@/lib/backend-relay';

export const dynamic = 'force-dynamic';

export async function GET() {
  return proxyPublic('/tokens/dates', { method: 'GET' });
}
