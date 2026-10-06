import { Check } from 'lucide-react';
import { CATEGORIES, categoryProgress } from '../../../data/checklists.js';

// Step 3: pick a category. Each shows progress and any failed items.
export default function CategorySelector({ active, results, onSelect }) {
  return (
    <div
      role="group"
      aria-label="Inspection category"
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0"
    >
      {CATEGORIES.map((c) => {
        const p = categoryProgress(c, results);
        const selected = c.id === active;
        const complete = p.answered === p.total;
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(c.id)}
            className={`relative flex min-h-[64px] w-[9.75rem] shrink-0 items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors sm:w-auto ${
              selected ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-steel-200 bg-white hover:border-steel-400'
            }`}
          >
            <Icon size={20} className={selected ? 'text-primary-700' : 'text-steel-600'} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-coal-900">{c.name}</span>
              <span className="flex items-center gap-1 text-xs text-steel-500">
                {complete ? <Check size={12} className="text-ok" strokeWidth={3} /> : null}
                {p.answered}/{p.total} done
              </span>
            </span>
            {p.fails > 0 && (
              <span
                aria-label={`${p.fails} failed`}
                className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold leading-none text-white"
              >
                {p.fails}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
