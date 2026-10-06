import { INSPECTION_TYPES } from '../../../data/checklists.js';
import { INSPECTOR } from '../../../data/inspectorMock.js';
import { MINES } from '../../../data/roles.js';
import { formatDate, formatTime } from '../../../lib/format.js';

function Row({ label, children }) {
  return (
    <div>
      <dt className="text-sm text-steel-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-coal-900">{children}</dd>
    </div>
  );
}

// Step 1: who, where, when, and what kind of inspection.
export default function StepDetails({ draft, dispatch }) {
  return (
    <section className="space-y-5" aria-labelledby="step1-title">
      <div className="rounded-md border border-steel-200 bg-white">
        <header className="flex items-center justify-between gap-3 border-b border-steel-200 px-4 py-3">
          <h2 id="step1-title" className="font-display text-2xl font-semibold leading-none text-coal-900">
            New inspection
          </h2>
          <span className="rounded bg-steel-100 px-2 py-1 text-sm font-semibold tabular-nums text-coal-900">{draft.id}</span>
        </header>
        <dl className="grid gap-x-6 gap-y-4 p-4 sm:grid-cols-2">
          <Row label="Inspector">{INSPECTOR.name}</Row>
          <Row label="Inspector ID">
            <span className="tabular-nums">{INSPECTOR.id}</span>
          </Row>
          <div>
            <label htmlFor="mine" className="text-sm text-steel-500">
              Mine
            </label>
            <select
              id="mine"
              className="field mt-1"
              value={draft.mineId}
              onChange={(e) => dispatch({ type: 'field', key: 'mineId', value: e.target.value })}
            >
              {MINES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <Row label="Date">{formatDate(draft.startTime)}</Row>
          <Row label="Start time">{formatTime(draft.startTime)}</Row>
        </dl>
      </div>

      <fieldset>
        <legend className="mb-2 text-base font-semibold text-coal-900">Inspection type</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {INSPECTION_TYPES.map((t) => {
            const selected = draft.type === t.id;
            return (
              <label
                key={t.id}
                className={`flex min-h-[64px] cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors ${
                  selected ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-steel-200 bg-white hover:border-steel-400'
                }`}
              >
                <input
                  type="radio"
                  name="inspection-type"
                  className="mt-1 h-4 w-4 accent-primary-600"
                  checked={selected}
                  onChange={() => dispatch({ type: 'field', key: 'type', value: t.id })}
                />
                <span>
                  <span className="block font-medium text-coal-900">{t.id}</span>
                  <span className="block text-sm text-steel-600">{t.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
