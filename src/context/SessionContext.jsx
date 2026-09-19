import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Prototype only: there is no real authentication. The "session" is a small
// object kept in sessionStorage so a page refresh does not drop the demo.
const KEY = 'coalcraft.session.v1';
const SessionContext = createContext(null);

function read() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function SessionProvider({ children }) {
  const [state, setState] = useState(() => ({ selectedRoleId: null, user: null, ...read() }));

  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable: the demo still works for this page load */
    }
  }, [state]);

  const setSelectedRoleId = useCallback((id) => setState((s) => ({ ...s, selectedRoleId: id })), []);
  const signIn = useCallback((user) => setState((s) => ({ ...s, selectedRoleId: user.roleId, user })), []);
  const signOut = useCallback(() => setState((s) => ({ ...s, user: null })), []);

  const value = useMemo(
    () => ({ ...state, setSelectedRoleId, signIn, signOut }),
    [state, setSelectedRoleId, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
