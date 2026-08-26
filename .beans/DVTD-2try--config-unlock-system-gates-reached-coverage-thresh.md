---
# DVTD-2try
title: 'Unlock system: configs, starter slots, borders'
status: draft
type: feature
priority: normal
tags:
    - meta-progress
created_at: 2026-07-16T20:29:52Z
updated_at: 2026-08-26T14:05:19Z
parent: DVTD-z2r2
---

Every config in CONFIG_LIST is available from run one; there is no progression gate. Three things should unlock permanently per account: configs, extra starter config slots, and cosmetic borders. Only unlocked configs feed the start-of-run draw and mid-run drafts.

Merged with DVTD-yuwi (scrapped), which carried the starter-slot and border scope.

## The trigger is undecided, and it blocks everything else

- clear gate N, or hit a coverage threshold in the config's own category
- lifetime stats: runs completed, wins (came from DVTD-yuwi)
- DVTD-9d7o: spend vault KB on a random pull

## Open

- Curated per config ("clear gate 3 unlocks Copilot") or rule-based by rarity?
- ~~Persistence: no cross-run unlock store exists~~ — STALE, corrected 2026-08-26. `users.owned_swatch_ids` is exactly a permanent, idempotent, per-account unlock ledger (written by `awardGateSwatch`, run.repository.ts:117). The depth half of this bean needs no new storage at all.
- Do locked configs show as silhouettes somewhere (Pokedex "seen but not caught")?
- Slots: in-run slot unlocks already ship (DVTD-ein1, gate swatches). Do account-level starter slots ride the same ledger?
- Shares that ledger with DVTD-g8ty (swatches), or stays separate?
- Borders are cosmetic and depend on no trigger. Split them back out if this bean gets too big to start.

## Work, once the trigger is picked

- [ ] Unlock-state persistence (configs, starter slots, border preference)
- [ ] Starter slots: tiers, unlock criteria, loadout UI showing available vs locked
- [ ] Borders: variants, selection UI, shown on run screens
- [ ] Locked configs visible in the shop with their unlock criteria

---

## Trigger decided (2026-08-26): depth backbone + challenges for standouts

Marciano picked both axes, shipped in that order. This unblocks the bean.

### What the codebase actually has

Two unrelated things share the word "unlock", and only one is stored.

**Per-run staging** — slots (`pipeline.model.ts` `SLOT_UNLOCKS`), Lock/Extend
(`draft.model.ts`), git tag (`rules.model.ts` `PIN_FROM_GATE`), storage plans. All
read the *current run's* `gatesCleared`/`coverage`. Nothing persists and nothing
should: this is complexity staging inside a run. Not this bean's scope.

**Account permanence** — four columns on `users` (`schema.ts`):

| column | written | read by the game |
|---|---|---|
| `owned_swatch_ids` | every gate clear, idempotently | nothing — Dex only |
| `archived_storage` | credited at run end | nothing — no sink exists |
| `pinned_gate` | git tag, burnt on use | yes |
| `owned_border_ids` / `equipped_border_id` | — | — |

### Axis 1 — depth backbone (ship first, no migration)

`unlocksAtGate?: number` on `Config` (`config.model.ts`). The account's deepest-ever
gate is already derivable from `owned_swatch_ids`, so this half needs **no new
storage and no migration**. Covers commons and uncommons, which only need to arrive
in some order.

Its flaw, stated so nobody mistakes it for the whole design: it is one axis. The
roster unlocks in a fixed order determined solely by how deep you have ever gotten,
and it never asks you to play differently, only further. That is what axis 2 is for.

### Axis 2 — challenges for the standouts

`unlocksBy?: ConfigChallenge` on legendaries and the risk family, where how you
earned it is part of what the config *is*: Volkswagen CI earned by a clean-gate
challenge tells a joke `unlocksAtGate: 8` cannot.

This bean previously assumed challenges need new per-run tracking. They largely do
not — `RunState` already carries `window.peeked`, `window.linted` (added by
DVTD-w1zu, 2026-08-26 — "clear a gate without running the linter" is now a
one-expression predicate that did not exist before), `faucetEarnedKb`, `streak`,
`coverage`, `coverageByCategory`, `stripsRemaining`, `pipeline.configs`,
`gatesCleared`.

Storage: one new column, `unlocked_config_ids text[]`, written at the same hook and
with the same `NOT (... @> ARRAY[...])` idempotence guard as `awardGateSwatch`.

### Two filter points, which must agree

A config visible in one and not the other is the bug this design most invites.

- `run.service.ts` `HANDED_CONFIGS` → a per-user query (its own comment already says
  "Interim until config unlocks land (DVTD-2try)")
- `draft.model.ts` shop pool, which currently pools the entire `CONFIG_LIST`

### Locked presentation (decided)

Locked configs show in the Configdex as silhouettes with their requirement named,
reusing the redaction pattern already built in `GatesPanel.ui.tsx` (`???` chips,
counts not strings). `ConfigdexPanel.ui.tsx` currently prints `total/total` with the
comment "No unlock system yet" — that becomes owned/total.

The shop simply never rolls locked configs. Rolling unbuyable ones burns shelf slots,
and the shop already blocks exit on an under-width build.

### proto-run (decided)

Stays fully unlocked. `proto-run.tsx` is `useState(() => createRun(POOLS, HANDED))` —
client-only, no auth, no DB call. It does not "reset" the ledger; it has never been
able to see it. Correct for a run-mechanics harness. Meta-progression gets tested on
`/run`. Revisit only if the locked early game turns out to need playtesting from
there.

### Still open

- Which configs take depth vs a challenge, and the actual gate numbers.
- Whether starter slots and borders ride the same ledger, or split back out.
