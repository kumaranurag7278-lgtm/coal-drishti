// Mock data for the Field Inspector dashboard. Nothing here is real.

export const INSPECTOR = {
  id: 'INS-001',
  title: 'Inspector',
  initials: 'IN',
  area: 'Pit Operations',
};

// One inspection is completed but queued offline (pending submission),
// and one is the next scheduled inspection (not started).
export const INSPECTIONS = [
  { id: 'INS-0412', zone: 'Stockyard', category: 'Workplace Safety', time: '06:45 AM', status: 'Submitted', findings: 0, checks: 8 },
  { id: 'INS-0413', zone: 'Pit B', category: 'PPE', time: '08:05 AM', status: 'Submitted', findings: 1, checks: 4 },
  { id: 'INS-0414', zone: 'Haul Road', category: 'Haul Roads', time: '09:20 AM', status: 'Pending submission', findings: 3, checks: 4 },
  { id: 'INS-0415', zone: 'Pit A', category: 'HEMM / Machinery', time: '10:15 AM', status: 'Not started', findings: 0, checks: 4 },
];

// Newest first. "Verified" is closed; everything else counts as open.
export const VIOLATIONS = [
  { id: 'V-1023', title: 'Missing reflective vest', zone: 'Pit B', severity: 'Medium', risk: 46, status: 'Open', reported: 'Today, 8:20 AM' },
  { id: 'V-1022', title: 'Edge protection damaged', zone: 'Haul Road', severity: 'High', risk: 79, status: 'Open', reported: 'Yesterday, 3:15 PM' },
  { id: 'V-1021', title: 'Poor visibility at junction', zone: 'Haul Road', severity: 'Medium', risk: 52, status: 'Assigned', reported: 'Yesterday, 11:05 AM' },
  { id: 'V-1020', title: 'Helmet not worn', zone: 'Crusher Area', severity: 'Medium', risk: 38, status: 'Open', reported: '2 days ago' },
  { id: 'V-1019', title: 'Loose material on bench', zone: 'Pit B', severity: 'High', risk: 74, status: 'In progress', reported: '2 days ago' },
  { id: 'V-1018', title: 'Faulty reverse alarm', zone: 'Workshop', severity: 'Medium', risk: 58, status: 'Awaiting verification', reported: '3 days ago' },
  { id: 'V-1016', title: 'Poor lighting at crusher feed', zone: 'Crusher Area', severity: 'Low', risk: 27, status: 'Open', reported: '6 days ago' },
  { id: 'V-1014', title: 'Ventilation fan guard missing', zone: 'Workshop', severity: 'Medium', risk: 44, status: 'Verified', reported: '9 days ago' },
];

export const HIGH_RISK_THRESHOLD = 70;

export const TASKS = [
  { id: 't1', title: 'Re-check edge protection on Haul Road', ref: 'V-1022', due: 'Today, 2:00 PM', priority: 'High' },
  { id: 't2', title: 'Submit Haul Road inspection report', ref: 'INS-0414', due: 'When back online', priority: 'Medium' },
  { id: 't3', title: 'Follow-up check on reverse alarm repair', ref: 'V-1018', due: 'Tomorrow, 9:00 AM', priority: 'Medium' },
];

export const ALERTS = [
  { id: 'a1', tone: 'danger', text: 'Edge protection on Haul Road has been reported 3 times in 30 days.', ref: 'V-1022', time: '20 min ago' },
  { id: 'a2', tone: 'warn', text: 'Rain expected after 3:00 PM. Check haul road surfaces before the afternoon shift.', ref: 'Weather advisory', time: '1 hr ago' },
  { id: 'a3', tone: 'info', text: 'Closure evidence for V-1018 is with the verification team.', ref: 'V-1018', time: '2 hrs ago' },
];

export const NEXT_INSPECTION = { zone: 'Pit A', category: 'HEMM / Machinery', due: '10:15 AM', checks: 4 };
