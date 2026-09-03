---
# DVTD-rdr5
title: Escalate the peel with gate depth
status: completed
type: task
priority: normal
created_at: 2026-08-17T14:56:21Z
updated_at: 2026-08-17T14:58:38Z
parent: DVTD-kulw
---

Marciano playtesting at Rainbow (gate 5, Celadon's badge): "the strip is still one. I want to escalate that as well." A flat 1-config peel is a third of an opening build and a fourteenth of a summit build, so it stops being a threat exactly as the pipeline gets wide.

Amends ADR-037 Decision 1 before it ever shipped: `GATE_FAIL_STRIPS` becomes a per-gate table read by `failStripsFor`, holding roughly a quarter of `slotsForGatesCleared` at that depth — [1,1,1,2,2,2,2,3,3,3,3,4,4]. Strip audits keep adding on top (Elite 5, Champion 6).

- [x] `failStripsFor` table in rules.model, `failStripQuotaFor` reads it
- [x] Strip-audit descriptions state the gate's own total (`stripAudit(gate, extra)`)
- [x] Specs: curve rows, monotonicity, deep-vs-shallow peel, wide-build helper
- [x] ADR-037 Decision 1 + consequences, wiki §2.7/§2.10/appendix, CHANGELOG

## Summary of Changes

`GATE_FAIL_STRIPS` went from a flat `1` to a private table read by `failStripsFor(gatesCleared)` — `[1,1,1,2,2,2,2,3,3,3,3,4,4]`, roughly a quarter of `slotsForGatesCleared` at each depth, clamped to the summit row so endless runs keep a rule. `failStripQuotaFor` reads the row instead of the constant, so the receipt, the reducer and the strip screen all escalated with one change.

`stripAudit` now takes its own gate (`stripAudit(11, 1)`), so the Strip audit's sentence states the gate's real total ("peels 5 configs instead of 4") rather than a surcharge. Elite lands at 5, Champion at 6.

Specs: a `failStripsFor` describe (narrow rows, escalation, monotonic across `GATE_COUNT`, clamp past the summit), a `peels more of a deep build than a shallow one` case, and a new `atGateWithBuild(gate, configCount)` helper in run.model.spec — the three configs a start hands out cannot stand in for a summit build once a peel takes four.

Docs: ADR-037 Decision 1 rewritten around the table with the rationale (width grows, so the peel must), Status records the same-day amendment, and a new consequence flags the rescued-run edge (a git tag opens deep, on a thin build, against a deep peel — fix the stipend, not the peel). Wiki §2.2/§2.7 rewritten, §2.10 gained a "A miss peels" column, appendix row replaced. CHANGELOG's unreleased entry updated in place.

**Verification.** 1530 tests / 121 files green, oxlint + dependency-cruiser clean, tsc + build clean. Uncommitted.
