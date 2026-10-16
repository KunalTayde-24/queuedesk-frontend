export default function AdminEventsLoading() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <div className="h-10 w-48 rounded-md bg-violet-soft motion-safe:animate-pulse" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-96 rounded-card bg-violet-soft motion-safe:animate-pulse" />
        <div className="h-96 rounded-card bg-violet-soft motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
