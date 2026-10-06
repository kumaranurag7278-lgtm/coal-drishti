import { Check } from 'lucide-react';
import { ZONES } from '../../../data/zones.js';
import GPSStatus from '../GPSStatus.jsx';

const RISK_STYLE = {
  HIGH: 'border-hi-line bg-hi-soft text-hi',
  MEDIUM: 'border-warn-line bg-warn-soft text-warn',
  LOW: 'border-primary-100 bg-primary-50 text-primary-700',
};

// Step 2: choose the work zone and capture (simulated) location.
export default function ZoneSelector({ draft, dispatch }) {
  return (
    <section className="space-y-5" aria-labelledby="step2-title">
      <div>
        <h2 id="step2-title" className="font-display text-2xl font-semibold leading-none text-coal-900">
          Select work zone
        </h2>
        <p className="mt-2 text-sm text-steel-600">Mine: {draft.mineId}. Pick the area you are inspecting now.</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2" role="group" aria-labelledby="step2-title">
        {ZONES.map((z) => {
          const selected = draft.zoneId === z.id;
          const Icon = z.icon;
          return (
            <button
              key={z.id}
              type="button"
              aria-pressed={selected}
              onClick={() => dispatch({ type: 'zone', zoneId: z.id })}
              className={`flex min-h-[76px] items-center gap-3.5 rounded-md border p-3.5 text-left transition-colors ${
                selected ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-steel-200 bg-white hover:border-steel-400'
              }`}
            >
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded ${selected ? 'bg-primary-600 text-white' : 'bg-steel-100 text-steel-700'}`}>
                <Icon size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-coal-900">{z.name}</span>
                <span className="block text-sm text-steel-600">{z.description}</span>
                <span className={`mt-1.5 inline-block rounded-sm border px-1.5 py-0.5 text-xs font-semibold ${RISK_STYLE[z.risk]}`}>
                  {z.risk} RISK
                </span>
              </span>
              {selected && (
                <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-600 text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-coal-900">Location status</h3>
        {draft.zoneId ? (
          <GPSStatus gps={draft.gps} />
        ) : (
          <p className="rounded-md border border-dashed border-steel-300 bg-steel-50 px-4 py-3 text-sm text-steel-600">
            Select a work zone to capture the location.
          </p>
        )}
        <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-steel-600">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary-600"
            checked={!draft.gpsAvailable}
            onChange={(e) => dispatch({ type: 'gpsAvailable', value: !e.target.checked })}
          />
          Demo: simulate GPS unavailable
        </label>
      </div>
    </section>
  );
}
