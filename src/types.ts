/** Vercel deployment check configuration */
export interface VercelCheck {
  type: "vercel";
  /** Display label (e.g. "Frontend") */
  label: string;
  /** Vercel project ID */
  projectId: string;
  /** Link to Vercel deployment dashboard */
  url?: string;
}

/** GitHub Actions check configuration */
export interface GitHubCheck {
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
export type Check = VercelCheck | GitHubCheck;

/** Configuration for the deploy status API handler */
export interface DeployStatusConfig {
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
export interface CheckResult {
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
export interface StatusResponse {
  /** Results for each configured check */
  checks: CheckResult[];
  /** True if any check is building/queued/in_progress */
  deploying: boolean;
  /** ISO 8601 timestamp of when the response was generated */
  timestamp: string;
}
