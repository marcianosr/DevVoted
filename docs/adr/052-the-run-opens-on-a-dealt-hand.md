# ADR-052: The run opens on a dealt hand

## Status

Accepted 2026-09-03. Supersedes [ADR-026](026-staged-onboarding-starter-stacks.md)
Decisions 1, 5, 6 and 7 (starter stacks). Amends
ADR-049 (retired): the archive slot lines stay on
the start screen, demoted below the deal.

Decisions 2 and 6 were answered by
[ADR-057](057-gate-0-is-the-calibration-gate.md) and
[ADR-062](062-the-starting-hand-is-dealt-under-guarantees.md); both are folded in
below.

## Context

Starter stacks added a second decision layer on top of the thing that is already
interesting. "Do I take a premade strategy, or understand these configs?" is a
harder opening question than the configs themselves, and the start screen had
inverted the model by deriving its deal from the stacks' contents.

Configs are both the build and effectively the run's hit points, so the dealt
configs should be the star of the screen.

## Decision

1. **A run opens on a dealt hand of five.** `startingHand` keeps its
   `userId:date` seed and its focus guarantee; `HAND_SIZE` drops from 6 to 5.
   Five reads at a glance and gives ten possible trios: variance without
   homework.
2. **The recommended picks are a marker, not a preselection.**
   `recommendedPicks(hand, maxSlots)` names a deterministic set — a focus config
   and a coverage earner — and the deal marks them.

   The original decision *installed* them at run birth, so a new player could
   open the screen and press Start. ADR-057 reversed that: gate 0 is the
   calibration gate, so the opening build has to be the player's own. Nothing is
   preselected, `RECOMMENDED_SIZE` is 2, and `withRecommendedBuild` is deleted.
3. **One config is the floor, the slots are the ceiling.** One to four picks are
   all legal openings. ADR-057 reaffirmed this and made the floor the whole rule:
   it is a floor, never a mandatory config.
4. **Starter stacks are deleted everywhere** — the model, the action and its wire
   schema, the picker, the preview list, the combo cards. The stack idea survives
   invisibly as the recommendation, and ADR-026's comparable-risk and
   honest-names rules now bind `recommendedPicks` instead of three curated cards.
5. **During configuring the hand is immutable.** Install and uninstall toggle
   build membership without moving cards between lists, so the deal renders as
   one stable, checkable list.
6. **The deal's safeguards are the pool's curation** — as it stood. The starter
   pool had distinct focus categories and a passive majority by hand, so
   dedupe-by-effect and can-trigger-today checks would have guarded against
   nothing.

   ADR-062 shipped the safeguards ahead of the pool swap, and **neither
   anticipated check was among them**: dedupe-by-effect is redundant while focus
   categories are unique, and can-trigger-today is ill-defined for a 13-day run.
   The draw enforces a slot-budget filter, a pairability floor and a 1–2 focus
   band instead.

| Number | Value |
| --- | --- |
| `HAND_SIZE` | 5 |
| `RECOMMENDED_SIZE` | 2, advisory (ADR-057) |
| Start floor / ceiling | 1 config / `BASE_SLOTS` |

## Consequences

- `state.available` no longer shrinks on install, so benches that want only
  uninstalled cards filter against the build.
- The production configure screen is bench-only; its stack mode and the
  "Back to stacks" detour are gone.
- A tagged run (ADR-036) still deals a hand today. Whether it should skip the
  deal is unimplemented and undecided.
