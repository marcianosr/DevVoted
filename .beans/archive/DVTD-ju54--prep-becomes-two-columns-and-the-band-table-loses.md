---
# DVTD-ju54
title: Prep becomes two columns and the band table loses its prose
status: completed
type: feature
priority: high
created_at: 2026-09-13T15:20:33Z
updated_at: 2026-09-13T15:40:37Z
---

The kanto prep screen stacks five things down the page: a header carrying a full-width
coverage bar, a full-width five-row band table with a sentence per row, two columns
("What it takes" | "The five polls" + "Audits"), then the footer. ADR-072 built it that
way on 2026-09-12; the density is the complaint.

Target is the New run screen's shape (header, two columns, footer) plus a three-column
band table (band / coverage / pays) with one prose lead above and one footnote below.

Plan: ~/.claude-work/plans/i-want-to-redeisgn-zippy-avalanche.md

## Todo

### Parts
- [x] 1 chevron icon in the kanto Icon set
- [x] 2 BandOutcomes drops the outcome column, gains lead + note
- [x] 3 bandOutcomesFor lifts into gate/application/bandOutcomes.viewmodel.ts
- [x] 4 PrepScreen becomes two columns, drops takes, header drops its bar
- [x] 5 rewire prepScreen.viewmodel / PrepView / newRunScreen.viewmodel / StartView
- [x] 6 route gate 0 through prep so "Pallet gate prep" is true
- [x] 7 fixtures, specs, stories
- [x] 8 ADR-078 (deleting 072), wiki, CHANGELOG

### Verification
- [x] npm run lint
- [x] npm test
- [x] npm run build

## Summary of Changes

**Prep is two columns**, the New run grid exactly (`md:grid-cols-2` + `min-w-0`):
Objectives and rewards left, the five polls + Audits right. `PrepScreenProps` dropped
`takes`; the header dropped its `bar`.

**The band table lost its prose column.** `BandOutcome` is `{ band, range, pays }`;
`BandOutcomesProps` gained `lead` and `note`. Three headings (band / coverage / pays).
The fatal row carries the theme and a `border-l-2` edge, which the outcome span used to.

**`bandOutcomesFor` moved to `gate/application/bandOutcomes.viewmodel.ts`** — both
screens import it as peers instead of new-run reaching into prep's viewmodel. SHAKY
quotes `−{peel} KB peel` from `GateStake.peelSlotsOnFailure * PEEL_KB_PER_SLOT`;
DANGER reads `the run ends`.

**Per-band payouts are real now.** `PrepView` passed `pays: () => modifiers.gateReward`,
a constant, which is why every band read `32 KB – 32 KB`. A band's floor divided by the
flat per-answer gain gives the answers to reach it, priced through `gateClearPayout` —
the one live payout.

**A unit bug was caught by the rewrite.** `perAnswerPreviewFor.coveragePerCorrect` and
`gainPerCorrectFor` return RATIOS; the ladder is in PERCENT. Dividing one by the other
made every clearing band quote the same figure and failed silently. The frame field is
`coverageGainPercent` and all three call sites convert with `percentOf`.

**`CoverageBar` gained `marks="rungs"`** — 0, floor, ok, healthy, 100 as bare numbers,
which is what the mock draws. `bands` and `boundaries` are untouched.

**Both footer buttons wear a chevron.** New `chevron` in `Icon.ui.tsx` (the kit had no
arrow; `gate` is a doorway). New run reads `Pallet gate prep ›`, prep reads
`Start Lavender ›`.

**Gate 0 walks through prep.** Done in `proto-run.tsx` with a local `startStep`, NOT in
`runRoutes.viewmodel.ts` — a spec there pins "gate 0 has no prep route at all (Configure
already covers it)" for the legacy `/run/*` routes, and proto-run never consults it.
`PrepView` gained `backLabel` so the aside reads "Back to the build" at gate 0.

**Docs.** ADR-072 deleted, ADR-078 written (supersedes it, closes ADR-032's open
"prep lost its shop link" consequence). Wiki: new Prep page entry in §8, build-rail line
corrected (the build is not on prep), new-run prep stop noted in §2.1. CHANGELOG: two
entries; the stale "OK row tells the truth again" bullet removed, since the column it
describes no longer exists and it never shipped.

## Verification

lint clean (0 depcruise violations, 973 modules), `npm run build` exit 0,
4215 tests pass. **4 failures remain, all pre-existing and out of scope** — they were
failing before this work started: `PollScreen.spec` x2 (one-column layout assertions)
and `gate.model.spec` x2 (the floor rule). Baseline before this branch was 7 failures;
the 3 in-scope ones are fixed.

## Follow-ups worth filing

- **ADR-076 Decision 3 describes an engine nothing pays through.** It says OK is priced
  by `payoutRatioFor` (ratio / healthyAt), but `answer.model.ts` pays via
  `gateClearPayout`, which scales on correct answers. Consequence: a build strong enough
  to clear HEALTHY on one right answer quotes OK and HEALTHY the same figure. Visible on
  the Lavender fixture today (+51 KB both).
- **Prep no longer says OK breaks the streak.** It lived in the deleted outcome column.
  One clause in the footnote would carry it.
- **`peelBillKbOf` in `gateOutcome.viewmodel.ts` disagrees with `failPeelQuotaFor`** —
  it omits `auditExtraPeelShare`, so the gate outcome and prep quote different peels on
  any gate carrying an audit. Prep uses the audit-aware number.
