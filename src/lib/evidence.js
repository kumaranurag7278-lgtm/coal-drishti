import { pad } from './format.js';

// ---- hashing -------------------------------------------------------------

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

// Deterministic 64-hex string. Used for seeded demo data and as a fallback.
export function pseudoHash(seed) {
  const next = xmur3(String(seed));
  return Array.from({ length: 8 }, () => next().toString(16).padStart(8, '0')).join('');
}

// Real SHA-256 when the browser allows it (HTTPS or localhost), otherwise a placeholder.
export async function sha256Hex(data) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  if (window.crypto?.subtle) {
    try {
      const digest = await window.crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      /* fall through */
    }
  }
  return pseudoHash(typeof data === 'string' ? data : `${data.byteLength}:${Date.now()}`);
}

// ---- images --------------------------------------------------------------

// Shrink photos before they go to local storage so a few evidence images do not fill it.
async function downscale(file, max = 640, quality = 0.62) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Placeholder "photo" for demos on a laptop with no camera, and for seeded records.
export function sampleImage(label = 'Sample evidence') {
  const safe = String(label).replace(/[<>&]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
<defs><pattern id="s" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="28" fill="#F2A900" fill-opacity=".16"/></pattern></defs>
<rect width="640" height="420" fill="#2A343B"/><rect y="300" width="640" height="120" fill="url(#s)"/>
<g fill="none" stroke="#8B98A2" stroke-width="3" opacity=".8"><rect x="270" y="120" width="100" height="72" rx="8"/><circle cx="320" cy="156" r="20"/><path d="M290 120l8-14h44l8 14"/></g>
<text x="320" y="238" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#D5DBE0">${safe}</text>
<text x="320" y="270" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#8B98A2">Sample image for the prototype demo</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ---- evidence records ----------------------------------------------------

export const evidenceId = (violationId, n) => `EV-${String(violationId).replace(/^VIOL-/, '')}-${pad(n, 2)}`;

function base({ id, gps, fileName, hash, preview, source }) {
  return {
    id,
    fileName,
    timestamp: new Date().toISOString(),
    latitude: gps?.available ? gps.latitude : null,
    longitude: gps?.available ? gps.longitude : null,
    hash,
    similarityStatus: 'pending', // checked later, at verification
    preview,
    source,
  };
}

export async function createEvidenceFromFile(file, { id, gps }) {
  const [buffer, preview] = await Promise.all([file.arrayBuffer(), downscale(file).catch(() => null)]);
  const hash = await sha256Hex(buffer);
  return base({ id, gps, fileName: file.name || 'evidence.jpg', hash, preview, source: 'device' });
}

export async function createSampleEvidence({ id, gps, label }) {
  const preview = sampleImage(label);
  const hash = await sha256Hex(`${id}:${preview}`);
  return base({ id, gps, fileName: 'sample-evidence.svg', hash, preview, source: 'sample' });
}
