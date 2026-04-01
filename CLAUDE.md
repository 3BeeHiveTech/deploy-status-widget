# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Before starting any task**, check `.claude/agents/` for specialized subagents that may handle your task better than general-purpose coding. **Always use relative paths** in code, configs, and documentation -- never absolute filesystem paths.

## CRITICAL: Use Relative Paths Only

**NEVER use absolute filesystem paths** that include the user's home directory. This repo is shared by multiple developers, so all paths in code, documentation, agent files, commit messages, and tool output **MUST be relative to the repo root**.

## CRITICAL: Git Commit & Push Rules

**NEVER use `--no-verify` when committing or pushing to git.** All pre-commit and pre-push hooks MUST run. If a hook fails, investigate and fix the underlying issue instead of bypassing it.

## CRITICAL: Agent Registry Sync

**When adding or editing an agent in `.claude/agents/`, you MUST update this CLAUDE.md file** to reflect the change in the Subagents table below. Specifically:

- **New agent**: Add a row to the Subagents table.
- **Renamed agent**: Update the agent name in the table.
- **Deleted agent**: Remove the row from the table.
- **Changed description/purpose**: Update the "Use When" column.

## Project Overview

**deploy-status-widget** is a lightweight npm package (`@3bee/deploy-status-widget`) that shows Vercel deployment and GitHub Actions build status as a floating toast widget.

- **Stack:** TypeScript + React + tsup
- **Runtime:** Browser (React 18/19 peer dependency)
- **Styling:** Inline styles (I Love Natura dark theme palette)

## Structure

```
src/
├── api/                  # Server-side exports (./api subpath)
│   ├── handler.ts        # createDeployStatusHandler() factory
│   ├── vercel.ts         # Vercel Deployments API client
│   ├── github.ts         # GitHub Actions API client
│   └── index.ts          # API entry point
├── components/
│   ├── DeployStatusWidget.tsx   # Main widget ("use client")
│   ├── StatusToast.tsx          # Floating draggable toast
│   ├── CheckRow.tsx             # Individual check row
│   └── styles.ts                # Inline style objects
├── hooks/
│   ├── useDeployStatus.ts       # Polling hook
│   └── usePersistedPosition.ts  # Drag position persistence
├── types.ts              # Shared types
└── index.ts              # Main entry point
```

## Package Exports

- `@3bee/deploy-status-widget` -- `DeployStatusWidget` component + types
- `@3bee/deploy-status-widget/api` -- `createDeployStatusHandler()` + config types

## Commands

```bash
npm run build        # Build with tsup
npm run dev          # Watch mode
npm run check-types  # TypeScript check
```

## Consumer Integration

1. `pnpm add github:3BeeHiveTech/deploy-status-widget`
2. Create `app/api/deploy-status/route.ts` using `createDeployStatusHandler()`
3. Add `<DeployStatusWidget />` in layout (gated by admin role)
4. Set `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `GITHUB_TOKEN` env vars

## Color Palette (I Love Natura Dark Theme)

```
#041015 = dark-mode-blue-200
#09202B = dark-mode-blue-300 (container bg)
#0D3041 = dark-mode-blue-400 (hover bg)
#17506D = dark-mode-blue-600 (border)
#00F4B3 = dark-mode-regeneration-600 (building indicator)
#00DF80 = state-colors-success-400 (ready)
#F54135 = state-colors-error-600 (error)
#FF8B16 = state-colors-warning-400 (queued)
#CFDBE5 = dark-mode-blue-1100 (label text)
#AAA9A9 = black-300 (secondary text)
```

## Subagents

Specialized agents are available in `.claude/agents/` for specific workflows:

| Agent File | Name | Use When |
|---|---|---|
| `deploy-widget-feature-architect.md` | Feature Architect | Designing and implementing new features (API clients, components, hooks, build config) |
| `deploy-widget-pr-reviewer.md` | PR Reviewer | Reviewing code changes for security, type safety, build correctness, and consumer compatibility |

## Security

Follow security guidelines from the workspace `docs/security/` directory:
- **Baseline:** `docs/security/SECURITY-BASELINE.md` -- universal rules (OWASP Top 10, secrets, input validation)
- **Stack-specific:** `docs/security/nodejs-serverless.md` -- Node.js/TypeScript security
- **Infrastructure:** `docs/security/aws-infrastructure.md` -- deployment security

### Key Security Rules for This Repo

1. **No Token Exposure** -- API tokens (`vercelToken`, `githubToken`) only used in `src/api/` (server-side). Never referenced in components or hooks.
2. **No Secret Leaks** -- No hardcoded tokens, keys, or credentials anywhere in code.
3. **Upstream Error Masking** -- Handler catches errors and returns generic status, never leaks upstream API error details to the client.
4. **No Dynamic Code Execution** -- No `eval()`, `new Function()`, or `dangerouslySetInnerHTML`.
5. **SSR Safety** -- All hooks and components must handle SSR (`typeof window`, `typeof document` checks).
6. **Safe URL Handling** -- Links use `rel="noopener noreferrer"` and `target="_blank"`.
7. **Dependency Security** -- Pin versions in `package.json`. Run `npm audit` before publishing.

### Security Checklist for PRs

- [ ] No secrets in code or config
- [ ] API tokens only used server-side in `src/api/`
- [ ] Error responses don't leak upstream details
- [ ] No `eval()`/`new Function()`/`dangerouslySetInnerHTML`
- [ ] SSR-safe (`typeof window`/`typeof document` guards)
- [ ] Dependencies pinned and audited
