/**
 * Upper bound for every upstream call (Vercel / GitHub REST APIs).
 *
 * Without it a hung upstream connection keeps the consumer's serverless
 * function alive until the platform kills it (60 s on Vercel), which surfaces
 * as a hard 504 "Runtime Timeout Error" instead of a per-check ERROR status.
 * The signal also bounds reading the response body. 8 s is far above the
 * normal latency of these endpoints (well under 1 s) and far below any
 * function limit, so the aggregate handler always answers.
 */
export const UPSTREAM_TIMEOUT_MS = 8000;

/** A fresh AbortSignal that aborts after UPSTREAM_TIMEOUT_MS. */
export function upstreamSignal(): AbortSignal {
  return AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
}
