import { Check, Lock } from 'lucide-react';
import { VIOLATION_FLOW } from '../../data/models.js';

// OPEN → ASSIGNED → IN PROGRESS → AWAITING VERIFICATION → VERIFIED.
// The inspector can only watch this. Verification belongs to the verification workflow.
export default function WorkflowStepper({ status }) {
  const current = VIOLATION_FLOW.indexOf(status);
  return (
    <div>
      <ol className="grid gap-2 sm:grid-cols-5">
        {VIOLATION_FLOW.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const verified = step === 'Verified' && active;
          return (
            <li
              key={step}
              aria-current={active ? 'step' : undefined}
              className={`flex items-center gap-2 rounded border px-3 py-2.5 text-sm sm:flex-col sm:items-start sm:gap-1 ${
                verified
                  ? 'border-ok bg-ok-soft text-ok'
                  : active
                    ? 'border-primary-600 bg-primary-50 font-semibold text-primary-700'
                    : done
                      ? 'border-steel-200 bg-white text-coal-800'
                      : 'border-steel-200 bg-steel-50 text-steel-500'
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${
                  done || verified ? 'bg-ok text-white' : active ? 'bg-primary-600 text-white' : 'bg-steel-200 text-steel-600'
                }`}
              >
                {done || verified ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              {step}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex items-start gap-2 text-sm text-steel-600">
        <Lock size={15} className="mt-0.5 shrink-0" />
        Verification is done by authorized personnel in the verification workflow. Inspectors cannot mark a violation as verified.
      </p>
    </div>
  );
}
