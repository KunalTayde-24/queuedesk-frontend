import { TokenStatus } from '@/types/token';

export const STATUS_LABEL: Record<TokenStatus, string> = {
  [TokenStatus.WAITING]: 'Waiting',
  [TokenStatus.CALLED]: 'Called',
  [TokenStatus.DONE]: 'Done',
};

export const SESSION_COOKIE_NAME = 'qd_session';
