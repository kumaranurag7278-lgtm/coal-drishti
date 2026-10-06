import { AlertCircle, ArrowLeft, Bell, BellRing, Check, CheckCheck, Clock, ExternalLink, Filter, Info, ShieldAlert, Trash2, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ALERTS } from '../../data/inspectorMock.js';
import { formatWhen } from '../../lib/format.js';

const ALERT_CONFIG = {
  danger: {
    icon: ShieldAlert,
    badge: 'High Priority',
    bg: 'border-l-4 border-danger bg-danger-soft/40',
    iconColor: 'text-danger',
  },
  warn: {
    icon: TriangleAlert,
    badge: 'Advisory',
    bg: 'border-l-4 border-warn-bar bg-warn-soft/50',
    iconColor: 'text-warn',
  },
  info: {
    icon: Info,
    badge: 'Update',
    bg: 'border-l-4 border-primary-500 bg-primary-50',
    iconColor: 'text-primary-700',
  },
  ok: {
    icon: Check,
    badge: 'Resolved',
    bg: 'border-l-4 border-ok-line bg-ok-soft/50',
    iconColor: 'text-ok',
  },
};

export default function InspectorAlerts() {
  const navigate = useNavigate();
  const { violations } = useComplianceStore();
  const { showToast } = useToast();

  // Combine static mock alerts with dynamic violation workflow notifications
  const [readIds, setReadIds] = useState(new Set());
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const dynamicAlerts = useMemo(() => {
    const list = [...ALERTS];

    // Add alert for any violation in awaiting verification
    const inVerification = violations.filter((v) => v.status === 'Awaiting verification');
    if (inVerification.length > 0) {
      list.push({
        id: 'dyn-verif',
        tone: 'info',
        text: `Closure evidence submitted for ${inVerification[0].id}. Under review at Verification Center.`,
        ref: inVerification[0].id,
        to: `/inspector/my-violations/${inVerification[0].id}`,
        time: 'Just now',
      });
    }

    // Add alert for any verified violation
    const verified = violations.filter((v) => v.status === 'Verified');
    if (verified.length > 0) {
      list.push({
        id: 'dyn-closed',
        tone: 'ok',
        text: `Violation ${verified[0].id} has been cryptographically certified as verified and closed.`,
        ref: verified[0].id,
        to: `/inspector/my-violations/${verified[0].id}`,
        time: 'Today',
      });
    }

    return list;
  }, [violations]);

  const toggleRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds(new Set(dynamicAlerts.map((a) => a.id)));
    showToast('All notifications marked as read.');
  };

  const displayedAlerts = useMemo(() => {
    if (filter === 'unread') {
      return dynamicAlerts.filter((a) => !readIds.has(a.id));
    }
    return dynamicAlerts;
  }, [dynamicAlerts, filter, readIds]);

  const unreadCount = dynamicAlerts.filter((a) => !readIds.has(a.id)).length;

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
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-danger px-2.5 py-0.5 text-xs font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className="btn-secondary h-9 px-3 text-xs"
            >
              <Filter size={14} />
              {filter === 'all' ? 'Filter: Unread' : 'Show All'}
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="btn-secondary h-9 px-3 text-xs font-medium"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <Panel title={`Active Notifications (${displayedAlerts.length})`}>
        {displayedAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={36} className="mx-auto text-steel-400" />
            <h3 className="mt-2 font-display text-xl font-semibold text-coal-900">No New Notifications</h3>
            <p className="mt-1 text-sm text-steel-500">
              You are completely caught up with field alerts and safety dispatches.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-steel-200">
            {displayedAlerts.map((a) => {
              const cfg = ALERT_CONFIG[a.tone] || ALERT_CONFIG.info;
              const Icon = cfg.icon;
              const isRead = readIds.has(a.id);

              return (
                <li
                  key={a.id}
                  className={`flex flex-col gap-3 p-4 transition-colors hover:bg-steel-50/70 sm:flex-row sm:items-start sm:justify-between ${
                    !isRead ? 'bg-primary-50/20' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded ${
                        isRead ? 'bg-steel-100 text-steel-500' : `${cfg.iconColor} bg-white shadow-xs border border-steel-200`
                      }`}
                    >
                      <Icon size={17} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isRead ? 'bg-steel-100 text-steel-600' : `${cfg.iconColor} bg-white border border-steel-200`
                          }`}
                        >
                          {cfg.badge}
                        </span>
                        <span className="text-xs text-steel-500">{a.time}</span>
                        {!isRead && (
                          <span className="h-2 w-2 rounded-full bg-danger" title="Unread" />
                        )}
                      </div>

                      <p className={`mt-1.5 text-sm leading-snug ${isRead ? 'text-steel-700' : 'font-medium text-coal-900'}`}>
                        {a.text}
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-xs text-steel-500">
                        <span>Reference: <strong>{a.ref}</strong></span>
                        {a.to && (
                          <Link
                            to={a.to}
                            className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline"
                          >
                            Open Details
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleRead(a.id)}
                      className="rounded border border-steel-200 bg-white px-2.5 py-1 text-xs text-steel-600 hover:bg-steel-50"
                    >
                      {isRead ? 'Mark unread' : 'Mark read'}
                    </button>
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
