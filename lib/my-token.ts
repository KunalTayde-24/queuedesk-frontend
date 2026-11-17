'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { todayKey } from '@/lib/dates';
import { Token } from '@/types/token';

/**
 * The visitor's own tokens, remembered in this browser so a refresh, a closed tab or switching
 * apps never loses their number. A visitor can hold one token per event, so this is a list. A
 * token belongs to the queue date it was booked for; once that date has passed the saved copy
 * is ignored.
 */
const KEY = 'qd-my-tokens';
// Before a visitor could hold several tokens, one ticket was saved under this key.
const LEGACY_KEY = 'qd-my-token';
const CHANGE_EVENT = 'qd-my-token-change';
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

export interface MyToken {
  id: string;
  tokenNumber: number;
  name: string;
  mobile: string;
  /** The queue date this token is for, "YYYY-MM-DD". */
  date: string;
  /** The event whose queue it is in (null for tokens taken before queues belonged to events). */
  eventId: string | null;
  eventTitle: string | null;
  eventVenue: string | null;
  eventStartsAt: string | null;
  eventEndsAt: string | null;
  createdAt: string;
}

function sgtDay(ms: number) {
  return new Date(ms + SGT_OFFSET_MS).toISOString().slice(0, 10);
}

function parseOne(t: Partial<MyToken> | null): MyToken | null {
  if (!t || typeof t.id !== 'string' || typeof t.tokenNumber !== 'number') return null;
  // Tokens saved before dates existed were always for the day they were taken.
  const createdAt = typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString();
  const date = typeof t.date === 'string' ? t.date.slice(0, 10) : sgtDay(Date.parse(createdAt));
  if (date < todayKey()) return null;
  return {
    id: t.id,
    tokenNumber: t.tokenNumber,
    name: t.name ?? '',
    mobile: t.mobile ?? '',
    date,
    eventId: t.eventId ?? null,
    eventTitle: t.eventTitle ?? null,
    eventVenue: t.eventVenue ?? null,
    eventStartsAt: t.eventStartsAt ?? null,
    eventEndsAt: t.eventEndsAt ?? null,
    createdAt,
  };
}

function parse(raw: string | null): MyToken[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as unknown;
    const list = Array.isArray(value) ? value : [value];
    return list
      .map((item) => parseOne(item as Partial<MyToken>))
      .filter((t): t is MyToken => t !== null)
      .sort((a, b) => a.date.localeCompare(b.date) || a.tokenNumber - b.tokenNumber);
  } catch {
    return [];
  }
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function getRaw(): string | null {
  try {
    const list = localStorage.getItem(KEY);
    if (list !== null) return list;
    const legacy = localStorage.getItem(LEGACY_KEY);
    return legacy === null ? null : `[${legacy}]`;
  } catch {
    return null;
  }
}

function write(list: MyToken[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Storage can be blocked (private mode); the ticket still shows for this page view.
  }
  notify();
}

/** Adds the token, or updates it if it is already saved (same id). */
export function saveMyToken(token: Token) {
  const mine: MyToken = {
    id: token.id,
    tokenNumber: token.tokenNumber,
    name: token.name,
    mobile: token.mobile,
    date: token.date.slice(0, 10),
    eventId: token.eventId ?? null,
    eventTitle: token.eventTitle ?? null,
    eventVenue: token.eventVenue ?? null,
    eventStartsAt: token.eventStartsAt ?? null,
    eventEndsAt: token.eventEndsAt ?? null,
    createdAt: token.createdAt,
  };
  write([...parse(getRaw()).filter((t) => t.id !== mine.id), mine]);
}

/** Forgets one saved ticket. */
export function clearMyToken(id: string) {
  write(parse(getRaw()).filter((t) => t.id !== id));
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** The saved tokens that are still for today or later. Always empty on the server, so it never causes a hydration mismatch. */
export function useMyTokens(): MyToken[] {
  const raw = useSyncExternalStore(subscribe, getRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
}
