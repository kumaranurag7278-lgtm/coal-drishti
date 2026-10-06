import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, ShieldCheck, UserCheck, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import AuditTimeline from '../../components/inspector/AuditTimeline.jsx';
import EvidencePreview from '../../components/inspector/EvidencePreview.jsx';
import GPSStatus from '../../components/inspector/GPSStatus.jsx';
import RiskScoreCard from '../../components/inspector/RiskScoreCard.jsx';
import WorkflowStepper from '../../components/inspector/WorkflowStepper.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getItem } from '../../data/checklists.js';
import { VIOLATION_FLOW } from '../../data/models.js';
import { SUPERVISORS } from '../../data/personnel.js';
import { formatDate, formatTime } from '../../lib/format.js';
import NotFoundPanel from '../inspector/NotFoundPanel.jsx';

function Fact({ label, children }) {
  return (
    <div className="bg-white p-3.5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-coal-900">{children}</dd>
    </div>
  );
}

export default function ManagerViolationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getViolation, assignCorrectiveAction } = useComplianceStore();
  const { showToast } = useToast();
  const v = getViolation(id);

  const [actionText, setActionText] = useState(
    () => v?.suggestedAction || 'Remediate hazard immediately and verify compliance per safety standards.',
  );
  const [selectedSupervisor, setSelectedSupervisor] = useState(() => SUPERVISORS[0].id);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [showReassign, setShowReassign] = useState(false);

  if (!v) {
    return <NotFoundPanel what="Violation" backTo="/manager/violations" backLabel="Back to Violations" />;
  }

  const item = v.checklistItemId ? getItem(v.checklistItemId) : null;
  const currentAction = v.correctiveAction;
  const upcoming = VIOLATION_FLOW.slice(VIOLATION_FLOW.indexOf(v.status) + 1).map((st) => `Next stage: ${st}`);

  const handleAssign = (e) => {
    e.preventDefault();
    if (!actionText.trim()) return;

    const sup = SUPERVISORS.find((s) => s.id === selectedSupervisor) || SUPERVISORS[0];
    const deadlineIso = new Date(`${deadlineDate}T17:00:00`).toISOString();

    assignCorrectiveAction(v.id, {
      action: actionText.trim(),
      assignedTo: `${sup.id} (${sup.name})`,
      deadline: deadlineIso,
      managerId: 'MGR-001',
    });

    showToast(`Corrective action assigned to ${sup.name}`);
    setShowReassign(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/manager/violations')}
          className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Violations & Actions
        </button>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-4xl font-semibold leading-none tabular-nums text-coal-900">{v.id}</h1>
          <div className="flex items-center gap-2">
            <SeverityBadge level={v.severity} />
            <StatusBadge status={v.status} />
            <RiskMeter score={v.riskScore?.score ?? 0} />
          </div>
        </div>
        <p className="mt-2 text-lg text-coal-900 font-medium">{v.finding}</p>
      </div>

      {/* Workflow Progress */}
      <Panel title="Platform Lifecycle — Stage Progress">
        <div className="p-4">
          <WorkflowStepper status={v.status} />
        </div>
      </Panel>

      {/* CORE ACTION: ASSIGN CORRECTIVE ACTION FORM */}
      {(v.status === 'Open' || showReassign) ? (
        <Panel
          title={v.status === 'Open' ? 'Assign Corrective Action (Stage 3)' : 'Re-assign Corrective Action'}
          tone="default"
        >
          <form onSubmit={handleAssign} className="space-y-4 p-5">
            <div className="rounded-md border border-brand/30 bg-amber-50/50 p-3 text-xs text-coal-800">
              <span className="font-semibold text-brand-dark">Manager Action Required:</span> Assign this violation to
              a qualified shift supervisor, prescribe the mandatory remediation, and set a completion deadline.
            </div>

            <div>
              <label htmlFor="action-text" className="block text-xs font-semibold uppercase tracking-wider text-steel-600 mb-1">
                Mandatory Corrective Action
              </label>
              <textarea
                id="action-text"
                rows={3}
                required
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="Specify precise actions to remediate the safety violation..."
                className="field w-full text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="supervisor-select" className="block text-xs font-semibold uppercase tracking-wider text-steel-600 mb-1">
                  Assign Accountable Supervisor
                </label>
                <select
                  id="supervisor-select"
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="field h-11 w-full text-sm"
                >
                  {SUPERVISORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.name} ({s.area})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="deadline-date" className="block text-xs font-semibold uppercase tracking-wider text-steel-600 mb-1">
                  Remediation Deadline
                </label>
                <input
                  id="deadline-date"
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="field h-11 w-full text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-primary h-11 px-5 text-sm font-semibold">
                <UserCheck size={18} />
                Confirm & Dispatch Assignment
              </button>
              {showReassign && (
                <button
                  type="button"
                  onClick={() => setShowReassign(false)}
                  className="btn-secondary h-11 px-4 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Panel>
      ) : (
        /* Already assigned summary */
        <Panel
          title="Assigned Corrective Action"
          action={
            v.status !== 'Verified' && (
              <button
                type="button"
                onClick={() => setShowReassign(true)}
                className="text-xs font-semibold text-primary-700 hover:underline"
              >
                Re-assign / Edit
              </button>
            )
          }
        >
          <div className="space-y-3 p-4">
            <div className="rounded-md border border-steel-200 bg-steel-50 p-3.5">
              <p className="text-sm font-medium text-coal-900">{currentAction?.action || 'Action assigned'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-steel-600">
                <span className="flex items-center gap-1">
                  <UserCheck size={14} className="text-primary-700" />
                  Accountable: <strong className="text-coal-800">{v.assignedTo}</strong>
                </span>
                {currentAction?.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-steel-500" />
                    Due by: <strong className="text-coal-800">{formatDate(currentAction.deadline)}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Facts grid */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-steel-200 bg-steel-200 lg:grid-cols-3">
        <Fact label="Category">{v.category}</Fact>
        <Fact label="Work Zone">{v.location}</Fact>
        <Fact label="Current Assignee">{v.assignedTo}</Fact>
        <Fact label="Reported Timestamp">
          {formatDate(v.timestamp)}, {formatTime(v.timestamp)}
        </Fact>
        <Fact label="Inspection Reference">{v.inspectionId}</Fact>
        <Fact label="Checklist Item">{item ? item.text : 'Manual Field Finding'}</Fact>
      </dl>

      {/* AI Risk Score & Evidence */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RiskScoreCard score={v.riskScore} />

        <div className="space-y-6">
          <section aria-label="GPS metadata">
            <h2 className="mb-2 font-display text-xl font-semibold leading-none text-coal-900">GPS Validation Metadata</h2>
            <GPSStatus gps={v.gps} />
          </section>

          <section aria-label="Original Evidence">
            <h2 className="mb-2 font-display text-xl font-semibold leading-none text-coal-900">
              Field Evidence ({v.evidence?.length || 0})
            </h2>
            <ul className="space-y-2">
              {v.evidence?.map((e) => (
                <EvidencePreview key={e.id} evidence={e} />
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* If Closure Evidence exists */}
      {v.closureEvidence && (
        <Panel title="Supervisor Closure Evidence (Stage 4)">
          <div className="space-y-3 p-4">
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

      {/* Audit Timeline */}
      <Panel title="Tamper-Evident Audit Timeline (Stage 6)">
        <div className="p-4">
          <AuditTimeline events={v.auditEvents || []} upcoming={upcoming} />
        </div>
      </Panel>
    </div>
  );
}
