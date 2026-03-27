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
 * Top-level deploy status widget component.
 *
 * Renders a floating, draggable, dismissable toast when deployments
 * are in progress. Renders nothing when idle or on error.
 *
 * Dismiss is session-only (React state). Refreshing the page
 * resets the dismiss — the widget always shows if something is building.
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
