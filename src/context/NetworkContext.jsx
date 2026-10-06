import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Real browser online/offline status, plus a demo switch so the offline flow
// can be shown on a laptop without opening DevTools.
const NetworkContext = createContext(null);
const DEMO_KEY = 'coaldrishti.demoOffline';

export function NetworkProvider({ children }) {
  const [browserOnline, setBrowserOnline] = useState(() => navigator.onLine);
  const [demoOffline, setDemoOfflineState] = useState(() => {
    try {
      return window.sessionStorage.getItem(DEMO_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const on = () => setBrowserOnline(true);
    const off = () => setBrowserOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const setDemoOffline = useCallback((value) => {
    setDemoOfflineState(value);
    try {
      window.sessionStorage.setItem(DEMO_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ online: browserOnline && !demoOffline, browserOnline, demoOffline, setDemoOffline }),
    [browserOnline, demoOffline, setDemoOffline],
  );
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used inside NetworkProvider');
  return ctx;
}
