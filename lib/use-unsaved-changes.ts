'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Warns before leaving a form that has unsaved changes.
 *
 * - Closing or refreshing the tab: the browser's own "leave site?" prompt.
 * - Clicking any in-app link (top bar, "Back to events", ...): `pending` holds the target so the
 *   page can show its own confirm dialog; call `leave()` to go on or `stay()` to cancel.
 *
 * The browser Back button is not intercepted: the Next.js router has already changed page by the
 * time the event fires, and undoing it would reload the page and lose the form anyway.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!dirtyRef.current) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      event.stopPropagation();
      setPending(url.pathname + url.search + url.hash);
    };
    // Capture phase, so we run before Next.js' own link handler.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return {
    pending,
    stay: () => setPending(null),
    leave: () => {
      const href = pending;
      dirtyRef.current = false;
      setPending(null);
      if (href) router.push(href);
    },
  };
}
