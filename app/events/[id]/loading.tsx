export default function EventDetailLoading() {
  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:pb-16" aria-hidden="true">
      <div className="overflow-hidden rounded-card bg-violet-soft motion-safe:animate-pulse">
        <div className="aspect-[16/9] w-full" />
        <div className="h-40" />
      </div>
      <div className="h-80 rounded-card bg-violet-soft motion-safe:animate-pulse" />
    </div>
  );
}
