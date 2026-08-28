---
# DVTD-3flx
title: Unrented spots hatch, free spots stay dashed
status: completed
type: task
created_at: 2026-08-28T10:59:49Z
updated_at: 2026-08-28T10:59:49Z
---

The pipeline track drew the room above the held rung with the same dashed border it uses for a spot standing open, so two states that need different answers looked identical.

- [x] bg-hatched utility in app.css
- [x] SpotTrack's ungranted stub hatches, keeps a solid edge, carries no label
- [x] Stale hover copy: gates stopped granting spots
- [x] Specs, stories, CHANGELOG, wiki

## Summary of Changes

- New `@utility bg-hatched` in `app.css`: a 135-degree repeating-linear-gradient in `--color-edge-strong`. A utility rather than a plain class so the track can hang a hover on it, matching the file's stated convention.
- `SpotTrack`'s `UNGRANTED` went from `border-dashed border-zinc-600` to `border-edge bg-hatched`. Free room keeps `border-dashed`. The stub stays one spot wide and unlabelled: printing a gate on it would promise a widening gates no longer hand out (ADR-044), which is exactly what the mock's "gate 3" / "gate 6" captions did.
- `UNLOCK_HINT` was "Clear gates to unlock more spots", which the ADR-044 amendment falsified. Now "Rent a wider storage plan for more spots".
- Boy-scout on a stale story: `AfterTheFirstWidening` at `spots: 6` named a rung the ladder no longer sells; it is `OnARentedRung` at 8. New story `RoomFreeAndRoomUnrented` puts the two treatments side by side.
- `app.css` was already prettier-dirty at HEAD on an unrelated line (`calc(c * ...)`), so it was left unformatted rather than reformatted wholesale. The added block is clean.
- Verified: lint clean, tsc clean, 2561 passed / 3 failed (the documented RewardScreen baseline, DVTD-9dn0).
