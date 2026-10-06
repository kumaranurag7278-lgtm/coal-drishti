// Mock forensic & cryptographic verification engine for closure evidence.
// This is COAL DRISHTI's core differentiator: preventing gamed/fraudulent compliance.

export function evaluateClosureIntegrity(violation) {
  const originalEv = violation?.evidence?.[0];
  const closureEv = violation?.closureEvidence?.evidence?.[0];

  if (!originalEv || !closureEv) {
    return {
      status: 'INCOMPLETE',
      trustScore: 50,
      checks: [
        { label: 'Evidence completeness', passed: false, detail: 'Missing either baseline or closure evidence.' },
      ],
    };
  }

  // Check 1: Cryptographic Uniqueness (Anti-Replay Fraud)
  // If the hashes are identical, the user re-uploaded the exact same file!
  const isIdenticalHash = originalEv.hash === closureEv.hash;
  const hashCheck = {
    id: 'crypto_hash',
    label: 'Cryptographic Hash Uniqueness',
    passed: !isIdenticalHash,
    detail: isIdenticalHash
      ? 'CRITICAL WARNING: Closure photo hash matches original finding exactly. Potential duplicate/tampered upload.'
      : 'SHA-256 signatures are distinct. Image re-upload check passed.',
  };

  // Check 2: Chronological Sequence
  const origTime = new Date(originalEv.timestamp).getTime();
  const closeTime = new Date(closureEv.timestamp).getTime();
  const isChronological = closeTime >= origTime;
  const timeCheck = {
    id: 'chronology',
    label: 'Temporal Sequence Validation',
    passed: isChronological,
    detail: isChronological
      ? 'Closure timestamp post-dates initial violation detection.'
      : 'INVALID: Closure timestamp predates original violation detection.',
  };

  // Check 3: Spatial Proximity (GPS delta)
  let gpsDeltaMeters = 0;
  let gpsPassed = true;
  if (originalEv.latitude && closureEv.latitude) {
    // Approx euclidean distance in metres (1 deg ~ 111,000m)
    const dLat = (closureEv.latitude - originalEv.latitude) * 111000;
    const dLon = (closureEv.longitude - originalEv.longitude) * 96000;
    gpsDeltaMeters = Math.round(Math.sqrt(dLat * dLat + dLon * dLon));
    gpsPassed = gpsDeltaMeters <= 150; // within 150m of work zone
  }

  const gpsCheck = {
    id: 'gps_proximity',
    label: 'Zone Coordinate Corroboration',
    passed: gpsPassed,
    detail: gpsPassed
      ? `Captured within ${gpsDeltaMeters}m of reported hazard site.`
      : `Discrepancy: Closure photo captured ${gpsDeltaMeters}m away from reported hazard zone.`,
  };

  // Check 4: Simulated Visual State Change (Mock AI Computer Vision Difference)
  // Generates a deterministic delta index based on hashes
  const diffIndex = Math.min(94, Math.max(65, 75 + ((violation.id.charCodeAt(5) || 50) % 18)));
  const visionCheck = {
    id: 'visual_delta',
    label: 'Site Modification Visual Index',
    passed: true,
    detail: `Computer vision identifies ~${diffIndex}% scene variation indicating physical remediation.`,
  };

  const allPassed = hashCheck.passed && timeCheck.passed && gpsCheck.passed;
  const trustScore = isIdenticalHash ? 12 : allPassed ? 94 : 62;

  return {
    status: isIdenticalHash ? 'SUSPECT' : allPassed ? 'HIGH_TRUST' : 'FLAGGED',
    trustScore,
    diffIndex,
    checks: [hashCheck, timeCheck, gpsCheck, visionCheck],
  };
}
