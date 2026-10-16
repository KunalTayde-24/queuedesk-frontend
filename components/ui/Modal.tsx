'use client';

import clsx from 'clsx';
import { ReactNode, useEffect, useId, useRef } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md';
}

export function Modal({ open, title, icon, children, onClose, size = 'sm' }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(
          'max-h-[min(92dvh,760px)] w-full overflow-y-auto overscroll-contain rounded-card border border-line border-t-4 border-t-violet bg-card p-5 shadow-lg outline-none motion-safe:animate-fadeIn sm:p-6',
          size === 'md' ? 'max-w-lg' : 'max-w-sm',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[11px] bg-violet-light text-violet">
            {icon}
          </div>
        )}
        <h3 id={titleId} className="mb-3 font-serif text-[17px] font-bold leading-6 text-violet-dark">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
