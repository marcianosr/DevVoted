---
# DVTD-4u3o
title: PERFECT is a fifth gate outcome that pays a bonus
status: completed
type: feature
priority: normal
created_at: 2026-09-12T15:29:36Z
updated_at: 2026-09-12T15:36:14Z
---

The prep screen's band-outcomes table (`BandOutcomes.ui.tsx`, shipped under
DVTD-2h6o) lists four outcomes. `bandFor` already returns a fifth, `perfect`, at
coverage >= 100% (ADR-070 Decision 3: "the existing PERFECT band at 100%"), but
nothing states what it does and nothing pays for it.

It pays nothing extra because `payoutRatioFor` caps at `PAYOUT_RATIO_CAP = 1.5`.
At gate 0 (healthy line 5%) the cap binds at 7.5% coverage, so filling the bar
to 100% pays exactly what 7.5% pays. At gate 12 (healthy line 95%) the ratio
only reaches 1.05. Either way the player cannot feel the top of the scale.

## Decisions (Marciano, 2026-09-12)

1. PERFECT is coverage reaching 100% -- exactly `bandFor`'s existing rule. One
   definition keeps the bar and the table from drifting. The old mock's "Every
   poll landed" copy is wrong: filling the bar needs all five right AND roughly
   a 4x multiplier build.
2. The bonus is a `PERFECT_BONUS` multiplier on `gatePayoutKb`, not a raised cap
   (a raised cap pays almost nothing extra at the late gates where perfect is
   hardest) and not a flat KB add-on.
3. The prismatic swatch is out of scope -- own bean.

`BandOutcomes.ui.tsx` needs no change: it takes its vocabulary from
`COVERAGE_BAND_WORD` and its spec already pins that a `perfect` row renders.

## Todo

- [x] `PERFECT_BONUS` + `isPerfect` + `perfectBonusFor` in `coverageRatio.model.ts`; `bandFor` and `gatePayoutKb` share the predicate
- [x] Update the broken cap pin in `coverageRatio.model.spec.ts` and add bonus tests
- [x] `outcomesFor` in `kantoPoll.factory.ts` gains a perfect row; healthy drops to `BELOW_FULL`
- [x] `BandOutcomes.stories.tsx` fixtures show five rows
- [x] `BandOutcomes.spec.tsx` names PERFECT in the roster
- [x] `PrepScreen.spec.tsx` "all four bands" becomes five
- [x] New ADR-075; edit ADR-071's decision list to name PERFECT
- [x] Follow-up bean for the prismatic swatch
- [x] lint, build, full test suite

## Out of scope

- DVTD-7uil (wire the closing band to the gate outcome). `survivesGate` is still
  one boolean; PERFECT joins the other four as stated-not-built.
- The `HEALTHY_LADDER` rebase (ADR-073 section 2 vs code) -- DVTD-gv0v owns it.
- Wiki band section -- DVTD-d16l owns that drift.

## Summary of Changes

`BandOutcomes.ui.tsx` needed **no change** -- it takes its vocabulary from
`COVERAGE_BAND_WORD` and its spec already pinned that a `perfect` row renders.
The work was a domain rule and a data row.

**Domain** (`coverageRatio.model.ts`): `PERFECT_BONUS = 1.5`, a private
`isPerfect` extracted from `bandFor`, and `perfectBonusFor` exported. `bandFor`
and `gatePayoutKb` now share one definition of perfect; the bonus rides inside
the existing `Math.round`, alongside the streak.

**Data** (`kantoPoll.factory.ts`): `outcomesFor` gains a `perfect` row first,
range `100%`, paying `kbLabel(kb(AS_PERCENT))` -- the bonus flows through with
no special casing because `kb()` already passes ratio 1. HEALTHY drops to a new
`BELOW_FULL` so it reads `40 - 99%` and the two rows do not both claim the top.

**Specs.** One pin broke by design: `gatePayoutKb(1, 0, 12, 0)` was asserted
equal to `PAYOUT_RATIO_CAP * 12 * 32` under the name "so the opening gates
cannot print" -- ratio 1 is exactly the new perfect case. It was borrowing an
extreme value, not guarding the bonus, so the cap claim moved to ratio 0.5 and
three new tests cover the bonus (amount, boundary at both the first and last
gate, and that it compounds with the streak rather than replacing it).

Two PrepScreen tests broke on ambiguity rather than on numbers: PERFECT and
HEALTHY both carry the swatch-and-next-gate sentence, so `getByText` found two.
Both are now scoped to the HEALTHY row. The "all four bands" test was weak (it
asserted the length of the array literal it was built from, not the DOM) so it
now checks every band renders and that PERFECT precedes HEALTHY precedes
DANGER. Added a test that the bonus actually reaches the screen: PERFECT's
payout beats the top of HEALTHY's range.

**ADRs.** New ADR-075 (indexed in README). ADR-071 amended in place, keeping its
original decision numbers per the directory convention: Decision 1 names the
100% clear, "Only HEALTHY advances" becomes "Only HEALTHY and PERFECT advance",
and the status note says "every outcome" rather than "all four". The rejected
alternative (raise `PAYOUT_RATIO_CAP` instead of multiplying) is recorded in
`rejected.md`, since it pays a rounding error at gate 12 where perfect is
hardest.

`proto-coverage.tsx` picks the bonus up for free: it calls `gatePayoutKb` in
three places including the shop pays-now/pays-after preview.

## Verification

`npm test` 4539 passed / 6 skipped / 2 todo across 250 files. `npm run lint`
clean (one pre-existing unused-param warning in `Screen.stories.tsx`,
untouched); dependency-cruiser 0 violations over 1004 modules. `npm run build`
clean. Prettier applied.

## Follow-up

DVTD-dr5y -- a perfect clear marks its swatch, carrying the trap found here: do
not flip `GateSwatch.finish` to `"fill"`.
