import { CreateTokenRequest, LoginRequest, Token, WalkInRequest } from '@/types/token';
import { AdminQueueDays, OpenDates, SendOtpResponse, VerifyOtpResponse } from '@/types/queue';
import { EventRegistrationResult, EventSummary, Registrant, RegistrationRequest } from '@/types/event';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const headers = new Headers(init?.headers);
  if (!isForm && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message ?? res.statusText;
    throw new Error(message);
  }

  return body as T;
}

export const apiClient = {
  createToken: (data: CreateTokenRequest) =>
    request<Token>('/api/tokens', { method: 'POST', body: JSON.stringify(data) }),
  fetchToday: () => request<Token[]>('/api/tokens/today', { method: 'GET' }),
  fetchOpenDates: () => request<OpenDates>('/api/tokens/dates', { method: 'GET' }),
  sendOtp: (mobile: string) =>
    request<SendOtpResponse>('/api/otp/send', { method: 'POST', body: JSON.stringify({ mobile }) }),
  verifyOtp: (mobile: string, code: string) =>
    request<VerifyOtpResponse>('/api/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobile, code }),
    }),
  fetchAdminQueue: (date: string) =>
    request<Token[]>(`/api/admin/queue?date=${encodeURIComponent(date)}`, { method: 'GET' }),
  listQueueDays: () => request<AdminQueueDays>('/api/admin/queue/days', { method: 'GET' }),
  openQueueDay: (date: string) =>
    request<{ date: string; open: true }>(`/api/admin/queue/days/${date}`, { method: 'PUT' }),
  closeQueueDay: (date: string) =>
    request<{ date: string; open: false }>(`/api/admin/queue/days/${date}`, { method: 'DELETE' }),
  createWalkIn: (data: WalkInRequest) =>
    request<Token>('/api/admin/queue/tokens', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginRequest) =>
    request<{ ok: true }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  callToken: (id: string) =>
    request(`/api/queue-actions/call/${id}`, { method: 'POST' }),
  recallToken: (id: string) =>
    request(`/api/queue-actions/recall/${id}`, { method: 'POST' }),
  skipToken: (id: string) =>
    request(`/api/queue-actions/skip/${id}`, { method: 'POST' }),
  doneToken: (id: string) =>
    request(`/api/queue-actions/done/${id}`, { method: 'POST' }),
  deleteToken: (id: string) =>
    request(`/api/queue-actions/${id}`, { method: 'DELETE' }),
  listEvents: () => request<EventSummary[]>('/api/events'),
  getEvent: (id: string) => request<EventSummary>(`/api/events/${id}`),
  registerForEvent: (id: string, data: RegistrationRequest) =>
    request<EventRegistrationResult>(`/api/events/${id}/registrations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listAdminEvents: () => request<EventSummary[]>('/api/admin/events'),
  getAdminEvent: (id: string) => request<EventSummary>(`/api/admin/events/${id}`),
  saveEvent: (id: string | null, data: FormData) =>
    request<EventSummary>(id ? `/api/admin/events/${id}` : '/api/admin/events', {
      method: id ? 'PATCH' : 'POST',
      body: data,
    }),
  publishEvent: (id: string) =>
    request<EventSummary>(`/api/admin/events/${id}/publish`, { method: 'POST' }),
  unpublishEvent: (id: string) =>
    request<EventSummary>(`/api/admin/events/${id}/unpublish`, { method: 'POST' }),
  cancelEvent: (id: string) =>
    request<EventSummary>(`/api/admin/events/${id}/cancel`, { method: 'POST' }),
  deleteEvent: (id: string) =>
    request<{ success: true }>(`/api/admin/events/${id}`, { method: 'DELETE' }),
  listRegistrants: (id: string) =>
    request<Registrant[]>(`/api/admin/events/${id}/registrations`),
};
