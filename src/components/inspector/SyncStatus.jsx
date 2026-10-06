import { CloudUpload, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useRef, useState } from 'react';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import useDismiss from '../../hooks/useDismiss.js';
import { plural } from '../../lib/format.js';

// Top-bar connectivity chip. Sync is simulated: nothing leaves this device.
export default function SyncStatus() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(open, setOpen, ref);
  const { online, demoOffline, setDemoOffline } = useNetwork();
  const { pendingSyncCount: pending, syncing, syncAll } = useInspectorStore();

  const tone = online ? 'bg-emerald-400/15 text-emerald-300' : 'bg-warn-on/15 text-warn-on';
  const label = syncing ? 'Syncing' : online ? 'Online' : 'Offline mode';

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
        {syncing ? <Loader2 size={17} className="animate-spin" /> : online ? <Wifi size={17} /> : <WifiOff size={17} />}
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
          <h2 className="font-display text-xl font-semibold leading-none text-coal-900">{online ? 'Online' : 'Offline mode'}</h2>
          <p className="mt-2 text-sm text-steel-600">
            {online
              ? pending > 0
                ? `${plural(pending, 'inspection')} saved on this device ${pending === 1 ? 'is' : 'are'} pending synchronization.`
                : 'Everything on this device is synchronized.'
              : 'Inspection data will be securely queued and synchronized when connectivity is restored.'}
          </p>
          {online && pending > 0 && (
            <button type="button" onClick={syncAll} disabled={syncing} className="btn-primary mt-4 h-11 w-full">
              <CloudUpload size={17} />
              {syncing ? 'Syncing' : 'Sync now'}
            </button>
          )}

          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 border-t border-steel-200 pt-3 text-sm">
            <span>
              <span className="block font-medium text-coal-900">Simulate offline</span>
              <span className="block text-xs text-steel-500">Demo switch. Real offline detection also works.</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={demoOffline}
              onChange={(e) => setDemoOffline(e.target.checked)}
              className="h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-steel-300 transition-colors checked:bg-warn-bar relative after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform checked:after:translate-x-5"
            />
          </label>
          <p className="mt-3 text-xs text-steel-500">Prototype: synchronization is simulated on this device only.</p>
        </div>
      )}
    </div>
  );
}
