---
# DVTD-teim
title: Run mutations read refusals one way
status: completed
type: task
created_at: 2026-10-01T18:29:58Z
updated_at: 2026-10-01T18:29:58Z
parent: DVTD-y3vn
---

**What:** The run's start, warm boot and loot presses read a server refusal through one shared mutation hook.

**Why:** Three call sites unwrapped the response envelope by hand, each a little differently, while queries already had one reader.

## Done when

- [x] No run screen reads the response envelope by hand
- [x] Queries and mutations word an error the same way

## Notes

New useApiMutation beside useApiQuery; both share apiErrorMessageOf.

## Summary of Changes

useApiMutation added beside useApiQuery; both word errors through apiErrorMessageOf. useRunActions start, warm boot and abandon, and useLootFallenRun use it; RunStart and RunNew read errorMessage. ADR-165 D3.
