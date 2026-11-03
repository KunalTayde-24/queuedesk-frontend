/** Dates visitors may pick, from GET /tokens/dates. All values are "YYYY-MM-DD". */
export interface OpenDates {
  today: string;
  dates: string[];
  /** Published events attached to those dates. */
  events: { date: string; id: string; title: string }[];
}

/** One day on the admin calendar. */
export interface QueueDaySummary {
  date: string;
  open: boolean;
  tokenCount: number;
  /** Published events that opened this date. */
  events: { id: string; title: string }[];
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
