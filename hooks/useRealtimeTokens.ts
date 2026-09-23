'use client';

import { useEffect, useState } from 'react';
import { Token } from '@/types/token';

const POLL_INTERVAL_MS = 3000;

export function useRealtimeTokens(initial: Token[] = []) {
  const [tokens, setTokens] = useState<Token[]>(initial);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/tokens/today', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Token[];
        if (!cancelled) setTokens(data);
      } catch {
        // Ignore transient network errors; the next poll will catch the
        // view up.
      }
    };
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return tokens;
}
