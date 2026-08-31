---
# DVTD-2try
title: 'Unlock system: configs, starter slots, borders'
status: todo
type: feature
priority: critical
tags:
    - meta-progress
created_at: 2026-07-16T20:29:52Z
updated_at: 2026-08-31T09:04:48Z
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
| `archived_storage` | credited at run end | yes, the border shop (`src/domains/economy/`) spends it |
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

### ~~Two filter points~~ ONE filter point

SUPERSEDED 2026-08-26 (see "Grant gates the hand, never the shelf" below). Only
`run.service.ts` `HANDED_CONFIGS` gets filtered; `draft.model.ts` keeps pooling the
entire `CONFIG_LIST` deliberately.

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

---

## The framework (2026-08-26): Reveal / Grant / Stage

"Unlock" was doing three jobs at once, which is why the scope kept sliding.

| | what it does | scope | balance impact |
|---|---|---|---|
| **Reveal** | you learn it exists | account | none |
| **Grant** | you own it, you bring it | account | high |
| **Stage** | when it appears inside a run | run | pacing only |

**The rule: Grant is only for things you carry into a run. Stage stays per-run,
always. Reveal is free, and everything can have it.**

Slots are found during a run, never carried into one, so they never get Grant. The
"someone plays 10 slots at gate 1" worry is not an exception to handle, it is the
rule working: no mechanism exists that could do it.

### The grid

| content | Stage | Grant | Reveal |
|---|---|---|---|
| Configs (~30) | no | yes: `unlocksAtGate` / `unlocksBy` | Configdex silhouettes |
| Starter stacks (3) | no | **yes** (decided below) | yes |
| Slots (11) | gates + coverage | **never** | shipping, Dex Gates tab |
| Rebuild / Lock / Extend / git tag | gates 0/2/3/4 | **no** | **new: Dex tools tab, ??? until met** |
| Storage plans (7 tiers) | `fromGate` | no | **new: same ??? treatment** |
| Audits (13 gates) | per gate | no | shipping, Dex Audits tab |
| Borders | no | yes, already built in `src/domains/economy/` | already built |

### Decisions (Marciano, 2026-08-26)

**Shop tools get Reveal only, not Grant.** They are verbs, and Lock/Extend/git tag
are already staged at gates 2/3/4. Account-gating on top would mean the player who
keeps dying at gate 3 never meets Extend, and that is exactly the player who needs
it. The Dex gains a tools tab where an unmet tool reads `???` until you first reach
its gate. Zero balance change. Storage plans ride the same tab treatment.

**Starter stacks get Grant, and are the onboarding lever.** Everyone starts on
Safe start (already the first-run recommendation, stack.model.ts). Gamble and
Category spread are earned. This is the single choice made *before* a run, so
granting one changes how a run opens without touching any in-run number, and it
gives the 3-stack picker a reason to grow.

**Config unlocks are achievement-only, no currency.** Meet the requirement (gate
depth or challenge) and nothing else. `archived_storage` stays the cosmetics
currency it already is, so unlocks stay earned rather than farmed and the two
economies do not compete for one pool.

### Follow-up work this implies

- [ ] Dex tools tab: Rebuild / Lock / Extend / git tag as `???` until first met (Reveal)
- [ ] Dex storage-plan rows, same treatment
- [ ] Starter stack grants + the ledger read on the pre-run picker

---

## Grant gates the hand, never the shelf (2026-08-26)

### The shop roll is not random, it is depth in disguise

`draftSeed` takes only `gatesCleared`, `rebuildsUsed` and `extensionsBought`. No user
id, no date, no RNG source anywhere in the chain (`shopAction.model.ts`,
`strip.model.ts`, `answer.model.ts`). **Every player at gate 3 with zero rebuilds
sees the same five configs**, minus what they already own.

So "configs you have met" is already "how deep you have got", with a hash in
between. Adopting met-as-unlock would give the depth curve for free but with no dial:
which config lands at which gate is whatever the hash says. Hence the split below —
meeting a config is Reveal, an authored requirement is Grant.

### Decisions

**Grant controls the STARTING HAND ONLY.** The shop keeps offering the entire roster
at every gate. Rationale: it is the Reveal/Grant/Stage rule applied honestly — Grant
is for what you carry in, the shop is what you find during a run. Consequences worth
keeping in mind:

- A brand-new account still meets the whole roster, so Reveal fills in from run one.
- A struggling run is never made worse by a thin shelf.
- `draft.model.ts` stays untouched. This reverses the "two filter points" note above.

**The custom-build hand is a draw, not a list.** Draw ~6 from the unlocked pool, pick
3 into slots (`BASE_SLOTS`), **guaranteeing at least one focus config**. Rationale:
showing the whole pool means a player settles on a best three and every run opens
identically. The focus guarantee is not politeness — the sim work found aim swings
win rate ~5x while width self-cancels, so a hand with no category multiplier is
broken rather than merely varied.

This gives the two paths already in `StackPicker.ui.tsx` distinct jobs for the first
time: **stacks** are curated, deterministic, one click (new-player path and unlock
reward), **Custom build** is the draw.

**Unlocks must skew rare or the draw stops feeling like progression.** A bigger pool
only means better hands if what enters it is stronger. The five legendaries
(AGENTS.md, WTFPL, Freemium, Volkswagen CI, Dependabot) are the natural late grants.

**"Met" = seen in a shop roll**, bought or not (Pokedex "seen"). Fills in fast, needs
no authoring, and pairs naturally with depth since the roll is seeded on gates
cleared.

### Revised work

- [ ] `unlocksAtGate` / `unlocksBy` on `Config`; `HANDED_CONFIGS` becomes a per-user query
- [ ] Hand draw: ~6 from the unlocked pool, one focus guaranteed
- [ ] Reveal ledger: record configs seen in a shop roll
- [ ] Configdex owned/total + silhouettes for unmet rows
- [ ] Starter stack grants
- [ ] Dex tools + storage-plan rows as `???` (Reveal)

## Assignment decided (2026-08-31): ADR-050 is the design of record

The two "Still open" items above are closed:

**Which configs take depth vs a challenge, and the numbers** — decided in
[ADR-050](../docs/adr/050-config-exposure-is-reveal-grant-stage.md): 9 free at
signup (js, ts, css, eslint, unitTests, codeCoverage, indexedDb, coverageGain,
coldStart), 15 on the depth ladder at gates 1–7 (stack grants ride along: Gamble
at gate 1, Category spread at gate 5), 6 challenge grants (Overclock, AGENTS.md,
Dependabot, Volkswagen CI, WTFPL, Freemium). Only WTFPL needs a new counter
(sells per shop). Consequence: `agentsMd` leaves `STARTER_POOL` in hand.model.ts
— legendaries are late grants, the shipped pool predates the decision.

**Starter slots and borders** — starter slots are dead as account unlocks: slots
are bought (ADR-046) and the archive already widens the start screen (ADR-049);
the framework's "slots never get Grant" holds. Borders stay in
`src/domains/economy/`, out of this bean.

Also decided: every Configdex row carries its requirement — `???` rows name the
requirement (never the config), met rows are dimmed named chips, granted rows read
as provenance. Tooltip-first, not tooltip-only: tooltips are invisible on touch
(DVTD-aiyp), so silhouette rows carry a visible caption too.

Status → todo: implementation is unblocked once the DVTD-811d rename settles.
