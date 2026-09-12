'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { removeToken, upsertToken } from '@/lib/queue-utils';
import { Token } from '@/types/token';

const POLL_INTERVAL_MS = 6000;

export function useRealtimeTokens(initial: Token[] = []) {
  const [tokens, setTokens] = useState<Token[]>(initial);

  useEffect(() => {
    // A unique channel name per mount avoids a real-world Supabase Realtime
    // gotcha: React Strict Mode (dev only) mounts -> cleans up -> mounts
    // again, and re-subscribing under the same fixed channel name can leave
    // the client in a half-closed state that silently drops events.
    const channelName = `tokens-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tokens' },
        (payload) => setTokens((prev) => upsertToken(prev, payload.new as Token)),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tokens' },
        (payload) => setTokens((prev) => upsertToken(prev, payload.new as Token)),
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tokens' },
        (payload) =>
          setTokens((prev) => removeToken(prev, (payload.old as Token).id)),
      )
      .subscribe();

    // Polling backstop: Realtime should deliver updates instantly, but a
    // WebSocket can silently drop (idle timeout, backgrounded tab, network
    // blip) without visibly erroring. This keeps the view self-healing
    // within a few seconds even if that ever happens, instead of requiring
    // a manual refresh.
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/tokens/today', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Token[];
        if (!cancelled) setTokens(data);
      } catch {
        // Ignore transient network errors; the next poll or a realtime
        // event will catch the view up.
      }
    };
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return tokens;
}
