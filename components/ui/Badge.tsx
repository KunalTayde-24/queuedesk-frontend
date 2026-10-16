import clsx from 'clsx';
import { TokenStatus } from '@/types/token';
import { STATUS_LABEL } from '@/lib/constants';

const STATUS_CLASSES: Record<TokenStatus, string> = {
  [TokenStatus.WAITING]: 'bg-amber-light text-amber-dark',
  [TokenStatus.CALLED]: 'bg-violet-light text-violet',
  [TokenStatus.DONE]: 'bg-teal-light text-teal-dark',
};

export function Badge({ status }: { status: TokenStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold leading-4',
        STATUS_CLASSES[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
