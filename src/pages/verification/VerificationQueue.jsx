import { AlertCircle, ArrowRight, CheckCircle2, Clock, ExternalLink, FileSearch, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import LifecycleStrip from '../../components/LifecycleStrip.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { formatWhen } from '../../lib/format.js';

export default function VerificationQueue() {
  const { violations } = useComplianceStore();
  const [tab, setTab] = useState('queue'); // 'queue' | 'history'

  const queue = useMemo(() => {
    return violations
      .filter((v) => v.status === 'Awaiting verification')
      .sort((a, b) => {
        const timeA = new Date(a.closureEvidence?.submittedAt || a.timestamp).getTime();
        const timeB = new Date(b.closureEvidence?.submittedAt || b.timestamp).getTime();
        return timeA - timeB; // oldest first
      });
  }, [violations]);

  const verified = useMemo(() => {
    return violations.filter((v) => v.status === 'Verified');
  }, [violations]);

  return (
    <div className="space-y-6">
      {/* Header & Product Differentiator Highlight */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-ok-soft px-2.5 py-0.5 text-xs font-bold text-ok uppercase tracking-wider border border-ok-line">
            Competitive Differentiator
          </span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
          Closure Verification Center
        </h1>
        <p className="mt-1 text-sm text-steel-600 max-w-3xl">
          Catch fake, duplicate, or gamed safety compliance. While conventional tools only track that someone <em>said</em> they fixed an issue, COAL DRISHTI verifies closure evidence against baseline findings.
        </p>
      </div>

      {/* Six-Stage Lifecycle Strip with 'Verify' highlighted */}
      <Panel title="Platform Lifecycle — Stage 5: Verify (Our Core Differentiator)" tone="dark">
        <div className="p-4">
          <LifecycleStrip
            active="Verify"
            subtitle="Verification Stage: The gatekeeper before DGMS audit. Before/after photos are compared for hash uniqueness, zone proximity, and physical site variation."
          />
        </div>
      </Panel>

      {/* Queue Tabs */}
      <div className="flex border-b border-steel-200">
        <button
          type="button"
          onClick={() => setTab('queue')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'queue'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-steel-500 hover:text-coal-800'
          }`}
        >
          <Clock size={16} />
          Pending Verification Queue ({queue.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'history'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-steel-500 hover:text-coal-800'
          }`}
        >
          <CheckCircle2 size={16} />
          Verified & Certified Archive ({verified.length})
        </button>
      </div>

      {/* Tab 1: Queue */}
      {tab === 'queue' && (
        <Panel
          title={`Action Queue: Pending Closure Verifications (${queue.length})`}
          action={
            <span className="text-xs text-steel-500">
              Sorted by queue wait time (oldest first)
            </span>
          }
        >
          {queue.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 size={40} className="mx-auto text-ok" />
              <h3 className="mt-3 font-display text-2xl font-semibold text-coal-900">Queue is Clear</h3>
              <p className="mt-1 text-sm text-steel-500 max-w-md mx-auto">
                No violations are currently awaiting closure verification. When supervisors submit closure evidence, they will appear here for review.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-steel-200">
              {queue.map((v) => {
                const beforeImg = v.evidence?.[0]?.preview;
                const afterImg = v.closureEvidence?.evidence?.[0]?.preview;

                return (
                  <li key={v.id} className="p-4 transition-colors hover:bg-steel-50/70">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold tabular-nums text-primary-700">{v.id}</span>
                          <SeverityBadge level={v.severity} />
                          <StatusBadge status={v.status} />
                          <span className="text-xs text-steel-500">Zone: {v.location}</span>
                          <span className="text-xs text-steel-400">· {formatWhen(v.timestamp)}</span>
                        </div>

                        <h3 className="text-base font-semibold text-coal-900">{v.finding}</h3>

                        {v.closureEvidence && (
                          <div className="rounded border border-steel-200 bg-steel-50 p-2.5 text-xs text-steel-700">
                            <span className="font-semibold text-coal-800">
                              Submitted by {v.closureEvidence.submittedBy}:
                            </span>{' '}
                            {v.closureEvidence.notes || 'Closure evidence submitted for review.'}
                          </div>
                        )}
                      </div>

                      {/* Visual Thumbnails Comparison Preview */}
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-steel-500 mb-1">
                            Before (Inspector)
                          </span>
                          <div className="h-16 w-24 overflow-hidden rounded border border-steel-300 bg-coal-950">
                            {beforeImg ? (
                              <img src={beforeImg} alt="Before" className="h-full w-full object-cover" />
                            ) : (
                              <span className="grid h-full place-items-center text-xs text-steel-400">No img</span>
                            )}
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-primary-700 mb-1">
                            After (Supervisor)
                          </span>
                          <div className="h-16 w-24 overflow-hidden rounded border-2 border-primary-500 bg-coal-950 shadow-sm">
                            {afterImg ? (
                              <img src={afterImg} alt="After" className="h-full w-full object-cover" />
                            ) : (
                              <span className="grid h-full place-items-center text-xs text-steel-400">No img</span>
                            )}
                          </div>
                        </div>

                        <div className="pl-2">
                          <Link
                            to={`/verification/review/${v.id}`}
                            className="btn-primary inline-flex h-11 items-center gap-1.5 px-4 text-xs font-semibold whitespace-nowrap shadow-sm"
                          >
                            <FileSearch size={16} />
                            Inspect & Verify
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      {/* Tab 2: Verified Archive */}
      {tab === 'history' && (
        <Panel title={`Verified & Certified Records (${verified.length})`}>
          {verified.length === 0 ? (
            <div className="p-8 text-center text-sm text-steel-500">No verified closures in history.</div>
          ) : (
            <ul className="divide-y divide-steel-200">
              {verified.map((v) => (
                <li key={v.id} className="p-4 hover:bg-steel-50">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tabular-nums text-primary-700">{v.id}</span>
                        <SeverityBadge level={v.severity} />
                        <StatusBadge status={v.status} />
                        <span className="text-xs text-steel-500">Zone: {v.location}</span>
                      </div>
                      <p className="mt-1 font-medium text-coal-900">{v.finding}</p>
                    </div>

                    <Link
                      to={`/verification/review/${v.id}`}
                      className="btn-secondary inline-flex h-9 items-center gap-1.5 px-3 text-xs"
                    >
                      View Forensic Details
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <p className="text-center text-xs text-steel-500">
        Anti-Fraud Engine Prototype · SHA-256 signatures are used for cryptographic auditability and tamper-detection ·
        Prototype heuristics simulate computer-vision validation.
      </p>
    </div>
  );
}
