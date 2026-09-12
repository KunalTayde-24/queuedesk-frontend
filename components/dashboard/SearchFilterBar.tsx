import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { FilterTab } from '@/lib/queue-utils';
import { TokenStatus } from '@/types/token';

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Waiting', value: TokenStatus.WAITING },
  { label: 'Called', value: TokenStatus.CALLED },
  { label: 'Done', value: TokenStatus.DONE },
];

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  onToggleWalkin: () => void;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  onToggleWalkin,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative w-full sm:min-w-[220px] sm:flex-1">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or mobile number..."
          className="w-full rounded-md border-[1.5px] border-line bg-card py-2.5 pl-9 pr-3 text-[13.5px] text-ink outline-none transition-colors focus:border-violet focus:ring-4 focus:ring-violet-light"
        />
      </div>
      <div className="flex gap-1 rounded-md border-[1.5px] border-line bg-card p-[3px]">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={clsx(
              'rounded-[7px] px-3 py-2 text-xs font-bold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
              activeTab === tab.value ? 'bg-violet-light text-violet-dark' : 'text-muted hover:bg-violet-soft',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Button variant="ghost" onClick={onToggleWalkin} className="whitespace-nowrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add walk-in
      </Button>
    </div>
  );
}
