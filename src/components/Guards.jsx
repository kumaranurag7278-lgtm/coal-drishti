import { Navigate } from 'react-router-dom';
import { getRole } from '../data/roles.js';
import { useSession } from '../context/SessionContext.jsx';

// Any signed-in user. If not logged in, redirects to role selection.
export function RequireSession({ children }) {
  const { user } = useSession();
  return user ? children : <Navigate to="/" replace />;
}

// Specific role guard. If not logged in, redirects to the login screen for this role.
// If logged in as another role, redirects to their assigned workspace.
export function RequireRole({ roleId, children }) {
  const { user } = useSession();
  if (!user) return <Navigate to={`/login/${roleId}`} replace />;
  if (user.roleId !== roleId) return <Navigate to={getRole(user.roleId)?.home ?? '/'} replace />;
  return children;
}
