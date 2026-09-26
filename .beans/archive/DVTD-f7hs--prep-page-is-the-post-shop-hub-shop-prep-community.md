---
# DVTD-f7hs
title: Prep page is the post-shop hub (shop ↔ prep ↔ community, gate starts from prep)
status: completed
type: feature
priority: normal
created_at: 2026-08-11T17:39:30Z
updated_at: 2026-08-11T18:12:54Z
---

Playtest direction (2026-08-11): after the shop the player should land on the build-prep page, not the community board. From prep: (a) return to the shop and keep customizing until the next day's polls open, (b) get nudged to the community page, (c) start the next gate (with countdown when polls aren't open yet — useNextPollsCountdown already exists on community).

Implementation: finish-reward moves from the shop exit to prep's "Start gate" button, so the run stays in "rewarding" overnight and the shop stays open (rollover appends segments regardless of status, queries.ts:353).

- [x] Route sync: prep allowed during "rewarding" (fourth page turn)
- [x] RunShop exit navigates to /run/prep (no finish-reward)
- [x] RunPrep hub: back-to-shop, community nudge, start-gate fires finish-reward; countdown lock while polls exhausted
- [x] Proto-run mirrors: rewardStep summary → review → shop → prep (community as side trip); answering prep beat removed
- [x] Tests (runRoutes, RunLayout, PrepScreen) + ADR-032 + wiki §2.1/§5.1/§5.2 + CHANGELOG

## Summary of Changes

- finish-reward moved to prep: RunPrep is status-aware — while rewarding it offers Back-to-shop / Community / Start-gate (sendWith finish-reward, then /run/answer); while answering it stays the deep-link stake page.
- RunView gains pollsExhausted (status-agnostic, unlike awaitingTomorrow); PrepScreen gains startLock and sheds the dead editing/onDropConfig/onEditPipeline props (Edit-pipeline button was already cut). PrepScreen spec repaired in the same pass (3 pre-existing reds: stale strip copy + edit-button test).
- RunCommunity back-link targets /run/prep while rewarding so the detour returns to the hub.
- Storage-overflow clamp now lands on prep Start-gate (finishReward unchanged) — wiki §5.1 notes overflow survives shop/prep/community detours.
