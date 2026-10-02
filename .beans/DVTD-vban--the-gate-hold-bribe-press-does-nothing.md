---
# DVTD-vban
title: The gate-hold bribe press does nothing
status: completed
type: bug
priority: normal
created_at: 2026-09-25T09:08:36Z
updated_at: 2026-10-01T15:39:17Z
parent: DVTD-z2r2
---

**What:** The bribe press on the gate-hold screen settles nothing — its `onPress` is a `noop`, so a player who can afford the peel presses an enabled button and the bill does not move.

**Why:** It is an enabled, affordable-looking button that lies, on the one screen where the player is deciding whether the run ends.

## Done when

- [ ] Pressing it settles the peel from the storage the run is holding
- [ ] It stays disabled, with the shortfall stated, when the run cannot cover the bill
- [ ] Settling in full opens the retry the same way dropping configs to the bill does
- [ ] A spec covers both the affordable and the short case

## Notes

Found while doing DVTD-yqy4. The label said "Bribe from the archive" and was renamed
to "Bribe from storage" under ADR-112 D4, which settled the wallet question: the
archive never pays a peel, because progression bought outside the run must not trade
against the run (ADR-029, ADR-082).

Renaming did not wire it. The cap it displays is already the right number —
`balanceOf(frame, SHAKY_BAND)` = `balanceBeforeKb + payout − bill` — so what is
missing is the action, not the arithmetic.

Whether a peel should be payable in cash at all is the open design question. Dropping
configs is the costly route and is built; a cash settle is strictly easier, so it may
need a premium or may not belong at all. Decide that before wiring it.

## Summary of Changes

Closed in the 2026-10-01 stale-bean sweep: the code already does this. The storage settle is wired from GateOutcomeView.component through RunGate to settleFromStorage in strip.model (ADR-126), and the press is disabled when nothing can be paid (gateOutcome.viewmodel).
