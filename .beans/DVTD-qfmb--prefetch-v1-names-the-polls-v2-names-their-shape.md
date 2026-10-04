---
# DVTD-qfmb
title: Prefetch v1 names the polls, v2 names their shape
status: completed
type: feature
priority: normal
created_at: 2026-09-30T08:53:54Z
updated_at: 2026-09-30T09:20:36Z
parent: DVTD-72d9
---

**What:** Prefetch gains a second version: v1 reveals this gate's and next gate's categories, v2 adds the option counts and the multiple-answer count.

**Why:** One boolean revealed everything at v1, so the config could not be upgraded and the shop had nothing to sell it.

## Done when
- [x] At v1 prep reveals the categories of this gate and the next and seals the answer types and option counts
- [x] At v2 prep reveals all four facts and the count line reads 4 of 4
- [x] The card states what v2 adds, and the upgrade press names it
- [x] Under 510 Not Extended a v2 Prefetch seals its shape rows for the gate

## Notes

Design settled 2026-09-29 (ADR-158). The brief's v1 (this gate only) was rejected as strictly weaker than git rebase -i v1 at the same weight, since the kanto reveal is prep-only. One axis per version: which polls, then what shape.

## Summary of Changes

`maxLevel: 2` on Prefetch; `showsPollShape` gates `answerTypesThisGate` and `optionCountsThisGate` in the run view (through `liveConfigsOf`, so 510 flattens it). Prep's five-polls ledger counts four facts, seals the next-gate row too when nothing reveals, reads `2 of 4` at v1 with a note naming what v2 adds, and `4 of 4` at v2. Description, gives and upgrade preview derive by version. Stories at v2 for the poll and prep; fixtures `kantoPrepPrefetched` (v2) and `kantoPrepPrefetchedAtV1`. ADR-158 D2.
