import { Bell, ChevronDown, LogOut, MapPin, Plus, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom';
import InstallButton from '../InstallButton.jsx';
import { LogoMark } from '../Logo.jsx';
import { BRAND } from '../../config/brand.js';
import { useSession } from '../../context/SessionContext.jsx';
import { INSPECTOR } from '../../data/inspectorMock.js';
import useDismiss from '../../hooks/useDismiss.js';
import { INSPECTOR_NAV } from './nav.js';
import OfflineBanner from './OfflineBanner.jsx';
import SyncStatus from './SyncStatus.jsx';
import TopNavRoleSwitcher from '../TopNavRoleSwitcher.jsx';

function ProfileMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { user } = useSession();
  useDismiss(open, setOpen, ref);

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
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-600 text-xs font-semibold">
          {INSPECTOR.initials}
        </span>
        <span className="hidden text-sm tabular-nums md:block">{user?.empId}</span>
        <ChevronDown size={15} className="hidden text-steel-300 md:block" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-40 w-56 rounded-md border border-steel-200 bg-white py-1 text-coal-800 shadow-lg">
          <div className="border-b border-steel-200 px-3 py-2.5">
            <p className="text-sm font-semibold text-coal-900">{INSPECTOR.name}</p>
            <p className="text-xs text-steel-500">
              {INSPECTOR.title}, {user?.empId}, {user?.org}
            </p>
          </div>
          <Link
            role="menuitem"
            to="/inspector/profile"
            onClick={() => setOpen(false)}
            className="flex h-11 items-center gap-2.5 px-3 text-sm hover:bg-steel-50"
          >
            <User size={16} className="text-steel-500" />
            Profile
          </Link>
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
  const item = (slug) => INSPECTOR_NAV.find((n) => n.slug === slug);
  const tabs = [item(''), item('my-inspections'), null, item('my-violations'), item('assigned-tasks')];
  const short = { '': 'Home', 'my-inspections': 'Inspections', 'my-violations': 'Violations', 'assigned-tasks': 'Tasks' };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-steel-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) =>
          tab ? (
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
                {short[tab.slug]}
              </NavLink>
            </li>
          ) : (
            <li key="start" className="flex justify-center">
              <Link
                to="/inspector/start-inspection"
                aria-label="Start inspection"
                className="-mt-6 flex flex-col items-center gap-1 text-xs font-medium text-primary-700"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-600 text-white shadow-lg ring-4 ring-white">
                  <Plus size={28} />
                </span>
                Start
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

export default function InspectorLayout() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  // The wizard has its own sticky action bar, so the bottom tab bar steps aside.
  const inWizard = Boolean(useMatch('/inspector/start-inspection'));

  const logout = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-steel-50">
      <header className="sticky top-0 z-30 border-b border-coal-700 bg-coal-950 text-white">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <Link to="/inspector" className="flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
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
          <TopNavRoleSwitcher currentRoleId="inspector" />

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden empty:hidden md:block">
              <InstallButton variant="dark" />
            </div>
            <SyncStatus />
            <Link
              to="/inspector/alerts"
              aria-label="Notifications, 3 unread"
              className="relative grid h-10 w-10 place-items-center rounded hover:bg-white/10"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none">
                3
              </span>
            </Link>
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
              {INSPECTOR_NAV.map((n) => (
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
                    {n.badge && (
                      <span className="rounded-full bg-danger px-1.5 py-0.5 text-xs font-semibold leading-none text-white">
                        {n.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <p className="border-t border-steel-200 px-5 py-4 text-xs leading-relaxed text-steel-500">
            Prototype build. All figures are mock data.
          </p>
        </aside>

        <main className={`min-w-0 px-4 pt-5 lg:px-8 lg:pb-10 lg:pt-8 ${inWizard ? 'pb-0' : 'pb-28'}`}>
          <Outlet />
        </main>
      </div>

      {!inWizard && <BottomNav />}
    </div>
  );
}
