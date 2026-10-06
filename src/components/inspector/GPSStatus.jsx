import { formatCoord } from '../../lib/format.js';

// GPS is simulated in this prototype. Wording avoids claiming that a location
// proves anything about the evidence.
export default function GPSStatus({ gps, compact = false }) {
  const ok = Boolean(gps?.available);
  return (
    <div className={`rounded-md border ${ok ? 'border-steel-200 bg-white' : 'border-warn-line bg-warn-soft'} ${compact ? 'p-3' : 'p-4'}`}>
      <p className="flex items-center gap-2 text-sm font-semibold text-coal-900">
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${ok ? 'bg-ok' : 'border-2 border-warn bg-transparent'}`}
        />
        GPS: {ok ? 'Location available' : 'Location unavailable'}
      </p>
      {ok ? (
        <>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
            <dt className="text-steel-500">Latitude</dt>
            <dd className="font-medium tabular-nums text-coal-900">{formatCoord(gps.latitude)}</dd>
            <dt className="text-steel-500">Longitude</dt>
            <dd className="font-medium tabular-nums text-coal-900">{formatCoord(gps.longitude)}</dd>
          </dl>
          <p className="mt-2 text-xs text-steel-500">
            GPS location captured. Location validation available. Coordinates are simulated in this prototype.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-warn">
          Location not captured. You can continue; records will show that location was unavailable.
        </p>
      )}
    </div>
  );
}
