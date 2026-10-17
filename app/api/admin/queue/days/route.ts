import { proxyAdmin } from '@/lib/backend-relay';

export const dynamic = 'force-dynamic';

export async function GET() {
  return proxyAdmin('/admin/queue/days', { method: 'GET' });
}
