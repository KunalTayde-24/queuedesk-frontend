'use client';

import { Modal } from '@/components/ui/Modal';
import { DeleteIcon } from '@/components/ui/icons';
import { Token } from '@/types/token';

interface DeleteConfirmModalProps {
  token: Token | null;
  onCancel: () => void;
  onConfirm: (token: Token) => void;
  deleting: boolean;
}

export function DeleteConfirmModal({
  token,
  onCancel,
  onConfirm,
  deleting,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      open={!!token}
      title="Remove this token?"
      onClose={onCancel}
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {DeleteIcon}
        </svg>
      }
    >
      {token && (
        <div className="flex flex-col gap-5">
          <p className="text-[13px] leading-relaxed text-muted">
            Remove token <span className="font-bold">#{token.tokenNumber}</span> (
            {token.name}) from today&apos;s queue? This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 rounded-md border-[1.5px] border-line bg-card py-2.5 text-xs font-bold text-ink transition-colors hover:bg-violet-light disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(token)}
              disabled={deleting}
              className="flex-1 rounded-md bg-[#D6472A] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#B5391F] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6472A] focus-visible:ring-offset-2"
            >
              {deleting ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
