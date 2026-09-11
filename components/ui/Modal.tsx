'use client';

import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, icon, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-fadeIn rounded-card bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[11px] bg-coral-light text-coral-dark">
            {icon}
          </div>
        )}
        <h3 className="mb-2 font-serif text-base font-bold text-violet-dark">{title}</h3>
        {children}
      </div>
    </div>
  );
}
