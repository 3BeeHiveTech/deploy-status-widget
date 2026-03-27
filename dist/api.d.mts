/** Vercel deployment check configuration */
interface VercelCheck {
    type: "vercel";
    /** Display label (e.g. "Frontend") */
    label: string;
    /** Vercel project ID */
    projectId: string;
    /** Link to Vercel deployment dashboard */
    url?: string;
}
/** GitHub Actions check configuration */
interface GitHubCheck {
    type: "github";
    /** Display label (e.g. "lambda-oasi") */
    label: string;
    /** GitHub repo owner (e.g. "3BeeHiveTech") */
    owner: string;
    /** GitHub repo name (e.g. "lambda-oasi") */
    repo: string;
    /** Link to GitHub Actions page */
    url?: string;
}
/** Union of all check types */
type Check = VercelCheck | GitHubCheck;
/** Configuration for the deploy status API handler */
interface DeployStatusConfig {
    /** Vercel API token (server-side only) */
    vercelToken: string;
    /** Vercel team ID for team-scoped API calls */
    vercelTeamId?: string;
    /** GitHub personal access token with actions:read scope */
    githubToken: string;
    /** List of checks to run */
    checks: Check[];
}
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

/**
 * Factory that creates a Next.js App Router compatible GET handler.
 *
 * Usage in consumer app:
 * ```ts
 * // app/api/deploy-status/route.ts
 * import { createDeployStatusHandler } from "@3bee/deploy-status-widget/api";
 *
 * export const GET = createDeployStatusHandler({
 *   vercelToken: process.env.VERCEL_TOKEN!,
 *   githubToken: process.env.GITHUB_TOKEN!,
 *   checks: [
 *     { type: "vercel", label: "Frontend", projectId: "my-project" },
 *   ],
 * });
 * ```
 */
declare function createDeployStatusHandler(config: DeployStatusConfig): () => Promise<Response>;

export { type Check, type CheckResult, type DeployStatusConfig, type GitHubCheck, type StatusResponse, type VercelCheck, createDeployStatusHandler };
