import { ArrowLeft, CheckCircle, FileCheck2, LogOut, MapPin, ShieldCheck } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import InstallButton from '../InstallButton.jsx';
import { LogoMark } from '../Logo.jsx';
import { BRAND } from '../../config/brand.js';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import OfflineBanner from '../inspector/OfflineBanner.jsx';
import SyncStatus from '../inspector/SyncStatus.jsx';
import TopNavRoleSwitcher from '../TopNavRoleSwitcher.jsx';

export default function VerificationLayout() {
  const { violations } = useComplianceStore();
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  const queueCount = violations.filter((v) => v.status === 'Awaiting verification').length;

  const logout = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-steel-50">
      <header className="sticky top-0 z-30 border-b border-coal-700 bg-coal-950 text-white">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
            <LogoMark size={28} />
            <span className="hidden font-display text-xl font-semibold leading-none tracking-wider sm:inline">
              {BRAND.name}
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-white/20 sm:block" aria-hidden="true" />
          <TopNavRoleSwitcher currentRoleId="verification" />


          <div className="ml-auto flex items-center gap-2">
            <NavLink
              to="/verification"
              end
              className={({ isActive }) =>
                `inline-flex h-9 items-center gap-1.5 rounded px-3 text-xs font-medium ${
                  isActive ? 'bg-white/20 text-white font-semibold' : 'text-steel-300 hover:bg-white/10'
                }`
              }
            >
              Queue
              {queueCount > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-warn px-1 text-[10px] font-bold text-coal-950">
                  {queueCount}
                </span>
              )}
            </NavLink>

            <Link
              to={user ? (user.roleId === 'manager' ? '/manager' : user.roleId === 'supervisor' ? '/supervisor' : '/inspector') : '/'}
              className="inline-flex h-9 items-center gap-1.5 rounded px-2.5 text-xs text-steel-300 hover:bg-white/10"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Return to Workspace</span>
            </Link>

            <SyncStatus />
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center gap-1.5 rounded px-2.5 text-xs text-steel-300 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
        <OfflineBanner />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
