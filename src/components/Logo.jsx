import { BRAND } from '../config/brand.js';

// The eye ("drishti" means sight). The offset rings in the pupil are the
// benches of an open-cast pit seen from above.
export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="#151B20" stroke="#3A4650" />
      <g fill="none" stroke="#F2A900">
        <path d="M3 16c4.5-6 9-8.5 13-8.5s8.5 2.5 13 8.5c-4.5 6-9 8.5-13 8.5S7.5 22 3 16Z" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="5.5" strokeWidth="1" opacity=".55" />
        <circle cx="16.4" cy="16.4" r="3.6" strokeWidth="1" opacity=".8" />
      </g>
      <circle cx="16.8" cy="16.8" r="1.7" fill="#F2A900" />
    </svg>
  );
}

export default function Logo({ size = 32, showName = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showName && (
        <span className="font-display text-2xl font-semibold leading-none tracking-wider">{BRAND.name}</span>
      )}
    </span>
  );
}
