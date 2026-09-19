import { useEffect, useRef } from 'react';
import { ROLES, ROLE_GROUPS, getRole } from '../data/roles.js';

/**
 * Lets the presenter jump between all seven roles from the login screen.
 * variant "list": grouped vertical list (desktop, dark panel)
 * variant "chips": horizontal scrolling chips (mobile, dark header)
 */
export default function RoleSwitcher({ currentId, onSelect, variant = 'list' }) {
  const activeChip = useRef(null);

  // Keep the selected chip in view when it sits off-screen in the scrolling row.
  useEffect(() => {
    activeChip.current?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [currentId, variant]);

  if (variant === 'chips') {
    return (
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label="Switch role">
        {ROLES.map((role) => {
          const active = role.id === currentId;
          return (
            <button
              key={role.id}
              ref={active ? activeChip : null}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(role.id)}
              className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                active ? 'border-white bg-white text-coal-950' : 'border-white/25 text-white/85 hover:border-white/50'
              }`}
            >
              {role.name}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav aria-label="Switch role" className="space-y-5">
      {ROLE_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-1.5 text-xs font-medium text-steel-400">{group.label}</p>
          <ul className="space-y-0.5">
            {group.roleIds.map((id) => {
              const role = getRole(id);
              const Icon = role.icon;
              const active = id === currentId;
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => onSelect(id)}
                    className={`flex h-11 w-full items-center gap-3 rounded border-l-2 px-3 text-left text-[15px] transition-colors ${
                      active
                        ? 'border-primary-300 bg-white/10 font-medium text-white'
                        : 'border-transparent text-steel-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-primary-300' : 'text-steel-400'} />
                    <span className="flex-1">{role.name}</span>
                    {active && <span className="h-2 w-2 rounded-full bg-primary-300" aria-label="Selected role" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
