import { CheckCircle2, ChevronDown, CircleAlert, ImageIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { getCategory } from '../../../data/checklists.js';
import { violationDisplayId } from '../../../data/submission.js';
import { computeRiskScore } from '../../../lib/risk.js';
import { plural } from '../../../lib/format.js';
import { RiskMeter, SeverityBadge } from '../../Badge.jsx';
import ViolationForm from './ViolationForm.jsx';
import { isViolationComplete, makeKey } from './useWizardState.js';

// Step 4: every violation in one place. Finish findings, severity and evidence here.
export default function StepViolations({ draft, dispatch }) {
  const firstIncomplete = draft.violations.find((v) => !isViolationComplete(v));
  const [openKey, setOpenKey] = useState(firstIncomplete?.key ?? null);
  const scores = draft.violations
    .map((v) => computeRiskScore({ severity: v.severity, zoneId: draft.zoneId, categoryId: v.categoryId })?.score)
    .filter(Boolean);
  const highest = scores.length ? Math.max(...scores) : null;

  const add = () => {
    const key = makeKey();
    dispatch({ type: 'addViolation', key });
    setOpenKey(key);
  };

  const remove = (v) => {
    if (window.confirm('Remove this violation and its evidence?')) dispatch({ type: 'removeViolation', key: v.key });
  };

  return (
    <section className="space-y-5" aria-labelledby="step4-title">
      <div>
        <h2 id="step4-title" className="font-display text-2xl font-semibold leading-none text-coal-900">
          Violations and evidence
        </h2>
        <p className="mt-2 text-sm text-steel-600">
          Inspection <span className="font-semibold tabular-nums text-coal-900">{draft.id}</span>,{' '}
          {plural(draft.violations.length, 'violation')}
          {highest ? <>, highest risk <span className="font-semibold tabular-nums text-coal-900">{highest}</span> / 100</> : null}.
        </p>
      </div>

      {draft.violations.length === 0 && (
        <p className="rounded-md border border-dashed border-steel-300 bg-steel-50 px-4 py-5 text-sm text-steel-700">
          No violations reported. If everything you checked was fine, continue to review. Failed checklist items appear here
          automatically.
        </p>
      )}

      <ul className="space-y-3">
        {draft.violations.map((v, i) => {
          const open = openKey === v.key;
          const complete = isViolationComplete(v);
          const score = computeRiskScore({ severity: v.severity, zoneId: draft.zoneId, categoryId: v.categoryId });
          return (
            <li key={v.key} className={`rounded-md border bg-white ${complete ? 'border-steel-200' : 'border-warn-line'}`}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenKey(open ? null : v.key)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <span className="mt-0.5 shrink-0" aria-label={complete ? 'Complete' : 'Needs attention'}>
                  {complete ? <CheckCircle2 size={20} className="text-ok" /> : <CircleAlert size={20} className="text-warn" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold tabular-nums text-primary-700">{violationDisplayId(draft, i)}</span>
                  <span className="block font-medium text-coal-900">{v.finding || 'New violation'}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-steel-600">
                    {v.severity ? <SeverityBadge level={v.severity} /> : <span className="text-warn">Severity needed</span>}
                    {score && <RiskMeter score={score.score} />}
                    <span className="inline-flex items-center gap-1">
                      <ImageIcon size={14} />
                      {plural(v.evidence.length, 'file')}
                    </span>
                    <span>{getCategory(v.categoryId)?.name}</span>
                  </span>
                </span>
                <ChevronDown size={18} className={`mt-1 shrink-0 text-steel-500 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div className="border-t border-steel-200 p-4">
                  <ViolationForm draft={draft} violation={v} index={i} dispatch={dispatch} variant="full" onRemove={() => remove(v)} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={add} className="flex h-14 w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-steel-300 text-base font-semibold text-primary-700 hover:border-primary-600 hover:bg-primary-50">
        <Plus size={20} />
        Add another violation
      </button>
    </section>
  );
}
