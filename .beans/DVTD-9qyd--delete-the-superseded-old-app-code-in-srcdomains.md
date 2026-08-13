---
# DVTD-9qyd
title: Delete the superseded old-app code in src/domains
status: todo
type: task
priority: normal
created_at: 2026-08-13T11:18:20Z
updated_at: 2026-08-13T11:18:20Z
parent: DVTD-82c4
blocked_by:
    - DVTD-17b3
---

Act on the audit: delete what the new engine replaced, rather than restructuring it into `src/modules/`.

Deleting beats migrating here. No ADR-002 naming decisions, no arch-rule fixes, no repointing importers — the rules stop applying to code that is gone. The account slice (DVTD-wj1t) was worth migrating because auth is the app's front door and nothing was replacing it; the old run engine is a different case.

Expected shape once the audit lands:

- **delete** — old engine (`runs/prototype/`), old config system (`economy/data/configs.ts`, 1134 lines), old scoring/turn/pipeline services, and whatever else is proto-only or unreachable
- **keep and migrate later** — polls authoring, borders
- **retire alongside** — the `legacy-*` dependency-cruiser rules, and the `src/domains/` exemption in `no-circular-runtime` (which currently hides two real cycles: `Login`↔`_authed` is already fixed, `progress.service`↔`turn.service` remains)

Also in scope: `routes/proto-session-slice.tsx` and `routes/proto-run.tsx` are the only consumers of some of this. Decide whether the dev rigs keep earning their keep or go with the code they drive.

## Todo
- [ ] Delete the proto-only and unreachable files the audit names
- [ ] Decide the fate of proto-session-slice.tsx and proto-run.tsx
- [ ] Retire the legacy-* arch rules that no longer have anything to guard
- [ ] Drop the src/domains exemption from no-circular-runtime once the tree is clean
- [ ] Re-scope DVTD-wj1t to whatever genuinely remains
