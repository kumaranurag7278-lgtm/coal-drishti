import { CloudOff, HardDrive } from 'lucide-react';
import { useInspectorStore } from '../../../context/InspectorStore.jsx';
import { useNetwork } from '../../../context/NetworkContext.jsx';
import { formatTime } from '../../../lib/format.js';

// Progress is written to this device as you go.
export default function SaveIndicator() {
  const { online } = useNetwork();
  const { draft } = useInspectorStore();
  const at = draft?.updatedAt;

  if (!online) {
    return (
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-warn" role="status">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <CloudOff size={15} />
          Inspection saved locally
        </span>
        <span className="rounded-sm border border-warn-line bg-warn-soft px-1.5 py-0.5 text-xs font-semibold">SYNC PENDING</span>
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-sm text-steel-500" role="status">
      <HardDrive size={15} />
      {at ? `Draft saved on this device, ${formatTime(at)}` : 'Progress is saved on this device'}
    </p>
  );
}
