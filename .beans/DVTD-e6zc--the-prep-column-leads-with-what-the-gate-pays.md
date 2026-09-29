---
# DVTD-e6zc
title: The prep column leads with what the gate pays
status: completed
type: feature
priority: high
created_at: 2026-09-28T13:02:01Z
updated_at: 2026-09-28T13:16:32Z
---

**What:** The prep screen's stakes column is retitled At stake and every objective states the prize it pays instead of restating itself.

**Why:** The column named the demand twice and never named the reward, and its swatch objective quoted a rule the engine does not run.

## Done when

- [x] Each objective reads as a statement and the reward it earns, with no section labels
- [x] Clearing names the next gate and the KB the band table already quotes for it
- [x] The swatch objective asks for a flawless window, not PERFECT coverage
- [x] No objective carries a met or out-of-reach mark
- [x] The band row the run stands in is accented
- [x] Audits are stated nowhere in this column

## Notes

Redesign from Marciano's two gate mockups, agreed this session. Audits leave the
column entirely; where they are acquired is DVTD-406l, whose decision that a
clear hands one needs revisiting against buying one in the shop.

The swatch objective is the substantive fix: it read "Finish at PERFECT" while
ADR-080 awards the swatch for five right answers, and that ADR's own
consequences say the two are not the same test.

## Summary of Changes

ADR-136. `Objectives` is a flat list of statement/earns pairs built on `Lead`,
which gained a swatch part and an `as` passthrough. `BandOutcomes` edges the
band the run is standing in, derived from the bar rather than passed. The
viewmodel drops the audit objective, the section labels and `landsAt`, and
quotes the clear's figure through `paysOf` so the objective and the table cannot
drift. `correctThisGate` was left dead by the met/lost removal and came out of
three frames along with `PrepFrame.answeredThisGate` and the factory's
`windowCorrect`.

Wiki, CHANGELOG and the ADR index updated. Full suite 4606 passed; the 14
CommunityView failures are the pre-existing baseline.
