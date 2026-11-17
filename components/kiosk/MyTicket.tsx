'use client';

import { useEffect, useRef } from 'react';
import { useRealtimeQueue } from '@/hooks/useRealtimeTokens';
import { clearMyToken, MyToken, saveMyToken } from '@/lib/my-token';
import { Token, TokenStatus } from '@/types/token';
import { TicketCard } from './TicketCard';

// How long after creating a token we trust the polled list to already contain it.
const SETTLE_MS = 15_000;

/**
 * One of the visitor's saved tickets, kept live: its status and "ahead of you" count come from
 * the queue of its own event, and it follows the token if staff move it.
 */
export function MyTicket({
  mine,
  today,
  todayTokens,
  removable,
}: {
  mine: MyToken;
  today: string;
  /** Today's live tokens of every event (the page polls them). */
  todayTokens: Token[];
  /** More than one ticket is saved, so the card button removes just this one. */
  removable: boolean;
}) {
  const seenLive = useRef(false);

  // If staff move the token to another date or event, its details change on the server.
  // Keep the saved ticket in step, so it keeps following the right queue.
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const res = await fetch(`/api/tokens/${mine.id}`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const server = (await res.json()) as Token;
        if (
          server.date.slice(0, 10) !== mine.date ||
          server.tokenNumber !== mine.tokenNumber ||
          (server.eventId ?? null) !== mine.eventId ||
          (server.eventTitle ?? null) !== mine.eventTitle ||
          (server.eventVenue ?? null) !== mine.eventVenue ||
          (server.eventStartsAt ?? null) !== mine.eventStartsAt ||
          (server.eventEndsAt ?? null) !== mine.eventEndsAt
        ) {
          // The public copy carries no name or phone number, so keep ours.
          saveMyToken({ ...server, name: mine.name, mobile: mine.mobile });
        }
      } catch {
        // Ignore transient network errors; the next check will catch up.
      }
    };
    void sync();
    const timer = setInterval(sync, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [
    mine.id,
    mine.date,
    mine.tokenNumber,
    mine.eventId,
    mine.eventTitle,
    mine.eventVenue,
    mine.eventStartsAt,
    mine.eventEndsAt,
    mine.name,
    mine.mobile,
  ]);

  const isToday = mine.date === today;
  // A token booked for a later date is followed on that date's own queue, so "called" shows up too.
  const { tokens: laterTokens, loaded: laterLoaded } = useRealtimeQueue(
    [],
    isToday
      ? null
      : `/api/tokens/by-date?date=${encodeURIComponent(mine.date)}${mine.eventId ? `&eventId=${encodeURIComponent(mine.eventId)}` : ''}`,
  );
  const sameQueue = (t: Token) => (t.eventId ?? null) === mine.eventId;
  const queue = (isToday ? todayTokens : laterTokens).filter(sameQueue);

  const live = queue.find((t) => t.id === mine.id);
  if (live) seenLive.current = true;
  const current: Token = {
    id: mine.id,
    date: mine.date,
    eventId: mine.eventId,
    eventTitle: mine.eventTitle,
    eventVenue: mine.eventVenue,
    eventStartsAt: mine.eventStartsAt,
    eventEndsAt: mine.eventEndsAt,
    tokenNumber: mine.tokenNumber,
    // The public queue never carries names or phone numbers, so always use our own copy.
    name: mine.name,
    mobile: mine.mobile,
    status: live?.status ?? TokenStatus.WAITING,
    createdAt: mine.createdAt,
  };
  const ahead = live
    ? queue.filter((t) => t.status === TokenStatus.WAITING && t.tokenNumber < mine.tokenNumber).length
    : isToday
      ? queue.filter((t) => t.status === TokenStatus.WAITING && t.tokenNumber < mine.tokenNumber).length
      : 0;

  // Removed by staff: the queue loaded and ours is not in it. Right after booking, allow a short
  // settling time first (the next poll may not include it yet).
  const settled = seenLive.current || Date.now() - Date.parse(mine.createdAt) > SETTLE_MS;
  const gone = isToday ? !live && queue.length > 0 && settled : laterLoaded && !live && settled;

  const onNew = () => {
    seenLive.current = false;
    clearMyToken(mine.id);
  };

  if (!isToday) {
    const progressed = live && live.status !== TokenStatus.WAITING;
    return (
      <TicketCard
        token={current}
        ahead={ahead}
        gone={gone}
        date={mine.date}
        upcoming={!progressed}
        onNew={onNew}
        newLabel={removable ? 'Remove' : 'New token'}
      />
    );
  }

  return (
    <TicketCard
      token={current}
      ahead={ahead}
      gone={gone}
      date={mine.date}
      onNew={onNew}
      newLabel={removable ? 'Remove' : 'New token'}
    />
  );
}
