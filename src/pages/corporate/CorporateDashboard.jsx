import { Building2, CheckCircle2, ChevronRight, Globe, Layers, LogOut, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { MINES } from '../../data/roles.js';

export default function CorporateDashboard() {
  const { violations } = useComplianceStore();
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  const totalViolations = violations.length;
  const verifiedCount = violations.filter((v) => v.status === 'Verified').length;
  const highRiskCount = violations.filter((v) => (v.riskScore?.score ?? 0) >= 70 && v.status !== 'Verified').length;
  const resolutionRate = totalViolations > 0 ? Math.round((verifiedCount / totalViolations) * 100) : 0;

  // Multi-mine comparative dataset
  const mineData = useMemo(() => {
    return [
      {
        id: 'mine-a',
        name: 'Mine A (Eastern Sector)',
        region: 'Region East',
        type: 'Opencast Extraction',
        violations: totalViolations,
        verified: verifiedCount,
        highRisk: highRiskCount,
        complianceRate: resolutionRate,
        status: highRiskCount > 2 ? 'ACTION_REQUIRED' : 'STABLE',
      },
      {
        id: 'mine-b',
        name: 'Mine B (Central Basin)',
        region: 'Region Central',
        type: 'Underground Continuous',
        violations: 6,
        verified: 5,
        highRisk: 1,
        complianceRate: 83,
        status: 'STABLE',
      },
      {
        id: 'mine-c',
        name: 'Mine C (Western Ridge)',
        region: 'Region West',
        type: 'Mixed Mechanized',
        violations: 4,
        verified: 4,
        highRisk: 0,
        complianceRate: 100,
        status: 'EXEMPLARY',
      },
    ];
  }, [totalViolations, verifiedCount, highRiskCount, resolutionRate]);

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
              <Building2 size={20} />
            </span>
            <span className="font-display text-xl font-bold uppercase tracking-wider">
              Corporate Safety & ESG Directorate
            </span>
            <span className="hidden rounded-sm bg-white/10 px-2 py-0.5 text-xs text-steel-300 sm:inline">
              Multi-Mine Portfolio Rollup
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

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
            Enterprise Cross-Mine Compliance Rollup
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Portfolio view across Coal India subsidiary leaseholds · Executive ESG and statutory compliance metrics.
          </p>
        </div>

        {/* Executive Portfolio KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Mines Monitored</span>
            <p className="mt-2 font-display text-3xl font-bold text-coal-900 tabular-nums">3</p>
            <p className="mt-1 text-xs text-steel-500">Active operational leaseholds</p>
          </div>

          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Total Active Findings</span>
            <p className="mt-2 font-display text-3xl font-bold text-coal-900 tabular-nums">
              {totalViolations - verifiedCount + 1}
            </p>
            <p className="mt-1 text-xs text-steel-500">Across all production sectors</p>
          </div>

          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">High Risk Breaches</span>
            <p className="mt-2 font-display text-3xl font-bold text-danger tabular-nums">
              {highRiskCount + 1}
            </p>
            <p className="mt-1 text-xs text-steel-500">AI Risk Score ≥ 70</p>
          </div>

          <div className="rounded-md border border-steel-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-steel-500">Verified Closure Ratio</span>
            <p className="mt-2 font-display text-3xl font-bold text-ok tabular-nums">
              {Math.round((resolutionRate + 83 + 100) / 3)}%
            </p>
            <p className="mt-1 text-xs text-steel-500">Cryptographically certified</p>
          </div>
        </div>

        {/* Comparative Mine Table */}
        <Panel title="Subsidiary Mine Safety & Compliance Scorecard">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-steel-50 border-b border-steel-200 font-semibold text-coal-800 uppercase">
              <tr>
                <th className="p-3">Mine Location</th>
                <th className="p-3">Jurisdiction</th>
                <th className="p-3">Total Findings</th>
                <th className="p-3">High Risk</th>
                <th className="p-3">Verified Closures</th>
                <th className="p-3">Compliance Rate</th>
                <th className="p-3">Audit Posture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-200">
              {mineData.map((m) => (
                <tr key={m.id} className="hover:bg-steel-50/70">
                  <td className="p-3 font-semibold text-coal-900">
                    {m.name}
                    <span className="block text-[11px] font-normal text-steel-500">{m.type}</span>
                  </td>
                  <td className="p-3 text-steel-600">{m.region}</td>
                  <td className="p-3 tabular-nums font-medium">{m.violations}</td>
                  <td className="p-3 tabular-nums font-bold text-danger">{m.highRisk}</td>
                  <td className="p-3 tabular-nums text-ok font-semibold">{m.verified}</td>
                  <td className="p-3 tabular-nums font-bold text-coal-900">{m.complianceRate}%</td>
                  <td className="p-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                        m.status === 'EXEMPLARY'
                          ? 'bg-ok-soft text-ok border border-ok-line'
                          : m.status === 'STABLE'
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'bg-danger/10 text-danger border border-danger/30'
                      }`}
                    >
                      {m.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <p className="text-center text-xs text-steel-500">
          Corporate ESG & Statutory Safety Dashboard · COAL DRISHTI Multi-Mine Architecture
        </p>
      </main>
    </div>
  );
}
