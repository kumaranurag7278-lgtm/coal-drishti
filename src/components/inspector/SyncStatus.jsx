import { CloudUpload, FileText, Image as ImageIcon, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useRef, useState } from 'react';
import useDismiss from '../../hooks/useDismiss.js';

// UI simulation only. Nothing is queued or synchronised.
export default function SyncStatus({ sync, onReconnect, onGoOffline }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(open, setOpen, ref);
  const { offline, pending, syncing } = sync;

  const tone = offline ? 'bg-warn-on/15 text-warn-on' : 'bg-emerald-400/15 text-emerald-300';
  const label = syncing ? 'Syncing' : offline ? 'Offline mode' : 'Online';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${label}${pending ? `, sync pending: ${pending}` : ''}`}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center gap-2 rounded px-2.5 text-sm font-medium ${tone}`}
      >
        {syncing ? <Loader2 size={17} className="animate-spin" /> : offline ? <WifiOff size={17} /> : <Wifi size={17} />}
        <span className="hidden sm:inline">{label}</span>
        {pending > 0 && (
          <span className="rounded-sm bg-warn-on px-1.5 py-0.5 text-xs font-semibold leading-none tabular-nums text-coal-950">
            <span className="sm:hidden">{pending}</span>
            <span className="hidden sm:inline">Sync pending: {pending}</span>
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Connectivity status"
          className="absolute right-0 top-12 z-40 w-[min(21rem,calc(100vw-2rem))] rounded-md border border-steel-200 bg-white p-4 text-coal-800 shadow-lg"
        >
          {offline ? (
            <>
              <h2 className="font-display text-xl font-semibold leading-none text-coal-900">Offline mode</h2>
              <p className="mt-2 text-sm text-steel-600">
                Inspection data will be securely queued and synchronized when connectivity is restored.
              </p>
              <p className="mt-4 text-sm font-medium text-coal-900">Sync pending: {pending}</p>
              <ul className="mt-2 space-y-2 text-sm text-steel-700">
                <li className="flex items-center gap-2">
                  <FileText size={16} className="text-steel-500" /> Haul Road inspection report
                </li>
                <li className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-steel-500" /> 1 evidence photo
                </li>
              </ul>
              <button type="button" onClick={onReconnect} disabled={syncing} className="btn-primary mt-4 h-11 w-full">
                <CloudUpload size={17} />
                {syncing ? 'Syncing' : 'Simulate reconnect'}
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold leading-none text-coal-900">Online</h2>
              <p className="mt-2 text-sm text-steel-600">All inspection data is synchronized.</p>
              <button type="button" onClick={onGoOffline} className="btn-secondary mt-4 h-11 w-full">
                <WifiOff size={17} />
                Simulate offline
              </button>
            </>
          )}
          <p className="mt-3 text-xs text-steel-500">Prototype simulation. No real synchronization happens.</p>
        </div>
      )}
    </div>
  );
}
