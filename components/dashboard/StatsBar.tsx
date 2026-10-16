interface StatsBarProps {
  waiting: number;
  called: number;
  served: number;
}

export function StatsBar({ waiting, called, served }: StatsBarProps) {
  const stats = [
    { label: 'Waiting', value: waiting, tone: 'bg-amber-light border-amber/30 text-amber-dark' },
    { label: 'Called', value: called, tone: 'bg-violet-light border-violet/25 text-violet' },
    { label: 'Served', value: served, tone: 'bg-teal-light border-teal/25 text-teal-dark' },
  ];

  return (
    <dl className="m-0 flex gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`min-w-[64px] rounded-xl border px-3.5 py-2 text-center ${s.tone}`}
        >
          <dd className="token-number m-0 text-[18px] font-black leading-tight">{s.value}</dd>
          <dt className="text-[10.5px] font-extrabold uppercase tracking-wide text-muted">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
