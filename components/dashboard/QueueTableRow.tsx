'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { ActionButton } from '@/components/ui/ActionButton';
import { CallIcon, RecallIcon, SkipIcon, DoneIcon, DeleteIcon } from '@/components/ui/icons';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Token, TokenStatus, QueueActionResponse } from '@/types/token';

interface QueueTableRowProps {
  token: Token;
  onDeleteRequest: (token: Token) => void;
}

const GRID_COLS = 'grid-cols-[34px_1fr_90px] sm:grid-cols-[48px_1fr_122px_100px_230px]';

export function QueueTableRow({ token, onDeleteRequest }: QueueTableRowProps) {
  const { show } = useToast();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function runAction(action: string, fn: () => Promise<unknown>, successText: string) {
    setPendingAction(action);
    try {
      const result = (await fn()) as QueueActionResponse;
      if (result?.warning) {
        show(result.warning, 'error');
      } else {
        show(successText, action === 'call' || action === 'recall' ? 'whatsapp' : 'default');
      }
    } catch (err) {
      show(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setPendingAction(null);
    }
  }

  const busy = pendingAction !== null;

  return (
    <div
      className={`grid ${GRID_COLS} items-center gap-y-2 border-b border-line px-[18px] py-3.5 text-[13.5px] transition-colors last:border-b-0 hover:bg-violet-soft/60 sm:gap-y-1.5 ${
        token.status === TokenStatus.DONE ? 'opacity-70' : ''
      }`}
    >
      <span className="token-number text-[16px] font-bold text-violet">{token.tokenNumber}</span>
      <span className="font-bold">{token.name}</span>
      <span className="hidden text-[12.5px] font-medium text-muted sm:block">
        +91 {token.mobile}
      </span>
      <span className="justify-self-end sm:justify-self-start">
        <Badge status={token.status} />
      </span>
      <span className="col-span-3 mt-1 flex flex-wrap gap-1.5 sm:col-span-1 sm:mt-0">
        {token.status === TokenStatus.WAITING && (
          <>
            <ActionButton
              kind="call"
              icon={CallIcon}
              disabled={busy}
              onClick={() =>
                runAction(
                  'call',
                  () => apiClient.callToken(token.id),
                  `WhatsApp sent to +91 ${token.mobile}: "Your token ${token.tokenNumber} has been called."`,
                )
              }
            >
              {pendingAction === 'call' ? 'Calling…' : 'Call'}
            </ActionButton>
            <ActionButton
              kind="del"
              icon={DeleteIcon}
              disabled={busy}
              onClick={() => onDeleteRequest(token)}
            >
              Remove
            </ActionButton>
          </>
        )}
        {token.status === TokenStatus.CALLED && (
          <>
            <ActionButton
              kind="done"
              icon={DoneIcon}
              disabled={busy}
              onClick={() => runAction('done', () => apiClient.doneToken(token.id), 'Marked done')}
            >
              {pendingAction === 'done' ? 'Saving…' : 'Done'}
            </ActionButton>
            <ActionButton
              kind="recall"
              icon={RecallIcon}
              disabled={busy}
              onClick={() =>
                runAction(
                  'recall',
                  () => apiClient.recallToken(token.id),
                  `WhatsApp re-sent to +91 ${token.mobile}: "Your token ${token.tokenNumber} has been called."`,
                )
              }
            >
              {pendingAction === 'recall' ? 'Recalling…' : 'Recall'}
            </ActionButton>
            <ActionButton
              kind="skip"
              icon={SkipIcon}
              disabled={busy}
              onClick={() =>
                runAction(
                  'skip',
                  () => apiClient.skipToken(token.id),
                  `Token ${token.tokenNumber} skipped and moved back to waiting.`,
                )
              }
            >
              {pendingAction === 'skip' ? 'Skipping…' : 'Skip'}
            </ActionButton>
          </>
        )}
        {token.status === TokenStatus.DONE && (
          <span className="text-[11px] text-muted/60">No actions</span>
        )}
      </span>
    </div>
  );
}
