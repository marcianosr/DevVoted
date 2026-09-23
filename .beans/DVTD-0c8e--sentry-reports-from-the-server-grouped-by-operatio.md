---
# DVTD-0c8e
title: Sentry reports from the server, grouped by operation
status: in-progress
type: task
priority: high
created_at: 2026-09-23T12:28:27Z
updated_at: 2026-09-23T12:39:24Z
parent: DVTD-uwf9
---

`@sentry/react` is the browser SDK and the only one installed. It is `init`-ed once at module scope in `src/routes/__root.tsx:24-29` with a hardcoded DSN and nothing else configured. But five of the six `captureException` call sites run server-side, where no client was ever bound — so every server-function failure a player hits is invisible today.

## Todo

- [x] Add `src/shared/utils/errorReporting.ts` owning the reporting policy (level, tags, fingerprint), still on `@sentry/react`
- [x] Move all six call sites onto it; repoint the two existing `vi.mock("@sentry/react")` lines
- [x] Swap the SDK: `npm i @sentry/tanstackstart-react`, `npm rm @sentry/react`; verify `npm ls @sentry/core` prints one version
- [x] Add `src/instrument.client.ts` + `src/instrument.server.ts`, gated on the DSN not on PROD
- [x] Add `src/client.tsx`, `src/server.ts` (wrapFetchWithSentry), `src/start.ts` (the two global middlewares)
- [x] Strip `Sentry.init` from `__root.tsx`; add the browser tracing integration in `src/router.tsx`
- [x] `sendDefaultPii: false` + `setUser({ id })` in `fetchUser`
- [x] `vite.config.ts`: `__COMMIT_SHA__` / `__DEPLOY_ENVIRONMENT__` defines + `sentryTanstackStart` plugin
- [x] Make `handleApiOperation`'s operation name required; name all ~24 call sites
- [x] Report from `DefaultCatchBoundary` (the global middleware does not catch SSR render errors)
- [x] `.env.sample` (Vercel env vars still to set by hand) (VITE_SENTRY_DSN, SENTRY_AUTH_TOKEN)
- [ ] Sentry alert rules on new issues in environment:production

## Notes

- `@sentry/react` must be REMOVED, not kept: the new package pins `@sentry/react@10.75.2` exactly, so a `^10.63.0` top-level dep installs a nested duplicate — two `@sentry/core` instances, and captures land on a client that was never init-ed.
- The package's export map has `node`/`browser` conditions and no `default`, so one import specifier resolves correctly in both bundles. No isomorphic shim needed for that.
- `sendDefaultPii: true` on the server attaches request headers, and auth here is Supabase cookies — one 500 would ship a live access token into a Sentry issue.
- The second arg of `handleApiOperation` is passed at only 2 of ~24 sites, so fingerprinting by operation is worthless until it is required.
- Sourcemap auth token goes on Vercel (build-time), not GitHub — deploys run through the Vercel Git integration, CI only runs `supabase db push`.

## Verification (2026-09-23)

- `npx tsc --noEmit` — clean
- `npm run lint` — oxlint clean (4 pre-existing warnings in stories files), depcruise `✔ no dependency violations found (683 modules, 3146 dependencies cruised)`, docs:check in sync
- `npm run format:check` — clean
- `npm test` — **183 files / 3554 tests, all passing** (up from 181/3538: 2 new spec files, 13 new tests)
- `NODE_ENV=production npx vite build` — succeeds; server output carries `@sentry/node` + `wrapFetchWithSentry` + `globalMiddleware`, client output carries `captureException` and no Node SDK
- `npm ls @sentry/core` — single version 10.75.2, fully deduped

## Still to do by hand (dashboard, not code)

- [ ] Set `VITE_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` in Vercel project settings (Production + Preview; the auth token is build-time)
- [ ] Tick 'Enable access to System Environment Variables' in Vercel, or `VERCEL_ENV`/`VERCEL_GIT_COMMIT_SHA` are absent and the fallbacks silently produce `mode`/local sha
- [ ] Sentry alert rule: any new issue in `environment:production`
- [ ] After the first real deploy, confirm events say `environment: "production"` and carry a readable stack frame

## Notes from implementation

- The old hardcoded DSN (`o4510300365651968`) was removed from the repo. It is public by design, but it now comes from env so previews and production separate.
- `sourcemaps.disable` is nested under `sourcemaps`, not top-level as first designed.
- Asserting on the Sentry capture options needed `toHaveBeenCalledWith` + `expect.objectContaining`: the second parameter is a union (`ExclusiveEventHintOrCaptureContext`) and indexing into it would have required a cast.
