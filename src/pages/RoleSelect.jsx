import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccessShell from '../components/AccessShell.jsx';
import LifecycleStrip from '../components/LifecycleStrip.jsx';
import { BRAND } from '../config/brand.js';
import { useSession } from '../context/SessionContext.jsx';
import { ROLE_GROUPS, getRole } from '../data/roles.js';

function RoleCard({ role, selected, onSelect }) {
  const Icon = role.icon;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(role.id)}
      className={`flex w-full items-start gap-3.5 rounded-md border p-4 text-left transition-colors ${
        selected
          ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
          : 'border-steel-200 bg-white hover:border-steel-400'
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded ${
          selected ? 'bg-primary-600 text-white' : 'bg-steel-100 text-steel-700'
        }`}
      >
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-coal-900">{role.name}</span>
        <span className="mt-0.5 block text-sm leading-snug text-steel-600">{role.description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          selected ? 'border-primary-600 bg-primary-600 text-white' : 'border-steel-300'
        }`}
      >
        {selected && <Check size={13} strokeWidth={3} />}
      </span>
    </button>
  );
}

export default function RoleSelect() {
  const navigate = useNavigate();
  const { selectedRoleId, setSelectedRoleId } = useSession();
  const selected = getRole(selectedRoleId);

  return (
    <AccessShell
      mobileExtra={<p className="max-w-xs text-sm leading-snug text-steel-300">{BRAND.tagline}</p>}
      panel={
        <>
          <h2 className="mt-16 max-w-md font-display text-5xl font-semibold leading-[1.04] xl:text-6xl">
            {BRAND.tagline}
          </h2>
          <div className="mt-auto pb-10">
            <LifecycleStrip />
          </div>
        </>
      }
    >
      <div className="flex min-h-screen flex-col">
        <div className="mx-auto w-full max-w-3xl flex-1 px-5 pb-8 pt-7 lg:px-10 lg:pt-14">
          <h1 className="font-display text-4xl font-semibold leading-none text-coal-900">Select your role</h1>
          <p className="mt-3 text-steel-600">Each role opens its own workspace on the same platform.</p>

          <div className="mt-8 space-y-8">
            {ROLE_GROUPS.map((group) => (
              <section key={group.id} aria-labelledby={`group-${group.id}`}>
                <h2
                  id={`group-${group.id}`}
                  className="mb-3 flex items-center gap-3 text-sm font-semibold text-steel-600"
                >
                  {group.label}
                  <span aria-hidden="true" className="h-px flex-1 bg-steel-200" />
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {group.roleIds.map((id) => (
                    <RoleCard key={id} role={getRole(id)} selected={id === selectedRoleId} onSelect={setSelectedRoleId} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-steel-200 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 lg:px-10">
            <p className="min-w-0 text-sm text-steel-600" aria-live="polite">
              {selected ? (
                <>
                  Selected: <span className="font-semibold text-coal-900">{selected.name}</span>
                </>
              ) : (
                'Choose a role to continue.'
              )}
            </p>
            <button
              type="button"
              disabled={!selected}
              onClick={() => navigate(`/login/${selected.id}`)}
              className="btn-primary h-12 shrink-0 px-6 text-base"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </AccessShell>
  );
}
