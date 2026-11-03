'use client';

import { useEffect, useState } from 'react';
import { Token } from '@/types/token';

const POLL_INTERVAL_MS = 2000;

/**
 * Polls `url` every few seconds and also reports whether the first answer has arrived,
 * so a caller can tell "not loaded yet" from "loaded and empty". Pass null to not poll.
 */
export function useRealtimeQueue(initial: Token[] = [], url: string | null = '/api/tokens/today') {
  const [state, setState] = useState<{ tokens: Token[]; loaded: boolean }>({ tokens: initial, loaded: false });

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setState((current) => ({ ...current, loaded: false }));
    const poll = async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Token[];
        if (!cancelled) setState({ tokens: data, loaded: true });
      } catch {
        // Ignore transient network errors; the next poll will catch the view up.
      }
    };
    void poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    // Browsers slow timers in background tabs, so catch up the moment the page is shown again.
    const onShow = () => {
      if (document.visibilityState === 'visible') void poll();
    };
    document.addEventListener('visibilitychange', onShow);
    window.addEventListener('focus', onShow);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onShow);
      window.removeEventListener('focus', onShow);
    };
  }, [url]);

  return state;
}

/** Polls `url` every few seconds. Pass a different URL (e.g. another date) to switch queues, or null to not poll. */
export function useRealtimeTokens(initial: Token[] = [], url: string | null = '/api/tokens/today') {
  return useRealtimeQueue(initial, url).tokens;
}
