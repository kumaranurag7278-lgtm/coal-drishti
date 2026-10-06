import { CheckCircle2, ChevronRight, LogOut, ShieldAlert, Truck, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { formatWhen } from '../../lib/format.js';

export default function ContractorDashboard() {
  const { violations } = useComplianceStore();
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  // Contractor-related violations (HEMM, Haul Road, PPE)
  const contractorTasks = useMemo(() => {
    return violations.filter(
      (v) =>
        v.categoryId === 'hemm' ||
        v.categoryId === 'haul' ||
        v.categoryId === 'ppe' ||
        (v.assignedTo || '').toLowerCase().includes('contractor'),
    );
  }, [violations]);

  const openCount = contractorTasks.filter((v) => v.status !== 'Verified').length;
  const verifiedCount = contractorTasks.filter((v) => v.status === 'Verified').length;

  const logout = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-steel-50">
      <header className="sticky top-0 z-30 border-b border-coal-700 bg-coal-950 text-white">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded bg-primary-600 text-white">
              <Truck size={20} />
            </span>
            <span className="font-display text-xl font-bold uppercase tracking-wider">
              Contractor Safety & Compliance Portal
            </span>
            <span className="hidden rounded-sm bg-white/10 px-2 py-0.5 text-xs text-steel-300 sm:inline">
              Contractor ID: {user?.empId || 'CON-001'}
            </span>
          </div>

          <div className="flex items-center gap-3">
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

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
            Contractor Fleet & Workforce Safety Portal
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Monitor outsourced heavy earth moving machinery (HEMM), haul truck compliance, and operator PPE at {user?.org}.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Contractor Actions Active</span>
            <p className="mt-2 font-display text-3xl font-bold text-danger tabular-nums">{openCount}</p>
            <p className="mt-1 text-xs text-steel-500">Requires remediation on site</p>
          </div>

          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Verified Cleared</span>
            <p className="mt-2 font-display text-3xl font-bold text-ok tabular-nums">{verifiedCount}</p>
            <p className="mt-1 text-xs text-steel-500">Passed verification review</p>
          </div>

          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Fleet Safety Rate</span>
            <p className="mt-2 font-display text-3xl font-bold text-coal-900 tabular-nums">
              {contractorTasks.length > 0 ? Math.round((verifiedCount / contractorTasks.length) * 100) : 100}%
            </p>
            <p className="mt-1 text-xs text-steel-500">Mandated statutory threshold: 90%</p>
          </div>
        </div>

        {/* Assigned Contractor Violations List */}
        <Panel title={`Contractor Workforce & Machinery Safety Actions (${contractorTasks.length})`}>
          <ul className="divide-y divide-steel-200">
            {contractorTasks.map((v) => (
              <li key={v.id} className="p-4 hover:bg-steel-50 transition-colors">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums text-primary-700 text-sm">{v.id}</span>
                      <SeverityBadge level={v.severity} />
                      <StatusBadge status={v.status} />
                      <span className="text-xs text-steel-500">Zone: {v.location}</span>
                    </div>
                    <p className="mt-1 font-medium text-coal-900">{v.finding}</p>
                    <p className="text-xs text-steel-500 mt-0.5">
                      Scope: {v.category} · Assigned: {v.assignedTo} · {formatWhen(v.timestamp)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <RiskMeter score={v.riskScore?.score ?? 0} />
                    <Link
                      to={`/supervisor/actions/${v.id}`}
                      className="btn-secondary h-9 px-3 text-xs font-semibold"
                    >
                      View Action
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </main>
    </div>
  );
}
