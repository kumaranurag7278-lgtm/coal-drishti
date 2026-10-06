import { AlertCircle, AlertTriangle, ArrowLeft, Check, CheckCircle2, Clock, Eye, FileText, Fingerprint, MapPin, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import AuditTimeline from '../../components/inspector/AuditTimeline.jsx';
import EvidencePreview from '../../components/inspector/EvidencePreview.jsx';
import WorkflowStepper from '../../components/inspector/WorkflowStepper.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { VIOLATION_FLOW } from '../../data/models.js';
import { formatDate, formatTime } from '../../lib/format.js';
import { evaluateClosureIntegrity } from '../../lib/verification.js';
import NotFoundPanel from '../inspector/NotFoundPanel.jsx';

export default function VerificationReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getViolation, verifyViolation } = useComplianceStore();
  const { showToast } = useToast();

  const v = getViolation(id);

  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');

  const integrity = useMemo(() => {
    return v ? evaluateClosureIntegrity(v) : null;
  }, [v]);

  if (!v) {
    return <NotFoundPanel what="Record" backTo="/verification" backLabel="Back to Queue" />;
  }

  const upcoming = VIOLATION_FLOW.slice(VIOLATION_FLOW.indexOf(v.status) + 1).map((st) => `Next stage: ${st}`);
  const originalEv = v.evidence?.[0];
  const closureEv = v.closureEvidence?.evidence?.[0];

  const handleVerify = () => {
    verifyViolation(v.id, {
      outcome: 'verified',
      notes: verifyNotes.trim() || 'Closure evidence visually and cryptographically validated. Safety hazard resolved.',
    });
    showToast(`Violation ${v.id} verified and officially closed.`);
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      showToast('Please provide a specific reason for rejection.');
      return;
    }
    verifyViolation(v.id, {
      outcome: 'rejected',
      notes: rejectReason.trim(),
    });
    showToast(`Verification rejected. Violation returned to supervisor.`);
    setRejecting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/verification')}
          className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Verification Queue
        </button>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-semibold leading-none tabular-nums text-coal-900">{v.id}</h1>
            <SeverityBadge level={v.severity} />
            <StatusBadge status={v.status} />
            <RiskMeter score={v.riskScore?.score ?? 0} />
          </div>

          {v.status === 'Verified' ? (
            <div className="flex items-center gap-2 rounded-md border border-ok-line bg-ok-soft px-3 py-1.5 text-xs font-bold text-ok">
              <CheckCircle2 size={16} />
              CERTIFIED CLOSED
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-warn-line bg-warn-soft px-3 py-1.5 text-xs font-semibold text-warn">
              <Clock size={16} />
              AWAITING VERIFIER APPROVAL
            </div>
          )}
        </div>
        <p className="mt-2 text-lg font-medium text-coal-900">{v.finding}</p>
      </div>

      {/* Workflow Stepper */}
      <Panel title="Platform Lifecycle — Stage 5: Verification Checkpoint">
        <div className="p-4">
          <WorkflowStepper status={v.status} />
        </div>
      </Panel>

      {/* CORE DIFFERENTIATOR: SIDE-BY-SIDE FORENSIC EVIDENCE COMPARISON */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold leading-none text-coal-900">
            Side-by-Side Closure Comparison
          </h2>
          <span className="text-xs text-steel-500 font-mono">
            Anti-tamper baseline matching
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left Column: Baseline Finding */}
          <div className="rounded-lg border border-steel-300 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-steel-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded bg-steel-200 text-xs font-bold text-coal-800">
                  1
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-steel-700">
                  Before: Baseline Finding (Inspector)
                </span>
              </div>
              <span className="text-xs text-steel-500 font-mono">{formatDate(v.timestamp)}</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-steel-300 bg-coal-950">
                {originalEv?.preview ? (
                  <img
                    src={originalEv.preview}
                    alt="Baseline evidence"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-steel-400">No baseline image</div>
                )}
                <span className="absolute bottom-2 left-2 rounded bg-coal-950/80 px-2 py-0.5 text-[10px] font-mono text-steel-300">
                  SHA-256: {originalEv?.hash?.slice(0, 16)}...
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-steel-600 bg-steel-50 p-3 rounded">
                <div className="flex justify-between">
                  <span>Reported By:</span>
                  <strong className="text-coal-800">{v.assignedTo === 'Mine Manager' ? 'INS-001' : 'Inspector'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Work Zone:</span>
                  <strong className="text-coal-800">{v.location}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>GPS:</span>
                  <span>{v.gps?.latitude?.toFixed(4)}° N, {v.gps?.longitude?.toFixed(4)}° E</span>
                </div>
                {v.remarks && (
                  <div className="pt-1 text-steel-700">
                    <span className="font-semibold">Inspector Remarks:</span> {v.remarks}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Remediation Closure Evidence */}
          <div className="rounded-lg border-2 border-primary-500 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-primary-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded bg-primary-600 text-xs font-bold text-white">
                  2
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-800">
                  After: Closure Remediation (Supervisor)
                </span>
              </div>
              <span className="text-xs text-steel-500 font-mono">
                {v.closureEvidence ? formatDate(v.closureEvidence.submittedAt) : 'Pending'}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-steel-300 bg-coal-950">
                {closureEv?.preview ? (
                  <img
                    src={closureEv.preview}
                    alt="Closure evidence"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-steel-400">
                    No closure evidence submitted yet
                  </div>
                )}
                {closureEv?.hash && (
                  <span className="absolute bottom-2 left-2 rounded bg-coal-950/80 px-2 py-0.5 text-[10px] font-mono text-steel-300">
                    SHA-256: {closureEv.hash.slice(0, 16)}...
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-steel-600 bg-primary-50/50 p-3 rounded border border-primary-100">
                <div className="flex justify-between">
                  <span>Submitted By:</span>
                  <strong className="text-coal-800">{v.closureEvidence?.submittedBy || 'SUP-001'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Remediation Status:</span>
                  <strong className="text-primary-700">Remediation Completed</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Closure GPS:</span>
                  <span>{closureEv?.latitude?.toFixed(4) || v.gps?.latitude?.toFixed(4)}° N, {closureEv?.longitude?.toFixed(4) || v.gps?.longitude?.toFixed(4)}° E</span>
                </div>
                <div className="pt-1 text-steel-800">
                  <span className="font-semibold">Supervisor Notes:</span>{' '}
                  {v.closureEvidence?.notes || 'Supervisor indicated resolution completed.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AUTOMATED INTEGRITY HEURISTICS & AUDIT CHECKS */}
      {integrity && (
        <Panel
          title="Automated Anti-Fraud & Cryptographic Heuristics"
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs text-steel-500">Overall Trust:</span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  integrity.status === 'HIGH_TRUST'
                    ? 'bg-ok-soft text-ok border border-ok-line'
                    : integrity.status === 'SUSPECT'
                    ? 'bg-danger text-white'
                    : 'bg-warn text-white'
                }`}
              >
                {integrity.trustScore} / 100 ({integrity.status.replace('_', ' ')})
              </span>
            </div>
          }
        >
          <div className="space-y-4 p-5">
            <p className="text-xs text-steel-500">
              Heuristic verification compares cryptographic signatures, timestamps, GPS bounds, and site variation indices to detect fake closures or duplicate submissions before audit sign-off.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {integrity.checks.map((chk) => (
                <div
                  key={chk.id}
                  className={`rounded-md border p-3 text-xs ${
                    chk.passed ? 'border-ok-line/60 bg-ok-soft/30' : 'border-danger/40 bg-danger/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-coal-900">{chk.label}</span>
                    {chk.passed ? (
                      <span className="flex items-center gap-1 font-bold text-ok">
                        <Check size={14} /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-danger">
                        <AlertTriangle size={14} /> FAILED
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-steel-600">{chk.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* VERIFIER OPERATIONAL DECISION ACTIONS */}
      {v.status === 'Awaiting verification' && (
        <Panel title="Verification Decision Action" tone="dark">
          <div className="space-y-4 p-5 text-white">
            <p className="text-sm text-steel-300">
              As a Verification Center official, certifying this closure updates the tamper-evident audit record and marks the violation officially resolved for DGMS compliance audits.
            </p>

            {!rejecting ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="verify-notes" className="block text-xs font-semibold uppercase tracking-wider text-steel-300 mb-1">
                    Verification Approval Notes (Optional)
                  </label>
                  <input
                    id="verify-notes"
                    type="text"
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="e.g. Evidence matches baseline location. Mechanical guard confirmed locked in position."
                    className="field w-full text-sm text-coal-900"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="inline-flex h-12 items-center gap-2 rounded bg-ok px-6 text-sm font-bold text-white shadow-md hover:bg-ok/90 active:scale-[0.99]"
                  >
                    <CheckCircle2 size={18} />
                    Verify & Certify Closure
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejecting(true)}
                    className="inline-flex h-12 items-center gap-2 rounded border border-danger/60 bg-danger/20 px-5 text-sm font-semibold text-red-200 hover:bg-danger/30"
                  >
                    <XCircle size={18} />
                    Reject — Send Back to Supervisor
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReject} className="space-y-3 rounded-md border border-danger/60 bg-coal-900 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-red-400">Rejection Reason Required:</span>
                  <button
                    type="button"
                    onClick={() => setRejecting(false)}
                    className="text-xs text-steel-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Detail why the closure is rejected (e.g. Photo obstructed, reverse alarm audible test missing, incomplete work)..."
                  className="field w-full text-sm text-coal-900"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-1.5 rounded bg-danger px-4 text-xs font-bold text-white hover:bg-danger/90"
                  >
                    Confirm Rejection & Return to Supervisor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejecting(false)}
                    className="btn-secondary h-10 px-3 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </Panel>
      )}

      {/* Tamper-Evident Audit Timeline */}
      <Panel title="Cryptographic Tamper-Evident Audit Timeline (Stage 6)">
        <div className="p-4">
          <AuditTimeline events={v.auditEvents || []} upcoming={upcoming} />
        </div>
      </Panel>
    </div>
  );
}
