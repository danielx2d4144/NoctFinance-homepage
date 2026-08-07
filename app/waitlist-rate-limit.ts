/**
 * Sliding-window rate limiter for the signup action.
 *
 * KNOW WHAT THIS IS: process-local counters. Every serverless instance keeps
 * its own map, so the effective ceiling is the limit multiplied by however
 * many instances happen to be warm, and a scale-to-zero window resets it. That
 * is a real weakness and the honest fix is a shared store (Vercel KV, Upstash)
 * once one exists.
 *
 * It is still worth having. The attack it defeats is the cheap one — a loop
 * hitting the endpoint from a single host — and against that, per-instance
 * counters work fine, because a loop fast enough to matter keeps hitting the
 * same warm instance. It costs nothing, needs no infrastructure, and turns an
 * unbounded outbound-email amplifier into a bounded one.
 */

type Window = { hits: number[] };

const WINDOW_MS = 10 * 60 * 1000;

/** Bounds the map so a flood of distinct keys cannot grow it without limit. */
const MAX_KEYS = 5000;

const buckets = new Map<string, Window>();

/**
 * Records a hit and reports whether it is allowed.
 *
 * Callers should check the *cheapest* key first: a rejected request should not
 * consume budget on the other dimension.
 */
export function withinLimit(key: string, limit: number, now: number): boolean {
  // Opportunistic prune. Doing it inline keeps this dependency-free — there is
  // no timer to leak in an environment that freezes instances between requests.
  if (buckets.size > MAX_KEYS) {
    for (const [k, w] of buckets) {
      if (w.hits.every((t) => now - t >= WINDOW_MS)) buckets.delete(k);
    }
    // Still oversized means live traffic, not stale entries. Drop the whole map
    // rather than grow: a rare over-permissive moment beats unbounded memory.
    if (buckets.size > MAX_KEYS) buckets.clear();
  }

  const win = buckets.get(key) ?? { hits: [] };
  win.hits = win.hits.filter((t) => now - t < WINDOW_MS);

  if (win.hits.length >= limit) {
    buckets.set(key, win);
    return false;
  }

  win.hits.push(now);
  buckets.set(key, win);
  return true;
}

/** Exported for tests and for resetting between dev hot reloads. */
export function resetLimits(): void {
  buckets.clear();
}
