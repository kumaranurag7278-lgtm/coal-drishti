import { CheckCircle2, HardDrive } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { inspectionSummary } from '../../data/summary.js';
import { plural } from '../../lib/format.js';

const FLOW = [
  { label: 'Detect', state: 'done' },
  { label: 'Prioritize', state: 'done' },
  { label: 'Assign', state: 'next', note: 'Mine Manager' },
  { label: 'Correct', state: 'todo' },
  { label: 'Verify', state: 'todo' },
  { label: 'Audit', state: 'todo' },
];

// Confirmation after submitting. Honest about what "submitted" means in a prototype.
export default function SubmissionSuccess() {
  const { id } = useParams();
  const store = useInspectorStore();
  const inspection = store.getInspection(id);
  if (!inspection) return <Navigate to="/inspector/my-inspections" replace />;

  const s = inspectionSummary(inspection, store.violations);
  const queued = inspection.syncStatus === 'pending';

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <section className={`rounded-md border p-6 text-center ${queued ? 'border-warn-line bg-warn-soft' : 'border-ok-line bg-ok-soft'}`}>
        <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-white ${queued ? 'bg-warn-bar' : 'bg-ok'}`}>
          {queued ? <HardDrive size={30} /> : <CheckCircle2 size={34} />}
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-none text-coal-900">
          {queued ? 'INSPECTION SAVED LOCALLY' : 'INSPECTION SUBMITTED'}
        </h1>
        <p className="mt-3 text-lg font-semibold tabular-nums text-coal-900">{inspection.id}</p>
        <div className="mt-3 flex justify-center gap-2">
          <StatusBadge status="Submitted" />
          {queued && <StatusBadge status="Sync pending" />}
        </div>
        <ul className="mt-5 space-y-1 text-coal-800">
          <li>{s.violationCount === 0 ? 'No violations recorded' : `${plural(s.violationCount, 'violation')} recorded`}</li>
          <li>{plural(s.evidenceCount, 'evidence file')} attached</li>
          {s.violationCount > 0 && <li>AI risk prioritization completed</li>}
        </ul>
        {queued ? (
          <p className="mx-auto mt-5 max-w-md text-sm text-coal-800">
            Your inspection has been securely stored on this device and will be synchronized when connectivity is restored.
          </p>
        ) : (
          <p className="mx-auto mt-5 max-w-md text-sm text-steel-600">
            Prototype build: this record is stored on this device only. No server received it.
          </p>
        )}
      </section>

      {s.violations.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-xl font-semibold leading-none text-coal-900">Violations recorded</h2>
          <ul className="divide-y divide-steel-200 rounded-md border border-steel-200 bg-white">
            {s.violations.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
                <Link to={`/inspector/my-violations/${v.id}`} className="text-sm font-semibold tabular-nums text-primary-700 hover:underline">
                  {v.id}
                </Link>
                <span className="min-w-0 flex-1 basis-40 font-medium text-coal-900">{v.finding}</span>
                <SeverityBadge level={v.severity} />
                <RiskMeter score={v.riskScore.score} />
                <span className="w-full text-sm text-steel-500">
                  Status Open, assigned to {v.assignedTo}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="What happens next">
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {FLOW.map((f) => (
            <li
              key={f.label}
              className={`rounded border px-2 py-2 text-center text-sm ${
                f.state === 'done'
                  ? 'border-ok-line bg-ok-soft font-semibold text-ok'
                  : f.state === 'next'
                    ? 'border-primary-600 bg-primary-50 font-semibold text-primary-700'
                    : 'border-steel-200 bg-white text-steel-500'
              }`}
            >
              {f.label}
              {f.note && <span className="block text-xs font-normal">{f.note}</span>}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-steel-600">
          The inspector covers Detect and Prioritize. The Mine Manager assigns the corrective action next.
        </p>
      </section>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <Link to={`/inspector/my-inspections/${inspection.id}`} className="btn-primary h-14 text-base">
          View inspection
        </Link>
        <Link to="/inspector/my-violations" className="btn-secondary h-14 text-base">
          View my violations
        </Link>
        <Link to="/inspector/start-inspection" className="btn-secondary h-14 text-base">
          Start another inspection
        </Link>
        <Link to="/inspector" className="btn-secondary h-14 text-base">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
