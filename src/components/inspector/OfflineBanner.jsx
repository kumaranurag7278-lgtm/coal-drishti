import { CheckCircle2, CloudUpload, Loader2, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { plural } from '../../lib/format.js';

// Persistent, quiet status strip under the top bar.
export default function OfflineBanner() {
  const { online } = useNetwork();
  const { pendingSyncCount: pending, syncing, syncAll, lastSyncedAt } = useInspectorStore();
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    if (!lastSyncedAt) return undefined;
    setJustSynced(true);
    const t = setTimeout(() => setJustSynced(false), 4500);
    return () => clearTimeout(t);
  }, [lastSyncedAt]);

  if (!online) {
    return (
      <div role="status" className="border-b border-warn-line bg-warn-soft px-4 py-2 text-warn lg:px-6">
        <p className="flex items-start gap-2 text-sm">
          <WifiOff size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong className="font-semibold">OFFLINE MODE</strong>{' '}
            <span className="text-coal-800">
              Inspection data will be securely queued and synchronized when connectivity is restored.
            </span>
          </span>
        </p>
      </div>
    );
  }

  if (syncing) {
    return (
      <div role="status" className="border-b border-primary-100 bg-primary-50 px-4 py-2 text-primary-700 lg:px-6">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Loader2 size={16} className="animate-spin" />
          Synchronizing {plural(pending, 'inspection')} (simulated)
        </p>
      </div>
    );
  }

  if (pending > 0) {
    return (
      <div role="status" className="border-b border-primary-100 bg-primary-50 px-4 py-1.5 text-primary-700 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">
            <strong className="font-semibold">SYNC AVAILABLE</strong>{' '}
            <span className="text-coal-800">{plural(pending, 'inspection')} pending synchronization</span>
          </p>
          <button type="button" onClick={syncAll} className="btn h-9 shrink-0 bg-primary-600 px-3.5 text-sm text-white hover:bg-primary-700">
            <CloudUpload size={15} />
            Sync now
          </button>
        </div>
      </div>
    );
  }

  if (justSynced) {
    return (
      <div role="status" className="border-b border-ok-line bg-ok-soft px-4 py-2 text-ok lg:px-6">
        <p className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={16} />
          All inspections synchronized (simulated). Nothing was sent to a server.
        </p>
      </div>
    );
  }
  return null;
}
