---
# DVTD-oj5r
title: 'Config: &&'
status: completed
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:00Z
updated_at: 2026-09-26T15:45:53Z
parent: DVTD-72d9
---

**What:** A config that chains correct answers and pays storage that doubles with every link.

**Why:** Puts a streak reward back in the roster, in a currency the built-in streak does not already own.

## Done when
- [x] A chain of correct answers pays storage that doubles each link, and any wrong answer sends the chain back to the start
- [x] A partial answer neither extends the chain nor breaks it
- [x] Clearing a gate leaves the chain standing
- [x] The poll screen states what the next link pays before the player answers
- [x] The chain stops paying once the run's storage cap is reached
- [x] Specs cover the climb, the reset, the gate boundary and the cap

## Notes

Design settled 2026-09-26. Four slots, 128 KB to draft, first link pays 1 KB, doubling
to 256 KB on the ninth. It draws on the shared run storage cap, so nine correct in a row
empties the faucet for the rest of the run and the config is an opening-game plan.

The balance lever is the first link's value in the roster entry, not the doubling.

Two objections stood against this config and both are answered by the same design. The
first was that coverage scoring already pays a streak bonus, so a second one would just
be a duplicate dial: this pays storage instead, off its own counter, and never touches
the coverage streak. The second was the reason the growing-streak config was deleted in
September, that a growing ladder on an axis the player cannot see is unreadable: this
states its next payment on the poll screen before the player commits, the same way the
auto-upgrade config shows its countdown.

The chain deliberately survives a gate clear, where the engine's own streak resets. That
is what makes it a different number rather than a second reading of the same one.

Dropped from the opening idea: a variant that only paid when two consecutive correct
answers shared a category. The per-category correct run is already computed and already
paid for by the cache config, with another designed against the same dial, so a third
would be a collision. The condition is also not something the player can steer, and the
name is about short-circuiting a chain rather than about categories.

## Summary of Changes

Shipped as a 4-slot config drafting at 128 KB, unlocking after five perfect windows.

The chain is a pure fold over the run's answer log, so nothing was added to the run
state and no migration was needed. The same fold, filtered by category, is what the
cache config was already doing, so that one now reads as a special case of this one.

The payment rides the existing per-answer storage faucet as a second addend, which
means the shared run cap already clamped it without a new clamp being written. Both
answers to the standing objections landed in the design rather than in code: it pays
storage rather than coverage, and its own row states what the next link pays before
the answer, which is the condition the deleted growing-streak config failed.

Wrote ADR-121 for the new axis and its condition, added the roster row, the faucet
note and the constants row to the wiki, regenerated the counted blocks, added a story
covering the opening link, mid-chain and post-break states, and logged the player-facing
entry in the changelog.

Verified: 4038 tests green across 207 files, oxlint and dependency-cruiser clean, wiki
in sync, `tsc --noEmit` clean, prettier clean.

Two follow-ups deliberately not taken: the collision the roster-expansion bean records
between the cache config and the unbuilt `.every()`, which this did not make worse but
did not resolve; and the unused per-run per-category streak columns in the schema,
which this feature does not need.
