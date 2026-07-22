import * as react_jsx_runtime from 'react/jsx-runtime';

interface DeployStatusWidgetProps {
    /** API endpoint path (default "/api/deploy-status") */
    apiPath?: string;
    /** Polling interval in ms (default 30000) */
    pollInterval?: number;
    /** Initial position if no saved position exists */
    defaultPosition?: {
        x: number;
        y: number;
    };
}
/**
 * Top-level deploy status widget.
 *
 * Collapsed by default into a small draggable traffic-light icon
 * (green = operational, amber = building, red = error). Clicking the icon
 * expands the full StatusToast panel; the panel's ✕ collapses back to the icon.
 * Renders nothing only when there is no data yet or the request errored.
 *
 * Collapse/expand is session state (React) — a refresh reopens collapsed.
 *
 * The widget is ANCHORED top-right in both states and no longer persists a drag
 * position. Persisting it (shared between the small pill and the wide panel)
 * stranded the collapsed pill "in the middle" whenever a stale/mismatched
 * coordinate was reused, so we drop persistence entirely: both states default to
 * their (viewport-clamped) top-right anchor on every open/close. Dragging still
 * works within a single open panel; collapsing re-pins top-right.
 */
declare function DeployStatusWidget({ apiPath, pollInterval, defaultPosition, }: DeployStatusWidgetProps): react_jsx_runtime.JSX.Element | null;

/** Individual check result returned from the API */
interface CheckResult {
    /** Display label */
    label: string;
    /** Check provider type */
    type: "vercel" | "github";
    /** Current status string */
    status: string;
    /** Link to deployment/actions dashboard */
    url?: string;
    /** When the current build started (ISO 8601) */
    startedAt?: string;
}
/** API response shape */
interface StatusResponse {
    /** Results for each configured check */
    checks: CheckResult[];
    /** True if any check is building/queued/in_progress */
    deploying: boolean;
    /** ISO 8601 timestamp of when the response was generated */
    timestamp: string;
}

export { type CheckResult, DeployStatusWidget, type DeployStatusWidgetProps, type StatusResponse };
