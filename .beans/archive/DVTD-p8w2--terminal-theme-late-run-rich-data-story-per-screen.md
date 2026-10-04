---
# DVTD-p8w2
title: 'Terminal theme: late-run rich-data story per screen'
status: completed
type: task
priority: normal
created_at: 2026-09-01T08:43:43Z
updated_at: 2026-09-01T08:52:01Z
---

Each of the 11 terminal-theme screens gets a second complex Storybook story set deep in the run (Seafoam / Elite): near-full swatch tracks, wide builds, multiple audits, big storage figures — to judge how the screens hold up with rich data.

## Summary of Changes

One shared late-run fiction across all 11 screens: gate 11 · Seafoam / gate 12 · Elite, 1.9 MB balance, 2.5 MB storage plan, 12-slot build, three audits stacked (Cost Overrun / Marsh Mirror / Volcano Burn), 13-swatch tracks nearly full.

New stories (one per screen, appended after Mobile):
- Home → LateRun · Prep → BeforeElite · NewRun → TaggedAtSeafoam (git-tag checkout) · Shop → SeafoamShop (8 build rows, 6 offers, 2.5 MB tier current, owned git tag) · Poll → EliteGate (10-config build, 4 choices, 85% demand) · Reveal → EliteReveal (8 rows, 4 paid, ×6.2 build factor) · GateClear → SeafoamCleared (7 ledger rows, 4 changed configs) · GateHold → EliteHolds (second stateful Shelf, 7 remove rows) · Review → AfterElite · GameOver → FellAtElite (5 categories, 6 final-build rows) · Dex → NearComplete (29/30, gates tab unredacted)

Verified: lint + depcruise clean, story typecheck 0 terminal-theme errors, vitest 2622 passed / 3 pre-existing RewardScreen failures. Not committed.
