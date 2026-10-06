import { Check, Minus, X } from 'lucide-react';

const OPTIONS = [
  { id: 'pass', label: 'PASS', icon: Check, on: 'border-ok bg-ok text-white' },
  { id: 'fail', label: 'FAIL', icon: X, on: 'border-danger bg-danger text-white' },
  { id: 'na', label: 'N/A', icon: Minus, on: 'border-steel-600 bg-steel-600 text-white' },
];

// One checklist question with large PASS / FAIL / N/A buttons.
// Tap the selected answer again to clear it. A FAIL shows its violation form below.
export default function ChecklistItem({ item, index, value, onChange, children }) {
  const frame =
    value === 'fail'
      ? 'border-danger-line border-l-4 border-l-danger'
      : value === 'pass'
        ? 'border-ok-line'
        : 'border-steel-200';

  return (
    <li className={`rounded-md border bg-white ${frame}`}>
      <div className="p-4">
        <p id={`q-${item.id}`} className="text-base font-medium leading-snug text-coal-900">
          <span className="mr-1.5 text-steel-400 tabular-nums">{index + 1}.</span>
          {item.text}
        </p>
        <div role="group" aria-labelledby={`q-${item.id}`} className="mt-3 grid grid-cols-3 gap-2">
          {OPTIONS.map((o) => {
            const selected = value === o.id;
            const Icon = o.icon;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(selected ? null : o.id)}
                className={`flex min-h-[56px] items-center justify-center gap-1.5 rounded border-2 text-base font-semibold transition-colors ${
                  selected ? o.on : 'border-steel-300 bg-white text-steel-700 hover:bg-steel-50'
                }`}
              >
                <Icon size={20} strokeWidth={2.5} />
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
      {children}
    </li>
  );
}
