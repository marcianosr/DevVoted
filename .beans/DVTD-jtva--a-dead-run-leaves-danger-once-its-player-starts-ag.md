---
# DVTD-jtva
title: A dead run leaves DANGER once its player starts again
status: completed
type: bug
priority: normal
created_at: 2026-10-14T14:53:15Z
updated_at: 2026-10-14T14:58:58Z
---

**What:** The community board stops listing a player in DANGER once they started a new run after dying.

**Why:** A player who died and started again read as still being in danger.

## Done when
- [x] A fallen run whose player has a live run sits in no outcome row
- [x] A fallen run whose player has not started again stays in DANGER
- [x] The decision record states the reversal
- [x] The changelog names the fix

## Notes
Reverses the 2026-10-03 amendment of ADR-176. A restarted player's corpse is now only reachable for looting from the climb map's fallen chips. The day's records still count the dead run.

## Summary of Changes

outcomesOf takes the set of players with a live run and drops them from DANGER; the community service passes it from the active rows. Records still count the fallen run. ADR-176 gained a 2026-10-14 amendment reversing the 2026-10-03 one, and the wiki is updated.
