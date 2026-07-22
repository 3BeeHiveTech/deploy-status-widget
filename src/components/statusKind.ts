import type { CheckResult } from "../types";
import { COLOR_READY, COLOR_QUEUED, COLOR_ERROR } from "./styles";

/** Traffic-light state the collapsed icon reduces every check down to. */
export type AggregateKind = "operational" | "building" | "error";

/** Vercel/GitHub states that mean a build failed or was canceled. */
const ERROR_STATES = new Set(["ERROR", "CANCELED"]);

/** States that mean something is currently in flight (building or queued). */
const ACTIVE_STATES = new Set([
  "BUILDING",
  "INITIALIZING",
  "in_progress",
  "QUEUED",
  "queued",
]);

export interface AggregateStatus {
  kind: AggregateKind;
  /** Traffic-light color for the icon (red / amber / green). */
  color: string;
  /** Pulse the indicator while something is in flight. */
  animated: boolean;
}

/**
 * Reduce all per-check statuses to a single traffic-light state for the
 * collapsed icon:
 *   red    — anything errored/canceled
 *   amber  — nothing errored, but something is building/queued (pulses)
 *   green  — everything operational (ready / idle / completed)
 *
 * Worst state wins so a single failure is never hidden behind a green dot.
 */
export function getAggregateStatus(checks: CheckResult[]): AggregateStatus {
  if (checks.some((check) => ERROR_STATES.has(check.status))) {
    return { kind: "error", color: COLOR_ERROR, animated: false };
  }
  if (checks.some((check) => ACTIVE_STATES.has(check.status))) {
    return { kind: "building", color: COLOR_QUEUED, animated: true };
  }
  return { kind: "operational", color: COLOR_READY, animated: false };
}
