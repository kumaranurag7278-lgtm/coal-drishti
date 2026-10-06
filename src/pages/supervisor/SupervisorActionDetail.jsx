import { AlertCircle, ArrowLeft, Calendar, Camera, CheckCircle2, Clock, Play, Send, ShieldAlert, Sparkles, User, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import AuditTimeline from '../../components/inspector/AuditTimeline.jsx';
import EvidenceCapture from '../../components/inspector/EvidenceCapture.jsx';
import EvidencePreview from '../../components/inspector/EvidencePreview.jsx';
import GPSStatus from '../../components/inspector/GPSStatus.jsx';
import WorkflowStepper from '../../components/inspector/WorkflowStepper.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { VIOLATION_FLOW } from '../../data/models.js';
import { formatDate, formatTime } from '../../lib/format.js';
import NotFoundPanel from '../inspector/NotFoundPanel.jsx';

export default function SupervisorActionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const { getViolation, markInProgress, submitClosureEvidence } = useComplianceStore();
  const { showToast } = useToast();

  const v = getViolation(id);
  const [closureEvidenceList, setClosureEvidenceList] = useState([]);
  const [closureNotes, setClosureNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!v) {
    return <NotFoundPanel what="Action" backTo="/supervisor" backLabel="Back to My Tasks" />;
  }

  const upcoming = VIOLATION_FLOW.slice(VIOLATION_FLOW.indexOf(v.status) + 1).map((st) => `Next stage: ${st}`);
  const action = v.correctiveAction;

  const handleStartWork = () => {
    markInProgress(v.id, { supervisorId: user?.empId || 'SUP-001' });
    showToast('Task marked in progress.');
  };

  const handleAddEvidence = (ev) => {
    setClosureEvidenceList((prev) => [...prev, ev]);
  };

  const handleRemoveEvidence = (evId) => {
    setClosureEvidenceList((prev) => prev.filter((e) => e.id !== evId));
  };

  const handleSubmitClosure = (e) => {
    e.preventDefault();
    if (closureEvidenceList.length === 0) {
      showToast('Please capture or attach at least one after-action photo.');
      return;
    }

    setSubmitting(true);
    submitClosureEvidence(v.id, {
      evidence: closureEvidenceList,
      notes: closureNotes.trim() || 'Remediation completed per safety specifications.',
      supervisorId: user?.empId || 'SUP-001',
    });
    setSubmitting(false);
    showToast('Closure evidence submitted for verification.');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/supervisor')}
          className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Supervisor Tasks
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

      {/* Workflow Stepper */}
      <Panel title="Platform Lifecycle — Stage Progress">
        <div className="p-4">
          <WorkflowStepper status={v.status} />
        </div>
      </Panel>

      {/* Mandated Corrective Action Details */}
      {action && (
        <Panel title="Assigned Corrective Action" tone="dark">
          <div className="space-y-3 p-4 text-white">
            <p className="text-base font-semibold">{action.action}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-steel-300">
              <span>
                Assignee: <strong className="text-white">{v.assignedTo}</strong>
              </span>
              <span>
                Target Deadline: <strong className="text-brand">{formatDate(action.deadline)}</strong>
              </span>
              <span>Work Zone: <strong className="text-white">{v.location}</strong></span>
            </div>
          </div>
        </Panel>
      )}

      {/* DYNAMIC ACTION STAGE */}
      {v.status === 'Assigned' && (
        <Panel title="Remediation Action Required (Stage 4)">
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 rounded-md border border-primary-200 bg-primary-50 p-4">
              <Wrench size={24} className="shrink-0 text-primary-700" />
              <div>
                <h3 className="font-display text-lg font-semibold text-coal-900">Ready to Begin Remediation?</h3>
                <p className="mt-1 text-sm text-steel-700">
                  Acknowledge this task to signal to mine management that physical remediation has begun on site.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartWork}
              className="btn-primary h-12 w-full text-base font-semibold sm:w-auto sm:px-8"
            >
              <Play size={18} />
              Mark Task In Progress
            </button>
          </div>
        </Panel>
      )}

      {v.status === 'In progress' && (
        <Panel title="Submit Closure Evidence (Stage 4)">
          <form onSubmit={handleSubmitClosure} className="space-y-5 p-5">
            <div className="rounded-md border border-brand/30 bg-amber-50/60 p-4 text-sm text-coal-900">
              <span className="font-semibold text-brand-dark">Closure Requirement:</span> Capture clear after-action
              photographic proof that the hazard has been eliminated. The Verification Center will compare hashes,
              locations, and image features before certifying closure.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-steel-600 mb-2">
                After-Action Closure Photograph (Mandatory)
              </label>
              <EvidenceCapture
                violationId={v.id}
                evidence={closureEvidenceList}
                gps={v.gps}
                onAdd={handleAddEvidence}
                onRemove={handleRemoveEvidence}
                label={`Resolved: ${v.finding}`}
              />
            </div>

            <div>
              <label htmlFor="closure-notes" className="block text-xs font-semibold uppercase tracking-wider text-steel-600 mb-1">
                Remediation Actions Taken & Notes
              </label>
              <textarea
                id="closure-notes"
                rows={3}
                required
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                placeholder="Detail the work carried out, parts replaced, or controls implemented..."
                className="field w-full text-sm"
              />
            </div>

            <div className="border-t border-steel-200 pt-4">
              <button
                type="submit"
                disabled={submitting || closureEvidenceList.length === 0}
                className="btn-primary h-12 w-full text-base font-semibold disabled:opacity-50 sm:w-auto sm:px-8"
              >
                <Send size={18} />
                Submit for Verification Review
              </button>
            </div>
          </form>
        </Panel>
      )}

      {v.status === 'Awaiting verification' && (
        <Panel title="Submitted for Verification (Stage 5)">
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-md border border-warn-line bg-warn-soft p-4">
              <Clock size={24} className="shrink-0 text-warn" />
              <div>
                <h3 className="font-display text-lg font-semibold text-coal-900">Awaiting Verification Review</h3>
                <p className="text-sm text-steel-700">
                  Your closure evidence has been queued for verification. The Verification Center will review before/after
                  evidence and check cryptographic integrity before closing this violation.
                </p>
              </div>
            </div>

            {v.closureEvidence && (
              <div className="space-y-3 rounded-md border border-steel-200 bg-white p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-steel-500">
                  Your Submitted Closure Evidence
                </h4>
                {v.closureEvidence.notes && (
                  <p className="text-sm text-coal-900 font-medium">{v.closureEvidence.notes}</p>
                )}
                <ul className="space-y-2">
                  {v.closureEvidence.evidence?.map((e) => (
                    <EvidencePreview key={e.id} evidence={e} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Panel>
      )}

      {v.status === 'Verified' && (
        <Panel title="Closure Verified & Certified (Stage 5 Closed)">
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-md border border-ok-line bg-ok-soft p-4">
              <CheckCircle2 size={24} className="shrink-0 text-ok" />
              <div>
                <h3 className="font-display text-lg font-semibold text-coal-900">Verified & Closed</h3>
                <p className="text-sm text-steel-700">
                  Remediation has been cryptographically validated and approved by the Verification Center.
                </p>
              </div>
            </div>

            {v.closureEvidence && (
              <div className="rounded-md border border-steel-200 bg-white p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-steel-500 mb-2">
                  Verified Closure Record
                </h4>
                <p className="text-sm text-coal-800">{v.closureEvidence.notes}</p>
                <ul className="mt-3 space-y-2">
                  {v.closureEvidence.evidence?.map((e) => (
                    <EvidencePreview key={e.id} evidence={e} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* Field Inspector's Original Finding & Evidence */}
      <Panel title="Original Detection Record (Stage 1)">
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-steel-200 bg-steel-200 sm:grid-cols-3">
            <div className="bg-white p-3">
              <span className="text-xs text-steel-500 block">Category</span>
              <span className="font-medium text-coal-900 text-sm">{v.category}</span>
            </div>
            <div className="bg-white p-3">
              <span className="text-xs text-steel-500 block">Work Zone</span>
              <span className="font-medium text-coal-900 text-sm">{v.location}</span>
            </div>
            <div className="bg-white p-3">
              <span className="text-xs text-steel-500 block">Inspection Ref</span>
              <span className="font-medium text-coal-900 text-sm">{v.inspectionId}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-steel-500 mb-2">
              Original Before-Action Evidence
            </h4>
            <ul className="space-y-2">
              {v.evidence?.map((e) => (
                <EvidencePreview key={e.id} evidence={e} />
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      {/* GPS Status */}
      <Panel title="GPS Validation Metadata">
        <div className="p-4">
          <GPSStatus gps={v.gps} />
        </div>
      </Panel>

      {/* Audit Timeline */}
      <Panel title="Tamper-Evident Audit Timeline">
        <div className="p-4">
          <AuditTimeline events={v.auditEvents || []} upcoming={upcoming} />
        </div>
      </Panel>
    </div>
  );
}
