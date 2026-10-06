import { AlertCircle, ArrowRight, CheckCircle2, Clock, Filter, MapPin, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import LifecycleStrip from '../../components/LifecycleStrip.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { MANAGERS } from '../../data/personnel.js';
import { ZONES } from '../../data/zones.js';
import { formatWhen } from '../../lib/format.js';

function KpiCard({ label, value, sub, icon: Icon, tone = 'text-coal-900', to }) {
  const content = (
    <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm hover:border-steel-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</span>
        <Icon size={20} className={tone} />
      </div>
      <p className={`mt-2 font-display text-3xl font-bold leading-none tabular-nums ${tone}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-steel-500">{sub}</p>}
    </div>
  );

  return to ? <Link to={to} className="block transition-transform active:scale-[0.99]">{content}</Link> : content;
}

export default function ManagerDashboard() {
  const { violations } = useComplianceStore();
  const navigate = useNavigate();
  const manager = MANAGERS[0];

  const unassigned = useMemo(
    () => violations.filter((v) => v.status === 'Open').sort((a, b) => b.riskScore.score - a.riskScore.score),
    [violations],
  );

  const highRisk = useMemo(
    () => violations.filter((v) => v.status !== 'Verified' && v.riskScore.score >= 70),
    [violations],
  );

  const awaitingVerification = useMemo(
    () => violations.filter((v) => v.status === 'Awaiting verification'),
    [violations],
  );

  const activeCount = violations.filter((v) => v.status !== 'Verified').length;

  // Zone statistics for mini GIS overview
  const zoneStats = useMemo(() => {
    return ZONES.map((zone) => {
      const zoneViolations = violations.filter((v) => v.zoneId === zone.id && v.status !== 'Verified');
      const highCount = zoneViolations.filter((v) => v.riskScore.score >= 70).length;
      return {
        ...zone,
        count: zoneViolations.length,
        highCount,
      };
    });
  }, [violations]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header & Role Info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
            Mine Management & Action Center
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Welcome back, <span className="font-semibold text-coal-800">{manager.name}</span> · {manager.area}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/manager/violations" className="btn-secondary h-10 text-sm">
            All Violations ({violations.length})
          </Link>
        </div>
      </div>

      {/* Six-Stage Lifecycle Strip with 'Assign' highlighted */}
      <Panel title="Platform Lifecycle — Stage 3: Assign" tone="dark">
        <div className="p-4">
          <LifecycleStrip
            active="Assign"
            subtitle="Mine Manager Stage: Review AI-prioritized safety hazards, designate accountable supervisors, and enforce resolution deadlines."
          />
        </div>
      </Panel>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Unassigned"
          value={unassigned.length}
          sub="Requires supervisor assignment"
          icon={AlertCircle}
          tone="text-danger"
          to="/manager/violations?status=Open"
        />
        <KpiCard
          label="High / Critical Risk"
          value={highRisk.length}
          sub="AI score ≥ 70"
          icon={ShieldAlert}
          tone="text-hi"
          to="/manager/violations?risk=high"
        />
        <KpiCard
          label="Awaiting Verification"
          value={awaitingVerification.length}
          sub="Remediation submitted"
          icon={Clock}
          tone="text-warn"
          to="/verification"
        />
        <KpiCard
          label="Total Active"
          value={activeCount}
          sub="Open across 7 zones"
          icon={CheckCircle2}
          tone="text-primary-700"
          to="/manager/violations"
        />
      </div>

      {/* Priority Action Queue: AI Risk-Prioritized Unassigned Violations */}
      <Panel
        title={`Action Required: Unassigned Violations (${unassigned.length})`}
        action={
          <span className="flex items-center gap-1.5 text-xs text-steel-500">
            <Sparkles size={14} className="text-brand" />
            Sorted by AI Risk Score
          </span>
        }
      >
        {unassigned.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 size={36} className="mx-auto text-ok" />
            <h3 className="mt-2 font-display text-xl font-semibold text-coal-900">All Violations Assigned</h3>
            <p className="mt-1 text-sm text-steel-500">
              There are no pending unassigned safety violations at this time.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-steel-200">
            {unassigned.slice(0, 5).map((v) => (
              <li
                key={v.id}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-steel-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-primary-700">{v.id}</span>
                    <SeverityBadge level={v.severity} />
                    <span className="text-xs text-steel-500">Zone: {v.location}</span>
                    <span className="text-xs text-steel-400">· {formatWhen(v.timestamp)}</span>
                  </div>
                  <p className="mt-1 font-medium text-coal-900">{v.finding}</p>
                  {v.suggestedAction && (
                    <p className="mt-0.5 text-xs text-steel-600 line-clamp-1">
                      <span className="font-semibold text-steel-500">Inspector suggestion:</span> {v.suggestedAction}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <RiskMeter score={v.riskScore.score} />
                  <Link
                    to={`/manager/violations/${v.id}`}
                    className="btn-primary inline-flex h-9 items-center gap-1.5 px-3 text-xs"
                  >
                    <UserCheck size={14} />
                    Assign
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        {unassigned.length > 5 && (
          <div className="border-t border-steel-200 p-3 text-center">
            <Link to="/manager/violations?status=Open" className="text-xs font-semibold text-primary-700 hover:underline">
              View all {unassigned.length} unassigned violations →
            </Link>
          </div>
        )}
      </Panel>

      {/* Mini GIS Work Zone Status Grid */}
      <Panel
        title="Mine Work Zones — Compliance Status"
        action={
          <Link to="/manager/zones" className="text-xs font-semibold text-primary-700 hover:underline">
            Interactive GIS Overview →
          </Link>
        }
      >
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {zoneStats.map((z) => {
              const ZoneIcon = z.icon;
              return (
                <Link
                  key={z.id}
                  to={`/manager/violations?zone=${z.id}`}
                  className="flex flex-col justify-between rounded-md border border-steel-200 bg-steel-50 p-3.5 transition-colors hover:border-primary-400 hover:bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded bg-steel-200 text-coal-800">
                        <ZoneIcon size={16} />
                      </span>
                      <div>
                        <h4 className="font-display font-semibold text-coal-900 leading-tight">{z.name}</h4>
                        <p className="text-[11px] text-steel-500">{z.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-steel-200/80 pt-2 text-xs">
                    <span className="text-steel-600">Active Violations</span>
                    <span className="flex items-center gap-1 font-semibold">
                      {z.count > 0 ? (
                        <span className={`tabular-nums ${z.highCount > 0 ? 'text-danger' : 'text-coal-800'}`}>
                          {z.count} {z.highCount > 0 && `(${z.highCount} high risk)`}
                        </span>
                      ) : (
                        <span className="text-ok">0 (Clear)</span>
                      )}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* Honest Prototype Notice */}
      <p className="text-center text-xs text-steel-500">
        COAL DRISHTI Smart Governance Prototype · AI risk scores assist prioritization and are not legally binding ·
        Final operational decisions remain with authorized personnel.
      </p>
    </div>
  );
}
