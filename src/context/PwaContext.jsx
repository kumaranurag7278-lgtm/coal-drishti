import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from './ToastContext.jsx';

// Install prompt + service worker status.
const PwaContext = createContext(null);
const SEEN_KEY = 'coaldrishti.offlineReadySeen';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export function PwaProvider({ children }) {
  const toast = useToast();
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [offlineReady, setOfflineReady] = useState(false);

  useRegisterSW({
    onOfflineReady() {
      setOfflineReady(true);
      try {
        if (!window.localStorage.getItem(SEEN_KEY)) {
          window.localStorage.setItem(SEEN_KEY, '1');
          toast('COAL DRISHTI is ready to work offline.', 'ok', 4200);
        }
      } catch {
        /* ignore */
      }
    },
  });

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
  }, [deferred]);

  const value = useMemo(
    () => ({
      canInstall: Boolean(deferred) && !installed,
      needsIosHint: isIOS() && !installed,
      installed,
      offlineReady,
      install,
    }),
    [deferred, installed, offlineReady, install],
  );
  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const ctx = useContext(PwaContext);
  if (!ctx) throw new Error('usePwa must be used inside PwaProvider');
  return ctx;
}
