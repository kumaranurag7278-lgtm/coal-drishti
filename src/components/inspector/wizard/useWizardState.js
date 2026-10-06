import { getItem } from '../../../data/checklists.js';
import { zoneGps } from '../../../data/zones.js';

let counter = 0;
const uid = () => `dv-${Date.now().toString(36)}-${(counter += 1).toString(36)}`;
export const makeKey = uid;

export function captureGps(zoneId, available) {
  const { latitude, longitude } = zoneGps(zoneId);
  return {
    available,
    latitude: available ? latitude : null,
    longitude: available ? longitude : null,
    capturedAt: new Date().toISOString(),
  };
}

export function createDraft({ id, violationBase, inspectorId, mineId, prefill = {} }) {
  const zoneId = prefill.zoneId ?? null;
  return {
    id,
    violationBase,
    inspectorId,
    mineId,
    type: 'Routine Inspection',
    startTime: new Date().toISOString(),
    step: 1,
    zoneId,
    gpsAvailable: true,
    gps: zoneId ? captureGps(zoneId, true) : null,
    activeCategory: prefill.categoryId ?? 'ppe',
    results: {},
    violations: [],
    updatedAt: null,
  };
}

const newViolation = (fields) => ({
  key: uid(),
  checklistItemId: null,
  categoryId: 'other',
  finding: '',
  severity: null,
  remarks: '',
  suggestedAction: '',
  evidence: [],
  createdAt: new Date().toISOString(),
  ...fields,
});

export const isViolationComplete = (v) => v.finding.trim().length > 0 && Boolean(v.severity) && v.evidence.length > 0;

export const isDirty = (d) => d.step > 1 || Boolean(d.zoneId) || Object.keys(d.results).length > 0 || d.violations.length > 0;

export function reducer(state, a) {
  switch (a.type) {
    case 'field':
      return { ...state, [a.key]: a.value };
    case 'step':
      return { ...state, step: a.step };
    case 'zone':
      return { ...state, zoneId: a.zoneId, gps: captureGps(a.zoneId, state.gpsAvailable) };
    case 'gpsAvailable':
      return { ...state, gpsAvailable: a.value, gps: state.zoneId ? captureGps(state.zoneId, a.value) : null };
    case 'category':
      return { ...state, activeCategory: a.id };
    case 'result': {
      const results = { ...state.results };
      if (a.value == null) delete results[a.itemId];
      else results[a.itemId] = a.value;
      let violations = state.violations;
      const linked = violations.find((v) => v.checklistItemId === a.itemId);
      if (a.value === 'fail' && !linked) {
        const item = getItem(a.itemId);
        violations = [
          ...violations,
          newViolation({ checklistItemId: a.itemId, categoryId: item.categoryId, finding: `${item.text}: not met` }),
        ];
      } else if (a.value !== 'fail' && linked) {
        violations = violations.filter((v) => v.checklistItemId !== a.itemId);
      }
      return { ...state, results, violations };
    }
    case 'addViolation':
      return {
        ...state,
        violations: [...state.violations, newViolation({ categoryId: state.activeCategory, key: a.key ?? uid() })],
      };
    case 'updateViolation':
      return { ...state, violations: state.violations.map((v) => (v.key === a.key ? { ...v, ...a.patch } : v)) };
    case 'removeViolation': {
      const target = state.violations.find((v) => v.key === a.key);
      const results = { ...state.results };
      if (target?.checklistItemId) delete results[target.checklistItemId];
      return { ...state, results, violations: state.violations.filter((v) => v.key !== a.key) };
    }
    case 'addEvidence':
      return {
        ...state,
        violations: state.violations.map((v) => (v.key === a.key ? { ...v, evidence: [...v.evidence, a.evidence] } : v)),
      };
    case 'removeEvidence':
      return {
        ...state,
        violations: state.violations.map((v) =>
          v.key === a.key ? { ...v, evidence: v.evidence.filter((e) => e.id !== a.evidenceId) } : v,
        ),
      };
    default:
      return state;
  }
}

export function getBlockers(d) {
  const out = [];
  if (!d.zoneId) out.push('Select a work zone.');
  if (Object.keys(d.results).length === 0) out.push('Answer at least one checklist item.');
  const incomplete = d.violations.filter((v) => !isViolationComplete(v)).length;
  if (incomplete) out.push(`${incomplete} violation${incomplete === 1 ? ' needs' : 's need'} a finding, severity and evidence.`);
  return out;
}
