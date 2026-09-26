---
# DVTD-2h6o
title: 'Prep screen opens on the stakes: coverage bar + four band outcomes'
status: completed
type: feature
priority: normal
created_at: 2026-09-12T12:20:27Z
updated_at: 2026-09-12T12:33:01Z
---

Replace the kanto PrepScreen with the stakes-first layout: CoverageBar in the header, a full-width BandOutcomes table, What it takes / The five polls / Audits. Build panel and What it pays come off.

## Summary of Changes

Prep now opens on the stakes. Header carries the CoverageBar (band-name marks),
then a full-width four-row outcome table, then What it takes / The five polls +
Audits, then the footer.

- `BandOutcomes.{ui,spec,stories}.tsx` — new; band badge, range, sentence,
  payout. Takes `COVERAGE_BAND_COLOR` and `COVERAGE_BAND_WORD` from
  CoverageBar so the two readouts cannot drift. The fatal row wears its own
  colour in the prose via `data-screen-theme`.
- `CoverageBar.ui.tsx` — `marks: "boundaries" | "bands"`, default boundaries so
  the poll screen is untouched.
- `PrepScreen.ui.tsx` — `build` and `shop` off the props; `outcomes` and
  `takes` on. Everything in the columns is a `Ledger`; the dashed ???/? come
  from `LedgerFigure.locked` unchanged.
- `kantoPoll.factory.ts` — `kantoPrepAt` reworked; outcomes and gains computed
  from the model (`healthyAt`/`okAt`/`floorAt`, `gatePayoutKb`,
  `gainPerCorrectFor`/`gainPerMissFor`), never hardcoded. Frame gains `streak`,
  loses `chips`/`capacity`. ~120 lines of Build-only fixture deleted.
- `ScreenFooter.spec.tsx` — its stakes tests had borrowed prep's footer, which
  no longer has stakes. Given their own fixture so the feature stays covered.
- ADR-071 rewritten (no bribe, OK no longer clears), ADR-072 new.

Verified: 249 files / 4501 tests pass, lint clean, depcruise 0 violations
(1001 modules), build exit 0.

## Flagged, not resolved

- **Prep lost its "back to shop" link.** The mock has no such button, but
  ADR-032 decision 2 rests on it: the shop is supposed to stay revisitable
  until the climb resumes, with `finish-reward` firing from prep's start
  button. The shop is now a one-way door in the kanto kit.
- The mock's own figures predate two model changes: "15 base × 2 build" is
  pre-5%/8%, and its payouts (653-870 KB) use raw coverage x weight x rate
  rather than the pay-against-the-line formula. The shipped screen computes
  from the live model, so it reads differently on purpose.
- ADR-037's peel and ADR-071's repeating gate are two death clocks; only one
  can be live. DVTD-7uil owns it.
