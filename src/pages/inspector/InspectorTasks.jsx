import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, ChevronRight, Clock, ListChecks, Play, Plus, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { SCHEDULED, scheduledDue, TASKS } from '../../data/inspectorMock.js';
import { plural } from '../../lib/format.js';

const PRIORITY_STYLE = {
  High: 'border-danger-line bg-danger-soft text-danger',
  Medium: 'border-warn-line bg-warn-soft text-warn',
  Routine: 'border-primary-100 bg-primary-50 text-primary-700',
};

export default function InspectorTasks() {
  const navigate = useNavigate();
  const { inspections, violations } = useComplianceStore();
  const { showToast } = useToast();

  const [completedIds, setCompletedIds] = useState(new Set());
  const [tab, setTab] = useState('pending'); // 'all' | 'pending' | 'completed'

  const queued = inspections.filter((i) => i.syncStatus === 'pending');
  const due = scheduledDue();

  const allTasks = useMemo(() => {
    const list = [
      ...TASKS.map((t) => ({
        ...t,
        type: 'followup',
        to: t.ref.startsWith('VIOL-') ? `/inspector/my-violations/${t.ref}` : '/inspector/my-inspections',
      })),
      {
        id: 'scheduled-routine',
        title: `Scheduled Shift Audit: ${SCHEDULED.zone} (${SCHEDULED.category})`,
        ref: 'Statutory Shift Routine',
        due: `Due today, ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        priority: 'Routine',
        type: 'scheduled',
        to: `/inspector/start-inspection?zone=${SCHEDULED.zoneId}&category=${SCHEDULED.categoryId}`,
      },
      ...(queued.length > 0
        ? [
            {
              id: 'offline-sync',
              title: `Upload & sync ${plural(queued.length, 'inspection')} recorded offline`,
              ref: queued[0].id,
              due: 'As soon as connectivity restored',
              priority: 'High',
              type: 'sync',
              to: '/inspector/my-inspections',
            },
          ]
        : []),
    ];
    return list;
  }, [queued, due]);

  const toggleTask = (id) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Task marked pending.');
      } else {
        next.add(id);
        showToast('Task marked completed!');
      }
      return next;
    });
  };

  const displayedTasks = useMemo(() => {
    if (tab === 'pending') {
      return allTasks.filter((t) => !completedIds.has(t.id));
    }
    if (tab === 'completed') {
      return allTasks.filter((t) => completedIds.has(t.id));
    }
    return allTasks;
  }, [allTasks, tab, completedIds]);

  const pendingCount = allTasks.filter((t) => !completedIds.has(t.id)).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/inspector')}
          className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
              Assigned Tasks & Shift Schedule
            </h1>
            <p className="mt-1 text-sm text-steel-600">
              Track routine zone checklists, scheduled follow-up inspections, and sync jobs.
            </p>
          </div>

          <Link
            to="/inspector/start-inspection"
            className="btn-primary inline-flex h-10 items-center gap-1.5 px-4 text-xs font-semibold shadow-sm"
          >
            <Plus size={16} />
            Start New Inspection
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-steel-200">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'pending'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-steel-500 hover:text-coal-800'
          }`}
        >
          <Clock size={16} />
          Pending Tasks ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setTab('completed')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'completed'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-steel-500 hover:text-coal-800'
          }`}
        >
          <CheckCircle2 size={16} />
          Completed ({completedIds.size})
        </button>

        <button
          type="button"
          onClick={() => setTab('all')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'all'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-steel-500 hover:text-coal-800'
          }`}
        >
          All Tasks ({allTasks.length})
        </button>
      </div>

      <Panel title={`Tasks (${displayedTasks.length})`}>
        {displayedTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 size={36} className="mx-auto text-ok" />
            <h3 className="mt-2 font-display text-xl font-semibold text-coal-900">
              {tab === 'completed' ? 'No Completed Tasks Yet' : 'All Tasks Completed'}
            </h3>
            <p className="mt-1 text-sm text-steel-500">
              {tab === 'completed'
                ? 'Check off tasks as you perform them in the mine.'
                : 'Great job! All shift tasks and follow-ups have been completed.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-steel-200">
            {displayedTasks.map((t) => {
              const isDone = completedIds.has(t.id);

              return (
                <li
                  key={t.id}
                  className={`flex flex-col gap-3 p-4 transition-colors hover:bg-steel-50/70 sm:flex-row sm:items-center sm:justify-between ${
                    isDone ? 'bg-steel-50/60 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTask(t.id)}
                      className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors ${
                        isDone
                          ? 'border-ok bg-ok text-white'
                          : 'border-steel-400 bg-white hover:border-steel-600'
                      }`}
                      aria-label={isDone ? 'Mark task pending' : 'Mark task completed'}
                    >
                      {isDone && <CheckCircle2 size={14} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Medium
                          }`}
                        >
                          {t.priority} Priority
                        </span>
                        <span className="text-xs text-steel-500">{t.due}</span>
                      </div>

                      <p
                        className={`mt-1 text-sm font-medium ${
                          isDone ? 'line-through text-steel-500' : 'text-coal-900'
                        }`}
                      >
                        {t.title}
                      </p>

                      <p className="mt-0.5 text-xs text-steel-500">Reference: {t.ref}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-8 sm:pl-0">
                    <Link
                      to={t.to}
                      className="btn-secondary inline-flex h-9 items-center gap-1 px-3 text-xs font-semibold"
                    >
                      {t.type === 'scheduled' ? 'Start Check' : 'Open'}
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
