import { ArrowRight } from 'lucide-react';
import { CATEGORIES, categoryProgress, getCategory, tally } from '../../../data/checklists.js';
import CategorySelector from './CategorySelector.jsx';
import ChecklistItem from './ChecklistItem.jsx';
import ViolationForm from './ViolationForm.jsx';

// Step 3: category chips, then the questions for that category.
export default function Checklist({ draft, dispatch }) {
  const category = getCategory(draft.activeCategory) ?? CATEGORIES[0];
  const progress = categoryProgress(category, draft.results);
  const t = tally(draft.results);
  const nextCategory = CATEGORIES[CATEGORIES.findIndex((c) => c.id === category.id) + 1];

  const change = (item, value) => {
    const linked = draft.violations.find((v) => v.checklistItemId === item.id);
    if (linked && value !== 'fail' && (linked.evidence.length > 0 || linked.remarks.trim())) {
      if (!window.confirm('Changing this answer removes its violation and evidence. Continue?')) return;
    }
    dispatch({ type: 'result', itemId: item.id, value });
  };

  return (
    <section className="space-y-5" aria-labelledby="step3-title">
      <div>
        <h2 id="step3-title" className="font-display text-2xl font-semibold leading-none text-coal-900">
          Inspection checklist
        </h2>
        <p className="mt-2 text-sm text-steel-600">
          Choose a category, then mark each item. You can check as many categories as this visit needs.
        </p>
      </div>

      <CategorySelector active={category.id} results={draft.results} onSelect={(id) => dispatch({ type: 'category', id })} />

      <div>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold text-coal-900">{category.name}</h3>
          <p className="text-sm text-steel-600 tabular-nums">
            {progress.answered} of {progress.total} answered
          </p>
        </div>

        <ul className="space-y-3">
          {category.items.map((item, i) => {
            const vIndex = draft.violations.findIndex((v) => v.checklistItemId === item.id);
            return (
              <ChecklistItem key={item.id} item={item} index={i} value={draft.results[item.id] ?? null} onChange={(val) => change(item, val)}>
                {vIndex >= 0 && (
                  <ViolationForm
                    draft={draft}
                    violation={draft.violations[vIndex]}
                    index={vIndex}
                    dispatch={dispatch}
                    variant="inline"
                  />
                )}
              </ChecklistItem>
            );
          })}
        </ul>

        {nextCategory && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'category', id: nextCategory.id })}
            className="btn-secondary mt-4 h-12 w-full"
          >
            Next category: {nextCategory.name}
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      <p className="rounded-md bg-steel-100 px-4 py-3 text-sm text-steel-700" aria-live="polite">
        So far: <strong className="tabular-nums">{t.pass}</strong> pass, <strong className="tabular-nums">{t.fail}</strong> fail,{' '}
        <strong className="tabular-nums">{t.na}</strong> N/A.
      </p>
      <p className="text-xs text-steel-500">
        These are prototype checklist examples. They are not a complete legal compliance checklist.
      </p>
    </section>
  );
}
