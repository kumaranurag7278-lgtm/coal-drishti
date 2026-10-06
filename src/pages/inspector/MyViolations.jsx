import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ViolationCard from '../../components/inspector/ViolationCard.jsx';
import Panel from '../../components/Panel.jsx';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { VIOLATION_FLOW } from '../../data/models.js';
import { FilterChips } from './MyInspections.jsx';

const FILTERS = [{ id: 'all', label: 'All' }, ...VIOLATION_FLOW.map((s) => ({ id: s, label: s }))];

export default function MyViolations() {
  const { violations } = useInspectorStore();
  const [params, setParams] = useSearchParams();
  const filter = FILTERS.some((f) => f.id === params.get('status')) ? params.get('status') : 'all';
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return violations.filter(
      (v) =>
        (filter === 'all' || v.status === filter) &&
        (!q || [v.id, v.finding, v.location, v.category, v.severity].join(' ').toLowerCase().includes(q)),
    );
  }, [violations, filter, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <h1 className="font-display text-4xl font-semibold leading-none text-coal-900">My violations</h1>
        <p className="mt-2 text-steel-600">Violations you reported. Corrective action and verification are handled by other roles.</p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" />
          <input
            type="search"
            aria-label="Search violations"
            placeholder="Search by ID, finding or zone"
            className="field pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <FilterChips
          label="Filter by status"
          filters={FILTERS}
          value={filter}
          onChange={(id) => setParams(id === 'all' ? {} : { status: id })}
        />
      </div>

      <Panel title={`${rows.length} ${rows.length === 1 ? 'violation' : 'violations'}`}>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-steel-600">No violations match. Try another filter or search.</p>
        ) : (
          <ul className="divide-y divide-steel-200">
            {rows.map((v) => (
              <ViolationCard key={v.id} violation={v} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
