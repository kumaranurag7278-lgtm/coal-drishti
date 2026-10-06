// Mock AI risk-priority score. The real product would use a trained model
// (XGBoost) with SHAP explanations. Here it is a deterministic formula so the
// demo is repeatable. It prioritizes attention; it does not predict accidents.
import { getZone } from '../data/zones.js';

export const MODEL_LABEL = 'XGBoost + SHAP';

export const SEVERITY_POINTS = { LOW: 10, MEDIUM: 20, HIGH: 30, CRITICAL: 40 };
export const ZONE_POINTS = { HIGH: 15, MEDIUM: 9, LOW: 4 };
export const FACTOR_MAX = { severity: 40, recurrence: 20, history: 15, daysOpen: 10, zone: 15 };

const FACTOR_LABELS = {
  severity: 'Severity',
  recurrence: 'Recurrence',
  history: 'Previous History',
  daysOpen: 'Days Open',
  zone: 'Zone Risk',
};

// Mock history of similar findings (same zone and category).
const KNOWN_HISTORY = {
  'pit-a|hemm': { prior: 3, openDays: 2 },
  'haul-road|haul': { prior: 4, openDays: 6 },
  'haul-road|hemm': { prior: 2, openDays: 4 },
  'pit-b|ppe': { prior: 2, openDays: 3 },
  'workshop|hemm': { prior: 1, openDays: 3 },
};

function hashString(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
}

export function mockHistory(zoneId, categoryId) {
  const key = `${zoneId}|${categoryId}`;
  if (KNOWN_HISTORY[key]) return KNOWN_HISTORY[key];
  const h = hashString(key);
  const prior = h % 3;
  return { prior, openDays: prior > 0 ? (h >> 3) % 5 + 1 : 0 };
}

export function levelFor(score) {
  if (score >= 90) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

const toFactors = (points) =>
  Object.keys(FACTOR_LABELS).map((key) => ({ key, label: FACTOR_LABELS[key], points: points[key], max: FACTOR_MAX[key] }));

export function computeRiskScore({ severity, zoneId, categoryId }) {
  if (!severity) return null;
  const zone = getZone(zoneId);
  const { prior, openDays } = mockHistory(zoneId, categoryId);
  const points = {
    severity: SEVERITY_POINTS[severity],
    recurrence: Math.min(FACTOR_MAX.recurrence, prior * 7),
    history: Math.min(FACTOR_MAX.history, prior * 5),
    daysOpen: Math.min(FACTOR_MAX.daysOpen, openDays),
    zone: ZONE_POINTS[zone?.risk ?? 'MEDIUM'],
  };
  const score = Object.values(points).reduce((a, b) => a + b, 0);
  const level = levelFor(score);
  return { score, level, label: `${level} PRIORITY`, factors: toFactors(points), model: MODEL_LABEL };
}

// For seeded demo records: split a fixed score into plausible factors.
export function syntheticScore(score, severity) {
  const sev = SEVERITY_POINTS[severity];
  const rest = Math.max(0, score - sev);
  const keys = ['recurrence', 'history', 'daysOpen', 'zone'];
  const caps = keys.map((k) => FACTOR_MAX[k]);
  const capSum = caps.reduce((a, b) => a + b, 0);
  const raw = caps.map((c) => (rest * c) / capSum);
  const floor = raw.map(Math.floor);
  let left = rest - floor.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => [v - Math.floor(v), i])
    .sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => {
      if (left > 0) {
        floor[i] += 1;
        left -= 1;
      }
    });
  const points = { severity: sev };
  keys.forEach((k, i) => {
    points[k] = floor[i];
  });
  const level = levelFor(score);
  return { score, level, label: `${level} PRIORITY`, factors: toFactors(points), model: MODEL_LABEL };
}
