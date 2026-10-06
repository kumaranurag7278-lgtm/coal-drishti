// Colour carries meaning: green verified/safe/positive, amber pending or warning,
// orange high, red critical/fail, blue information. Text always says the same thing.

const SEVERITY = {
  LOW: 'border-primary-100 bg-primary-50 text-primary-700',
  MEDIUM: 'border-warn-line bg-warn-soft text-warn',
  HIGH: 'border-hi-line bg-hi-soft text-hi',
  CRITICAL: 'border-danger bg-danger text-white',
};

const STATUS = {
  Open: 'border-warn-line bg-warn-soft text-warn',
  Assigned: 'border-primary-100 bg-primary-50 text-primary-700',
  'In progress': 'border-primary-100 bg-primary-50 text-primary-700',
  'Awaiting verification': 'border-warn-line bg-warn-soft text-warn',
  Verified: 'border-ok-line bg-ok-soft text-ok',
  Submitted: 'border-ok-line bg-ok-soft text-ok',
  Draft: 'border-steel-300 bg-steel-100 text-steel-700',
  'Sync pending': 'border-warn-line bg-warn-soft text-warn',
  'Not started': 'border-steel-200 bg-steel-100 text-steel-600',
};

const base = 'inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 text-xs font-semibold';

export function SeverityBadge({ level }) {
  const key = String(level).toUpperCase();
  return <span className={`${base} ${SEVERITY[key] ?? SEVERITY.LOW}`}>{key}</span>;
}

export function StatusBadge({ status }) {
  return <span className={`${base} ${STATUS[status] ?? STATUS['Not started']}`}>{status}</span>;
}

export const scoreTone = (score) =>
  score >= 90 ? 'bg-danger' : score >= 70 ? 'bg-hi-bar' : score >= 40 ? 'bg-warn-bar' : 'bg-primary-500';

export function RiskMeter({ score }) {
  return (
    <div className="flex items-center gap-2" title={`Risk score ${score} of 100`}>
      <span className="w-7 text-right font-display text-lg font-semibold leading-none tabular-nums text-coal-900">{score}</span>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-steel-200" aria-hidden="true">
        <span className={`block h-full ${scoreTone(score)}`} style={{ width: `${score}%` }} />
      </span>
    </div>
  );
}
