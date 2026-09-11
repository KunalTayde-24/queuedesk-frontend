const API_URL = process.env.API_URL;

interface ForwardOptions extends RequestInit {
  token?: string | null;
}

/**
 * Server-only helper used inside Next.js route handlers to forward a request
 * to the NestJS backend, attaching a Bearer token pulled from the httpOnly
 * session cookie when present.
 */
export async function forwardToBackend(path: string, init: ForwardOptions = {}) {
  const { token, headers, ...rest } = init;

  return fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
}
