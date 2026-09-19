import { useMemo } from 'react';

// Contour lines around an open-cast pit, drawn as a topographic map.
// Every fifth line is an "index contour" (heavier), as on survey maps.
// The dotted spiral is the haul-road ramp winding down the pit.

const wobble = (t, phase) =>
  1 + 0.055 * Math.sin(2 * t + phase) + 0.035 * Math.sin(3 * t + phase * 1.7) + 0.018 * Math.sin(7 * t + phase * 0.6);

function ring(r, phase, cx, cy, squash, steps = 140) {
  let d = '';
  for (let s = 0; s <= steps; s += 1) {
    const t = (s / steps) * Math.PI * 2;
    const w = wobble(t, phase);
    d += `${s === 0 ? 'M' : 'L'}${(cx + r * w * Math.cos(t)).toFixed(1)} ${(cy + r * w * squash * Math.sin(t)).toFixed(1)}`;
  }
  return `${d}Z`;
}

function ramp(cx, cy, squash, r0, r1, turns, gap, first, steps = 420) {
  let d = '';
  for (let s = 0; s <= steps; s += 1) {
    const u = s / steps;
    const t = u * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * u;
    const w = wobble(t, ((r - first) / gap) * 0.09);
    d += `${s === 0 ? 'M' : 'L'}${(cx + r * w * Math.cos(t)).toFixed(1)} ${(cy + r * w * squash * Math.sin(t)).toFixed(1)}`;
  }
  return d;
}

export default function TopoBackdrop({
  width = 900,
  height = 900,
  cx = 620,
  cy = 650,
  rings = 26,
  first = 34,
  gap = 14,
  growth = 0.35,
  squash = 0.78,
  showRamp = true,
  className = '',
}) {
  const { lines, spiral } = useMemo(() => {
    const lines = Array.from({ length: rings }, (_, i) => ({
      d: ring(first + i * gap + i * i * growth, i * 0.09, cx, cy, squash),
      index: i % 5 === 0,
    }));
    const outer = first + (rings - 1) * gap + (rings - 1) ** 2 * growth;
    return { lines, spiral: ramp(cx, cy, squash, first + 30, outer * 0.62, 4, gap, first) };
  }, [rings, first, gap, growth, cx, cy, squash]);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="#fff" strokeLinejoin="round">
        {lines.map((l, i) => (
          <path key={i} d={l.d} strokeOpacity={l.index ? 0.17 : 0.075} strokeWidth={l.index ? 1.4 : 1} />
        ))}
      </g>
      {showRamp && (
        <path d={spiral} fill="none" stroke="#8DB8E6" strokeOpacity=".45" strokeWidth="2.2" strokeDasharray="1 7" strokeLinecap="round" />
      )}
    </svg>
  );
}
