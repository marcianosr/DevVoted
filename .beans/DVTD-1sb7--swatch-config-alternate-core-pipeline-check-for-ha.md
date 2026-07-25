---
# DVTD-1sb7
title: Swatch config: alternate core pipeline check for harder runs
status: todo
type: story
priority: normal
created_at: 2026-07-25T07:29:53Z
updated_at: 2026-07-25T07:29:53Z
---

A "swatch" is a config/unlock that lets a player opt into a harder run variant. Installing it swaps in a second "core" pipeline check — parallel to the unit-test check — with its own pass/fail condition, so the run is judged against an additional gate rather than unit-test alone. Runs with a swatch installed should carry different (presumably richer) rewards to compensate for the added difficulty.

Sister bean: DVTD-klz2 (renames the unit-test core check terminology this idea builds on).

## Open questions

- [ ] What does a swatch actually check/require (its pass condition), distinct from unit-test?
- [ ] How is a swatch unlocked (shop item, milestone unlock, discovery system)?
- [ ] Can multiple swatches be active at once, or is it one alternate core check at a time?
- [ ] What reward differential justifies the added difficulty (storage, cosmetics, exclusive configs)?
- [ ] Does failing the swatch check end the run the same way failing unit-test does, or is it a softer penalty?

## Todos

- [ ] Brainstorm session to nail down swatch mechanics
- [ ] Decide reward structure vs. unit-test-only runs
- [ ] Spec out swatch as a new core pipeline check type alongside unit-test
