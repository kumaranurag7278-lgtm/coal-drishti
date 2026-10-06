import { Camera, ImagePlus, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { createEvidenceFromFile, createSampleEvidence, evidenceId } from '../../lib/evidence.js';
import EvidencePreview from './EvidencePreview.jsx';

// Camera first. On a phone, "Capture evidence" opens the camera. On a laptop it
// opens a file picker, and "Use sample image" gives a demo photo with no camera.
export default function EvidenceCapture({ violationId, evidence, gps, onAdd, onRemove, label }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const nextId = () => {
    const used = evidence.map((e) => parseInt(e.id.split('-').pop(), 10) || 0);
    return evidenceId(violationId, Math.max(0, ...used) + 1);
  };

  async function fromFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onAdd(await createEvidenceFromFile(file, { id: nextId(), gps }));
    } catch {
      setError('That image could not be read. Try another one.');
    } finally {
      setBusy(false);
    }
  }

  async function sample() {
    setBusy(true);
    setError('');
    try {
      onAdd(await createSampleEvidence({ id: nextId(), gps, label }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={busy}
          className="btn-primary h-14 text-base"
        >
          {busy ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
          Capture evidence
        </button>
        <button type="button" onClick={() => galleryRef.current?.click()} disabled={busy} className="btn-secondary h-14 text-base">
          <ImagePlus size={20} />
          Add image
        </button>
      </div>
      <button
        type="button"
        onClick={sample}
        disabled={busy}
        className="mt-2 text-sm font-medium text-primary-700 underline-offset-2 hover:underline disabled:opacity-50"
      >
        Use a sample image (demo)
      </button>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={fromFile} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={fromFile} />

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      {evidence.length > 0 ? (
        <ul className="mt-3 space-y-2" aria-label="Evidence attached">
          {evidence.map((ev) => (
            <EvidencePreview key={ev.id} evidence={ev} onRemove={() => onRemove(ev.id)} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded border border-dashed border-steel-300 bg-steel-50 px-3 py-2.5 text-sm text-steel-600">
          No evidence yet. At least one photo is needed to submit this violation.
        </p>
      )}
    </div>
  );
}
