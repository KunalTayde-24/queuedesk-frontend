export enum TokenStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  DONE = 'DONE',
}

export interface Token {
  id: string;
  date: string;
  tokenNumber: number;
  /** The event whose queue this token is in (null for tokens from before queues belonged to events). */
  eventId?: string | null;
  eventTitle?: string | null;
  eventVenue?: string | null;
  eventStartsAt?: string | null;
  eventEndsAt?: string | null;
  name: string;
  mobile: string;
  status: TokenStatus;
  /** When staff last called it (ISO). Several tokens can be called at once. */
  calledAt?: string | null;
  createdAt: string;
}

/** A visitor's token: the date they picked and the id returned by /otp/verify. */
export interface CreateTokenRequest {
  name: string;
  mobile: string;
  eventId: string;
  date: string;
  verificationToken: string;
}

/** A walk-in added by staff: no OTP, date defaults to today on the server. */
export interface WalkInRequest {
  name: string;
  mobile: string;
  eventId: string;
  date?: string;
}

export type CreateTokenResponse = Token;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

export interface QueueActionResponse {
  success: true;
  token: Token;
  warning?: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}
