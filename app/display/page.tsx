import { DisplayClient } from '@/components/display/DisplayClient';
import { Token } from '@/types/token';

async function fetchInitialTokens(): Promise<Token[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tokens/today`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DisplayPage() {
  const initialTokens = await fetchInitialTokens();
  return <DisplayClient initialTokens={initialTokens} />;
}
