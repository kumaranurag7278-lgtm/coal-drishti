import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatWhen } from '../../lib/format.js';
import { RiskMeter, SeverityBadge, StatusBadge } from '../Badge.jsx';

export default function ViolationCard({ violation: v }) {
  return (
    <li>
      <Link
        to={`/inspector/my-violations/${v.id}`}
        className="block px-4 py-4 transition-colors hover:bg-steel-50 md:grid md:grid-cols-[5.5rem_minmax(0,1fr)_5.5rem_6rem_9.5rem_1.25rem] md:items-center md:gap-x-4"
      >
        <span className="block text-sm font-semibold tabular-nums text-primary-700">{v.id}</span>
        <span className="mt-0.5 block min-w-0 md:mt-0">
          <span className="block font-medium text-coal-900">{v.finding}</span>
          <span className="block text-sm text-steel-500">
            {v.location}, {formatWhen(v.timestamp)}
          </span>
          <span className="block text-sm text-steel-500 md:hidden">Assigned to {v.assignedTo}</span>
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 md:contents">
          <span className="md:justify-self-start">
            <SeverityBadge level={v.severity} />
          </span>
          <RiskMeter score={v.riskScore.score} />
          <span className="md:justify-self-start">
            <StatusBadge status={v.status} />
          </span>
        </span>
        <ChevronRight size={18} className="hidden text-steel-400 md:block" />
      </Link>
    </li>
  );
}
