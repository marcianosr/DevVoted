---
# DVTD-ufem
title: The shop's exit lock over the covered space is enforced by the engine
status: todo
type: task
created_at: 2026-10-01T18:43:09Z
updated_at: 2026-10-01T18:43:09Z
parent: DVTD-y3vn
---

**What:** Leaving the shop while the build is heavier than the space its balance covered is refused by the engine, not only by the shop screen.

**Why:** Today only the screen shuts the exit; a client posting the leave action directly walks out over the cap and keeps the extra room for free.

## Done when

- [ ] Leaving the shop over the covered space is refused by the engine
- [ ] The balance simulation sheds weight the way a player must, and its win-rate guards still hold
- [ ] The wiki's build space section states the lock without qualification

## Notes

Found while landing DVTD-e083 (ADR-167, "Not decided here"). Adding `buildSpaceOf(state).overflow > 0` to `prepHold` in runAction.model is the one-line fix, and it passes the shop tests, but it fails three ADR-161 balance guards in runAction.model.spec ("the balance the whole engine holds"): the simulation's policy never sells, so a capped run stalls in the shop forever. Decide how the simulation sheds weight (sell cheapest until it fits?) before enforcing.
