'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { todayKey } from '@/lib/dates';
import { Token } from '@/types/token';

/**
 * The visitor's own token, remembered in this browser so a refresh, a closed tab
 * or switching apps never loses their number. A token belongs to the queue date
 * it was booked for; once that date has passed the saved copy is ignored.
 */
const KEY = 'qd-my-token';
const CHANGE_EVENT = 'qd-my-token-change';
const IST_OFFSET_MS = 330 * 60 * 1000;

export interface MyToken {
  id: string;
  tokenNumber: number;
  name: string;
  mobile: string;
  /** The queue date this token is for, "YYYY-MM-DD". */
  date: string;
  createdAt: string;
}

function istDay(ms: number) {
  return new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function parse(raw: string | null): MyToken | null {
  if (!raw) return null;
  try {
    const t = JSON.parse(raw) as MyToken;
    if (!t || typeof t.id !== 'string' || typeof t.tokenNumber !== 'number') return null;
    // Tokens saved before dates existed were always for the day they were taken.
    const date = typeof t.date === 'string' ? t.date.slice(0, 10) : istDay(Date.parse(t.createdAt));
    if (date < todayKey()) return null;
    return { ...t, date };
  } catch {
    return null;
  }
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveMyToken(token: Token) {
  const mine: MyToken = {
    id: token.id,
    tokenNumber: token.tokenNumber,
    name: token.name,
    mobile: token.mobile,
    date: token.date.slice(0, 10),
    createdAt: token.createdAt,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(mine));
  } catch {
    // Storage can be blocked (private mode); the ticket still shows for this page view.
  }
  notify();
}

export function clearMyToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  notify();
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getRaw() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** The saved token for today, or null. Always null on the server, so it never causes a hydration mismatch. */
export function useMyToken(): MyToken | null {
  const raw = useSyncExternalStore(subscribe, getRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
}
