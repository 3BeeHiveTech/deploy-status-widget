import type { GitHubCheck, CheckResult } from "../types";

/** GitHub Actions workflow runs response shape (subset of fields we need) */
interface GitHubRunsResponse {
  total_count: number;
  workflow_runs: Array<{
    created_at: string;
    status: string;
  }>;
}

/**
 * A run stuck in queued/in_progress for longer than this is a GitHub-side
 * zombie (e.g. a corrupted re-run that never starts — observed on lambda-oasi:
 * a "queued" run 58 DAYS old that not even force-cancel could clear). Real
 * deploys finish in minutes; anything in flight for hours is not "an update
 * is coming" and must not pin the widget amber forever.
 */
const STALE_ACTIVE_RUN_MS = 3 * 60 * 60 * 1000; // 3 hours

function isFreshRun(createdAt: string | undefined): boolean {
  if (!createdAt) return true; // no timestamp — assume fresh, never hide real activity
  const age = Date.now() - new Date(createdAt).getTime();
  return Number.isFinite(age) ? age < STALE_ACTIVE_RUN_MS : true;
}

/**
 * Check GitHub Actions for in-progress or queued workflow runs.
 *
 * Makes two API calls:
 * - ?status=in_progress to find running builds
 * - ?status=queued to find queued builds
 *
 * Returns "idle" when no active runs, "in_progress" or "queued" otherwise.
 * Zombie runs (in flight longer than STALE_ACTIVE_RUN_MS) are treated as idle.
 */
export async function checkGitHub(
  check: GitHubCheck,
  token: string,
): Promise<CheckResult> {
  try {
    const baseUrl = `https://api.github.com/repos/${check.owner}/${check.repo}/actions/runs`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const [inProgressResponse, queuedResponse] = await Promise.all([
      fetch(`${baseUrl}?status=in_progress&per_page=1`, { headers }),
      fetch(`${baseUrl}?status=queued&per_page=1`, { headers }),
    ]);

    if (!inProgressResponse.ok || !queuedResponse.ok) {
      return {
        label: check.label,
        type: "github",
        status: "ERROR",
        url: check.url,
      };
    }

    const inProgressData =
      (await inProgressResponse.json()) as GitHubRunsResponse;
    const queuedData = (await queuedResponse.json()) as GitHubRunsResponse;

    if (inProgressData.total_count > 0) {
      const run = inProgressData.workflow_runs[0];
      if (isFreshRun(run?.created_at)) {
        return {
          label: check.label,
          type: "github",
          status: "in_progress",
          url: check.url,
          startedAt: run?.created_at,
        };
      }
    }

    if (queuedData.total_count > 0) {
      const run = queuedData.workflow_runs[0];
      if (isFreshRun(run?.created_at)) {
        return {
          label: check.label,
          type: "github",
          status: "queued",
          url: check.url,
          startedAt: run?.created_at,
        };
      }
    }

    return {
      label: check.label,
      type: "github",
      status: "idle",
      url: check.url,
    };
  } catch {
    return {
      label: check.label,
      type: "github",
      status: "ERROR",
      url: check.url,
    };
  }
}
