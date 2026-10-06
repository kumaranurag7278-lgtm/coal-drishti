import { Trash2 } from 'lucide-react';
import { CATEGORIES } from '../../../data/checklists.js';
import { SEVERITIES } from '../../../data/models.js';
import { violationDisplayId } from '../../../data/submission.js';
import { formatTime } from '../../../lib/format.js';
import { computeRiskScore } from '../../../lib/risk.js';
import EvidenceCapture from '../EvidenceCapture.jsx';
import GPSStatus from '../GPSStatus.jsx';
import RiskScoreCard from '../RiskScoreCard.jsx';
import { getZone } from '../../../data/zones.js';
import { getCategory } from '../../../data/checklists.js';

const SEV_ON = {
  LOW: 'border-primary-600 bg-primary-600 text-white',
  MEDIUM: 'border-warn-bar bg-warn-bar text-coal-950',
  HIGH: 'border-hi-bar bg-hi-bar text-white',
  CRITICAL: 'border-danger bg-danger text-white',
};

/**
 * Violation reporting. "inline" sits under a failed checklist item (short, with
 * extra fields tucked away). "full" is used in the Violations step.
 */
export default function ViolationForm({ draft, violation: v, index, dispatch, variant = 'full', onRemove }) {
  const id = violationDisplayId(draft, index);
  const inline = variant === 'inline';
  const zone = getZone(draft.zoneId);
  const score = computeRiskScore({ severity: v.severity, zoneId: draft.zoneId, categoryId: v.categoryId });
  const patch = (p) => dispatch({ type: 'updateViolation', key: v.key, patch: p });
  const fid = (name) => `${name}-${v.key}`;

  const extra = (
    <div className="space-y-4">
      <div>
        <label htmlFor={fid('remarks')} className="mb-1.5 block text-sm font-medium text-coal-900">
          Remarks
        </label>
        <textarea
          id={fid('remarks')}
          rows={3}
          className="field h-auto py-2.5"
          value={v.remarks}
          onChange={(e) => patch({ remarks: e.target.value })}
          placeholder="What did you see? Anything the manager should know?"
        />
      </div>
      <div>
        <label htmlFor={fid('action')} className="mb-1.5 block text-sm font-medium text-coal-900">
          Suggested corrective action
        </label>
        <textarea
          id={fid('action')}
          rows={3}
          className="field h-auto py-2.5"
          value={v.suggestedAction}
          onChange={(e) => patch({ suggestedAction: e.target.value })}
          placeholder="What should be done to fix it?"
        />
      </div>
    </div>
  );

  return (
    <div className={inline ? 'space-y-4 border-t border-danger-line bg-danger-soft/40 p-4' : 'space-y-5'}>
      {inline && (
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold leading-none text-danger">Report violation</h3>
          <span className="rounded bg-white px-2 py-1 text-sm font-semibold tabular-nums text-coal-900">{id}</span>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        {!inline && (
          <div>
            <dt className="text-steel-500">Violation ID</dt>
            <dd className="font-semibold tabular-nums text-coal-900">{id}</dd>
          </div>
        )}
        <div>
          <dt className="text-steel-500">Category</dt>
          <dd className="font-medium text-coal-900">
            {v.checklistItemId ? (
              getCategory(v.categoryId)?.name
            ) : (
              <select
                aria-label="Category"
                className="mt-0.5 h-10 w-full rounded border border-steel-300 bg-white px-2 text-sm"
                value={v.categoryId}
                onChange={(e) => patch({ categoryId: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-steel-500">Location</dt>
          <dd className="font-medium text-coal-900">{zone?.name ?? 'Zone not selected'}</dd>
        </div>
        <div>
          <dt className="text-steel-500">GPS</dt>
          <dd className="font-medium text-coal-900">{draft.gps?.available ? 'Captured' : 'Unavailable'}</dd>
        </div>
        <div>
          <dt className="text-steel-500">Timestamp</dt>
          <dd className="font-medium text-coal-900">{formatTime(v.createdAt)}</dd>
        </div>
      </dl>

      {!inline && <GPSStatus gps={draft.gps} compact />}

      <div>
        <label htmlFor={fid('finding')} className="mb-1.5 block text-sm font-medium text-coal-900">
          Finding
        </label>
        <input
          id={fid('finding')}
          className="field"
          value={v.finding}
          onChange={(e) => patch({ finding: e.target.value })}
          placeholder="Describe the finding"
        />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-coal-900">Severity</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SEVERITIES.map((s) => {
            const on = v.severity === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => patch({ severity: s })}
                className={`min-h-[52px] rounded border-2 text-sm font-semibold transition-colors ${
                  on ? SEV_ON[s] : 'border-steel-300 bg-white text-steel-700 hover:bg-steel-50'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <p className="mb-1.5 text-sm font-medium text-coal-900">Evidence</p>
        <EvidenceCapture
          violationId={id}
          evidence={v.evidence}
          gps={draft.gps}
          label={v.finding}
          onAdd={(evidence) => dispatch({ type: 'addEvidence', key: v.key, evidence })}
          onRemove={(evidenceId) => dispatch({ type: 'removeEvidence', key: v.key, evidenceId })}
        />
      </div>

      <RiskScoreCard score={score} compact={inline} />

      {inline ? (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-primary-700">Add remarks and suggested action</summary>
          <div className="mt-3">{extra}</div>
        </details>
      ) : (
        extra
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-11 items-center gap-2 rounded px-2 text-sm font-medium text-danger hover:bg-danger-soft"
        >
          <Trash2 size={16} />
          Remove violation
        </button>
      )}
    </div>
  );
}
