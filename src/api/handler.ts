import type { DeployStatusConfig, CheckResult, StatusResponse } from "../types";
import { checkVercel } from "./vercel";
import { checkGitHub } from "./github";

/** Deploying status values for Vercel checks */
const VERCEL_DEPLOYING = new Set(["BUILDING", "QUEUED", "INITIALIZING"]);

/** Deploying status values for GitHub checks */
const GITHUB_DEPLOYING = new Set(["in_progress", "queued"]);

/**
 * Determine if a check result indicates an active deployment.
 */
function isCheckDeploying(result: CheckResult): boolean {
  if (result.type === "vercel") {
    return VERCEL_DEPLOYING.has(result.status);
  }
  if (result.type === "github") {
    return GITHUB_DEPLOYING.has(result.status);
  }
  return false;
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
export function createDeployStatusHandler(config: DeployStatusConfig) {
  return async function GET(): Promise<Response> {
    const results = await Promise.allSettled(
      config.checks.map((check) => {
        if (check.type === "vercel") {
          return checkVercel(check, config.vercelToken, config.vercelTeamId);
        }
        return checkGitHub(check, config.githubToken);
      }),
    );

    const checks: CheckResult[] = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      /* Check failed entirely — return error result */
      const check = config.checks[index];
      return {
        label: check.label,
        type: check.type,
        status: "ERROR",
        url: check.url,
      };
    });

    const deploying = checks.some(isCheckDeploying);

    const response: StatusResponse = {
      checks,
      deploying,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=10",
      },
    });
  };
}
