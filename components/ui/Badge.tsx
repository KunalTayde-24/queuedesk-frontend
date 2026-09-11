import clsx from 'clsx';
import { TokenStatus } from '@/types/token';
import { STATUS_LABEL } from '@/lib/constants';

const STATUS_CLASSES: Record<TokenStatus, string> = {
  [TokenStatus.WAITING]: 'bg-amber-light text-amber-dark',
  [TokenStatus.CALLED]: 'bg-coral-light text-coral-dark',
  [TokenStatus.DONE]: 'bg-violet-light text-[#6B5FA8]',
};

const DOT_CLASSES: Record<TokenStatus, string> = {
  [TokenStatus.WAITING]: 'bg-amber',
  [TokenStatus.CALLED]: 'bg-coral',
  [TokenStatus.DONE]: 'bg-[#9B8FD6]',
};

export function Badge({ status }: { status: TokenStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-bold',
        STATUS_CLASSES[status],
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', DOT_CLASSES[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}
