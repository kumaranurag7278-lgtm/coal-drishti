export const pad = (n, width = 4) => String(n).padStart(width, '0');

const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatTime = (d) => timeFmt.format(new Date(d)).toUpperCase();
export const formatDate = (d) => dateFmt.format(new Date(d));

export const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const isSameDay = (a, b = new Date()) => startOfDay(a).getTime() === startOfDay(b).getTime();

export const isThisWeek = (d) => {
  const diff = startOfDay().getTime() - startOfDay(d).getTime();
  return diff >= 0 && diff <= 6 * 86400000;
};

export function dayLabel(d) {
  const now = new Date();
  if (isSameDay(d, now)) return 'Today';
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (isSameDay(d, y)) return 'Yesterday';
  return formatDate(d);
}

export const formatWhen = (d) => `${dayLabel(d)}, ${formatTime(d)}`;

export const minutesBetween = (a, b = new Date()) =>
  Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));

export function formatDuration(min) {
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export const shortHash = (h) => (h ? `${h.slice(0, 4)}…${h.slice(-4)}` : '');

export const formatCoord = (n) => (typeof n === 'number' ? n.toFixed(4) : '');

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
