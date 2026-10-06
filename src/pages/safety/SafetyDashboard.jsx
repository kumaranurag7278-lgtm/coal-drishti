import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Filter, Layers, LogOut, MapPin, ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import LifecycleStrip from '../../components/LifecycleStrip.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { ALERTS } from '../../data/inspectorMock.js';
import { SAFETY_OFFICERS } from '../../data/personnel.js';
import { ZONES } from '../../data/zones.js';
import { formatWhen } from '../../lib/format.js';

export default function SafetyDashboard() {
  const { violations } = useComplianceStore();
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const safetyOfficer = SAFETY_OFFICERS[0];

  const totalViolations = violations.length;
  const criticalViolations = violations.filter((v) => v.severity === 'CRITICAL');
  const highRisk = violations.filter((v) => v.riskScore?.score >= 70 && v.status !== 'Verified');
  const awaitingVerification = violations.filter((v) => v.status === 'Awaiting verification');

  // Trend analysis (e.g. repeated violations by zone or category)
  const repeatedTrends = useMemo(() => {
    const counts = {};
    violations.forEach((v) => {
      const key = `${v.location} - ${v.category}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([_, count]) => count >= 2)
      .map(([label, count]) => ({ label, count }));
  }, [violations]);

  const logout = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-steel-50">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-coal-700 bg-coal-950 text-white">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded bg-primary-600 text-white">
              <ShieldCheck size={20} />
            </span>
            <span className="font-display text-xl font-bold uppercase tracking-wider">
              Mine Safety Directorate
            </span>
            <span className="hidden rounded-sm bg-white/10 px-2 py-0.5 text-xs text-steel-300 sm:inline">
              {user?.org || 'Mine A'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/verification"
              className="inline-flex h-9 items-center gap-1.5 rounded bg-brand/20 px-3 text-xs font-semibold text-brand hover:bg-brand/30"
            >
              Verification Queue ({awaitingVerification.length})
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center gap-1.5 rounded px-2.5 text-xs text-steel-300 hover:bg-white/10"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
            Mine-Wide Safety Oversight & Trend Analysis
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Safety Officer: <strong className="text-coal-800">{safetyOfficer.name}</strong> · {safetyOfficer.title}
          </p>
        </div>

        {/* Lifecycle */}
        <Panel title="Platform Lifecycle — Safety Directorate" tone="dark">
          <div className="p-4">
            <LifecycleStrip
              active="Verify"
              subtitle="Safety Officer Scope: Proactive monitoring of hazard clusters, safety trend alerts, and cross-sector compliance integrity."
            />
          </div>
        </Panel>

        {/* Safety KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Critical Hazards</span>
            <p className="mt-2 font-display text-3xl font-bold text-danger tabular-nums">
              {criticalViolations.length}
            </p>
            <p className="mt-1 text-xs text-steel-500">Immediate stop-work risk</p>
          </div>

          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">High Risk Active</span>
            <p className="mt-2 font-display text-3xl font-bold text-hi tabular-nums">
              {highRisk.length}
            </p>
            <p className="mt-1 text-xs text-steel-500">AI Risk Score ≥ 70</p>
          </div>

          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Pending Verification</span>
            <p className="mt-2 font-display text-3xl font-bold text-warn tabular-nums">
              {awaitingVerification.length}
            </p>
            <p className="mt-1 text-xs text-steel-500">Awaiting verifier review</p>
          </div>

          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Cumulative Findings</span>
            <p className="mt-2 font-display text-3xl font-bold text-coal-900 tabular-nums">
              {totalViolations}
            </p>
            <p className="mt-1 text-xs text-steel-500">All mine sectors</p>
          </div>
        </div>

        {/* Hazard Trends & Early Warning Alerts */}
        <Panel
          title="Active Safety Alerts & Hazard Cluster Warnings"
          action={
            <span className="flex items-center gap-1 text-xs font-semibold text-hi">
              <TrendingUp size={14} /> AI Cluster Heuristics
            </span>
          }
        >
          <div className="p-4 space-y-3">
            {repeatedTrends.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-md border border-hi-line bg-hi-soft/40 p-3 text-xs"
              >
                <AlertTriangle size={18} className="shrink-0 text-hi" />
                <div className="flex-1">
                  <span className="font-bold text-coal-900">{t.label}:</span> Detected {t.count} recurring violations in
                  this sector. Systematic maintenance or procedural review advised.
                </div>
              </div>
            ))}
            {ALERTS.slice(0, 2).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-md border border-steel-200 bg-steel-50 p-3 text-xs"
              >
                <AlertCircle size={18} className="shrink-0 text-steel-600" />
                <div className="flex-1 text-coal-800">{a.text}</div>
                <span className="text-[11px] text-steel-500">{a.time}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* All Violations Mine-Wide List */}
        <Panel title={`Mine-Wide Safety Violations (${violations.length})`}>
          <ul className="divide-y divide-steel-200">
            {violations.map((v) => (
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
                    <span className="text-xs text-steel-400">· {formatWhen(v.timestamp)}</span>
                  </div>
                  <p className="mt-1 font-medium text-coal-900">{v.finding}</p>
                  <p className="text-xs text-steel-500 mt-0.5">Assigned to: {v.assignedTo}</p>
                </div>

                <div className="flex items-center gap-4">
                  <RiskMeter score={v.riskScore?.score ?? 0} />
                  <Link
                    to={`/verification/review/${v.id}`}
                    className="btn-secondary h-9 px-3 text-xs font-semibold"
                  >
                    Inspect Evidence
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </main>
    </div>
  );
}
