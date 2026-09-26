---
# DVTD-ooim
title: Gate checks come only from configs; payout scales with correctness
status: completed
type: feature
priority: normal
created_at: 2026-08-05T09:46:12Z
updated_at: 2026-08-05T10:01:16Z
---

Marciano (2026-08-05): remove the always-on Correct-N baseline check — with the config rule (ADR-016) every config carries its own check, so the gate should demand only what the build demands (Copilot check planned separately). Anti-farm replacement chosen via AskUserQuestion: gate clear pays GATE_REWARD_KB scaled by window correctness (80 x correct/5), so an all-skip 0/5 build climbs but earns nothing to bank. Unit Tests stays the only source of a correct-count demand (its own escalating check).

## Todo

- [x] gate.model: Correct row only when a correct-check config is installed
- [x] rules.model: delete CLIMB_BASE_REQUIREMENT; gateClearPayout added in pipeline.model
- [x] run.model reducer: pay the scaled reward on gate clear
- [x] Specs realigned (gate, run.model, runView, queries, pipeline) + new regression cases
- [x] ADR-017 records the decision incl. objection + escalation follow-up
- [x] Wiki 2.2/3.2/4.1/glossary/appendix + CHANGELOG

## Summary of Changes

Third decision folded in mid-work (AskUserQuestion): **a bare pipeline never clears** — without it, a stripped-bare run had zero checks, could never fail, and death (ADR-014) became unreachable. gatePassed now fails on isBare.

- gate.model: currentRequirement returns null without a check:correct config; Correct row synthesized only when one is installed (target = checkAmount + escalation); gateDemands mirrors; gatePassed bare-fails.
- pipeline.model: gateClearPayout(configs, correct) = round(80 x rewardMultiplier x correct/5) + flat clear payouts (flats whole — their config's own check earned them). Reducer pays it on clear. View gateReward stays the ceiling/preview.
- rules.model: CLIMB_BASE_REQUIREMENT deleted. effect.model stale comment fixed.
- Spec realignment: failure-model fixtures now judge via unit-tests (id is kebab-case!); 'ignores a strip once quota met' was passing coincidentally (gate cleared, strip ignored for the wrong reason) — fixed to genuinely reach awaiting-strip; queries victory fixture installs .js (bare can't clear); runView fixture answering() never slotted configs — switched to answeringWith.
- ADR-017 (+ index, ⚠ markers in ADR-016 §1-2), wiki §2.2/§3.2/§4.1/glossary/appendix, CHANGELOG new bullet + amended 'no build escapes' claim.

Open threads: Copilot check (Marciano's, planned); victory prize must not be claimable by zero-coverage runs (noted for DVTD-g1p0); escalation cap for gate 12 is now Unit Tests tuning; dropCount growth needs the same look; legacy proto sessionRun.ts keeps old baseline (parked).

Verified: vitest 1060 passed / 110 files, oxlint + depcruise clean, tsc clean.
