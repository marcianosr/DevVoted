---
# DVTD-fpf9
title: 'Telemetry config: buy the community split'
status: completed
type: feature
priority: normal
created_at: 2026-08-14T11:05:29Z
updated_at: 2026-08-14T12:22:43Z
parent: DVTD-72d9
---

Uncommon, upgradable to L2. Pay an escalating fee to see how other players answered the current poll; every poll you peek at must be answered correctly.

## Decided with Marciano (2026-08-14)

- **Vote pool**: all `polls_responses` rows for that poll id, both loops (session + calendar). Biggest pool, so the split is signal and the config is live from day one.
- **No quorum gate anywhere.** L1 sells a split with no sample size attached, so 100%-of-2 and 100%-of-127 look identical on screen. That blindness IS the L1 product.
- **L2 adds the sample size** ("based on 127 answers"), which is what makes the reading trustworthy. `maxLevel: 2` — the shop stops offering upgrades after it.
- **Fee**: 32/64/128... doubling per use, resets each gate (lint ladder precedent, one rung up).
- **Check**: each peeked poll must be correct. Self-binding: never peek, never owe.

## Todo

- [x] Domain: `peeksCommunitySplit` benefit + `peek-correct` CheckKind + peek fee ladder
- [x] Engine: `peek-poll` action, per-gate use counter, peeked-poll bookkeeping on answer
- [x] Roster entry + level-derived copy
- [x] Server: split query (all-time, both modes), authorized against peeked polls, sample size only at L2
- [x] Presentation: peek action on the Telemetry row, split bars on the poll options
- [x] Tests + wiki 4.3 + CHANGELOG

## Summary of Changes

Built, verified, uncommitted (house rule).

### Domain
- `config.model.ts`: `peeksCommunitySplit` benefit flag, `peek-correct` CheckKind, `showsSampleSize` (level >= 2), `isUpgradable` route, level-derived `describeConfig`/`givesOf`/`needsOf`.
- `effect.model.ts`: `peeked` / `peekedCorrect` / `peekedMissed` on `GateWindow`, `peekCorrectCheck`. Sticky in failure only (a missed peek never washes out); a clean record stays `running` until the window closes, because the next peek can still spoil it; `skipped` when unused.
- `configRoster.model.ts`: `telemetry` (uncommon, `maxLevel: 2`, family `defense`).
- `pipeline.model.ts`: `peekerFor` (category-blind, unlike `linterFor` -- the split exists for every poll, so the draw can never excuse the check).
- `run.model.ts`: `PEEK_COSTS` 32/64/128/256/512 read off `window.peeked`, so the ladder resets with the window; `peek-poll` action, `peekApplies`/`canBuyPeek`, `peekedPollIds` on run state (run-scoped, not window-scoped: the server reads it to authorize the data).

### Server
- `community.repository.ts` `fetchPollSplit`: pick counts per option for a poll, all-time, both loops. Correctness never joins the query.
- `community/domain/pollSplit.model.ts` `toPollSplit`: percentages as shares of answerers (multi-answer polls sum past 100), sample size gated behind a flag.
- `community/application/pollSplit.service.ts` + `getPollSplit` server fn: refuses any poll the run has not paid a peek on, and omits `answeredCount` entirely at L1 -- withheld server-side, not hidden in the UI.
- `usePollSplit.hook.ts`: enabled only once the engine reports the poll paid for, so `send({type:"peek-poll"})` -> new view -> query fires. No manual invalidation.

### Presentation
- `PollOptionList` draws a pewter bar + percentage per option (grey on purpose: a crowd favourite is not a right answer). `PollCard` takes `split` and renders the L2 "based on N answers" line. `AnsweringScreen`'s `getUseAction` now serves both paid actions from their own config's row. Two new `PollCard` stories (L1 and L2).

### Two engine facts worth keeping
1. **The fee counter and the check's target are the same number** (`window.peeked`). One field prices the ladder and sets the demand, which is why the ladder resetting per gate and the check resetting per gate are the same fact rather than two rules to keep in sync.
2. **`peekedPollIds` is run-scoped while the tallies are window-scoped**, deliberately: the paid data has to survive a reload and a later gate (the server authorizes against it), but the demand it created belongs to the window that bought it.

### Verified
1543 tests pass (120 files, +41), `tsc --noEmit` clean, oxlint + dependency-cruiser clean (543 modules).

### Docs
Wiki: roster row now green and describes the real L1/L2 product; 4.5 renamed "Paid Actions: Lint and Peek" with the peek's rules and the declinable-check argument; 4.4 gained the Telemetry upgrade paragraph and the `maxLevel: 2` exception; escalation table gained the peek fee. CHANGELOG entry added.

### Deferred
- No quorum floor anywhere, by decision: L1 blindness is the product. If playtest shows 2-answer splits feel broken rather than risky, the fix is a floor on the *pool* (ignore polls under N answers when rolling Telemetry into a shop), not a gate on the peek.
- Benchmark (the ghost-duel config, Phase 2's Telemetry) is untouched and still amber.

## Amendment 2026-08-14: the check is now "peek at least 2× per gate"

Marciano reversed the check hours after the build. `peek-correct` is gone;
`peek-count` (`checkAmount: 2`) replaces it. The demand is now **the fee**:
32 + 64 = 96KB every window, and a window closing a peek short fails the gate
regardless of how the polls went.

### What this trades away

The old check was the roster's only **declinable** demand (peek nothing, owe
nothing), which is what made it self-binding and ADR-022-safe by construction.
The new one is the roster's only **unskippable** one, and it knowingly breaks the
rule stated two paragraphs above it in wiki 4.5: a linter never demands proof of
purchase because an unaffordable window is then a death the player never chose
(ADR-031's trap rule). Telemetry now accepts that trap.

Mitigations that make it survivable rather than punishing (all pre-existing, none
added for this):
- It is **not in `HANDED_CONFIGS`**, so it can only be drafted in the shop. Gate 0
  pays at most 32KB, so the run can never lose gate 0 to a demand it could not
  have funded.
- The loss is **one gate**, not a spiral: failing peels configs, and peeling
  Telemetry takes the demand with it.
- `canBuyPeek` already refuses an unaffordable peek, so the failure is a failed
  check rather than a negative balance.

### Balance watch

Gate clear pays `32KB × gate number × (correct/5)`. The demand is flat 96KB. So
the demand outruns the income until gate 2, and an early draft is the dangerous
one. If playtest says it is unplayable rather than tense, the cheap dials in order:
`PEEK_COSTS[0..1]` (lower the first two rungs), `checkAmount: 1`, or excuse the
check when the balance could not cover the next rung (precedented: the draw
excuses focus and lint masteries) -- one predicate in `peekCountCheck`.

### Code that got simpler

`GateWindow.peekedCorrect` / `peekedMissed` and the `peekHonoured` predicate are
**deleted** -- correctness is no longer any of this check's business, so the
partial-vs-wrong dial that was flagged as an open question is moot. The check is
now plain `checkState` (sticky success, fails at close) instead of a bespoke
sticky-failure machine. `window.peeked` alone serves both the fee ladder and the
demand, which is why "the ladder resets per gate" and "the demand resets per gate"
remain one fact.

### Verified

1546 tests pass (120 files), `tsc --noEmit` clean, oxlint + dependency-cruiser
clean. Wiki 4.3 + 4.5 and the CHANGELOG entry rewritten to match. Uncommitted.

## Amendment 2026-08-14 (second): the demand is one peek, not two

Marciano cut the count the same day: `checkAmount: 2` → `1`. Nothing structural
moved, because every consumer already read the number off the field — the gate
check target, the checklist row, the tooltip and the pipeline copy all followed.

Two derivations grew a plural branch, since a count cannot carry grammar:
- `config.model.ts` `peekDemandPhrase`: `1` → "once each gate", otherwise "N× each gate".
- `effect.model.ts` `peekCountCheck` demand: "1 peek this window" / "N peeks this window".

Both defaults dropped from `?? 2` to `?? 1`.

### What this fixes

The trap the first amendment accepted is now narrow enough to be tension rather
than a bill. The demand is the ladder's **first rung, 32KB**, and a cleared gate
pays `32KB × gate number`, so from gate 1 the demand is funded by the thing it
gates. Two rungs (96KB) outran the payout until gate 2, which made an early draft
unpayable rather than tense.

The mitigations from the first amendment all still hold, and the surviving trap
is now only a balance under 32KB — the cheapest any action in the game costs.

Also fixed here: the roster entry had drifted to `rarity: "rare"` (128KB draft)
while this bean, wiki 4.3 and the changelog all said uncommon (64KB). The code
was the outlier, so it moved back to `uncommon`.
