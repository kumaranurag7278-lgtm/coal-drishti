// Colour carries meaning: green verified/safe, amber pending, red critical, blue information.

const SEVERITY = {
  Low: 'border-primary-100 bg-primary-50 text-primary-700',
  Medium: 'border-warn-line bg-warn-soft text-warn',
  High: 'border-danger-line bg-danger-soft text-danger',
  Critical: 'border-danger bg-danger text-white',
};

const STATUS = {
  Open: 'border-warn-line bg-warn-soft text-warn',
  Assigned: 'border-primary-100 bg-primary-50 text-primary-700',
  'In progress': 'border-primary-100 bg-primary-50 text-primary-700',
  'Awaiting verification': 'border-warn-line bg-warn-soft text-warn',
  Verified: 'border-ok-line bg-ok-soft text-ok',
  Submitted: 'border-ok-line bg-ok-soft text-ok',
  'Pending submission': 'border-warn-line bg-warn-soft text-warn',
  'Not started': 'border-steel-200 bg-steel-100 text-steel-600',
};

const base = 'inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 text-xs font-semibold';

export function SeverityBadge({ level }) {
  return <span className={`${base} ${SEVERITY[level] ?? SEVERITY.Low}`}>{level}</span>;
}

export function StatusBadge({ status }) {
  return <span className={`${base} ${STATUS[status] ?? STATUS['Not started']}`}>{status}</span>;
}

export function RiskMeter({ score }) {
  const tone = score >= 70 ? 'bg-danger' : score >= 40 ? 'bg-warn-bar' : 'bg-primary-500';
  return (
    <div className="flex items-center gap-2" title={`Risk score ${score} of 100`}>
      <span className="w-7 text-right font-display text-lg font-semibold leading-none tabular-nums text-coal-900">{score}</span>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-steel-200" aria-hidden="true">
        <span className={`block h-full ${tone}`} style={{ width: `${score}%` }} />
      </span>
    </div>
  );
}
