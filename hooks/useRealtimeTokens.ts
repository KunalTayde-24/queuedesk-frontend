'use client';

import { useEffect, useState } from 'react';
import { Token } from '@/types/token';

const POLL_INTERVAL_MS = 3000;

/** Polls `url` every few seconds. Pass a different URL (e.g. another date) to switch queues. */
export function useRealtimeTokens(initial: Token[] = [], url = '/api/tokens/today') {
  const [tokens, setTokens] = useState<Token[]>(initial);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Token[];
        if (!cancelled) setTokens(data);
      } catch {
        // Ignore transient network errors; the next poll will catch the
        // view up.
      }
    };
    void poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [url]);

  return tokens;
}
