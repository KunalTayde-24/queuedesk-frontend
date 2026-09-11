import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from './constants';

export function getSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE_NAME)?.value ?? null;
}
