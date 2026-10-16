import { proxyPublic } from '@/lib/backend-relay';

export async function GET() {
  return proxyPublic('/events', { method: 'GET' });
}
