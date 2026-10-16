import { AdminSectionNav } from '@/components/admin/AdminSectionNav';
import { TopBar } from '@/components/layout/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <TopBar />
      <div className="mx-auto max-w-[1080px] px-4 pb-16 pt-2 sm:px-5">
        <AdminSectionNav />
        {children}
      </div>
    </div>
  );
}
