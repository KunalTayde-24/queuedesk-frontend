import { TopBar } from '@/components/layout/TopBar';

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <TopBar />
      <div className="mx-auto min-w-0 max-w-[1080px] px-4 pt-4 sm:px-5">{children}</div>
    </main>
  );
}
