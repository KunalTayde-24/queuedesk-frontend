import { CreateTokenRequest, LoginRequest, Token } from '@/types/token';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
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
};
