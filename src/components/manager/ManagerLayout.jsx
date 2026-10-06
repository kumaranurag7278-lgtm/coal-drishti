import { Bell, ChevronDown, LogOut, MapPin, Pickaxe, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import InstallButton from '../InstallButton.jsx';
import { LogoMark } from '../Logo.jsx';
import { BRAND } from '../../config/brand.js';
import { useSession } from '../../context/SessionContext.jsx';
import { MANAGERS } from '../../data/personnel.js';
import useDismiss from '../../hooks/useDismiss.js';
import { MANAGER_NAV } from './nav.js';
import OfflineBanner from '../inspector/OfflineBanner.jsx';
import SyncStatus from '../inspector/SyncStatus.jsx';
import TopNavRoleSwitcher from '../TopNavRoleSwitcher.jsx';

function ProfileMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { user } = useSession();
  useDismiss(open, setOpen, ref);
  const mgr = MANAGERS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Profile menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded px-1.5 hover:bg-white/10"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-bold text-coal-950">
          {mgr.initials}
        </span>
        <span className="hidden text-sm tabular-nums md:block">{user?.empId}</span>
        <ChevronDown size={15} className="hidden text-steel-300 md:block" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-40 w-56 rounded-md border border-steel-200 bg-white py-1 text-coal-800 shadow-lg">
          <div className="border-b border-steel-200 px-3 py-2.5">
            <p className="text-sm font-semibold text-coal-900">{mgr.name}</p>
            <p className="text-xs text-steel-500">
              {mgr.title}, {user?.empId}, {user?.org}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex h-11 w-full items-center gap-2.5 px-3 text-sm hover:bg-steel-50"
          >
            <LogOut size={16} className="text-steel-500" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function BottomNav() {
  return (
    <nav
      aria-label="Manager navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-steel-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-3">
        {MANAGER_NAV.map((tab) => (
          <li key={tab.slug}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${
                  isActive ? 'text-primary-700' : 'text-steel-500'
                }`
              }
            >
              <tab.icon size={22} />
              {tab.label.split(' ')[0]}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function ManagerLayout() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  const logout = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-steel-50">
      <header className="sticky top-0 z-30 border-b border-coal-700 bg-coal-950 text-white">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <Link to="/manager" className="flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
            <LogoMark size={28} />
            <span className="hidden font-display text-xl font-semibold leading-none tracking-wider sm:inline">
              {BRAND.name}
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-white/20 sm:block" aria-hidden="true" />
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin size={15} className="text-steel-300" />
            {user?.org}
          </span>
          <TopNavRoleSwitcher currentRoleId="manager" />

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden empty:hidden md:block">
              <InstallButton variant="dark" />
            </div>
            <SyncStatus />
            <ProfileMenu onLogout={logout} />
            <button
              type="button"
              onClick={logout}
              className="hidden h-10 items-center gap-2 rounded px-3 text-sm text-steel-300 hover:bg-white/10 hover:text-white md:inline-flex"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
        <OfflineBanner />
      </header>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-steel-200 bg-white lg:sticky lg:top-14 lg:flex lg:h-[calc(100vh-3.5rem)] lg:flex-col">
          <nav aria-label="Main" className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {MANAGER_NAV.map((n) => (
                <li key={n.slug || 'dashboard'}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      `flex h-11 items-center gap-3 rounded border-l-[3px] px-3 text-[15px] font-medium transition-colors ${
                        isActive
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-transparent text-steel-700 hover:bg-steel-50'
                      }`
                    }
                  >
                    <n.icon size={19} />
                    <span className="flex-1">{n.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-steel-200 px-5 py-4 text-xs leading-relaxed text-steel-500">
            <p className="font-semibold text-coal-800">Operational Honesty Rule</p>
            <p className="mt-1">
              AI assists prioritization. Final operational decisions remain with authorized personnel.
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-4 pt-5 pb-24 lg:px-8 lg:pb-10 lg:pt-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
