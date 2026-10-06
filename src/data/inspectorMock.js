// Mock data for the Field Inspector dashboard. Nothing here is real.

export const INSPECTOR = {
  id: 'INS-001',
  name: 'Arsh Kumar',
  title: 'Inspector',
  initials: 'AK',
  area: 'Pit Operations',
};

export const HIGH_RISK_THRESHOLD = 70;

export const TASKS = [
  { id: 't1', title: 'Re-check edge protection on Haul Road', ref: 'VIOL-00479', due: 'Today, 2:00 PM', priority: 'High' },
  { id: 't3', title: 'Follow-up check on reverse alarm repair', ref: 'VIOL-00475', due: 'Tomorrow, 9:00 AM', priority: 'Medium' },
];

export const ALERTS = [
  { id: 'a1', tone: 'danger', text: 'Edge protection on Haul Road has been reported 3 times in 30 days.', ref: 'VIOL-00479', time: '20 min ago' },
  { id: 'a2', tone: 'warn', text: 'Rain expected after 3:00 PM. Check haul road surfaces before the afternoon shift.', ref: 'Weather advisory', time: '1 hr ago' },
  { id: 'a3', tone: 'info', text: 'Closure evidence for VIOL-00475 is with the verification team.', ref: 'VIOL-00475', time: '2 hrs ago' },
];

// The next scheduled inspection. Its due time is always a little after "now".
export const SCHEDULED = { zoneId: 'pit-a', categoryId: 'hemm', zone: 'Pit A', category: 'HEMM / Machinery', checks: 5 };

export function scheduledDue(now = new Date()) {
  const d = new Date(now);
  d.setMinutes(Math.ceil((d.getMinutes() + 1) / 15) * 15 + 15, 0, 0);
  return d;
}
