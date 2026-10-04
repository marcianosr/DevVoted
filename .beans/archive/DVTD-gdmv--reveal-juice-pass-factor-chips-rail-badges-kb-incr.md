---
# DVTD-gdmv
title: 'Reveal juice pass: factor chips, rail badges, KB increments'
status: completed
type: task
priority: normal
created_at: 2026-08-27T09:16:54Z
updated_at: 2026-08-27T10:08:26Z
---

Match Marciano's reveal mock: (1) rail shows per-config increments as green badges beside the figure (losses red), plus KB increments for faucet configs (IndexedDB); reveal-mode rail statuses read applied/unused, header counts 'N applied · M skipped'. (2) Right panel replaces the Ledger with the true multiplicative equation as chips — correct × streak × your build — recorded as factors on CoverageBreakdown at scoring time (never reconstructed from rounded sums). (3) Below it: 'this answer paid +x.x%' big, celadon/cinnabar by sign. (4) Option rows: 'expected' / 'you picked' pills, verdict wash on the card, unpicked non-expected options dim.

- [x] Domain: CoverageBreakdown.factors (correct/build/streak) + AnsweredPoll.faucetKb
- [x] Pipeline.ui settled mode: applied/unused/skipped, badge beside figure, KB badge
- [x] Equation.ui (new): factor chips × … = this answer paid
- [x] Choice.ui: trailing badge slot + verdict wash + dim
- [x] RevealView rewiring + specs + stories
- [x] CHANGELOG + wiki wording

## Summary of Changes

Reveal juice pass, refined mid-build by Marciano's second mock (would/did chip grammar):

- `Chip.ui`: `outline` variant for every tone — outlined = what a thing WOULD do, filled = what it DID.
- `Pipeline.ui`: live online rows quote their rate as an outlined muted chip (`×1.25`, `+0.5 flat` — rateLabel, "flat" marks adds apart from multipliers); settled applied rows trade the rate for a filled `paid +0.5` badge (valueTone: red for losses), faucet rows badge `paid +N KB` (clamped attribution); "skipped ·" prefix dropped everywhere (hollow dot says it); header promises live ("2 will apply" + offline) and reports settled ("2 applied · 1 skipped"); online-but-paid-nothing reads "unused".
- `Equation.ui` (new): factor chips `correct 1.0 × streak 1.1 × your build 1.25` + "this answer paid +1.4%" (3xl, sign-toned). Factors at 1 stay out; a miss is the paid line alone.
- Domain: `coverageFactorsForAnswer` (pipeline.model — separate fn, no CoverageBreakdown churn; correct = scored share with gate/difficulty folded, build = (1+adds)×mults, streak factor; undefined on a miss) recorded as `AnsweredPoll.coverageFactors`; `AnsweredPoll.faucetKb` records the clamped per-answer faucet payout.
- `Choice.ui`: verdict wash follows letterTone (celadon/cinnabar borders + soft bg), settled-no-verdict dims, `trailing` badge slot; RevealView passes `expected` / `you picked` Chips (red "you picked" on a wrong pick).
- RevealView: Equation replaces the Ledger; per-config detail lives only on the rail.

Checklist: all items done (specs: Equation 5, Pipeline settled 6, Chip outline 1, Choice 4 new, RevealView 8, factors 4; stories: Equation ×4, Pipeline Settled/SettledWithFaucet, Choice settled ×3). Verification: lint + depcruise clean, tsc/build clean, 2452 tests pass (pre-existing red: RewardScreen.spec ×3, DVTD-9dn0). CHANGELOG + wiki updated to the chip grammar.

## Round 3 (mock #4)
- [x] Equation: per-config factor chips (label + factor, rarity-outlined) replace the aggregate 'your build'; flat adds fold into one exact (1+Σ) chip named by its sole contributor
- [x] Paid figure: subscript %, aria-label for specs
- [x] Footer: 'Next poll →' + note '2 to go · 0.1% short of clearing Pallet' (met → demand met; last poll → plain Next, no note)

### Round 3 summary (mock #4)

Per-config factor chips derived at reveal time (`buildFactors` in RevealView): covers are pure functions of (config, context) so it is a lookup, not arithmetic; `configBonuses` ids gate which configs chip (keeps audit-offline configs out); flat adds fold into one exact (1+Σ) chip named by the sole contributor, or "flat adds" with several. `EquationFactor` gained `rarity` (renders Chip's rarity variant). Paid figure: subscript % + aria-label (specs assert via getByLabelText). `nextNote(view)`: window left + shortfall off gateStake ("4 to go · 3% short of clearing Pallet" / "demand met"), silent after the 5th answer so the click reveals the gate rather than spoiling it; button reads "Next poll →" mid-window, "Next →" on the last. Verification: lint + depcruise clean, build/tsc clean, 2456 tests pass (pre-existing red: RewardScreen ×3, DVTD-9dn0).
