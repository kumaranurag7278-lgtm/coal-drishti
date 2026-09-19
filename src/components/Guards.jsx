import { Navigate } from 'react-router-dom';
import { getRole } from '../data/roles.js';
import { useSession } from '../context/SessionContext.jsx';

// Any signed-in user.
export function RequireSession({ children }) {
  const { user } = useSession();
  return user ? children : <Navigate to="/" replace />;
}

// A specific role. Someone signed in as another role is sent to their own home.
export function RequireRole({ roleId, children }) {
  const { user } = useSession();
  if (!user) return <Navigate to="/" replace />;
  if (user.roleId !== roleId) return <Navigate to={getRole(user.roleId)?.home ?? '/'} replace />;
  return children;
}
