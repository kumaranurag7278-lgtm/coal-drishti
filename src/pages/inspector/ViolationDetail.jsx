import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import AuditTimeline from '../../components/inspector/AuditTimeline.jsx';
import EvidencePreview from '../../components/inspector/EvidencePreview.jsx';
import GPSStatus from '../../components/inspector/GPSStatus.jsx';
import RiskScoreCard from '../../components/inspector/RiskScoreCard.jsx';
import WorkflowStepper from '../../components/inspector/WorkflowStepper.jsx';
import Panel from '../../components/Panel.jsx';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { getItem } from '../../data/checklists.js';
import { VIOLATION_FLOW } from '../../data/models.js';
import { formatDate, formatTime } from '../../lib/format.js';
import NotFoundPanel from './NotFoundPanel.jsx';

function Fact({ label, children }) {
  return (
    <div className="bg-white p-3.5">
      <dt className="text-sm text-steel-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-coal-900">{children}</dd>
    </div>
  );
}

const NEXT = {
  Open: 'The Mine Manager assigns a corrective action.',
  Assigned: 'The Supervisor carries out the corrective action.',
  'In progress': 'The Supervisor submits closure evidence.',
  'Awaiting verification': 'The verification workflow checks the closure evidence.',
  Verified: 'Closed. The record stays in the audit trail.',
};

export default function ViolationDetail() {
  const { id } = useParams();
  const store = useInspectorStore();
  const navigate = useNavigate();
  const v = store.getViolation(id);

  if (!v) return <NotFoundPanel what="Violation" backTo="/inspector/my-violations" backLabel="Back to My violations" />;

  const item = v.checklistItemId ? getItem(v.checklistItemId) : null;
  const action = v.correctiveAction;
  const upcoming = VIOLATION_FLOW.slice(VIOLATION_FLOW.indexOf(v.status) + 1).map((st) => `Next stage: ${st}`);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <button type="button" onClick={() => navigate('/inspector/my-violations')} className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline">
          <ArrowLeft size={16} />
          My violations
        </button>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-4xl font-semibold leading-none tabular-nums text-coal-900">{v.id}</h1>
          <div className="flex gap-1.5">
            <SeverityBadge level={v.severity} />
            <StatusBadge status={v.status} />
            {v.syncStatus === 'pending' && <StatusBadge status="Sync pending" />}
          </div>
        </div>
        <p className="mt-2 text-lg text-coal-900">{v.finding}</p>
      </div>

      <Panel title="Workflow">
        <div className="p-4">
          <WorkflowStepper status={v.status} />
          <p className="mt-3 text-sm text-coal-800">
            <span className="font-medium">Next:</span> {NEXT[v.status]}
          </p>
        </div>
      </Panel>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-steel-200 bg-steel-200 lg:grid-cols-3">
        <Fact label="Category">{v.category}</Fact>
        <Fact label="Location">{v.location}</Fact>
        <Fact label="Assigned to">{v.assignedTo}</Fact>
        <Fact label="Reported">
          {formatDate(v.timestamp)}, {formatTime(v.timestamp)}
        </Fact>
        <Fact label="Inspection">
          <Link to={`/inspector/my-inspections/${v.inspectionId}`} className="tabular-nums text-primary-700 hover:underline">
            {v.inspectionId}
          </Link>
        </Fact>
        <Fact label="Checklist item">{item ? item.text : 'Added manually'}</Fact>
      </dl>

      {(v.remarks || v.suggestedAction) && (
        <Panel title="Inspector notes">
          <div className="space-y-3 p-4 text-sm">
            {v.remarks && (
              <p>
                <span className="text-steel-500">Remarks: </span>
                {v.remarks}
              </p>
            )}
            {v.suggestedAction && (
              <p>
                <span className="text-steel-500">Suggested corrective action: </span>
                {v.suggestedAction}
              </p>
            )}
          </div>
        </Panel>
      )}

      {action && (
        <Panel title="Corrective action">
          <div className="space-y-1.5 p-4 text-sm">
            <p className="text-coal-900">{action.action}</p>
            <p className="text-steel-600">
              Owner {action.assignedTo}, due {formatDate(action.deadline)}, {formatTime(action.deadline)}
            </p>
          </div>
        </Panel>
      )}

      {v.closureEvidence && (
        <Panel title="Supervisor closure evidence">
          <div className="space-y-3 p-4 text-sm">
            <div className="flex items-center justify-between text-xs text-steel-500">
              <span>Submitted by: <strong>{v.closureEvidence.submittedBy}</strong></span>
              <span>{formatDate(v.closureEvidence.submittedAt)}, {formatTime(v.closureEvidence.submittedAt)}</span>
            </div>
            {v.closureEvidence.notes && (
              <p className="rounded border border-steel-200 bg-steel-50 p-2.5 text-xs text-steel-700">
                {v.closureEvidence.notes}
              </p>
            )}
            <ul className="space-y-2">
              {v.closureEvidence.evidence?.map((e) => (
                <EvidencePreview key={e.id} evidence={e} />
              ))}
            </ul>
          </div>
        </Panel>
      )}


      <div className="grid gap-6 lg:grid-cols-2">
        <RiskScoreCard score={v.riskScore} />
        <div className="space-y-6">
          <section aria-label="GPS metadata">
            <h2 className="mb-2 font-display text-xl font-semibold leading-none text-coal-900">GPS metadata</h2>
            <GPSStatus gps={v.gps} />
          </section>
          <section aria-label="Evidence">
            <h2 className="mb-2 font-display text-xl font-semibold leading-none text-coal-900">Evidence</h2>
            <ul className="space-y-2">
              {v.evidence.map((e) => (
                <EvidencePreview key={e.id} evidence={e} />
              ))}
            </ul>
          </section>
        </div>
      </div>

      <Panel title="Audit timeline">
        <div className="p-4">
          <AuditTimeline events={v.auditEvents} upcoming={upcoming} />
        </div>
      </Panel>
    </div>
  );
}
