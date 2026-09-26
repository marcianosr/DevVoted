---
# DVTD-h6ho
title: Failed gate detours to community after strip
status: completed
type: feature
priority: normal
created_at: 2026-07-25T14:33:34Z
updated_at: 2026-07-25T14:37:40Z
parent: DVTD-u35m
---

After a failed gate (pipeline failure), the strip screen's continue action should mirror the shop's success path: commit resume-climb, then detour to /run/community before the climb resumes.

- [x] RunStrip: commit resume-climb via sendWith, then navigate to /run/community
- [x] Align CTA label with the shop's community-bound button
- [x] Update CHANGELOG.md (player-visible flow change)

## Summary of Changes

- `RunStrip.component.tsx`: the strip screen's continue action now mirrors `RunShop`'s detour — `sendWith({ type: "resume-climb" })`, commit the returned view, then navigate to `/run/community`. CTA relabeled from "Climb on →" to "How you compared →" (the community page owns "Climb on →", matching the shop flow).
- `CHANGELOG.md`: Unreleased entry — failed gates take the community breather before the climb resumes.
- Verified: tsc, oxlint + arch clean. 3 failing run-module tests (RewardScreen ×1, RunHud ×2) pre-date this change — they fail at HEAD too.
