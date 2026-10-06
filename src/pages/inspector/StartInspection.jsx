import { History, Play } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import InspectionWizard from '../../components/inspector/wizard/InspectionWizard.jsx';
import { createDraft } from '../../components/inspector/wizard/useWizardState.js';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { getZone } from '../../data/zones.js';
import { INSPECTOR } from '../../data/inspectorMock.js';
import { formatWhen, pad } from '../../lib/format.js';

// Entry to the wizard. If an unfinished draft exists, ask whether to resume it.
export default function StartInspection() {
  const store = useInspectorStore();
  const { user } = useSession();
  const [params] = useSearchParams();

  const makeFresh = () => {
    const { inspectionNumber, violationBase } = store.allocateIds();
    const zoneId = getZone(params.get('zone')) ? params.get('zone') : null;
    return createDraft({
      id: `INS-${new Date().getFullYear()}-${pad(inspectionNumber)}`,
      violationBase,
      inspectorId: INSPECTOR.id,
      mineId: user?.org ?? 'Mine A',
      prefill: { zoneId, categoryId: params.get('category') || undefined },
    });
  };

  // null means "ask about the existing draft first"
  const [initial, setInitial] = useState(() => (store.draft ? null : makeFresh()));

  if (!initial) {
    const d = store.draft;
    return (
      <div className="mx-auto max-w-xl py-6">
        <div className="rounded-md border border-steel-200 bg-white p-5">
          <span className="grid h-12 w-12 place-items-center rounded bg-primary-50 text-primary-700">
            <History size={24} />
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-none text-coal-900">Continue your draft?</h1>
          <p className="mt-3 text-steel-700">
            You have an unfinished inspection <span className="font-semibold tabular-nums">{d.id}</span>
            {d.zoneId ? <> for {getZone(d.zoneId)?.name}</> : null}, last saved {d.updatedAt ? formatWhen(d.updatedAt) : 'just now'} on this device.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button type="button" onClick={() => setInitial(store.draft)} className="btn-primary h-14 flex-1 text-base">
              <Play size={18} />
              Resume draft
            </button>
            <button
              type="button"
              onClick={() => {
                store.discardDraft();
                setInitial(makeFresh());
              }}
              className="btn-secondary h-14 flex-1 text-base"
            >
              Discard and start new
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <InspectionWizard initial={initial} />;
}
