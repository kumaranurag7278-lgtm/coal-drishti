import { formatTime, dayLabel } from '../../lib/format.js';

// Chronological record: the "audit" step of the platform story.
export default function AuditTimeline({ events, upcoming = [] }) {
  const sorted = [...events].sort((a, b) => new Date(a.at) - new Date(b.at));
  return (
    <ol className="relative space-y-5 pl-7 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-steel-300">
      {sorted.map((e) => (
        <li key={e.id} className="relative">
          <span aria-hidden="true" className="absolute -left-7 top-1 h-[15px] w-[15px] rounded-full border-2 border-primary-600 bg-white" />
          <p className="text-sm font-semibold text-coal-900">{e.label}</p>
          <p className="text-sm text-steel-600">
            {dayLabel(e.at)}, {formatTime(e.at)}
            {e.actor ? <>, {e.actor}</> : null}
          </p>
          {e.note ? <p className="text-sm text-steel-500">{e.note}</p> : null}
        </li>
      ))}
      {upcoming.map((u) => (
        <li key={u} className="relative">
          <span aria-hidden="true" className="absolute -left-7 top-1 h-[15px] w-[15px] rounded-full border-2 border-dashed border-steel-300 bg-white" />
          <p className="text-sm text-steel-500">{u}</p>
        </li>
      ))}
    </ol>
  );
}
