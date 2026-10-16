export default function EventsLoading() {
  return (
    <div className="grid gap-4 pb-16" aria-hidden="true">
      <div className="h-4 w-28 rounded-full bg-violet-soft motion-safe:animate-pulse" />
      <div className="h-10 w-full max-w-sm rounded-md bg-violet-soft motion-safe:animate-pulse" />
      <div className="h-16 w-full max-w-xl rounded-md bg-violet-soft motion-safe:animate-pulse" />
      <div className="aspect-[16/9] w-full rounded-card bg-violet-soft motion-safe:animate-pulse md:aspect-[2.4/1]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="h-80 rounded-card bg-violet-soft motion-safe:animate-pulse" />
        <div className="h-80 rounded-card bg-violet-soft motion-safe:animate-pulse" />
        <div className="hidden h-80 rounded-card bg-violet-soft motion-safe:animate-pulse xl:block" />
      </div>
    </div>
  );
}
