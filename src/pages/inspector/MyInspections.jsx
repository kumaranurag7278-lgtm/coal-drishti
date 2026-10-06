import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import InspectionCard from '../../components/inspector/InspectionCard.jsx';
import Panel from '../../components/Panel.jsx';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { draftAsInspection, draftSummary, inspectionSummary } from '../../data/summary.js';
import { isSameDay, isThisWeek } from '../../lib/format.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'draft', label: 'Draft' },
  { id: 'sync', label: 'Sync Pending' },
];

const MATCH = {
  all: () => true,
  today: (i) => isSameDay(i.startTime),
  week: (i) => isThisWeek(i.startTime),
  submitted: (i) => i.status === 'Submitted',
  draft: (i) => i.status === 'Draft',
  sync: (i) => i.syncStatus === 'pending',
};

export function FilterChips({ filters, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          aria-pressed={value === f.id}
          onClick={() => onChange(f.id)}
          className={`h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
            value === f.id ? 'border-primary-600 bg-primary-600 text-white' : 'border-steel-300 bg-white text-steel-700 hover:border-steel-400'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export default function MyInspections() {
  const store = useInspectorStore();
  const [params, setParams] = useSearchParams();
  const filter = MATCH[params.get('filter')] ? params.get('filter') : 'all';
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const all = [
      ...(store.draft ? [{ item: draftAsInspection(store.draft), summary: draftSummary(store.draft) }] : []),
      ...store.inspections.map((i) => ({ item: i, summary: inspectionSummary(i, store.violations) })),
    ];
    const q = query.trim().toLowerCase();
    return all.filter(
      ({ item }) =>
        MATCH[filter](item) &&
        (!q || [item.id, item.zone, item.mineId, item.type, item.status].join(' ').toLowerCase().includes(q)),
    );
  }, [store.draft, store.inspections, store.violations, filter, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <h1 className="font-display text-4xl font-semibold leading-none text-coal-900">My inspections</h1>
        <p className="mt-2 text-steel-600">Everything you have inspected, including drafts and items waiting to sync.</p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" />
          <input
            type="search"
            aria-label="Search inspections"
            placeholder="Search by ID, zone or type"
            className="field pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <FilterChips
          label="Filter inspections"
          filters={FILTERS}
          value={filter}
          onChange={(id) => setParams(id === 'all' ? {} : { filter: id })}
        />
      </div>

      <Panel title={`${rows.length} ${rows.length === 1 ? 'inspection' : 'inspections'}`}>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-steel-600">No inspections match. Try another filter or search.</p>
        ) : (
          <>
            <div className="hidden border-b border-steel-200 bg-steel-50 px-4 py-2 text-xs font-medium text-steel-500 md:grid md:grid-cols-[9.5rem_9.5rem_minmax(0,1fr)_8rem_auto_1.25rem] md:gap-x-4">
              <span>Inspection</span>
              <span>Date</span>
              <span>Zone</span>
              <span>Violations</span>
              <span className="text-right">Status</span>
              <span />
            </div>
            <ul className="divide-y divide-steel-200">
              {rows.map(({ item, summary }) => (
                <InspectionCard key={item.id} item={item} summary={summary} />
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}
