---
# DVTD-opgd
title: 'Wiki: resolve 20 contradictions against the code'
status: completed
type: task
priority: high
created_at: 2026-09-22T19:51:22Z
updated_at: 2026-09-23T06:52:44Z
---

`docs/wiki.md` contradicts itself in 20 places. Its own preamble says the code wins,
so every fix resolves to `src/modules/run/`, not to the ADRs.

Twelve were reported; verifying them turned up eight more. Pattern: the **tables**
are almost always right and the **prose around them** is stale — a number change
gets grepped, a rationale does not.

## Part A — the twelve reported

- [x] §2.1 L76 run length: 12 → 13 calendar days (13 gates, 1/day)
- [x] §2.2 L118 gate reward: `32 KB × gate number` → `32 KB × (gate + 1)`
- [x] §2.2 L110-116 outcomes: delete the pre-ADR-076 two-row Advance/Miss table, point at §2.6
- [x] §2.8 L467 Pallet: drop "asks 20%"; the real calibration is floor 0 + peel 0
- [x] §2.8 L462 coverage: delete "per-gate and fresh, never a running total" (it is cumulative)
- [x] §2.8 L478 rename: "Unit Tests" → "Build Artifacts"
- [x] §4.3 L704 delete the stale planned Overclock row (shipped at L658 with a different effect)
- [x] §4.3 L697 delete Rate limiter (prevents a loss only `strict: true` can cause)
- [x] §6.2 L931 unlocks: "the other 30" → 36 (44 roster, 8 free, 36 earned)
- [x] §6.2 starter list: ids → labels, incl. Build Artifacts
- [x] §6.4 L1023-1026 Audit Dex: `audit_incidents` makes RECEIVED firings countable; sent are not (no `sent_by_run_id`)
- [x] §7.1 L1066 + §7.3 L1100 standouts: tag six 🟢 shipped, four 🟡 planned (ADR-067 accepted, never built)
- [x] §4.3 L675-679 + §8 L1165 storage cap: delete both, incl. the retired ADR-046 citations
- [x] §5.1 L823 reward: "gate number" → `(gate + 1)`; cap ×12 → ×13
- [x] §3 L538-539 build line: "7 of 10 slots · 3 free" → the live `roomLineOf` weight format
- [x] §3 L553-554 + §5.2 L880-881: no over-capacity start, no ladder to step down

## Part B — the eight found while verifying

- [x] §2.8 L436-437 peel column: 45%/50% → 35%/35% (410 Gone is a rival-fired audit, not the base)
- [x] §10 L1394 peel row: `0% / 20%×2 / 25%×4 / 30%×4 / 35%×2`
- [x] §2.6 + §10: document retry peel escalation (`share × (1 + 0.5 × attempts)`), undocumented today
- [x] §4.3 L668 poll bank: 96 → 475, and rewrite the Regression Test reasoning (at 475 a run sees ~14%, so "small bank" no longer carries it)
- [x] §5.1 L823 + §10 L1418 reward cap ×12 → ×13
- [x] §2.8 L469-470: a bare build is HELD, not killed (`gateRulingFor` → `heldBy: "bare"`)
- [x] ~~§2.3 + §2.8: audits scale the coverage ladder~~ **DROPPED** — `demandFactor` is declared but no audit sets it, so the factor is always 1. Documenting it would describe a rule that never fires. Folded into DVTD-pshl.
- [x] §2.6 L345: the flawless-never-DANGER rule is an explicit clamp, not emergent

## Ground truth

| Question | Code | Source |
| --- | --- | --- |
| Pallet | 3 units / 60%, floor 0 | `GATE_RUNGS[0]` `coverageRatio.model.ts:43` |
| Coverage | cumulative, `5 × (gate+1)` | `scoringSlotsAt` `coverageRatio.model.ts:76` |
| Reward | `32 × (gatesCleared+1) × correct÷5` | `gateRewardMultiplier` `rules.model.ts:142` |
| Reward cap | `GATE_COUNT` = 13 | `rules.model.ts:9` |
| Bands | five + `FLOOR_CORRECT = 2` | `bandAtClose` `gate.model.ts:163` |
| Storage cap | none | `addStorage` `run.model.ts:42` |
| Roster | 44; 8 free + 36 earned | `configRoster.model.ts:3`; `configUnlock.model.ts:76` |
| Standouts | six computed AND displayed | `AWARDS` `standouts.model.ts:363` |
| Peel | `[0,.2,.2,.25×4,.3×4,.35×2]` | `rules.model.ts:148` |

ADR-046 is retired (`docs/adr/README.md:107`). The wiki cites it twice as live.

Docs-only; no `CHANGELOG.md` entry.

## Summary of Changes

`docs/wiki.md` only. 24 edits. No source, no `CHANGELOG.md` (docs-only).

**All 20 resolved**, except one dropped on evidence: *audits scale the coverage
ladder*. `audit.model.ts:44` declares `demandFactor` and `:377` reduces over it, but
**no audit sets it**, so the factor is always 1. Documenting it would have described a
rule that never fires. Moved to DVTD-pshl.

**Five more found during the cross-section sweep**, all fixed:

- §2.8 "Width is on neither: it is bought" — width is derived (ADR-098)
- §6.1 archived storage "open your next run wider" — it cannot; ADR-049 was retired
  when ADR-082 deleted the start-slot ladder
- §9 glossary called the gate meter "(per attempt)" two rows under a row calling it
  cumulative
- §10 `gateRewardMultiplier` read "×1 to ×12" — a **third** copy of the cap error
  (gate 12 pays 416 KB = 32 × 13)
- §4.3 Replication priced itself against the deleted free storage plan; flagged as
  needing a redesign rather than silently rewritten

**Deferred to DVTD-pshl:** `isPeelFatal` is live and contradicts §2.6's "death is a
DANGER close" — a one-config build is killed by its own peel from Boulder on. The wiki
was left stating the ADR rule and claiming nothing about the code, pending that call.
That bean also carries ADR-098's false "`Build.slots` is deleted" claim and the dormant
`demandFactor`.

## The pattern worth remembering

The **tables were almost always right and the prose around them almost always stale**.
§2.8's gate table had Pallet at 60% while the paragraph beneath it still said 20%; §3's
build line was correct at one line and described the deleted slot model five lines
later. A number change gets grepped; the sentence explaining *why* the old number was
right does not.

Three facts were each wrong in **three** places (the reward formula, the reward cap, the
storage cap), so fixing a contradiction meant grepping for its twins rather than
editing where it was reported.

## Verification

- `grep -n "ADR-046"` → nothing (retired ADR, was cited twice as live)
- `grep -n "Unit Tests"` → nothing
- `grep -nE "12 calendar days|never a running total|96 polls|the other 30"` → nothing
- `grep -nE "×12|256 KB cap|free tier|over-capacity"` → nothing stale
- Cross-read the twin sites for coverage, the peel, the cap and the run length
- `npm run lint` → 0 errors, 2 pre-existing story warnings, 0 architecture violations
  across 825 modules
