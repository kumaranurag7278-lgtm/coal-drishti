import { ArrowLeft, CheckCircle2, Download, Printer, Scale, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { CATEGORIES } from '../../data/checklists.js';
import { AUDITORS, MANAGERS } from '../../data/personnel.js';
import { formatDate, formatTime } from '../../lib/format.js';

export default function DgmsComplianceReport() {
  const navigate = useNavigate();
  const { violations, inspections } = useComplianceStore();
  const { user } = useSession();
  const auditor = AUDITORS[0];
  const manager = MANAGERS[0];

  const now = new Date();
  const reportDate = formatDate(now);
  const reportTime = formatTime(now);

  const total = violations.length;
  const verified = violations.filter((v) => v.status === 'Verified');
  const open = violations.filter((v) => v.status !== 'Verified');
  const critical = violations.filter((v) => v.severity === 'CRITICAL');
  const high = violations.filter((v) => v.severity === 'HIGH');
  const complianceRate = total > 0 ? Math.round((verified.length / total) * 100) : 100;

  // Category statistics
  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const catViolations = violations.filter((v) => v.categoryId === cat.id);
      const catVerified = catViolations.filter((v) => v.status === 'Verified');
      const catOpen = catViolations.filter((v) => v.status !== 'Verified');
      return {
        ...cat,
        total: catViolations.length,
        verified: catVerified.length,
        open: catOpen.length,
      };
    });
  }, [violations]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action header - hidden when printing */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate('/dgms')}
          className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to DGMS Audit Ledger
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-primary inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold shadow-sm"
          >
            <Printer size={16} />
            Print / Save Statutory Dossier (PDF)
          </button>
        </div>
      </div>

      {/* Printable Formal DGMS Report Container */}
      <div className="rounded-lg border border-steel-300 bg-white p-6 shadow-sm print:border-none print:p-0 print:shadow-none sm:p-10">
        {/* Official Letterhead */}
        <div className="border-b-2 border-coal-900 pb-6 text-center">
          <div className="flex justify-center items-center gap-2 text-coal-800">
            <Scale size={28} className="text-coal-900" />
            <span className="font-display text-2xl font-bold uppercase tracking-wider">
              Directorate General of Mines Safety (DGMS)
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-steel-600 mt-1">
            Ministry of Labour & Employment · Government of India
          </p>
          <h2 className="mt-4 font-display text-xl font-bold uppercase text-coal-900">
            Statutory Safety Governance & Compliance Audit Dossier
          </h2>
          <p className="text-xs text-steel-600 mt-0.5">
            Compiled under the Provisions of Coal Mines Regulations (CMR), 2017 & Mines Act, 1952
          </p>
        </div>

        {/* Report Metadata Block */}
        <div className="grid grid-cols-2 gap-4 border-b border-steel-200 py-4 text-xs sm:grid-cols-4">
          <div>
            <span className="font-semibold text-steel-500 block uppercase">Mine Lease Area</span>
            <span className="font-medium text-coal-900 text-sm">{user?.org || 'Mine A (Eastern Sector)'}</span>
          </div>
          <div>
            <span className="font-semibold text-steel-500 block uppercase">Report Dossier ID</span>
            <span className="font-mono font-medium text-coal-900 text-sm">DGMS-CMR-2026-084</span>
          </div>
          <div>
            <span className="font-semibold text-steel-500 block uppercase">Audit Generated</span>
            <span className="font-medium text-coal-900 text-sm">{reportDate}, {reportTime}</span>
          </div>
          <div>
            <span className="font-semibold text-steel-500 block uppercase">Lead DGMS Auditor</span>
            <span className="font-medium text-coal-900 text-sm">{auditor.name} ({auditor.initials})</span>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="my-6">
          <h3 className="font-display text-base font-bold uppercase text-coal-900 mb-3 border-l-4 border-coal-900 pl-2">
            1. Executive Compliance Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded border border-steel-200 bg-steel-50 p-3">
              <span className="text-[11px] text-steel-600 block uppercase">Inspections Filed</span>
              <span className="font-display text-2xl font-bold text-coal-900">{inspections.length}</span>
            </div>
            <div className="rounded border border-steel-200 bg-steel-50 p-3">
              <span className="text-[11px] text-steel-600 block uppercase">Total Violations</span>
              <span className="font-display text-2xl font-bold text-coal-900">{total}</span>
            </div>
            <div className="rounded border border-ok-line bg-ok-soft p-3">
              <span className="text-[11px] text-ok block uppercase font-semibold">Verified Closed</span>
              <span className="font-display text-2xl font-bold text-ok">{verified.length}</span>
            </div>
            <div className="rounded border border-steel-200 bg-steel-50 p-3">
              <span className="text-[11px] text-steel-600 block uppercase">Compliance Index</span>
              <span className="font-display text-2xl font-bold text-primary-700">{complianceRate}%</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-steel-600">
            Current outstanding risk: <strong className="text-danger">{critical.length} Critical</strong>, <strong className="text-hi">{high.length} High Severity</strong> findings active on mine leasehold.
          </p>
        </div>

        {/* Regulatory Hazard Category Breakdown Table */}
        <div className="my-6">
          <h3 className="font-display text-base font-bold uppercase text-coal-900 mb-3 border-l-4 border-coal-900 pl-2">
            2. Statutory Category Performance (CMR 2017 Classification)
          </h3>
          <table className="w-full text-left text-xs border border-steel-200">
            <thead className="bg-steel-100 border-b border-steel-200 font-semibold text-coal-800 uppercase">
              <tr>
                <th className="p-2.5">Statutory Category</th>
                <th className="p-2.5">Total Findings</th>
                <th className="p-2.5">Verified Resolved</th>
                <th className="p-2.5">Open / Pending</th>
                <th className="p-2.5">Resolution %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-200">
              {categoryStats.map((c) => {
                const pct = c.total > 0 ? Math.round((c.verified / c.total) * 100) : 100;
                return (
                  <tr key={c.id}>
                    <td className="p-2.5 font-medium text-coal-900">{c.name}</td>
                    <td className="p-2.5 tabular-nums">{c.total}</td>
                    <td className="p-2.5 tabular-nums text-ok font-semibold">{c.verified}</td>
                    <td className="p-2.5 tabular-nums text-danger">{c.open}</td>
                    <td className="p-2.5 tabular-nums font-semibold">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Comprehensive Audit Item Ledger */}
        <div className="my-6">
          <h3 className="font-display text-base font-bold uppercase text-coal-900 mb-3 border-l-4 border-coal-900 pl-2">
            3. Chronological Violation & Cryptographic Verification Ledger
          </h3>
          <table className="w-full text-left text-xs border border-steel-200">
            <thead className="bg-steel-100 border-b border-steel-200 font-semibold text-coal-800 uppercase">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Finding</th>
                <th className="p-2">Zone</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Status</th>
                <th className="p-2">Remediation Owner</th>
                <th className="p-2 font-mono">Closure Hash Checksum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-200">
              {violations.map((v) => (
                <tr key={v.id}>
                  <td className="p-2 font-bold tabular-nums text-coal-900">{v.id}</td>
                  <td className="p-2 font-medium text-coal-900">{v.finding}</td>
                  <td className="p-2 text-steel-600">{v.location}</td>
                  <td className="p-2 font-semibold">{v.severity}</td>
                  <td className="p-2">
                    <span className={v.status === 'Verified' ? 'text-ok font-bold' : 'text-warn font-semibold'}>
                      {v.status}
                    </span>
                  </td>
                  <td className="p-2 text-steel-700">{v.assignedTo}</td>
                  <td className="p-2 font-mono text-[10px] text-steel-500">
                    {v.closureEvidence?.evidence?.[0]?.hash?.slice(0, 14) || 'Pending verification'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Statutory Attestation Sign-off */}
        <div className="mt-12 border-t-2 border-steel-300 pt-8">
          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-14 border-b border-dashed border-steel-400 mx-auto w-3/4" />
              <p className="mt-2 font-bold text-coal-900">{manager.name}</p>
              <p className="text-[11px] text-steel-500">Mine Manager (Mine A)</p>
            </div>
            <div>
              <div className="h-14 border-b border-dashed border-steel-400 mx-auto w-3/4" />
              <p className="mt-2 font-bold text-coal-900">Dr. Ananya Roy</p>
              <p className="text-[11px] text-steel-500">Chief Safety Officer</p>
            </div>
            <div>
              <div className="h-14 border-b border-dashed border-steel-400 mx-auto w-3/4" />
              <p className="mt-2 font-bold text-coal-900">{auditor.name}</p>
              <p className="text-[11px] text-steel-500">DGMS Inspecting Officer & Auditor</p>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] text-steel-400 uppercase tracking-widest">
            COAL DRISHTI AI Governance Platform · Statutory Prototype Audit Format · Generated for Smart India Hackathon 2026
          </p>
        </div>
      </div>
    </div>
  );
}
