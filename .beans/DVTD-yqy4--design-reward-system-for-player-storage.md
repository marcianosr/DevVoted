---
# DVTD-yqy4
title: Say what the archive is for, and what happens to existing balances
status: completed
type: feature
priority: normal
tags:
    - meta-progress
created_at: 2026-07-25T08:20:01Z
updated_at: 2026-09-25T09:08:17Z
parent: DVTD-z2r2
---

**What:** Decide what archived storage buys, and what happens to the balances live players already hold.

**Why:** Players carry a balance that almost nothing reads, and nobody has decided whether it survives 2.0.

⚠️ The Why line is stale twice over: the border shop already spends the archive, ADR-110 gave it a second sink, and the balance was already readable on four screens. Settled in ADR-112.

## Done when
- [x] What the archive buys is written down
- [x] Decided: whether existing balances carry over, are scaled or reset, and the clash with the no-backfill rule is resolved
- [x] The player can watch the balance accrue

## Notes

Define how players are rewarded with persistent storage, **for the players who
already exist on the live app**, not only for a clean 2.0 account.

## Why that framing matters

Live accounts already carry meta state: `users.archived_storage` (bytes,
credited at run end from unused in-run storage), `owned_border_ids`,
`owned_swatch_ids`, plus streak and coverage history in `leaderboard`. So the
question is not "invent a currency", it is "say what the existing balance is
for, and what happens to it".

## Answered in ADR-112

- What does an existing balance buy? Today the archive is spent on start slots
  (ADR-049) and the git tag (ADR-036). Nothing else reads it.
- Does the existing balance carry into 2.0 at face value, scaled, or reset?
  **This contradicts a decision already on the books**: ADR-051 line 137 says
  "no grandfathering and no historical backfill: the game is pre-release, nobody
  has anything yet". If there are live players with balances, either that line is
  wrong for storage, or storage is deliberately the one thing that carries. Pick,
  and write it down.
- Is the reward loop legible in the live app today, or only after 2.0 ships? A
  balance the player cannot see accruing is not a reward.

## Related, not duplicates

- DVTD-54gi decides the *rate* at which leftover storage banks. This bean decides
  what banking is *for*.
- DVTD-in1b spends the unbanked remainder on a community pool.

## Summary of Changes

Settled in **ADR-112** (2026-09-25). Three of this bean's premises had gone stale
and are corrected above rather than deleted.

**What the archive buys.** Appearance (borders, 256 KB to 32 MB) and licences
(ADR-110, decided not built). Never a config (ADR-050 D4, ADR-051 D1), never width
(ADR-082), and nothing inside a run spends it. The bean's "start slots (ADR-049)
and the git tag (ADR-036)" is dead on both counts: ADR-049 is retired and the tag
is a shop control paid in run storage.

**Balances carry at face value.** ADR-051's no-backfill line refuses backfilling
*achievement* — a grant for an objective nobody was measured against. Storage is
the opposite case: banked by real play, under a rule that already said it persists,
with the number visible on the profile the whole time. Carrying it invents nothing.
No scaling, no cap, no reset.

**The legacy cohort is topped up once**, on top of what it holds: 256 KB for having
played the calendar game, 1 MB instead for a climb the cutover ended. Flat, so it
pays an account sitting at zero, and 256 KB is exactly the cheapest border, so it
buys a thing rather than moving a bar.

The cohort is read from `user_titles`, **never re-derived from `runs`**. ADR-111's
migration ends by closing every active calendar run, so
`mode = 'calendar' AND status = 'active'` matches nobody from the moment that file
has run — a later migration re-deriving tier 2 that way would report success and
pay no one. `bool_or` collapses an account holding both title rows to the larger
payment instead of stacking them, and `users.legacy_bonus_bytes` (null = unpaid) is
written in the same statement as the credit, so the two cannot drift.

**The balance was already legible**, which is why the third box is ticked without
new work: the profile's Storage panel, the Dex header, the run-over screen's
after-figure, and a before → after step on the gate outcome (DVTD-3ueg).

### Found while doing it: four sites said "archive" and meant run storage

Three were player-facing, and the most visible sat beside the New run press telling
the player their permanent currency is wiped:

- `BRIBE_LABEL`, "Bribe from the archive" — the figure beside it is
  `balanceBeforeKb + payout − bill`, which is run storage. Now "Bribe from storage".
- `ARCHIVE_EMPTIES`, "the archive empties when the run ends" — flatly false. Renamed
  `ONLY_BANKED_CARRIES`, "only what banked carries into your archive".
- The run-ending detail line, "the build and the archive do not carry into the next
  run" — the exact opposite of the rule this bean exists to state.
- `wiki.md`, "you can settle it from the archive" — the peel is paid in run storage.

`GateOutcomeScreen.spec` hardcoded the bribe string instead of importing the
constant, which is how it survived the rename; it now imports `BRIBE_LABEL`.

### Not done here

Wiring the bribe press, which is still a `noop` regardless of which wallet it names.
