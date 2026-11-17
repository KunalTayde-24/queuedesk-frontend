/** One event's queue that is open for visitors on one date ("YYYY-MM-DD"). */
export interface OpenQueue {
  eventId: string;
  title: string;
  date: string;
  startsAt: string;
  endsAt: string;
}

/** Queues visitors may pick from, from GET /tokens/dates. */
export interface OpenDates {
  today: string;
  queues: OpenQueue[];
}

/** One event's queue on one date, on the admin calendar. */
export interface QueueDaySummary {
  date: string;
  /** Null for days from before queues belonged to events (history). */
  eventId: string | null;
  eventTitle: string | null;
  open: boolean;
  tokenCount: number;
}

export interface AdminQueueDays {
  today: string;
  days: QueueDaySummary[];
}

export interface SendOtpResponse {
  sent: true;
  expiresInSeconds: number;
  resendAfterSeconds: number;
  /** Present only in test mode, when nothing is really sent. */
  devCode?: string;
}

export interface VerifyOtpResponse {
  verificationToken: string;
  expiresInSeconds: number;
}
