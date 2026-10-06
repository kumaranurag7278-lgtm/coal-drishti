import { CheckSquare, Clock, HardHat, LayoutDashboard } from 'lucide-react';

export const SUPERVISOR_NAV = [
  { slug: '', label: 'My Tasks', to: '/supervisor', end: true, icon: LayoutDashboard },
  { slug: 'pending', label: 'Action Required', to: '/supervisor?filter=pending', icon: Clock },
  { slug: 'all', label: 'All Tasks', to: '/supervisor?filter=all', icon: CheckSquare },
];
