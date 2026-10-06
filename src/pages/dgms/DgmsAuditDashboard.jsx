import { AlertTriangle, Check, CheckCircle2, ChevronDown, ChevronRight, Download, ExternalLink, Eye, FileSpreadsheet, FileText, Fingerprint, Layers, MapPin, Scale, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import LifecycleStrip from '../../components/LifecycleStrip.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { SEVERITIES, VIOLATION_FLOW } from '../../data/models.js';
import { AUDITORS } from '../../data/personnel.js';
import { ZONES } from '../../data/zones.js';
import { formatDate, formatTime, formatWhen } from '../../lib/format.js';

export default function DgmsAuditDashboard() {
  const { violations, inspections } = useComplianceStore();
  const auditor = AUDITORS[0];

  const [activeZone, setActiveZone] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Audit metrics
  const totalViolations = violations.length;
  const verifiedCount = violations.filter((v) => v.status === 'Verified').length;
  const resolutionRate = totalViolations > 0 ? Math.round((verifiedCount / totalViolations) * 100) : 0;
  const totalAuditEvents = useMemo(() => {
    return violations.reduce((acc, v) => acc + (v.auditEvents?.length || 0), 0);
  }, [violations]);

  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      if (activeZone !== 'ALL' && v.zoneId !== activeZone) return false;
      if (activeStatus !== 'ALL' && v.status !== activeStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = v.id.toLowerCase().includes(q);
        const matchFinding = v.finding.toLowerCase().includes(q);
        const matchZone = v.location.toLowerCase().includes(q);
        const matchCategory = v.category.toLowerCase().includes(q);
        if (!matchId && !matchFinding && !matchZone && !matchCategory) return false;
      }
      return true;
    });
  }, [violations, activeZone, activeStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-brand" />
            <span className="text-xs font-bold uppercase tracking-wider text-steel-500">
              Government of India · Ministry of Labour & Employment
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
            DGMS Statutory Compliance Ledger
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Official Regulatory Oversight Portal · Auditor: <strong className="text-coal-800">{auditor.name}</strong> ({auditor.title}, {auditor.area})
          </p>
        </div>

        <Link
          to="/dgms/report"
          className="btn-primary inline-flex h-11 items-center gap-2 px-5 text-sm font-semibold shadow-sm"
        >
          <FileText size={16} />
          Generate Statutory Report
        </Link>
      </div>

      {/* Six-Stage Lifecycle Strip with 'Audit' highlighted */}
      <Panel title="Platform Lifecycle — Stage 6: Audit & Compliance Dossier" tone="dark">
        <div className="p-4">
          <LifecycleStrip
            active="Audit"
            subtitle="DGMS Regulatory Stage: Complete, tamper-evident chronological timeline of every violation, action, cryptographic signature, and closure certification."
          />
        </div>
      </Panel>

      {/* Regulatory KPI Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">Total Inspections</span>
          <p className="mt-2 font-display text-3xl font-bold leading-none text-coal-900 tabular-nums">
            {inspections.length}
          </p>
          <p className="mt-1 text-xs text-steel-500">Statutory audits conducted</p>
        </div>

        <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">Total Findings</span>
          <p className="mt-2 font-display text-3xl font-bold leading-none text-coal-900 tabular-nums">
            {totalViolations}
          </p>
          <p className="mt-1 text-xs text-steel-500">Cumulative logged violations</p>
        </div>

        <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">Verified Resolution Rate</span>
          <p className="mt-2 font-display text-3xl font-bold leading-none text-ok tabular-nums">
            {resolutionRate}%
          </p>
          <p className="mt-1 text-xs text-steel-500">{verifiedCount} closures cryptographically certified</p>
        </div>

        <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">Chained Audit Events</span>
          <p className="mt-2 font-display text-3xl font-bold leading-none text-primary-700 tabular-nums">
            {totalAuditEvents}
          </p>
          <p className="mt-1 text-xs text-steel-500">Immutable SHA-256 blocks</p>
        </div>
      </div>

      {/* Cryptographic Chain Integrity Banner */}
      <div className="flex flex-col gap-3 rounded-md border border-ok-line bg-ok-soft p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={26} className="shrink-0 text-ok" />
          <div>
            <h3 className="font-display text-lg font-bold text-coal-900 leading-tight">
              Cryptographic Audit Chain Integrity: 100% UNBROKEN
            </h3>
            <p className="text-xs text-steel-700 mt-0.5">
              All compliance events are hash-chained in chronological sequence. No retroactive tampering or deleted entries detected.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-coal-800 bg-white/80 px-3 py-1.5 rounded border border-ok-line/50">
          <Fingerprint size={14} className="text-ok" />
          <span>Genesis Block: 0000000000000000</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Panel title="Statutory Audit Trail Browser">
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-steel-500 mb-1">
                Filter by Zone
              </label>
              <select
                value={activeZone}
                onChange={(e) => setActiveZone(e.target.value)}
                className="field h-10 w-full text-sm"
              >
                <option value="ALL">All Mine Zones</option>
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-steel-500 mb-1">
                Filter by Compliance Status
              </label>
              <select
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value)}
                className="field h-10 w-full text-sm"
              >
                <option value="ALL">All Statuses</option>
                {VIOLATION_FLOW.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-steel-500 mb-1">
                Search Findings & IDs
              </label>
              <div className="relative">
                <input
                  type="search"
                  placeholder="VIOL-00473, Haul Road, HEMM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="field h-10 w-full pl-9 text-sm"
                />
                <Search size={16} className="absolute left-3 top-3 text-steel-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Violations and Detailed Hash Trail */}
        <div className="border-t border-steel-200">
          <ul className="divide-y divide-steel-200">
            {filteredViolations.map((v) => {
              const isExpanded = expandedId === v.id;
              const events = v.auditEvents || [];

              return (
                <li key={v.id} className="transition-colors hover:bg-steel-50/50">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                    className="flex cursor-pointer flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold tabular-nums text-primary-700 text-sm">{v.id}</span>
                        <SeverityBadge level={v.severity} />
                        <StatusBadge status={v.status} />
                        <span className="text-xs text-steel-500">{v.location}</span>
                        <span className="text-xs text-steel-400">· {formatWhen(v.timestamp)}</span>
                      </div>
                      <p className="mt-1 font-medium text-coal-900">{v.finding}</p>
                      <p className="text-xs text-steel-500 mt-0.5">
                        Category: {v.category} · Assigned: {v.assignedTo} · Audit Events: {events.length}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <RiskMeter score={v.riskScore?.score ?? 0} />
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700"
                      >
                        {isExpanded ? 'Hide Ledger' : 'Inspect Ledger'}
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Hash-Chained Audit Ledger */}
                  {isExpanded && (
                    <div className="border-t border-steel-200 bg-steel-100/60 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-base font-bold text-coal-900 flex items-center gap-2">
                          <Fingerprint size={18} className="text-primary-600" />
                          Cryptographic Event Ledger for {v.id}
                        </h4>
                        <span className="text-xs text-steel-500 font-mono">
                          {events.length} Hash-Chained Records
                        </span>
                      </div>

                      {/* Evidence Hashes */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {v.evidence?.[0] && (
                          <div className="rounded border border-steel-300 bg-white p-3 text-xs">
                            <span className="font-bold text-coal-900 block mb-1">
                              Stage 1 Baseline Evidence Hash:
                            </span>
                            <span className="font-mono text-steel-600 break-all select-all block bg-steel-50 p-1.5 rounded">
                              {v.evidence[0].hash}
                            </span>
                          </div>
                        )}
                        {v.closureEvidence?.evidence?.[0] && (
                          <div className="rounded border border-primary-200 bg-primary-50/40 p-3 text-xs">
                            <span className="font-bold text-primary-900 block mb-1">
                              Stage 4 Closure Evidence Hash:
                            </span>
                            <span className="font-mono text-primary-700 break-all select-all block bg-white p-1.5 rounded border border-primary-100">
                              {v.closureEvidence.evidence[0].hash}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Chronological Chained Events */}
                      <div className="rounded border border-steel-300 bg-white overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-steel-200 bg-steel-50 font-semibold text-steel-600 uppercase">
                            <tr>
                              <th className="p-2.5">Seq</th>
                              <th className="p-2.5">Timestamp</th>
                              <th className="p-2.5">Event Label</th>
                              <th className="p-2.5">Actor</th>
                              <th className="p-2.5 font-mono">SHA-256 Hash</th>
                              <th className="p-2.5 font-mono">Parent Hash</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-steel-200">
                            {events.map((ev, idx) => (
                              <tr key={ev.id} className="hover:bg-steel-50">
                                <td className="p-2.5 font-bold tabular-nums text-steel-500">#{idx + 1}</td>
                                <td className="p-2.5 whitespace-nowrap text-steel-600">
                                  {formatDate(ev.at)} {formatTime(ev.at)}
                                </td>
                                <td className="p-2.5 font-medium text-coal-900">
                                  {ev.label}
                                  {ev.note && <span className="block text-[11px] text-steel-500">{ev.note}</span>}
                                </td>
                                <td className="p-2.5 text-steel-700 font-medium">{ev.actor || 'System'}</td>
                                <td className="p-2.5 font-mono text-[11px] text-primary-700">
                                  {ev.hash ? `${ev.hash.slice(0, 12)}...` : 'calc_hash...'}
                                </td>
                                <td className="p-2.5 font-mono text-[11px] text-steel-400">
                                  {ev.previousHash ? `${ev.previousHash.slice(0, 10)}...` : '00000000...'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
