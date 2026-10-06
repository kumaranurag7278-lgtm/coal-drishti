import { AlertCircle, AlertTriangle, ArrowRight, Calendar, CheckCircle2, Clock, Filter, HardHat, ShieldAlert, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import LifecycleStrip from '../../components/LifecycleStrip.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { SUPERVISORS } from '../../data/personnel.js';
import { formatDate, formatWhen } from '../../lib/format.js';

function KpiCard({ label, value, sub, icon: Icon, tone = 'text-coal-900', onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-md border p-4 shadow-sm transition-all ${
        active
          ? 'border-primary-600 bg-primary-50/40 ring-2 ring-primary-500/20'
          : 'border-steel-200 bg-white hover:border-steel-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</span>
        <Icon size={20} className={tone} />
      </div>
      <p className={`mt-2 font-display text-3xl font-bold leading-none tabular-nums ${tone}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-steel-500">{sub}</p>}
    </button>
  );
}

export default function SupervisorDashboard() {
  const { violations } = useComplianceStore();
  const { user } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';

  const supervisor = useMemo(() => {
    return SUPERVISORS.find((s) => s.id === user?.empId) || SUPERVISORS[0];
  }, [user]);

  // Tasks assigned to this supervisor (or all assigned tasks for prototype demonstration)
  const myTasks = useMemo(() => {
    return violations.filter((v) => {
      if (v.status === 'Open') return false;
      const assigned = v.assignedTo || '';
      return assigned.includes(supervisor.id) || assigned.includes('Supervisor') || assigned.includes('SUP');
    });
  }, [violations, supervisor.id]);

  const now = new Date();

  // Categorize
  const pendingActions = myTasks.filter((v) => v.status === 'Assigned' || v.status === 'In progress');
  const inProgress = myTasks.filter((v) => v.status === 'In progress');
  const awaitingVerification = myTasks.filter((v) => v.status === 'Awaiting verification');
  const verifiedClosed = myTasks.filter((v) => v.status === 'Verified');

  const overdue = pendingActions.filter((v) => {
    if (!v.correctiveAction?.deadline) return false;
    return new Date(v.correctiveAction.deadline) < now;
  });

  const displayedTasks = useMemo(() => {
    if (filter === 'pending') return pendingActions;
    if (filter === 'inprogress') return inProgress;
    if (filter === 'awaiting') return awaitingVerification;
    if (filter === 'verified') return verifiedClosed;
    return myTasks;
  }, [filter, myTasks, pendingActions, inProgress, awaitingVerification, verifiedClosed]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header & Supervisor identity */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
            Supervisor Remediation Hub
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Assigned to <span className="font-semibold text-coal-800">{supervisor.name}</span> ({supervisor.id}) · {supervisor.area}
          </p>
        </div>
      </div>

      {/* Six-Stage Lifecycle Strip with 'Correct' highlighted */}
      <Panel title="Platform Lifecycle — Stage 4: Correct" tone="dark">
        <div className="p-4">
          <LifecycleStrip
            active="Correct"
            subtitle="Supervisor Stage: Remediate hazards on the ground, upload verifiable completion evidence photo, and trigger verification."
          />
        </div>
      </Panel>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Action Required"
          value={pendingActions.length}
          sub={`${overdue.length} overdue`}
          icon={AlertTriangle}
          tone={overdue.length > 0 ? 'text-danger' : 'text-warn'}
          active={filter === 'pending'}
          onClick={() => setSearchParams({ filter: 'pending' })}
        />
        <KpiCard
          label="In Progress"
          value={inProgress.length}
          sub="Remediation active"
          icon={Wrench}
          tone="text-primary-700"
          active={filter === 'inprogress'}
          onClick={() => setSearchParams({ filter: 'inprogress' })}
        />
        <KpiCard
          label="Awaiting Verification"
          value={awaitingVerification.length}
          sub="Submitted for review"
          icon={Clock}
          tone="text-hi"
          active={filter === 'awaiting'}
          onClick={() => setSearchParams({ filter: 'awaiting' })}
        />
        <KpiCard
          label="Verified & Closed"
          value={verifiedClosed.length}
          sub="Passed tamper-check"
          icon={CheckCircle2}
          tone="text-ok"
          active={filter === 'verified'}
          onClick={() => setSearchParams({ filter: 'verified' })}
        />
      </div>

      {/* Overdue alert banner if any */}
      {overdue.length > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-coal-900">
          <AlertCircle size={20} className="shrink-0 text-danger" />
          <div className="flex-1">
            <span className="font-semibold text-danger">Action Overdue:</span> You have {overdue.length} assigned
            corrective action(s) past their mandated completion deadline.
          </div>
          <button
            type="button"
            onClick={() => setSearchParams({ filter: 'pending' })}
            className="text-xs font-bold uppercase tracking-wider text-danger underline hover:text-danger/80"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Assigned Tasks List */}
      <Panel
        title={`My Corrective Actions (${displayedTasks.length})`}
        action={
          <div className="flex items-center gap-2">
            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setSearchParams({ filter: 'all' })}
                className="text-xs font-semibold text-primary-700 hover:underline"
              >
                Show All Tasks
              </button>
            )}
          </div>
        }
      >
        {displayedTasks.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 size={36} className="mx-auto text-ok" />
            <h3 className="mt-2 font-display text-xl font-semibold text-coal-900">No Pending Tasks</h3>
            <p className="mt-1 text-sm text-steel-500">
              There are no tasks matching this filter view.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-steel-200">
            {displayedTasks.map((v) => {
              const deadline = v.correctiveAction?.deadline;
              const isOverdue = deadline && new Date(deadline) < now && v.status !== 'Verified' && v.status !== 'Awaiting verification';

              return (
                <li
                  key={v.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-steel-50 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold tabular-nums text-primary-700">{v.id}</span>
                      <SeverityBadge level={v.severity} />
                      <StatusBadge status={v.status} />
                      <span className="text-xs text-steel-500">Zone: {v.location}</span>
                      {isOverdue && (
                        <span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                          Overdue
                        </span>
                      )}
                    </div>

                    <p className="mt-1 font-medium text-coal-900">{v.finding}</p>

                    {v.correctiveAction?.action && (
                      <p className="mt-1 rounded bg-steel-100/70 p-2 text-xs text-coal-800">
                        <strong className="text-steel-600">Assigned Action:</strong> {v.correctiveAction.action}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-steel-500">
                      {deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          Target: {formatDate(deadline)}
                        </span>
                      )}
                      <span>Reported: {formatWhen(v.timestamp)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-steel-100 pt-3 md:border-0 md:pt-0">
                    <RiskMeter score={v.riskScore?.score ?? 0} />
                    <Link
                      to={`/supervisor/actions/${v.id}`}
                      className={`inline-flex h-9 items-center gap-1.5 rounded px-3 text-xs font-semibold shadow-sm transition-colors ${
                        v.status === 'Assigned'
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : v.status === 'In progress'
                          ? 'bg-brand text-coal-950 font-bold hover:bg-brand/90'
                          : 'bg-steel-200 text-coal-800 hover:bg-steel-300'
                      }`}
                    >
                      {v.status === 'Assigned' && 'Start Work'}
                      {v.status === 'In progress' && 'Submit Closure'}
                      {v.status === 'Awaiting verification' && 'View Submission'}
                      {v.status === 'Verified' && 'View Record'}
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
