import { scoreTone } from '../Badge.jsx';
import { MODEL_LABEL } from '../../lib/risk.js';

const LEVEL_CHIP = {
  CRITICAL: 'bg-danger text-white',
  HIGH: 'bg-hi-soft text-hi border border-hi-line',
  MEDIUM: 'bg-warn-soft text-warn border border-warn-line',
  LOW: 'bg-primary-50 text-primary-700 border border-primary-100',
};

// Mock AI-assisted prioritization. Never presented as a prediction of accidents.
export default function RiskScoreCard({ score, compact = false }) {
  if (!score) {
    return (
      <p className="rounded-md border border-dashed border-steel-300 bg-steel-50 px-4 py-3 text-sm text-steel-600">
        Choose a severity to see the AI risk-priority score.
      </p>
    );
  }

  const factors = (
    <ul className="space-y-2.5">
      {score.factors.map((f) => (
        <li key={f.key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="text-steel-700">{f.label}</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-steel-200" aria-hidden="true">
            <span className="block h-full bg-coal-600" style={{ width: `${(f.points / f.max) * 100}%` }} />
          </span>
          <span className="text-right font-medium tabular-nums text-coal-900">+{f.points}</span>
        </li>
      ))}
      <li className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 border-t border-steel-200 pt-2.5 text-sm font-semibold">
        <span className="text-coal-900">Total</span>
        <span />
        <span className="text-right tabular-nums text-coal-900">{score.score}</span>
      </li>
    </ul>
  );

  const disclaimer = (
    <>
      <p className="text-xs leading-relaxed text-steel-600">
        AI-assisted prioritization based on violation severity, recurrence, previous history and zone risk.
      </p>
      <p className="text-xs leading-relaxed text-steel-600">
        AI assists prioritization. Final operational decisions remain with authorized personnel. Prototype score: it
        does not predict accidents and is not legally binding.
      </p>
    </>
  );

  if (compact) {
    return (
      <div className="rounded-md border border-steel-200 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-coal-900">AI risk-priority score</p>
          <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${LEVEL_CHIP[score.level]}`}>{score.label}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <p className="font-display text-4xl font-semibold leading-none tabular-nums text-coal-900">
            {score.score}
            <span className="ml-1 text-lg text-steel-500">/ 100</span>
          </p>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-steel-200" aria-hidden="true">
            <span className={`block h-full ${scoreTone(score.score)}`} style={{ width: `${score.score}%` }} />
          </span>
        </div>
        <details className="group mt-3">
          <summary className="cursor-pointer text-sm font-medium text-primary-700">See contributing factors</summary>
          <div className="mt-3 space-y-3">
            {factors}
            {disclaimer}
          </div>
        </details>
      </div>
    );
  }

  return (
    <section aria-label="AI risk-priority score" className="rounded-md border border-steel-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-steel-200 px-4 py-3">
        <h3 className="font-display text-xl font-semibold leading-none text-coal-900">AI risk-priority score</h3>
        <span className="rounded-sm border border-steel-300 bg-steel-100 px-2 py-0.5 text-xs font-medium text-steel-700">
          {MODEL_LABEL} (simulated)
        </span>
      </header>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-display text-6xl font-semibold leading-none tabular-nums text-coal-900">
            {score.score}
            <span className="ml-1.5 text-2xl text-steel-500">/ 100</span>
          </p>
          <span className={`rounded-sm px-2.5 py-1 text-sm font-semibold ${LEVEL_CHIP[score.level]}`}>{score.label}</span>
        </div>
        <span className="mt-4 block h-2 overflow-hidden rounded-full bg-steel-200" aria-hidden="true">
          <span className={`block h-full ${scoreTone(score.score)}`} style={{ width: `${score.score}%` }} />
        </span>
        <div className="mt-5">{factors}</div>
        <div className="mt-4 space-y-1.5 border-t border-steel-200 pt-3">{disclaimer}</div>
      </div>
    </section>
  );
}
