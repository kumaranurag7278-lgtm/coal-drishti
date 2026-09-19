import { BRAND } from '../config/brand.js';

// Three offset ellipses: the benches of an open-cast pit seen from above.
export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="6" fill="#2F72B8" />
      <g fill="none" stroke="#fff" strokeWidth="1.6">
        <ellipse cx="16" cy="17" rx="11" ry="8.5" opacity=".5" />
        <ellipse cx="16.6" cy="17.4" rx="7.6" ry="5.8" opacity=".75" />
        <ellipse cx="17.2" cy="17.8" rx="4.2" ry="3.1" />
      </g>
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
