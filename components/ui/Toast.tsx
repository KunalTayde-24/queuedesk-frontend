'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from 'react';
import clsx from 'clsx';

type ToastKind = 'default' | 'whatsapp' | 'error';

interface ToastState {
  text: string;
  kind: ToastKind;
  visible: boolean;
}

interface ToastContextValue {
  show: (text: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ text: '', kind: 'default', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((text: string, kind: ToastKind = 'default') => {
    setToast({ text, kind, visible: true });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className={clsx(
          'fixed bottom-6 left-1/2 z-[70] flex max-w-[90%] -translate-x-1/2 items-center gap-2.5 rounded-xl bg-[#241F3D] px-5 py-3.5 text-[13px] text-white shadow-lg transition-all duration-200',
          toast.visible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-6 opacity-0',
        )}
      >
        {toast.kind === 'whatsapp' && (
          <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2s-.8 1-.9 1.1c-.2.2-.3.2-.6.1s-1.3-.5-2.4-1.5c-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.4-.5.2-.4v-.4c0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4Z" />
              <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Z" />
            </svg>
          </span>
        )}
        {toast.kind === 'error' && (
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-coral" />
        )}
        <span>{toast.text}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
