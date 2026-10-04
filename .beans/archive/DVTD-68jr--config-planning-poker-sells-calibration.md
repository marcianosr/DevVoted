---
# DVTD-68jr
title: 'Config: Planning Poker sells calibration'
status: completed
type: feature
priority: normal
created_at: 2026-09-06T07:17:49Z
updated_at: 2026-09-06T09:02:26Z
parent: DVTD-72d9
---

## Design (2026-09-06 session)

- 1 slot. At the stake receipt, commit an estimate: how many of the window's 5 polls you will answer correctly (exact-set correctness, the binary streak rule; partials count as misses).
- An exact hit pays 32 KB × estimate at gate resolution. Anything else pays nothing.
- Pays KB only, never coverage: it can never rescue a meter (coverage is score, storage is reward).
- Pays on a missed gate too: predicting your own 2/5 disaster is calibration, and calibration is what the config sells. It is the first config to score self-knowledge, which nothing on the roster touches.

## Balance

- The linear payout is roughly EV-flat across honest estimates under a binomial model (at p=0.8, estimating 4 EVs ~52 KB and estimating 5 ~52 KB), so a calibrated player earns about a slot's worth per gate at any skill level and only miscalibration loses. The binomial is the difficulty table.
- Self-policing: throwing an answer to land a low estimate costs 1.5x+ an answer's earn in bleed; a skip-heavy sandbag misses the gate and eats the peel.
- No audit special-casing: the estimate reads the window's final correct count whatever the rules did to it (a 408 timeout busts it like any miss; 300 mirror correctness stays binary).
- Synergy, not dependency: Prefetch and .length sharpen estimates; a linter raises your accuracy after you have already committed.

## Todo

- [x] Payout decided: 32 KB × estimate, flat across gates. Chosen over a flat per-hit payout because scaling by the estimate puts the EV one notch above an honest guess, so the config prices optimism instead of being a quiz with one right answer. Reversible if playtesting says otherwise.
- [x] No upgrade path in v1. A config only becomes upgradable by joining isUpgradable, so withholding it is free. The ±1 half-pay idea needs its own design; a level that only multiplies money changes no decision.
- [x] On a fatal miss the payout lands before the run ends, so it joins the balance and banks at the normal death rate.

## Summary of Changes

Shipped as a 1-slot config, `storagePerEstimate: 32` on the roster (appended last, since run.factory and seedCommunity slice CONFIGS positionally). Reasoning is in ADR-063; wiki 4.3 and the 2.6 miss-payout row updated; CHANGELOG entry added.

**Engine.** New `run/domain/estimate.model.ts` (`estimatorFor`, `canEstimate`, `commitEstimate`, `estimatePayoutKb`, `ESTIMATE_CHOICES`), modelled on `rebase.model.ts`. New `{ type: "estimate"; count }` RunAction plus its zod arm. Two `RunState` fields: `estimatedCorrect` (the live bet) and `estimateThisGateKb` (what it paid) — both persist for free through `RunSnapshot`.

**Where it settles.** `closeWindow` pays on BOTH branches — the clear adds it to the gate reward, the miss adds it straight to storage through `addStorage` so the cap still applies. The commitment is cleared at resolution; `estimateThisGateKb` stays undefined when nothing was committed and 0 when the call was wrong, which is what lets the report tell "no bet" from "lost the bet". `resumeClimb` clears the stale figure alongside its siblings.

**Two things worth knowing for the next config.**
1. `finishReward` does NOT reset the commitment, which is why the bet survives the press that starts the gate — verified by a test, since resetting it there would have silently killed the feature.
2. This produces `GateRewardStatus: "failed"` for the first time ever. The union declared it but nothing could produce it, because ADR-035 configs demand nothing. The row reads its verdict off the KB the engine paid rather than recomputing the comparison.

**UI** ships in the terminal theme `/proto-run` mounts, beside `git rebase -i`: a Section on the prep screen with one armed press per poll (aria-pressed marks the standing bet), the payout quoted per press, and the poll screen's build row keeping score ("estimated 4 · 2 right so far"). Three engine-driven stories in ConfigsInAction.

**Not done (deliberate):** the authed `/run/*` prep screen is unwired, exactly as `git rebase -i` is — `RunPrep.component.tsx` wires neither. Gate 0 needs nothing, since the config is shop-only and shops open on a clear.

**Verification:** 3554 tests pass (+44), the only 3 failures are the pre-existing `src/ui/modern-theme/screens/RewardScreen.spec.tsx` ones documented by the Cache and GC beans. `npx tsc --noEmit` exit 0, `npm run lint` clean.
