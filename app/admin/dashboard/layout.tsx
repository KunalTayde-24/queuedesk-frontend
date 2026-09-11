import { TopBar } from '@/components/layout/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-[1080px] px-5 pb-16 pt-2">{children}</div>
    </div>
  );
}
