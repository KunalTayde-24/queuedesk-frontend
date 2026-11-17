import { Token, TokenStatus } from '@/types/token';

export function computeAheadCount(tokens: Token[], newToken: Token): number {
  return tokens.filter(
    (t) => t.status === TokenStatus.WAITING && t.tokenNumber < newToken.tokenNumber,
  ).length;
}

/** "Now serving": the called token that was called most recently (staff can call several). */
export function latestCalled(tokens: Token[]): Token | undefined {
  const called = tokens.filter((t) => t.status === TokenStatus.CALLED);
  const at = (t: Token) => (t.calledAt ? Date.parse(t.calledAt) : 0);
  return called.reduce<Token | undefined>(
    (best, t) => (!best || at(t) > at(best) || (at(t) === at(best) && t.tokenNumber > best.tokenNumber) ? t : best),
    undefined,
  );
}

/** The event queue with the most people waiting (null = tokens from before queues belonged to events). */
export function busiestWaitingEvent(tokens: Token[]): string | null {
  const counts = new Map<string | null, number>();
  for (const t of tokens) {
    if (t.status !== TokenStatus.WAITING) continue;
    const key = t.eventId ?? null;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  counts.forEach((count, key) => {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  });
  return best;
}

export function sortByTokenNumberAsc(tokens: Token[]): Token[] {
  return [...tokens].sort((a, b) => a.tokenNumber - b.tokenNumber);
}

export function sortByTokenNumberDesc(tokens: Token[]): Token[] {
  return [...tokens].sort((a, b) => b.tokenNumber - a.tokenNumber);
}

export type FilterTab = 'ALL' | TokenStatus;

export function filterTokens(
  tokens: Token[],
  { status, search }: { status: FilterTab; search: string },
): Token[] {
  const term = search.trim().toLowerCase();

  return tokens.filter((t) => {
    const matchesStatus = status === 'ALL' || t.status === status;
    const matchesSearch =
      term.length === 0 ||
      t.name.toLowerCase().includes(term) ||
      t.mobile.includes(term);

    return matchesStatus && matchesSearch;
  });
}

export function countByStatus(tokens: Token[]) {
  return {
    waiting: tokens.filter((t) => t.status === TokenStatus.WAITING).length,
    called: tokens.filter((t) => t.status === TokenStatus.CALLED).length,
    served: tokens.filter((t) => t.status === TokenStatus.DONE).length,
  };
}
