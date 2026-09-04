# ADR-052: The run opens on a dealt hand

## Status

Accepted 2026-09-03. Supersedes ADR-026 Decisions 1, 5, 6 and 7 (starter
stacks). Amends ADR-049 (the archive slot lines stay on the start screen,
demoted below the deal).

## Context

Starter stacks added a second decision layer on top of the thing that is
already interesting: "do I take a premade strategy, or understand these
configs?" is a harder opening question than the configs themselves, and the
terminal start screen had inverted the model by deriving its deal from the
stacks' contents (DVTD-71w3). Configs are both the build and effectively the
run's hit points, so the dealt configs should be the star of the screen.

## Decision

1. A run opens on a dealt hand of five: `startingHand` keeps its seed
   (`userId:date`) and its focus guarantee, `HAND_SIZE` drops 6 → 5. Five
   reads at a glance and gives ten possible trios — variance without homework.
2. The recommended three arrive preselected. `recommendedPicks(hand,
   maxSlots)` picks a deterministic trio (a focus config, a coverage earner,
   a filler that fits) and `withRecommendedBuild` installs it through the
   reducer at run birth. A new player opens the screen and presses Start; a
   veteran toggles.
3. The start rule does not change: one config is the floor, the slots are the
   ceiling. One to four picks are all legal openings; three is only the
   default.
4. Starter stacks are deleted everywhere — `stack.model.ts`, the `pick-stack`
   action and its wire schema, `StackPicker`, `StackPreviewList`, the combo
   cards. The stack idea survives invisibly as the recommendation; the
   comparable-risk and honest-names rules (ADR-026 D5/D6) now bind
   `recommendedPicks` instead of three curated cards.
5. During configuring the hand is immutable. Install and uninstall toggle
   build membership without moving cards between lists, so the deal renders
   as one stable, checkable list.
6. The deal's safeguards are the pool's curation. `STARTER_POOL` already has
   distinct focus categories and a passive majority, so dedupe-by-effect and
   can-trigger-today checks would guard against nothing; they get built when
   DVTD-p9ah swaps the pool to the account's granted configs and curation no
   longer holds by construction.

| Number | Value |
| --- | --- |
| `HAND_SIZE` | 5 |
| `RECOMMENDED_SIZE` | 3 |
| Possible trios from a deal | 10 |
| Start floor / ceiling | 1 config / `BASE_SLOTS` (4) |

## Consequences

- `state.available` no longer shrinks on install; benches that want only
  uninstalled cards filter against the build (`RunConfigure`).
- The production configure screen is bench-only; its stack mode, the
  "Back to stacks" detour and the `overflowSlots` receipt prop are gone.
- A tagged run (ADR-036) still deals a hand today; whether it should skip the
  deal remains unimplemented and undecided.
- DVTD-30k6 (random draw at start) ships with this; DVTD-71w3 and DVTD-fkpa
  are superseded; DVTD-4fxt (Lock on the run-start deal) stays open.
