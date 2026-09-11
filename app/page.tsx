import { TopBar } from '@/components/layout/TopBar';
import { TokenForm } from '@/components/kiosk/TokenForm';

export default function KioskPage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-[1080px] px-5 pb-16 pt-4">
        <TokenForm />
      </div>
    </main>
  );
}
