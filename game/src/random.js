// Gobble Run — a small seeded random number generator.
//
// mulberry32 again (it is the right size for a job like this):
// the same seed always grows the same run of obstacles, so the
// screenshot scenes and every player's first escape attempt
// meet the identical farm.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rng(seed) {
  const next = mulberry32(seed);
  return {
    next,
    range: (lo, hi) => lo + next() * (hi - lo),
    chance: (p) => next() < p,
  };
}
