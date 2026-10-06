import { CircleAlert, Pencil } from 'lucide-react';
import { getCategory } from '../../../data/checklists.js';
import { INSPECTOR } from '../../../data/inspectorMock.js';
import { draftSummary } from '../../../data/summary.js';
import { violationDisplayId } from '../../../data/submission.js';
import { getZone } from '../../../data/zones.js';
import { useNetwork } from '../../../context/NetworkContext.jsx';
import { computeRiskScore } from '../../../lib/risk.js';
import { formatDuration, formatTime, minutesBetween } from '../../../lib/format.js';
import { RiskMeter, SeverityBadge } from '../../Badge.jsx';
import EvidencePreview from '../EvidencePreview.jsx';
import { getBlockers } from './useWizardState.js';

function Stat({ label, children }) {
  return (
    <div className="bg-white p-3.5">
      <dt className="text-sm text-steel-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-coal-900">{children}</dd>
    </div>
  );
}

// Step 5: everything in one place before submitting.
export default function InspectionReview({ draft, onEdit }) {
  const { online } = useNetwork();
  const s = draftSummary(draft);
  const zone = getZone(draft.zoneId);
  const blockers = getBlockers(draft);

  return (
    <section className="space-y-5" aria-labelledby="step5-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="step5-title" className="font-display text-2xl font-semibold leading-none text-coal-900">
            Review inspection
          </h2>
          <p className="mt-2 text-sm text-steel-600">Check everything, then submit.</p>
        </div>
        <button type="button" onClick={onEdit} className="btn-secondary h-11 shrink-0 px-3.5 text-sm">
          <Pencil size={15} />
          Edit inspection
        </button>
      </div>

      {blockers.length > 0 && (
        <div className="rounded-md border border-warn-line bg-warn-soft p-4" role="alert">
          <p className="flex items-center gap-2 text-sm font-semibold text-warn">
            <CircleAlert size={16} />
            Fix these before submitting
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-coal-800">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-steel-200 bg-steel-200">
        <Stat label="Inspection">
          <span className="tabular-nums">{draft.id}</span>
        </Stat>
        <Stat label="Mine">{draft.mineId}</Stat>
        <Stat label="Zone">{zone?.name ?? 'Not selected'}</Stat>
        <Stat label="Inspector">
          <span className="tabular-nums">{INSPECTOR.id}</span>, {INSPECTOR.name}
        </Stat>
        <Stat label="Inspection type">{draft.type}</Stat>
        <Stat label="Start time">{formatTime(draft.startTime)}</Stat>
        <Stat label="Duration">{formatDuration(minutesBetween(draft.startTime))}</Stat>
        <Stat label="Checklist">
          <span className="tabular-nums">
            {s.tally.pass} PASS, {s.tally.fail} FAIL, {s.tally.na} N/A
          </span>
        </Stat>
        <Stat label="Violations">
          <span className="tabular-nums">{s.violationCount}</span>
        </Stat>
        <Stat label="Highest risk">{s.highestRisk != null ? <span className="tabular-nums">{s.highestRisk} / 100</span> : 'None'}</Stat>
        <Stat label="Evidence">
          <span className="tabular-nums">{s.evidenceCount}</span> {s.evidenceCount === 1 ? 'file' : 'files'}
        </Stat>
        <Stat label="GPS">{draft.gps?.available ? 'Captured' : 'Unavailable'}</Stat>
        <Stat label="Offline status">
          {online ? 'Saved on this device' : 'Saved locally, sync pending'}
        </Stat>
      </dl>

      {draft.violations.length > 0 && (
        <div>
          <h3 className="mb-2 text-base font-semibold text-coal-900">Violations</h3>
          <ul className="space-y-2">
            {draft.violations.map((v, i) => {
              const score = computeRiskScore({ severity: v.severity, zoneId: draft.zoneId, categoryId: v.categoryId });
              return (
                <li key={v.key}>
                  <details className="group rounded-md border border-steel-200 bg-white">
                    <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold tabular-nums text-primary-700">{violationDisplayId(draft, i)}</span>
                        <span className="block font-medium text-coal-900">{v.finding}</span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          {v.severity && <SeverityBadge level={v.severity} />}
                          {score && <RiskMeter score={score.score} />}
                        </span>
                      </span>
                      <span className="mt-1 text-sm font-medium text-primary-700 group-open:hidden">Details</span>
                      <span className="mt-1 hidden text-sm font-medium text-primary-700 group-open:inline">Hide</span>
                    </summary>
                    <div className="space-y-3 border-t border-steel-200 p-4 text-sm">
                      <p>
                        <span className="text-steel-500">Category: </span>
                        {getCategory(v.categoryId)?.name}. <span className="text-steel-500">Location: </span>
                        {zone?.name}
                      </p>
                      {v.remarks.trim() && (
                        <p>
                          <span className="text-steel-500">Remarks: </span>
                          {v.remarks}
                        </p>
                      )}
                      {v.suggestedAction.trim() && (
                        <p>
                          <span className="text-steel-500">Suggested action: </span>
                          {v.suggestedAction}
                        </p>
                      )}
                      <ul className="space-y-2">
                        {v.evidence.map((ev) => (
                          <EvidencePreview key={ev.id} evidence={ev} />
                        ))}
                      </ul>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-xs text-steel-500">
        Violations go to the Mine Manager for corrective action. AI assists prioritization; final operational decisions remain
        with authorized personnel.
      </p>
    </section>
  );
}
