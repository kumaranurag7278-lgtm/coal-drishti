import { Cog, Ellipsis, HardHat, Layers, Lightbulb, Route, ShieldCheck, Wind } from 'lucide-react';

// Prototype checklist examples. Not a complete legal compliance checklist.
const make = (id, name, icon, texts) => ({
  id,
  name,
  icon,
  items: texts.map((text, i) => ({ id: `${id}.${i}`, text, categoryId: id })),
});

export const CATEGORIES = [
  make('ppe', 'PPE', HardHat, [
    'Safety helmet worn correctly',
    'Required PPE available',
    'Safety shoes used',
    'High-visibility clothing used',
  ]),
  make('hemm', 'HEMM / Machinery', Cog, [
    'Operator authorization and training status available',
    'Machine guarding in place',
    'Reverse alarm functional',
    'Safe clearance from workers maintained',
    'Equipment condition appears acceptable',
  ]),
  make('haul', 'Haul Roads', Route, [
    'Road condition acceptable',
    'Adequate width maintained',
    'Edge protection where required',
    'Traffic movement controlled',
    'Visibility and lighting adequate where applicable',
  ]),
  make('roof', 'Roof / Strata', Layers, [
    'Roof and strata condition inspected',
    'Loose material controlled',
    'Support condition acceptable',
    'Unsafe area appropriately restricted',
  ]),
  make('vent', 'Ventilation', Wind, [
    'Ventilation condition acceptable',
    'Airflow monitoring available',
    'No obvious ventilation obstruction',
    'Required ventilation controls in place',
  ]),
  make('light', 'Lighting', Lightbulb, [
    'Adequate lighting available',
    'Work area sufficiently illuminated',
    'Machinery lighting functional',
  ]),
  make('safety', 'Workplace Safety', ShieldCheck, [
    'Emergency access available',
    'Warning signs visible',
    'Unsafe areas barricaded',
    'Housekeeping acceptable',
    'Fire and emergency equipment accessible',
  ]),
  make('other', 'Other', Ellipsis, [
    'No other hazards observed in the work area',
    'Other site conditions acceptable',
  ]),
];

const ITEMS = Object.fromEntries(CATEGORIES.flatMap((c) => c.items).map((i) => [i.id, i]));

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) ?? null;
export const getItem = (id) => ITEMS[id] ?? null;
export const itemsOf = (categoryId) => getCategory(categoryId)?.items ?? [];

export const INSPECTION_TYPES = [
  { id: 'Routine Inspection', description: 'Scheduled round of the work zone' },
  { id: 'Safety Inspection', description: 'Focused check on safety conditions' },
  { id: 'Follow-up Inspection', description: 'Re-check after a corrective action' },
  { id: 'Special Inspection', description: 'Triggered by an incident or alert' },
];

// Counts across all answered items.
export function tally(results) {
  const t = { pass: 0, fail: 0, na: 0 };
  Object.values(results).forEach((v) => {
    if (t[v] !== undefined) t[v] += 1;
  });
  return { ...t, answered: t.pass + t.fail + t.na };
}

export function categoryProgress(category, results) {
  let answered = 0;
  let fails = 0;
  category.items.forEach((i) => {
    if (results[i.id]) answered += 1;
    if (results[i.id] === 'fail') fails += 1;
  });
  return { answered, total: category.items.length, fails };
}
