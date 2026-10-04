---
# DVTD-ot4g
title: Prep draws the codebase, states why the percent moved, and prices a poll
status: completed
type: feature
priority: high
created_at: 2026-09-29T08:42:12Z
updated_at: 2026-09-29T09:02:31Z
---

**What:** Prep gains a What a poll pays panel that draws every opened slot as a gate-coloured square, states in units why the percent moved since yesterday, holds the coverage bar, and prices a single, each focus and a multiple answer in units and as a share of the codebase. A folded Gate strictness table shows how slots and the HEALTHY line move gate by gate.

**Why:** Clearing a gate opens five more slots, so the same units read a lower percent on the next prep, and that has read as loss twice in play. Prep is the first screen in the new denominator and nothing on it showed the arithmetic or what one answer is now worth.

## Done when

- [x] One square per opened slot, coloured by the gate that opened it; covered squares filled, today's five dashed
- [x] From the second gate on, a line states the codebase grew and that the same units read yesterday's percent and today's
- [x] The coverage bar stands in What a poll pays and no longer inside At stake
- [x] Rows price a single answer, each installed focus config and a multiple answer, in units and as a signed share
- [x] Gate strictness folds shut under the left column with rows for the first, second, current and last gate
- [x] Decision record, wiki and changelog updated

## Notes

The pool of slots is called the codebase. Test suite was rejected: tests cover code, nothing covers a suite; the player's answers are the tests. Gate stays the checkpoint. Units stay units.

The bar moving out of At stake reverses an earlier prep decision, and pricing a single answer on prep reverses another; both are recorded in the new decision record. PollScores stays inside At stake for now; if two swatch pictures in one column read as doubling, drop it from prep in a follow-up.

## Summary of Changes

Three kit files: Codebase (one swatch square per opened slot, grouped by gate), PollPays (header meta with the open slot count, the squares, the standing line, the moved coverage bar, the owed line, three priced rows, a footnote) and GateStrictness (a Fold drawn shut with two numbered statements, a four-column table and a note). PanelTable gained a sides bleed so a table can sit inside a Fold body; Swatch gained swatchFillsFor, which PollScores now reuses. BandOutcomes lost its bar and takes the standing band instead.

One viewmodel, pollPays.viewmodel.ts, derives every string from the rung table: the growth line with yesterday's percent, the owed units, the pay rows (single, one per focus config, multiple) and the strictness statements, which name Thunder and Seafoam by reading GATE_RUNGS rather than by literal. The poll screen's scored sentence moved to scoredLead.viewmodel.ts so both screens import it without a cycle. Prep wiring: PrepFrame carries unitsHeld, PrepScreen renders the panel under At stake and the fold last in the left column.

ADR-139 written; ADR-078 D5 and D10 and ADR-106 D3 point to it; README, rejected list, wiki (2.2, 8, glossary) and changelog updated. Vocabulary settled as gate, codebase, units; test suite rejected as an inverted metaphor.

Verification: full suite 257 files, 4776 tests green; typecheck clean for every touched file; oxlint, dependency-cruiser and docs:check clean.
