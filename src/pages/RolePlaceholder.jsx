import { ArrowLeft, LogOut } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { getRole } from '../data/roles.js';

export default function RolePlaceholder() {
  const { roleId } = useParams();
  const role = getRole(roleId);
  const navigate = useNavigate();
  const { user, signOut } = useSession();

  if (!role) return <Navigate to="/" replace />;
  const Icon = role.icon;

  const message =
    role.phase === 'later'
      ? 'Role dashboard is part of the next prototype phase.'
      : `The ${role.name} dashboard is built in the next step, once the inspection workflow is connected.`;

  return (
    <div className="min-h-screen bg-steel-50">
      <header className="bg-coal-950 text-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Logo size={28} />
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="inline-flex h-10 items-center gap-2 rounded px-3 text-sm text-steel-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-5 py-16 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded bg-primary-600 text-white">
          <Icon size={32} />
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-none text-coal-900">{role.name} workspace</h1>
        <p className="mt-2 text-sm text-steel-500">
          Signed in as <span className="font-medium tabular-nums text-steel-700">{user?.empId}</span> at {user?.org}
        </p>
        <p className="mx-auto mt-8 max-w-sm rounded-md border border-steel-200 bg-white px-5 py-4 text-steel-700">{message}</p>
        <button type="button" onClick={() => navigate('/')} className="btn-secondary mt-8 h-12 px-5">
          <ArrowLeft size={18} />
          Back to Role Selection
        </button>
      </main>
    </div>
  );
}
