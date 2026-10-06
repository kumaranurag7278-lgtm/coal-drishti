import { ArrowLeft, Check, CloudUpload, Minus, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/Badge.jsx';
import AuditTimeline from '../../components/inspector/AuditTimeline.jsx';
import GPSStatus from '../../components/inspector/GPSStatus.jsx';
import RiskScoreCard from '../../components/inspector/RiskScoreCard.jsx';
import ViolationCard from '../../components/inspector/ViolationCard.jsx';
import Panel from '../../components/Panel.jsx';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { CATEGORIES } from '../../data/checklists.js';
import { INSPECTOR } from '../../data/inspectorMock.js';
import { inspectionSummary } from '../../data/summary.js';
import { formatDate, formatDuration, formatTime, minutesBetween, plural, shortHash } from '../../lib/format.js';
import NotFoundPanel from './NotFoundPanel.jsx';

const RESULT = {
  pass: { label: 'PASS', icon: Check, cls: 'border-ok-line bg-ok-soft text-ok' },
  fail: { label: 'FAIL', icon: X, cls: 'border-danger-line bg-danger-soft text-danger' },
  na: { label: 'N/A', icon: Minus, cls: 'border-steel-300 bg-steel-100 text-steel-700' },
};

function Fact({ label, children }) {
  return (
    <div className="bg-white p-3.5">
      <dt className="text-sm text-steel-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-coal-900">{children}</dd>
    </div>
  );
}

export default function InspectionDetail() {
  const { id } = useParams();
  const store = useInspectorStore();
  const { online } = useNetwork();
  const navigate = useNavigate();
  const inspection = store.getInspection(id);

  if (!inspection) return <NotFoundPanel what="Inspection" backTo="/inspector/my-inspections" backLabel="Back to My inspections" />;

  const s = inspectionSummary(inspection, store.violations);
  const queued = inspection.syncStatus === 'pending';
  const top = [...s.violations].sort((a, b) => b.riskScore.score - a.riskScore.score)[0];
  const evidence = s.violations.flatMap((v) => v.evidence.map((e) => ({ ...e, violationId: v.id })));
  const groups = CATEGORIES.map((c) => ({
    category: c,
    rows: c.items.filter((i) => inspection.checklistResults[i.id]).map((i) => ({ item: i, value: inspection.checklistResults[i.id] })),
  })).filter((g) => g.rows.length);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <button type="button" onClick={() => navigate('/inspector/my-inspections')} className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline">
          <ArrowLeft size={16} />
          My inspections
        </button>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-4xl font-semibold leading-none tabular-nums text-coal-900">{inspection.id}</h1>
          <div className="flex gap-1.5">
            <StatusBadge status={inspection.status} />
            {queued && <StatusBadge status="Sync pending" />}
          </div>
        </div>
      </div>

      {queued && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-warn-line bg-warn-soft p-4">
          <p className="text-sm text-coal-800">
            <strong className="text-warn">Saved on this device.</strong> Waiting to synchronize when connectivity is restored.
          </p>
          <button type="button" disabled={!online || store.syncing} onClick={store.syncAll} className="btn-primary h-11 px-4 text-sm">
            <CloudUpload size={16} />
            {online ? 'Sync now' : 'Offline'}
          </button>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-steel-200 bg-steel-200 lg:grid-cols-3">
        <Fact label="Inspector">
          {INSPECTOR.name}, <span className="tabular-nums">{inspection.inspectorId}</span>
        </Fact>
        <Fact label="Mine">{inspection.mineId}</Fact>
        <Fact label="Zone">{inspection.zone}</Fact>
        <Fact label="Inspection type">{inspection.type}</Fact>
        <Fact label="Start">
          {formatDate(inspection.startTime)}, {formatTime(inspection.startTime)}
        </Fact>
        <Fact label="End">
          {formatTime(inspection.endTime)} ({formatDuration(minutesBetween(inspection.startTime, inspection.endTime))})
        </Fact>
        <Fact label="Checklist">
          <span className="tabular-nums">
            {s.tally.pass} PASS, {s.tally.fail} FAIL, {s.tally.na} N/A
          </span>
        </Fact>
        <Fact label="Violations">
          <span className="tabular-nums">{s.violationCount}</span>
          {s.highestRisk != null && <span className="text-steel-500">, highest risk {s.highestRisk} / 100</span>}
        </Fact>
        <Fact label="Submission status">{queued ? 'Saved locally, sync pending' : 'Submitted (prototype, stored on this device)'}</Fact>
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Location metadata">
          <h2 className="mb-2 font-display text-xl font-semibold leading-none text-coal-900">GPS metadata</h2>
          <GPSStatus gps={inspection.gps} />
        </section>
        {top && (
          <section aria-label="Highest AI risk score">
            <h2 className="mb-2 font-display text-xl font-semibold leading-none text-coal-900">
              Highest risk: <span className="tabular-nums">{top.id}</span>
            </h2>
            <RiskScoreCard score={top.riskScore} compact />
          </section>
        )}
      </div>

      <Panel title={`Violations (${s.violationCount})`}>
        {s.violations.length === 0 ? (
          <p className="px-4 py-6 text-steel-600">No violations were recorded in this inspection.</p>
        ) : (
          <ul className="divide-y divide-steel-200">
            {s.violations.map((v) => (
              <ViolationCard key={v.id} violation={v} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`Checklist results (${s.tally.answered} items)`}>
        <div className="divide-y divide-steel-200">
          {groups.map(({ category, rows }) => (
            <div key={category.id} className="px-4 py-3">
              <h3 className="text-sm font-semibold text-coal-900">{category.name}</h3>
              <ul className="mt-2 space-y-1.5">
                {rows.map(({ item, value }) => {
                  const r = RESULT[value];
                  const Icon = r.icon;
                  return (
                    <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-coal-800">{item.text}</span>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-semibold ${r.cls}`}>
                        <Icon size={12} strokeWidth={3} />
                        {r.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-t border-steel-200 px-4 py-3 text-xs text-steel-500">
          Prototype checklist examples. Not a complete legal compliance checklist.
        </p>
      </Panel>

      <Panel title={`Evidence (${plural(evidence.length, 'file')})`}>
        {evidence.length === 0 ? (
          <p className="px-4 py-6 text-steel-600">No evidence files in this inspection.</p>
        ) : (
          <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {evidence.map((e) => (
              <li key={e.id} className="overflow-hidden rounded-md border border-steel-200">
                {e.preview ? (
                  <img src={e.preview} alt={`Evidence ${e.id}`} className="h-36 w-full object-cover" />
                ) : (
                  <div className="grid h-36 place-items-center bg-steel-100 text-sm text-steel-500">Preview not stored</div>
                )}
                <div className="p-3 text-sm">
                  <p className="font-semibold tabular-nums text-coal-900">{e.id}</p>
                  <p className="text-steel-600">
                    <Link to={`/inspector/my-violations/${e.violationId}`} className="text-primary-700 hover:underline">
                      {e.violationId}
                    </Link>
                    , {formatTime(e.timestamp)}
                  </p>
                  <p className="text-steel-600">
                    Location {e.latitude != null ? 'captured' : 'not captured'}, SHA-256 <span className="tabular-nums">{shortHash(e.hash)}</span>
                  </p>
                  <p className="mt-1 text-xs text-steel-500">Evidence hash generated for audit traceability.</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Audit timeline">
        <div className="p-4">
          <AuditTimeline events={inspection.auditEvents} upcoming={s.violationCount ? ['Corrective action assigned by Mine Manager (next)'] : []} />
        </div>
      </Panel>
    </div>
  );
}
