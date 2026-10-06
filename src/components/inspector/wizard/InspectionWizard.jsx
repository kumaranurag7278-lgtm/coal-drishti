import { ArrowLeft, ArrowRight, Loader2, Save, Send, X } from 'lucide-react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInspectorStore } from '../../../context/InspectorStore.jsx';
import { useNetwork } from '../../../context/NetworkContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { tally } from '../../../data/checklists.js';
import Checklist from './Checklist.jsx';
import InspectionProgress, { STEPS } from './InspectionProgress.jsx';
import InspectionReview from './InspectionReview.jsx';
import SaveIndicator from './SaveIndicator.jsx';
import StepDetails from './StepDetails.jsx';
import StepViolations from './StepViolations.jsx';
import ZoneSelector from './ZoneSelector.jsx';
import { getBlockers, isDirty, isViolationComplete, reducer } from './useWizardState.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Five-step field inspection. Progress autosaves to this device, so losing
// signal (or the tab) does not lose work.
export default function InspectionWizard({ initial }) {
  const [draft, dispatch] = useReducer(reducer, initial);
  const store = useInspectorStore();
  const { online } = useNetwork();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const done = useRef(false);

  // Autosave (debounced) once there is something worth keeping.
  useEffect(() => {
    if (done.current || !isDirty(draft)) return undefined;
    const t = setTimeout(() => {
      if (!done.current) store.saveDraft({ ...draft, updatedAt: new Date().toISOString() });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [draft.step]);

  const step = draft.step;
  const go = (n) => dispatch({ type: 'step', step: n });
  const answered = tally(draft.results).answered;
  const allViolationsComplete = draft.violations.every(isViolationComplete);

  const canContinue = {
    1: Boolean(draft.type && draft.mineId),
    2: Boolean(draft.zoneId),
    3: answered > 0,
    4: allViolationsComplete,
  }[step];

  const hint = {
    2: 'Select a work zone to continue.',
    3: 'Answer at least one checklist item to continue.',
    4: 'Add a finding, severity and evidence to every violation.',
  }[step];

  const exit = () => {
    if (isDirty(draft)) {
      store.saveDraft({ ...draft, updatedAt: new Date().toISOString() });
      toast('Draft saved on this device.', 'info');
    }
    done.current = true;
    navigate('/inspector');
  };

  const saveDraft = () => {
    done.current = true;
    store.saveDraft({ ...draft, updatedAt: new Date().toISOString() });
    toast(online ? 'Draft saved on this device.' : 'Inspection saved locally. Sync pending.', online ? 'ok' : 'warn');
    navigate('/inspector/my-inspections?filter=draft');
  };

  const submit = async () => {
    if (getBlockers(draft).length || submitting) return;
    setSubmitting(true);
    done.current = true;
    await delay(online ? 900 : 500);
    const id = store.submitDraft(draft, { online });
    navigate(`/inspector/start-inspection/submitted/${id}`, { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col lg:min-h-[calc(100vh-6rem)]">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold leading-none text-coal-900">New inspection</h1>
          <p className="mt-1.5 text-sm tabular-nums text-steel-600">{draft.id}</p>
          <div className="mt-1.5">
            <SaveIndicator />
          </div>
        </div>
        <button type="button" onClick={exit} className="btn-secondary h-11 shrink-0 px-3.5 text-sm" aria-label="Save and exit">
          <X size={16} />
          <span className="hidden sm:inline">Save and exit</span>
        </button>
      </header>

      <InspectionProgress step={step} onJump={go} />

      <div className="mt-5 flex-1 pb-6">
        {step === 1 && <StepDetails draft={draft} dispatch={dispatch} />}
        {step === 2 && <ZoneSelector draft={draft} dispatch={dispatch} />}
        {step === 3 && <Checklist draft={draft} dispatch={dispatch} />}
        {step === 4 && <StepViolations draft={draft} dispatch={dispatch} />}
        {step === 5 && <InspectionReview draft={draft} onEdit={() => go(3)} />}
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-steel-200 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:mx-0 lg:rounded-md lg:border lg:pb-3">
        {step < 5 ? (
          <>
            {!canContinue && hint && <p className="mb-2 text-center text-sm text-steel-600">{hint}</p>}
            <div className="flex gap-2.5">
              {step > 1 && (
                <button type="button" onClick={() => go(step - 1)} className="btn-secondary h-14 px-4 text-base" aria-label="Back">
                  <ArrowLeft size={20} />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <button type="button" disabled={!canContinue} onClick={() => go(step + 1)} className="btn-primary h-14 flex-1 text-base">
                Continue to {STEPS[step].toLowerCase()}
                <ArrowRight size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-2.5">
            <button type="button" onClick={saveDraft} disabled={submitting} className="btn-secondary h-14 px-4 text-base">
              <Save size={20} />
              Save draft
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || getBlockers(draft).length > 0}
              className="btn-primary h-14 flex-1 text-base"
            >
              {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {submitting ? 'Submitting' : (
                <>
                  Submit<span className="hidden sm:inline">&nbsp;inspection</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
