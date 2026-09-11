'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { removeToken, upsertToken } from '@/lib/queue-utils';
import { Token } from '@/types/token';

export function useRealtimeTokens(initial: Token[] = []) {
  const [tokens, setTokens] = useState<Token[]>(initial);

  useEffect(() => {
    const channel = supabase
      .channel('tokens-today')
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
