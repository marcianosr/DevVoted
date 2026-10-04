# ADR-064: A grant is recorded with its provenance

## Status

Accepted (2026-09-06, Marciano, DVTD-0sjo). Supersedes the ledger shape in
[ADR-051](051-configs-unlock-on-individual-objectives.md)'s consequences
(`users.unlocked_config_ids text[]`) and the `users.unplayed_config_ids` column
[ADR-062](062-the-starting-hand-is-dealt-under-guarantees.md) anticipated.
Settles DVTD-of79's storage question, the deal ordering ADR-062 left open, and
affirms ADR-062's oversized-config rule.

## Context

Three beans each planned their own slice of grant storage: DVTD-clgs a text
array of granted ids, ADR-062 a second text array for the unplayed queue, and
DVTD-of79 needed which path completed with nowhere to put it. An array cannot
carry provenance, and deriving it from the counters misreports as soon as the
second path also crosses its target.

## Decision 1: one table holds grant, provenance and the unplayed queue

```
user_config_unlocks (
  user_id, config_id, via_metric, unlocked_at, first_installed_at,
  PK (user_id, config_id)
)
```

- Granted means a row exists; `fetchUnlockedConfigIds` reads this table.
- `via_metric` names the path that completed; null means granted at signup (the
  free eight), and the Dex prints those as starter configs, not earnings.
- Unplayed means `first_installed_at IS NULL`; newest-first is
  `ORDER BY unlocked_at DESC`. No separate queue column exists.
- The unplayed guarantee reads earned rows only (`via_metric` not null): a new
  account must not spend its first eight hands walking the free set through a
  reserved seat.

## Decision 2: the unlock lands in two beats

- Beat one, at the deed: a saffron alert line on the screen where the grant
  fires, the same idiom audits use. Never the run log (it does not render,
  DVTD-yl13).
- Beat two, at the payoff: the guaranteed seat's card wears a NEW tag when the
  next hand is dealt.
- The permanent record is the Dex row flipping to provenance read from
  `via_metric` ("Earned: cleared Marsh's Mirror audit without a miss";
  fallback grants read "Earned: answered 400 polls").

## Decision 3: the guaranteed seat is dealt first

The newest unplayed earned config, one per hand, is seeded into the hand before
the draw; the other four are dealt under the focus band and pairability around
it, with the seeded card counting toward the band and the budget. This closes
the case ADR-062 left open: a fresh focus grant cannot breach `FOCUS_BAND`,
because the band counts it. Pairability repair never evicts the seat. ADR-062's
budget filter still applies to the seat itself, which is Decision 4's case.

## Decision 4: for an oversized config, the checkmark is the reward

`agentsMd` and `volkswagenCi` at 8 slots gain no hand presence from their grant
at `BASE_SLOTS` 4, and that stays. No shop-side compensation: a per-player
discount bends ADR-047's size-is-price, and a guaranteed shelf appearance breaks
the shared draft seed. Their grant pays in Decision 2's moment and the Dex
provenance; if ADR-049's archive slots ever raise the opening budget in
production, these grants mature with no further decision.

## Consequences

- DVTD-clgs changes before build: no `users.unlocked_config_ids` column;
  `user_config_unlocks` created instead; `awardConfigUnlock` writes
  `via_metric`; signup seeds the free eight with `via_metric` null.
- DVTD-p9ah gains the seat: `startingHand` seeds the unplayed config first and
  repair treats it as unevictable.
- DVTD-of79 loses its open question; both beats above are its scope.
- proto-run stays fully unlocked and untouched (client-only, no account).
