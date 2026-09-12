'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { removeToken, upsertToken } from '@/lib/queue-utils';
import { Token } from '@/types/token';

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

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return tokens;
}
