---
# DVTD-tgzu
title: Run screens ask one module where to go next
status: completed
type: task
created_at: 2026-10-01T18:29:58Z
updated_at: 2026-10-01T18:29:58Z
parent: DVTD-y3vn
---

**What:** Every run screen asks the run route map where its forward and back presses lead, instead of naming a screen itself.

**Why:** The phase graph lived in the route sync and again in eight screens, so a new phase or a moved screen had to be changed in many places and a screen could send the player somewhere the sync would bounce.

## Done when

- [x] No run screen names another run screen's address
- [x] The forward, back and leave-prep rules are tested as one phase graph
- [x] Every run screen behaves as before

## Notes

runRoutes.viewmodel gains nextFrom, backFrom and prepDepartureOf; useRunNavigation is the one navigate for run links. ReviewView's status check picks a gate number, not a route, so it stays.

## Summary of Changes

runRoutes.viewmodel exports RUN_ROUTES, COMMUNITY_ROUTE, nextFrom, prepBackOf, REVIEW_BACK and prepDepartureOf; useRunNavigation.hook is the one navigate for run links. RunPrep, RunShop, RunGate, RunNew, RunReview, RunOver, RunRecap, RunStart and RunCommunity name no run path. Spec proves every forward and back press lands where the sync leaves it alone. ADR-165 D1.
