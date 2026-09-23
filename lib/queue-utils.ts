import { Token, TokenStatus } from '@/types/token';

export function computeAheadCount(tokens: Token[], newToken: Token): number {
  return tokens.filter(
    (t) => t.status === TokenStatus.WAITING && t.tokenNumber < newToken.tokenNumber,
  ).length;
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
