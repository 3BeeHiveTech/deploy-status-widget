# deploy-status-widget

Pacchetto React `@3bee/deploy-status-widget`: un toast che mostra lo stato dei deploy Vercel e delle GitHub
Actions, piu' `createDeployStatusHandler()` (sottopercorso `/api`) per la route lato server dell'app che lo usa.
Lo installano da GitHub `next-monorepo` e `3bee-helpdesk` (`github:3BeeHiveTech/deploy-status-widget`).

## Comandi

- `npm install`, `npm run build` (tsup, CJS + ESM + tipi in `dist/`), `npm run dev`, `npm run check-types`.
  Nessun test configurato.

## Rilascio

- Non si pubblica su npm: `dist/` e' versionato e i consumatori lo prendono dal repo. Ogni modifica a `src/`
  va committata insieme a `dist/` ricostruito con `npm run build` (e0e1ce5 se l'era dimenticato).
- I lockfile dei consumatori fissano un commit preciso: la modifica arriva solo aggiornando la dipendenza li'.

## Trappole e convenzioni

- Token Vercel e GitHub solo in `src/api/`, mai in componenti o hook (finirebbero nel bundle del browser).
- Il handler non autentica e risponde `Cache-Control: public, s-maxage=10`: la route del consumatore deve
  controllare il ruolo admin e mettere `private, no-store` (come `apps/3bee/web` in next-monorepo).
- Errori a monte diventano `status: "ERROR"` senza dettagli; ogni fetch ha il timeout di `src/api/timeout.ts`.
  Run e deploy in corso da oltre 3 ore sono trattati come fermi (zombie), non come aggiornamenti in arrivo.
- Stili solo inline in `src/components/styles.ts` (palette scura di I Love Natura): niente CSS o Tailwind,
  che chiederebbero configurazione all'app ospite. `"use client"` su componenti e hook; React 18 e 19.
- Se l'API fallisce il widget si nasconde (`return null`) e non scrive in console: non deve mai rompere l'app.
- Sicurezza: `docs/security/nodejs-serverless.md` e `docs/security/nextjs-react-frontend.md` del workspace.
