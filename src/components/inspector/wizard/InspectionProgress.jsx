import { Check } from 'lucide-react';

export const STEPS = ['Details', 'Work zone', 'Checklist', 'Violations', 'Review'];

// Phone: "Step 3 of 5" with a segmented bar. Larger screens: full stepper.
export default function InspectionProgress({ step, onJump }) {
  return (
    <nav aria-label="Inspection progress">
      <div className="sm:hidden">
        <p className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-coal-900">
            Step {step} of {STEPS.length}
          </span>
          <span className="text-steel-600">{STEPS[step - 1]}</span>
        </p>
        <div className="mt-2 grid grid-cols-5 gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s} className={`h-1.5 rounded-full ${i < step ? 'bg-primary-600' : 'bg-steel-200'}`} />
          ))}
        </div>
      </div>

      <ol className="hidden sm:flex">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          const clickable = n < step;
          return (
            <li key={label} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${n <= step ? 'bg-primary-600' : 'bg-steel-200'}`}
                />
              )}
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onJump(n)}
                aria-current={active ? 'step' : undefined}
                aria-label={`Step ${n}: ${label}${done ? ' (completed)' : ''}`}
                className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-sm font-semibold ${
                  done
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : active
                      ? 'border-primary-600 bg-white text-primary-700'
                      : 'border-steel-300 bg-white text-steel-500'
                } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {done ? <Check size={16} strokeWidth={3} /> : n}
              </button>
              <span className={`text-sm ${active ? 'font-semibold text-coal-900' : 'text-steel-600'}`}>{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
