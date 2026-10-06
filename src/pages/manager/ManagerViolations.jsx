import { ChevronRight, Filter, Search, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { SEVERITIES, VIOLATION_FLOW } from '../../data/models.js';
import { ZONES } from '../../data/zones.js';
import { formatWhen } from '../../lib/format.js';

export default function ManagerViolations() {
  const { violations } = useComplianceStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeStatus = searchParams.get('status') || 'ALL';
  const activeZone = searchParams.get('zone') || 'ALL';
  const activeSeverity = searchParams.get('severity') || 'ALL';
  const isHighRiskOnly = searchParams.get('risk') === 'high';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredViolations = useMemo(() => {
    return violations
      .filter((v) => {
        if (activeStatus !== 'ALL' && v.status !== activeStatus) return false;
        if (activeZone !== 'ALL' && v.zoneId !== activeZone) return false;
        if (activeSeverity !== 'ALL' && v.severity !== activeSeverity) return false;
        if (isHighRiskOnly && (v.riskScore?.score ?? 0) < 70) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = v.id.toLowerCase().includes(q);
          const matchFinding = v.finding.toLowerCase().includes(q);
          const matchLocation = v.location.toLowerCase().includes(q);
          const matchAssigned = (v.assignedTo || '').toLowerCase().includes(q);
          if (!matchId && !matchFinding && !matchLocation && !matchAssigned) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // High risk unassigned first, then date
        if (a.status === 'Open' && b.status !== 'Open') return -1;
        if (b.status === 'Open' && a.status !== 'Open') return 1;
        return (b.riskScore?.score ?? 0) - (a.riskScore?.score ?? 0);
      });
  }, [violations, activeStatus, activeZone, activeSeverity, isHighRiskOnly, searchQuery]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'ALL' || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
            Violations & Corrective Actions
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Review, assign, and track safety violations across all mine zones.
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <Panel title="Filter & Search">
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-steel-500 mb-1">
                Status
              </label>
              <select
                value={activeStatus}
                onChange={(e) => updateParam('status', e.target.value)}
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
                Work Zone
              </label>
              <select
                value={activeZone}
                onChange={(e) => updateParam('zone', e.target.value)}
                className="field h-10 w-full text-sm"
              >
                <option value="ALL">All Zones</option>
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-steel-500 mb-1">
                Severity
              </label>
              <select
                value={activeSeverity}
                onChange={(e) => updateParam('severity', e.target.value)}
                className="field h-10 w-full text-sm"
              >
                <option value="ALL">All Severities</option>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-steel-500 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="search"
                  placeholder="ID, finding, assignee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="field h-10 w-full pl-9 text-sm"
                />
                <Search size={16} className="absolute left-3 top-3 text-steel-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-steel-200 pt-3">
            <span className="text-xs font-semibold text-steel-500">Quick shortcuts:</span>
            <button
              type="button"
              onClick={() => updateParam('status', 'Open')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeStatus === 'Open' ? 'bg-danger text-white' : 'bg-steel-100 text-steel-700 hover:bg-steel-200'
              }`}
            >
              Unassigned Only
            </button>
            <button
              type="button"
              onClick={() => updateParam('risk', isHighRiskOnly ? null : 'high')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                isHighRiskOnly ? 'bg-hi text-white' : 'bg-steel-100 text-steel-700 hover:bg-steel-200'
              }`}
            >
              High Risk Only (≥70)
            </button>
            <button
              type="button"
              onClick={() => updateParam('status', 'Awaiting verification')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeStatus === 'Awaiting verification'
                  ? 'bg-warn text-white'
                  : 'bg-steel-100 text-steel-700 hover:bg-steel-200'
              }`}
            >
              Awaiting Verification
            </button>
            {(activeStatus !== 'ALL' || activeZone !== 'ALL' || activeSeverity !== 'ALL' || isHighRiskOnly || searchQuery) && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="ml-auto text-xs font-semibold text-primary-700 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </Panel>

      {/* Violations List */}
      <Panel
        title={`Results (${filteredViolations.length} violations)`}
        action={
          <span className="text-xs text-steel-500">
            Click any row to inspect details or assign supervisor
          </span>
        }
      >
        {filteredViolations.length === 0 ? (
          <div className="p-10 text-center">
            <Filter size={36} className="mx-auto text-steel-400" />
            <h3 className="mt-2 font-display text-xl font-semibold text-coal-900">No matching violations found</h3>
            <p className="mt-1 text-sm text-steel-500">
              Try adjusting your filter options or search query.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-steel-200">
            {filteredViolations.map((v) => (
              <li key={v.id}>
                <Link
                  to={`/manager/violations/${v.id}`}
                  className="block p-4 transition-colors hover:bg-steel-50 md:grid md:grid-cols-[6rem_minmax(0,1fr)_5.5rem_6rem_8.5rem_7rem_1.5rem] md:items-center md:gap-x-3"
                >
                  <span className="block text-sm font-bold tabular-nums text-primary-700">{v.id}</span>
                  <div className="min-w-0">
                    <span className="block font-medium text-coal-900 truncate">{v.finding}</span>
                    <span className="block text-xs text-steel-500">
                      {v.location} · {formatWhen(v.timestamp)}
                    </span>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <SeverityBadge level={v.severity} />
                  </div>
                  <div className="mt-2 md:mt-0">
                    <RiskMeter score={v.riskScore?.score ?? 0} />
                  </div>
                  <div className="mt-2 md:mt-0">
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="mt-2 text-xs md:mt-0">
                    {v.status === 'Open' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-danger">
                        <UserCheck size={13} /> Unassigned
                      </span>
                    ) : (
                      <span className="text-steel-600 truncate block">
                        Assigned: {v.assignedTo}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={18} className="hidden text-steel-400 md:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
