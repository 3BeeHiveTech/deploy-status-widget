import type { VercelCheck, CheckResult } from "../types";

/** Vercel deployment states that indicate an active build */
const DEPLOYING_STATES = new Set(["BUILDING", "QUEUED", "INITIALIZING"]);

/** Vercel deployment response shape (subset of fields we need) */
interface VercelDeployment {
  state: string;
  createdAt: number;
}

interface VercelDeploymentsResponse {
  deployments: VercelDeployment[];
}

/**
 * Check the latest Vercel production deployments for a project.
 *
 * Maps Vercel deployment states:
 * - BUILDING | QUEUED | INITIALIZING -> deploying
 * - READY | ERROR | CANCELED -> idle
 */
export async function checkVercel(
  check: VercelCheck,
  token: string,
  teamId?: string,
): Promise<CheckResult> {
  try {
    const params = new URLSearchParams({
      projectId: check.projectId,
      limit: "3",
      target: "production",
    });

    if (teamId) {
      params.set("teamId", teamId);
    }

    const response = await fetch(
      `https://api.vercel.com/v6/deployments?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      return {
        label: check.label,
        type: "vercel",
        status: "ERROR",
        url: check.url,
      };
    }

    const data = (await response.json()) as VercelDeploymentsResponse;
    const deployments = data.deployments;

    if (!deployments || deployments.length === 0) {
      return {
        label: check.label,
        type: "vercel",
        status: "READY",
        url: check.url,
      };
    }

    const latest = deployments[0];
    // Same zombie guard as GitHub: a deployment "in flight" for hours is a
    // stuck artifact, not an incoming update (see STALE_ACTIVE_RUN_MS rationale
    // in github.ts). 3 hours is far beyond any real Vercel build.
    const ageMs = Date.now() - latest.createdAt;
    const isStale = Number.isFinite(ageMs) && ageMs > 3 * 60 * 60 * 1000;
    const isDeploying = DEPLOYING_STATES.has(latest.state) && !isStale;

    // The widget aggregates on the raw `status` string (statusKind
    // ACTIVE_STATES), so a stale in-flight state must not leak through or it
    // pins the traffic light amber forever — surface it as READY instead.
    const status = isStale && DEPLOYING_STATES.has(latest.state) ? "READY" : latest.state;

    return {
      label: check.label,
      type: "vercel",
      status,
      url: check.url,
      startedAt: isDeploying
        ? new Date(latest.createdAt).toISOString()
        : undefined,
    };
  } catch {
    return {
      label: check.label,
      type: "vercel",
      status: "ERROR",
      url: check.url,
    };
  }
}
