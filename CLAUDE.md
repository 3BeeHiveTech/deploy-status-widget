# Deploy Status Widget

Lightweight npm package that shows Vercel deployment and GitHub Actions build status as a floating toast widget.

## Stack

- **Build**: tsup (ESM + CJS + .d.ts)
- **Runtime**: React 18/19 (peer dependency)
- **Drag**: react-draggable
- **Styling**: Inline styles (I Love Natura dark theme palette)

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

- `@3bee/deploy-status-widget` — `DeployStatusWidget` component + types
- `@3bee/deploy-status-widget/api` — `createDeployStatusHandler()` + config types

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

## Security

- API tokens are server-side only (never in browser code)
- Widget component has no access to tokens
- API handler catches errors gracefully, never leaks upstream details
