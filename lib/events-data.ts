import { EventSummary, Registrant } from '@/types/event';
import { forwardToBackend } from './backend-proxy';
import { getSessionToken } from './auth-cookie';

async function readJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

export async function loadPublicEvents(): Promise<{ events: EventSummary[]; error: boolean }> {
  try {
    const res = await forwardToBackend('/events', { method: 'GET' });
    if (!res.ok) return { events: [], error: true };
    return { events: (await res.json()) as EventSummary[], error: false };
  } catch {
    return { events: [], error: true };
  }
}

export async function loadPublicEvent(id: string): Promise<EventSummary | null> {
  try {
    const res = await forwardToBackend(`/events/${id}`, { method: 'GET' });
    return readJson<EventSummary>(res);
  } catch {
    return null;
  }
}

export async function loadAdminEvents(): Promise<{ events: EventSummary[]; error: boolean }> {
  const token = getSessionToken();
  if (!token) return { events: [], error: true };
  try {
    const res = await forwardToBackend('/admin/events', { method: 'GET', token });
    if (!res.ok) return { events: [], error: true };
    return { events: (await res.json()) as EventSummary[], error: false };
  } catch {
    return { events: [], error: true };
  }
}

export async function loadAdminEvent(id: string): Promise<EventSummary | null> {
  const token = getSessionToken();
  if (!token) return null;
  try {
    const res = await forwardToBackend(`/admin/events/${id}`, { method: 'GET', token });
    return readJson<EventSummary>(res);
  } catch {
    return null;
  }
}

export async function loadRegistrants(id: string): Promise<{ registrants: Registrant[]; error: boolean }> {
  const token = getSessionToken();
  if (!token) return { registrants: [], error: true };
  try {
    const res = await forwardToBackend(`/admin/events/${id}/registrations`, { method: 'GET', token });
    if (!res.ok) return { registrants: [], error: true };
    return { registrants: (await res.json()) as Registrant[], error: false };
  } catch {
    return { registrants: [], error: true };
  }
}
