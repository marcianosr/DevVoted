---
# DVTD-4rrk
title: Community step in proto-run + Kanto trainer seed for /run/community
status: completed
type: task
created_at: 2026-08-04T17:48:19Z
updated_at: 2026-08-04T17:48:19Z
parent: DVTD-h175
---

Follow-up to DVTD-95k3 (Marciano: the community page should occur in both flows).

## Summary of Changes

- proto-run.tsx: reward flow is now summary → shop → community → next gate. Shop rightAction relabeled Community →; the community step renders RunCommunityBoard from simulateCommunityBoard(answeredThisGate, polls) — 7 Kanto trainers (Gary Oak 0.9 … Ash Ketchum 0.35) whose picks derive from a (trainer, poll) hash, stable across re-renders; includes gotItRight tallies and a simulated top-X% percentile. Continue button keeps the gate number (Continue to gate N →).
- src/database/seedCommunity.ts (new, npm run db:seed:community, also appended to db:refresh): idempotent per-day script — creates the 7 trainer users (fixed UUIDs ca7050ca-…, kanto.dev emails) and inserts mode=session polls_responses + polls_response_options for today's getOrCreateDailyRunSeed sequence (first SLICE_WINDOW polls), run_id null. Rerun any day tops up that day; no-ops if already seeded.
- Verified: seed ran against local DB (7 × 5 answers) + rerun no-ops; proto flow driven in browser via Playwright (configure → All right → gate → shop → Community → board renders all 5 polls with trainer chips). 1028 tests / oxlint + depcruise + tsc green.
