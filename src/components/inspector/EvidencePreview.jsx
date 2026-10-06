import { Check, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatCoord, formatTime, shortHash } from '../../lib/format.js';

// Metadata for one evidence file. The hash is for audit traceability only; it
// does not prove a photo is genuine.
export default function EvidencePreview({ evidence, onRemove }) {
  const [copied, setCopied] = useState(false);
  const hasLocation = evidence.latitude != null && evidence.longitude != null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(evidence.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <li className="flex gap-3 rounded-md border border-steel-200 bg-white p-3">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded bg-steel-100 sm:h-28 sm:w-28">
        {evidence.preview ? (
          <img src={evidence.preview} alt={`Evidence ${evidence.id}`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center px-2 text-center text-xs text-steel-500">Preview not stored</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold tabular-nums text-coal-900">{evidence.id}</p>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove evidence ${evidence.id}`}
              className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded text-steel-500 hover:bg-steel-100 hover:text-danger"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>
        <dl className="mt-1 grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-0.5 text-xs sm:text-sm">
          <dt className="text-steel-500">Location</dt>
          <dd className="text-coal-800">
            {hasLocation ? (
              <>
                Captured <span className="tabular-nums text-steel-500">({formatCoord(evidence.latitude)}, {formatCoord(evidence.longitude)})</span>
              </>
            ) : (
              'Not captured'
            )}
          </dd>
          <dt className="text-steel-500">Timestamp</dt>
          <dd className="text-coal-800">Captured, {formatTime(evidence.timestamp)}</dd>
          <dt className="text-steel-500">SHA-256</dt>
          <dd className="flex items-center gap-1.5 text-coal-800">
            <span className="tabular-nums">{shortHash(evidence.hash)}</span>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy full hash"
              className="grid h-7 w-7 place-items-center rounded text-steel-500 hover:bg-steel-100"
            >
              {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
            </button>
          </dd>
        </dl>
        <p className="mt-1 text-xs text-steel-500">Evidence hash generated for audit traceability.</p>
      </div>
    </li>
  );
}
