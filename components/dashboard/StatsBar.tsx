interface StatsBarProps {
  waiting: number;
  called: number;
  served: number;
}

export function StatsBar({ waiting, called, served }: StatsBarProps) {
  const stats = [
    {
      label: 'WAITING',
      value: waiting,
      bg: 'bg-amber-light',
      border: 'border-[#F3DFAE]',
      color: 'text-amber-dark',
    },
    {
      label: 'CALLED',
      value: called,
      bg: 'bg-coral-light',
      border: 'border-[#F9C9BA]',
      color: 'text-coral-dark',
    },
    {
      label: 'SERVED',
      value: served,
      bg: 'bg-teal-light',
      border: 'border-[#B7E9D0]',
      color: 'text-teal-dark',
    },
  ];

  return (
    <div className="flex gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`min-w-[66px] rounded-xl border px-4 py-2.5 text-center shadow-sm ${s.bg} ${s.border}`}
        >
          <p className={`token-number text-[18px] font-bold ${s.color}`}>{s.value}</p>
          <p className="text-[9px] font-bold tracking-wide text-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
