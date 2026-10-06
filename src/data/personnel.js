// Mock personnel data for role assignment and context

export const SUPERVISORS = [
  { id: 'SUP-001', name: 'Rajesh Verma', title: 'Shift Supervisor', area: 'Pit & Haul Operations', initials: 'RV' },
  { id: 'SUP-002', name: 'Sunil Mahto', title: 'Plant Supervisor', area: 'Crusher & Processing', initials: 'SM' },
  { id: 'SUP-003', name: 'Manoj Tiwari', title: 'Workshop Supervisor', area: 'Maintenance & HEMM', initials: 'MT' },
  { id: 'SUP-004', name: 'Pooja Murmu', title: 'Environmental Supervisor', area: 'Overburden & Dumps', initials: 'PM' },
];

export const MANAGERS = [
  { id: 'MGR-001', name: 'Vikramaditya Sen', title: 'Mine Manager', area: 'Mine A Operations', initials: 'VS' },
];

export const SAFETY_OFFICERS = [
  { id: 'SAF-001', name: 'Dr. Ananya Roy', title: 'Chief Safety Officer', area: 'Mine Safety Directorate', initials: 'AR' },
];

export const AUDITORS = [
  { id: 'DGM-001', name: 'Harish Chandra', title: 'DGMS Deputy Director', area: 'Eastern Directorate', initials: 'HC' },
];

export const getSupervisor = (id) => SUPERVISORS.find((s) => s.id === id) || SUPERVISORS[0];
