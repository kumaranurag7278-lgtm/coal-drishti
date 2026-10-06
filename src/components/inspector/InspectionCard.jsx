import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatWhen } from '../../lib/format.js';
import { plural } from '../../lib/format.js';
import { RiskMeter, StatusBadge } from '../Badge.jsx';

// One inspection as a row: stacked card on phones, aligned columns on desktop.
export default function InspectionCard({ item, summary }) {
  const to = item.isDraft ? '/inspector/start-inspection' : `/inspector/my-inspections/${item.id}`;
  const queued = item.syncStatus === 'pending';
  return (
    <li>
      <Link
        to={to}
        className="block px-4 py-4 transition-colors hover:bg-steel-50 md:grid md:grid-cols-[9.5rem_9.5rem_minmax(0,1fr)_8rem_auto_1.25rem] md:items-center md:gap-x-4"
      >
        <span className="block text-sm font-semibold tabular-nums text-primary-700">{item.id}</span>
        <span className="mt-0.5 block text-sm text-steel-600 md:mt-0">
          {item.isDraft ? `Started ${formatWhen(item.startTime)}` : formatWhen(item.startTime)}
        </span>
        <span className="mt-1 block min-w-0 md:mt-0">
          <span className="block font-medium text-coal-900">{item.zone}</span>
          <span className="block text-sm text-steel-500">
            {item.mineId}, {item.type}
          </span>
        </span>
        <span className="mt-2 flex items-center gap-2 text-sm text-steel-700 md:mt-0">
          {plural(summary.violationCount, 'violation')}
          {summary.highestRisk != null && (
            <span className="flex items-center gap-1 text-steel-500">
              <span className="text-steel-400">Top</span>
              <RiskMeter score={summary.highestRisk} />
            </span>
          )}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5 md:mt-0 md:justify-end">
          <StatusBadge status={item.status} />
          {queued && <StatusBadge status="Sync pending" />}
        </span>
        <ChevronRight size={18} className="hidden text-steel-400 md:block" />
      </Link>
    </li>
  );
}
