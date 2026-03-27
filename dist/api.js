"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/api/index.ts
var api_exports = {};
__export(api_exports, {
  createDeployStatusHandler: () => createDeployStatusHandler
});
module.exports = __toCommonJS(api_exports);

// src/api/vercel.ts
var DEPLOYING_STATES = /* @__PURE__ */ new Set(["BUILDING", "QUEUED", "INITIALIZING"]);
async function checkVercel(check, token, teamId) {
  try {
    const params = new URLSearchParams({
      projectId: check.projectId,
      limit: "3",
      target: "production"
    });
    if (teamId) {
      params.set("teamId", teamId);
    }
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
      return {
        label: check.label,
        type: "vercel",
        status: "ERROR",
        url: check.url
      };
    }
    const data = await response.json();
    const deployments = data.deployments;
    if (!deployments || deployments.length === 0) {
      return {
        label: check.label,
        type: "vercel",
        status: "READY",
        url: check.url
      };
    }
    const latest = deployments[0];
    const isDeploying = DEPLOYING_STATES.has(latest.state);
    return {
      label: check.label,
      type: "vercel",
      status: latest.state,
      url: check.url,
      startedAt: isDeploying ? new Date(latest.createdAt).toISOString() : void 0
    };
  } catch {
    return {
      label: check.label,
      type: "vercel",
      status: "ERROR",
      url: check.url
    };
  }
}

// src/api/github.ts
async function checkGitHub(check, token) {
  try {
    const baseUrl = `https://api.github.com/repos/${check.owner}/${check.repo}/actions/runs`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    const [inProgressResponse, queuedResponse] = await Promise.all([
      fetch(`${baseUrl}?status=in_progress&per_page=1`, { headers }),
      fetch(`${baseUrl}?status=queued&per_page=1`, { headers })
    ]);
    if (!inProgressResponse.ok || !queuedResponse.ok) {
      return {
        label: check.label,
        type: "github",
        status: "ERROR",
        url: check.url
      };
    }
    const inProgressData = await inProgressResponse.json();
    const queuedData = await queuedResponse.json();
    if (inProgressData.total_count > 0) {
      const run = inProgressData.workflow_runs[0];
      return {
        label: check.label,
        type: "github",
        status: "in_progress",
        url: check.url,
        startedAt: run?.created_at
      };
    }
    if (queuedData.total_count > 0) {
      const run = queuedData.workflow_runs[0];
      return {
        label: check.label,
        type: "github",
        status: "queued",
        url: check.url,
        startedAt: run?.created_at
      };
    }
    return {
      label: check.label,
      type: "github",
      status: "idle",
      url: check.url
    };
  } catch {
    return {
      label: check.label,
      type: "github",
      status: "ERROR",
      url: check.url
    };
  }
}

// src/api/handler.ts
var VERCEL_DEPLOYING = /* @__PURE__ */ new Set(["BUILDING", "QUEUED", "INITIALIZING"]);
var GITHUB_DEPLOYING = /* @__PURE__ */ new Set(["in_progress", "queued"]);
function isCheckDeploying(result) {
  if (result.type === "vercel") {
    return VERCEL_DEPLOYING.has(result.status);
  }
  if (result.type === "github") {
    return GITHUB_DEPLOYING.has(result.status);
  }
  return false;
}
function createDeployStatusHandler(config) {
  return async function GET() {
    const results = await Promise.allSettled(
      config.checks.map((check) => {
        if (check.type === "vercel") {
          return checkVercel(check, config.vercelToken, config.vercelTeamId);
        }
        return checkGitHub(check, config.githubToken);
      })
    );
    const checks = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      const check = config.checks[index];
      return {
        label: check.label,
        type: check.type,
        status: "ERROR",
        url: check.url
      };
    });
    const deploying = checks.some(isCheckDeploying);
    const response = {
      checks,
      deploying,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=10"
      }
    });
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createDeployStatusHandler
});
//# sourceMappingURL=api.js.map