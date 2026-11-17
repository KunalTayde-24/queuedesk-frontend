import { NextRequest } from 'next/server';
import { proxyAdmin } from '@/lib/backend-relay';

interface RouteContext {
  params: { date: string };
}

function target(req: NextRequest, params: { date: string }) {
  const eventId = req.nextUrl.searchParams.get('eventId') ?? '';
  return `/admin/queue/days/${encodeURIComponent(params.date)}?eventId=${encodeURIComponent(eventId)}`;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  return proxyAdmin(target(req, params), { method: 'PUT' });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  return proxyAdmin(target(req, params), { method: 'DELETE' });
}
