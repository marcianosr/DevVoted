---
# DVTD-9ney
title: Starting hand is a draw, not a fixed list
status: completed
type: task
priority: normal
created_at: 2026-08-26T16:12:37Z
updated_at: 2026-08-26T16:16:47Z
parent: DVTD-2try
---

The pre-run hand becomes a seeded draw of 6 from the starter pool, guaranteeing at least one focus config. First slice of DVTD-2try: the machinery the account-level pool will later feed, built while the pool is still the fixed starter set.

Design recorded in DVTD-2try: Grant gates the hand, never the shelf; stacks are the curated path, the draw is the found path.

- [x] `shuffleSeeded` on the existing `~/shared/lib/seededRandom`
- [x] `hand.model.ts`: STARTER_POOL, HAND_SIZE, startingHand with the focus guarantee
- [x] `pickStack` stops requiring members in `available` (would silently no-op on a draw)
- [x] Wire `run.service.ts`, drop HANDED_CONFIGS
- [x] Specs

## Summary of Changes

The opening hand is now a seeded draw of 6 rather than a fixed 10.

- `shuffleSeeded` added to `~/shared/lib/seededRandom` (reuses the existing `SeededRandom` LCG rather than adding a third copy of a PRNG — `draft.model.ts` and `seed.model.ts` each already carry one).
- `config/domain/hand.model.ts`: `STARTER_POOL` (the ten `HANDED_CONFIGS` was, moved into the domain as roster data), `HAND_SIZE = 6`, and `startingHand(pool, seed)` guaranteeing at least one focus config — reaching into the undealt half to trade the last card when the draw comes up with none.
- `pickStack` no longer requires its members to be in `available`. It used to no-op silently otherwise, which was survivable while the hand held all nine stack members and fatal the moment it became a draw of six.
- `run.service.ts` draws with seed `${userId}:${date}`. Per player, not shared: the poll sequence is the shared thing (ADR-009), the hand is what you personally opened with.
- Boy-scout: removed a dead `import {} from ...` in `runAction.model.ts`.

Pool is deliberately NOT the full roster: handed configs are free and WTFPL alone lists at 512KB. `STARTER_POOL` is the seam the unlock system grows.

Verified: tsc clean, lint + dependency-cruiser clean (768 modules), 2413 tests pass. The 3 remaining failures are pre-existing in `RewardScreen.spec.tsx`.

### Left for later

- proto-run still hands the entire roster and does not draw, per the "proto-run stays fully unlocked" decision. The draw is therefore not playtestable from there.
- Widening `STARTER_POOL` (it holds 3 focus configs of 10, so the guarantee fires ~3% of the time) is the next tuning knob.
- Picking a stack then unslotting a member leaves that config in `available`, so a player can mix one stack config into a drawn hand. Reads as a feature (start from Safe start, swap one) rather than a leak.
