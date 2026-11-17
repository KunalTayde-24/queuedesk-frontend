import { todayKey } from '@/lib/dates';
import { EventSummary } from '@/types/event';
import { QueueDaySummary } from '@/types/queue';

/** One event's queue on the selected date, as the admin dashboard shows it. */
export interface DashboardQueue {
  /** Stable key: the event id, or "legacy" for tokens from before queues belonged to events. */
  key: string;
  eventId: string | null;
  title: string;
  open: boolean;
  tokenCount: number;
}

/** Does the event run on this Singapore calendar day ("YYYY-MM-DD")? */
export function eventCoversDate(event: Pick<EventSummary, 'startsAt' | 'endsAt'>, key: string): boolean {
  const first = todayKey(new Date(event.startsAt));
  const last = todayKey(new Date(Date.parse(event.endsAt) - 1));
  return key >= first && key <= last;
}

/**
 * The queues of one date: every published event that runs a queue on that day (even if its
 * queue is closed and empty, so it can be reopened) plus any queue that already has tokens.
 */
export function queuesForDate(date: string, days: QueueDaySummary[], events: EventSummary[]): DashboardQueue[] {
  const byKey = new Map<string, DashboardQueue>();
  for (const event of events) {
    if (event.status === 'PUBLISHED' && event.needsQueue !== false && eventCoversDate(event, date)) {
      byKey.set(event.id, { key: event.id, eventId: event.id, title: event.title, open: false, tokenCount: 0 });
    }
  }
  for (const day of days) {
    if (day.date !== date) continue;
    const key = day.eventId ?? 'legacy';
    const queue = byKey.get(key) ?? {
      key,
      eventId: day.eventId,
      title: day.eventTitle ?? 'General (no event)',
      open: false,
      tokenCount: 0,
    };
    queue.open = day.open;
    queue.tokenCount = day.tokenCount;
    byKey.set(key, queue);
  }
  return [...byKey.values()].sort((a, b) => a.title.localeCompare(b.title));
}
