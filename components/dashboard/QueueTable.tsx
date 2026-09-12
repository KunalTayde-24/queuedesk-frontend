'use client';

import { useState } from 'react';
import { QueueTableRow } from './QueueTableRow';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EmptyQueueIcon } from '@/components/ui/icons';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Token } from '@/types/token';

const GRID_COLS = 'grid-cols-[34px_1fr_90px] sm:grid-cols-[48px_1fr_122px_100px_230px]';

export function QueueTable({ tokens }: { tokens: Token[] }) {
  const { show } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Token | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete(token: Token) {
    setDeleting(true);
    try {
      await apiClient.deleteToken(token.id);
      show(`Token #${token.tokenNumber} removed`);
      setPendingDelete(null);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to remove token', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-card shadow-card">
      <div
        className={`grid ${GRID_COLS} bg-gradient-to-r from-violet-light to-violet-soft px-[18px] py-2.5 text-[10.5px] font-bold tracking-wide text-violet-dark`}
      >
        <span>#</span>
        <span>Name</span>
        <span className="hidden sm:block">Mobile</span>
        <span className="hidden sm:block">Status</span>
        <span className="hidden sm:block">Actions</span>
      </div>
      {tokens.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 px-4 py-11 text-center">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="text-muted/50"
          >
            {EmptyQueueIcon}
          </svg>
          <p className="text-[13px] font-semibold text-muted/70">
            No tokens match. Try a different search or filter.
          </p>
        </div>
      ) : (
        tokens.map((t) => (
          <QueueTableRow key={t.id} token={t} onDeleteRequest={setPendingDelete} />
        ))
      )}
      <DeleteConfirmModal
        token={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </div>
  );
}
