export enum TokenStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  DONE = 'DONE',
}

export interface Token {
  id: string;
  date: string;
  tokenNumber: number;
  name: string;
  mobile: string;
  status: TokenStatus;
  createdAt: string;
}

/** A visitor's token: the date they picked and the id returned by /otp/verify. */
export interface CreateTokenRequest {
  name: string;
  mobile: string;
  date: string;
  verificationToken: string;
}

/** A walk-in added by staff: no OTP, date defaults to today on the server. */
export interface WalkInRequest {
  name: string;
  mobile: string;
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
