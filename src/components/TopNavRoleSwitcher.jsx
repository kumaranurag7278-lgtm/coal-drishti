import { ChevronDown, ShieldCheck, UserCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext.jsx';
import { ROLES, getRole } from '../data/roles.js';
import useDismiss from '../hooks/useDismiss.js';

export default function TopNavRoleSwitcher({ currentRoleId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { signIn } = useSession();
  useDismiss(open, setOpen, ref);

  const currentRole = getRole(currentRoleId) || ROLES[0];
  const CurrentIcon = currentRole.icon;

  const handleSelectRole = (role) => {
    setOpen(false);
    if (role.demo) {
      signIn({ roleId: role.id, empId: role.demo.id, org: role.demo.org });
    }
    navigate(role.home);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        title="Switch active user role"
      >
        <CurrentIcon size={14} className="text-brand" />
        <span className="max-w-[110px] truncate sm:max-w-none">{currentRole.name}</span>
        <ChevronDown size={13} className="text-steel-300" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 sm:left-auto sm:right-0 top-11 z-50 w-64 rounded-lg border border-steel-200 bg-white p-1.5 text-coal-900 shadow-xl"
        >
          <div className="border-b border-steel-100 px-3 py-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-steel-500">
              Switch Active Role
            </span>
            <span className="block text-xs text-steel-600">
              One-click instant workspace switch
            </span>
          </div>

          <div className="mt-1 space-y-0.5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isCurrent = r.id === currentRoleId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectRole(r)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-coal-800 hover:bg-steel-50'
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded ${
                      isCurrent ? 'bg-primary-600 text-white' : 'bg-steel-100 text-steel-700'
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{r.name}</span>
                    <span className="block text-[10px] text-steel-500">{r.idHint}</span>
                  </div>
                  {isCurrent && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                  )}
                </button>
              );
            })}

            {/* Direct Verification Center Link */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/verification');
              }}
              className="flex w-full items-center gap-2.5 rounded-md border-t border-steel-100 px-2.5 py-2 text-left text-xs font-medium text-ok hover:bg-ok-soft/30"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-ok text-white">
                <ShieldCheck size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <span className="block font-bold">Verification Center</span>
                <span className="block text-[10px] text-steel-500">Anti-fraud review</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
