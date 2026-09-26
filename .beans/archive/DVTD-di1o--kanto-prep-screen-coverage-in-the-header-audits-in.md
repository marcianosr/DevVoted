---
# DVTD-di1o
title: 'Kanto prep screen: coverage in the header, audits in one panel, outcomes in a footer'
status: completed
type: task
priority: normal
created_at: 2026-09-10T19:52:12Z
updated_at: 2026-09-10T20:07:44Z
---

The kanto PrepScreen was five stacked Ledger sections. A new mock re-homes three
of them: the coverage reading moves into the header, the bill folds into the
Audits heading, and the clear/miss outcomes become a footer strip with Community
and Start presses (which is what ADR-032 asked for all along).

## Decisions

- The bill lives on the Audits heading only, as pre-formatted prose. The
  shortfall sentence becomes the audits panel note. The 413 per-answer leak keeps
  its cue and stays out of the total.
- The miss note prints only when it has news: a fatal peel, or one an audit
  deepened.

## Todo

- [x] Header takes an optional coverage reading + meter row
- [x] Audit gains a `row` layout arm, replacing `width`
- [x] Extract SwatchChip from Ledger's Figure
- [x] Stake takes `readings`, `aside`, `note`, and swatch figures
- [x] PrepScreen re-layout: header / two columns / footer
- [x] kantoPrepAt: coverage, auditBillFor, missNoteFor news test, prepStakeFor
- [x] kantoGateZeroStake moves to `readings`
- [x] Specs and stories follow the props
- [x] Ledger.stories rebuilt off its own args
- [x] lint + build + tests green

## Summary of Changes

Five stacked ledgers became a header, two panels and a footer.

**Kit extensions**
- `Header` takes `coverage: { label, held, demand, meter }` — the reading sits at
  the far end of the track row, the bar under both rows. Header had to own it:
  the reading belongs on that row and nothing outside can reach it.
- `Audit`'s `width: "fit" | "full"` became `layout: "fit" | "full" | "row"`. The
  row arm sheds the card border and pushes its cue to the far edge, so a panel
  can rule its audits off each other. One prop, so `row` + `fit` is
  unrepresentable.
- `SwatchChip` extracted from `Ledger`'s private swatch figure; `Ledger` and
  `Stake` both use it. Not a `Badge`: `badge-theme` pairs a fill with its ink,
  and a chip carrying a coloured swatch would read as two fills competing.
- `Stake` grew from one reading to many (`readings: StakeReading[]`), plus
  `aside` (the side exit, ambient), `note` (a cost with news in it) and swatch
  figures. `kantoGateZeroStake` moved to the new shape; `NewRunScreen` needed no
  edit because it spreads `stake`.

**PrepScreen**
`asks`, `billed` and `ends` are gone from `PrepScreenProps`; `stake` arrived.
The bill is one pre-formatted string on the audits heading, rendered through
`Figures` — its regex already badges a leading `−` cinnabar. A gate that deals
no audits draws no panel, only the heading's "none this gate".

**Factory**
`billedLedgerFor` and `leakRowFor` collapsed into `auditBillFor`, which returns
the bill prose and the shortfall note off the same `billLedger` call.
`missNoteFor` gained a news test: it returns nothing unless the peel is fatal or
an audit deepened it, so gate 4's footer stays one line and the summit's does
not. The header's audits badge is dropped at a gate that carries none. New
`kantoPrepSpent()` fixture for ADR-032's locked start.

**Verified**: 234 test files / 4179 tests pass; `npm run lint` clean (one
pre-existing warning in `Screen.stories.tsx`); `npm run build` green; a
stories-only typecheck reports the same 30 pre-existing errors, none in
`src/ui/kanto-theme/`.

## Known divergences

- The mock's `−352 KB` is a fossil (plan tier 3 + Freemium at gate 4's rate).
  The engine now asks ~32 MB at the summit and the note says it lapses —
  **DVTD-s04t**.
- The mock's `peels 5-6` and `+512 KB` are stale too; the engine gives
  `peels 2 or 7 configs` and `+416 KB` at gate 12.
- `Ledger`'s `meter`, `total` and `detail` arms lost their last caller. Left in
  place and demonstrated by hand-authored stories rather than deleted.
- CHANGELOG (2026-08) promised the live prep receipt "names its trigger rather
  than being flattened into one scary number". The kanto kit now flattens it.
  `GateStakeReceipt` still itemises, so nothing shipped changed — but this needs
  settling before kanto becomes the live prep screen.
