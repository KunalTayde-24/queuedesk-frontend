'use client';

import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await apiClient.logout();
    router.push('/admin/login');
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border-[1.5px] border-coral-light bg-card px-3 py-2 text-xs font-bold text-coral-dark transition-colors hover:bg-coral-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
      Log out
    </button>
  );
}
