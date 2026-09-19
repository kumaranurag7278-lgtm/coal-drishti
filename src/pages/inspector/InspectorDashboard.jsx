import {
  BellRing,
  ClipboardList,
  Cog,
  HardHat,
  Info,
  ListChecks,
  Plus,
  Route,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Upload,
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import Panel from '../../components/Panel.jsx';
import TopoBackdrop from '../../components/TopoBackdrop.jsx';
import {
  ALERTS,
  HIGH_RISK_THRESHOLD,
  INSPECTIONS,
  INSPECTOR,
  NEXT_INSPECTION,
  TASKS,
  VIOLATIONS,
} from '../../data/inspectorMock.js';
import { useSession } from '../../context/SessionContext.jsx';

const CATEGORY_ICON = {
  PPE: HardHat,
  'HEMM / Machinery': Cog,
  'Haul Roads': Route,
  'Workplace Safety': ShieldCheck,
};

const ALERT_STYLE = {
  danger: { icon: ShieldAlert, box: 'border-danger bg-danger-soft/60', text: 'text-danger' },
  warn: { icon: TriangleAlert, box: 'border-warn-bar bg-warn-soft/70', text: 'text-warn' },
  info: { icon: Info, box: 'border-primary-500 bg-primary-50', text: 'text-primary-700' },
};

const PRIORITY_STYLE = {
  High: 'border-danger-line bg-danger-soft text-danger',
  Medium: 'border-warn-line bg-warn-soft text-warn',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function Kpi({ to, label, value, note, icon: Icon, tone = 'text-coal-900' }) {
  return (
    <Link to={to} className="block bg-white p-4 transition-colors hover:bg-steel-50 lg:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-steel-600">{label}</span>
        <Icon size={18} className="shrink-0 text-steel-400" />
      </div>
      <p className={`mt-2 font-display text-5xl font-semibold leading-none tabular-nums ${tone}`}>{value}</p>
      <p className="mt-2 text-xs text-steel-500">{note}</p>
    </Link>
  );
}

export default function InspectorDashboard() {
  const { sync } = useOutletContext();
  const { user } = useSession();

  // A queued inspection becomes "Submitted" once the simulated sync completes.
  const synced = sync.pending === 0;
  const inspections = INSPECTIONS.map((i) =>
    i.status === 'Pending submission' && synced ? { ...i, status: 'Submitted' } : i,
  );

  // The "submit report" task is done once the queued report syncs.
  const tasks = TASKS.filter((t) => !(t.ref === 'INS-0414' && synced));

  const open = VIOLATIONS.filter((v) => v.status !== 'Verified');
  const notAssigned = open.filter((v) => v.status === 'Open').length;
  const highRisk = open.filter((v) => v.risk >= HIGH_RISK_THRESHOLD).length;
  const pendingSubmissions = inspections.filter((i) => i.status === 'Pending submission').length;
  const submitted = inspections.filter((i) => i.status === 'Submitted').length;
  const notStarted = inspections.filter((i) => i.status === 'Not started').length;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-4xl font-semibold leading-none text-coal-900 lg:text-5xl">
          {greeting()}, {INSPECTOR.title}
        </h1>
        <p className="mt-2 text-steel-600">
          {user?.org}, {INSPECTOR.area}. {today}.
        </p>
      </header>

      {/* The one thing an inspector does most: start an inspection */}
      <section
        aria-label="Start an inspection"
        className="relative overflow-hidden rounded-md bg-coal-900 text-white"
      >
        <TopoBackdrop
          className="absolute inset-0 h-full w-full"
          width={1200}
          height={320}
          cx={1010}
          cy={190}
          rings={14}
          first={22}
          gap={14}
          growth={0.5}
          showRamp={false}
        />
        <div className="relative flex flex-col gap-6 p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <p className="text-sm text-steel-300">Next scheduled inspection</p>
            <p className="mt-1 font-display text-3xl font-semibold leading-none">
              {NEXT_INSPECTION.zone}, {NEXT_INSPECTION.category}
            </p>
            <p className="mt-2 text-sm text-steel-300">
              Due {NEXT_INSPECTION.due}. {NEXT_INSPECTION.checks} checks.
            </p>
          </div>
          <Link
            to="/inspector/start-inspection"
            className="inline-flex h-14 items-center justify-center gap-2.5 rounded bg-white px-8 text-lg font-semibold text-coal-950 transition-colors hover:bg-primary-50 md:shrink-0"
          >
            <Plus size={22} strokeWidth={2.5} className="text-primary-600" />
            Start inspection
          </Link>
        </div>
      </section>

      <section
        aria-label="Key figures"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-steel-200 bg-steel-200 lg:grid-cols-4"
      >
        <Kpi
          to="/inspector/my-inspections"
          label="Today's inspections"
          value={inspections.length}
          note={`${submitted} submitted, ${pendingSubmissions} pending, ${notStarted} not started`}
          icon={ClipboardList}
        />
        <Kpi
          to="/inspector/my-violations"
          label="Open violations"
          value={open.length}
          note={`${notAssigned} not yet assigned`}
          icon={TriangleAlert}
        />
        <Kpi
          to="/inspector/my-violations"
          label="High-risk findings"
          value={highRisk}
          note={`Risk score ${HIGH_RISK_THRESHOLD} or above`}
          icon={ShieldAlert}
          tone="text-danger"
        />
        <Kpi
          to="/inspector/my-inspections"
          label="Pending submissions"
          value={pendingSubmissions}
          note={pendingSubmissions ? 'Queued until you are back online' : 'Everything is submitted'}
          icon={Upload}
          tone={pendingSubmissions ? 'text-warn' : 'text-ok'}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel
            title="Today's inspections"
            action={
              <Link to="/inspector/my-inspections" className="text-sm font-medium text-primary-700 hover:underline">
                View all
              </Link>
            }
          >
            <ul className="divide-y divide-steel-200">
              {inspections.map((i) => {
                const Icon = CATEGORY_ICON[i.category] ?? ClipboardList;
                const queued = i.status === 'Pending submission';
                return (
                  <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-steel-100 text-steel-700">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="font-medium text-coal-900">
                        {i.zone}, {i.category}
                      </p>
                      <p className="text-sm text-steel-500">
                        {i.status === 'Not started' ? `Due ${i.time}` : i.time}
                        {i.status !== 'Not started' && (
                          <>
                            {', '}
                            {i.findings === 0
                              ? 'no findings'
                              : `${i.findings} finding${i.findings > 1 ? 's' : ''}${queued ? ', queued for sync' : ''}`}
                          </>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={i.status} />
                    {i.status === 'Not started' && (
                      <Link to="/inspector/start-inspection" className="btn-primary h-10 px-4 text-sm">
                        Start
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            title="Recent violations"
            action={
              <Link to="/inspector/my-violations" className="text-sm font-medium text-primary-700 hover:underline">
                View all {open.length} open
              </Link>
            }
          >
            <ul className="divide-y divide-steel-200">
              {VIOLATIONS.slice(0, 5).map((v) => (
                <li
                  key={v.id}
                  className="px-4 py-3.5 md:grid md:grid-cols-[3.75rem_minmax(0,1fr)_4.75rem_6rem_9.5rem] md:items-center md:justify-items-start md:gap-x-4"
                >
                  <span className="text-sm font-semibold tabular-nums text-primary-700">{v.id}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-coal-900">{v.title}</p>
                    <p className="text-sm text-steel-500">
                      {v.zone}, {v.reported}
                    </p>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 md:contents">
                    <SeverityBadge level={v.severity} />
                    <RiskMeter score={v.risk} />
                    <StatusBadge status={v.status} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Assigned tasks">
            <ul className="divide-y divide-steel-200">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded bg-steel-100 text-steel-700">
                    <ListChecks size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-coal-900">{t.title}</p>
                    <p className="mt-1 text-sm text-steel-500">
                      <span className="tabular-nums">{t.ref}</span>, {t.due}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-sm border px-2 py-0.5 text-xs font-semibold ${PRIORITY_STYLE[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Alerts"
            action={
              <Link
                to="/inspector/alerts"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
              >
                <BellRing size={15} />3 new
              </Link>
            }
          >
            <ul className="space-y-3 p-4">
              {ALERTS.map((a) => {
                const s = ALERT_STYLE[a.tone];
                const Icon = s.icon;
                return (
                  <li key={a.id} className={`flex gap-3 rounded-sm border-l-4 p-3 ${s.box}`}>
                    <Icon size={18} className={`mt-0.5 shrink-0 ${s.text}`} />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-coal-900">{a.text}</p>
                      <p className="mt-1 text-xs text-steel-500">
                        {a.ref}, {a.time}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
