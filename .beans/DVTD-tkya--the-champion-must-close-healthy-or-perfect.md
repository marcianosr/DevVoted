---
# DVTD-tkya
title: The Champion must close HEALTHY or PERFECT
status: completed
type: feature
created_at: 2026-09-30T11:23:34Z
updated_at: 2026-09-30T11:23:34Z
---

**What:** At the last gate an OK close holds like SHAKY; only HEALTHY or PERFECT wins the run.

**Why:** OK's thin clear costs nothing at the Champion because there is no next gate, so a run could win on its weakest passing band.

## Done when

- [x] An OK close at the Champion is held on the band and owes a peel
- [x] Every other gate still clears on OK
- [x] Prep's ladder prices the Champion's OK band as a peel and asks for HEALTHY or better
- [x] The debrief titles an OK Champion as a hold, never a summit
- [x] Wiki, ADR and changelog state the rule

## Notes

ADR-159. clearsAt(band, gate) in gate.model.ts owns the rule; the static CLEARING_BANDS table (viewmodel and test factory) is deleted. closedBarFor takes the gate so a cleared Champion lifts onto HEALTHY and a held one keeps its OK reading. Wiki row text lives in scripts/wiki-sync.ts.

## Summary of Changes

Domain rule plus tests in gate.model; gateOutcome and bandOutcomes viewmodels read clearsAt; both closedBarFor callers pass the gate; ADR-159, wiki band section and table, generator text, changelog entry.
