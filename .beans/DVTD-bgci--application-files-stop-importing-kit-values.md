---
# DVTD-bgci
title: Application files stop importing kit values
status: todo
type: task
created_at: 2026-09-30T16:42:38Z
updated_at: 2026-09-30T16:42:38Z
---

**What:** No file under a module's application layer imports a runtime value from the design kit, and the architecture lint forbids it.

**Why:** Fifteen application viewmodels reach up into the kit for copy constants and label helpers, so the kit owns copy the run state should pick, and the dependency rule the architecture decision states cannot be enforced by the lint.

## Done when
- [ ] Every application to kit import is type-only
- [ ] A dependency-cruiser rule forbids application, domain and infrastructure from importing kit values
- [ ] The architecture decision lists the rule

## Notes
Follow-up to DVTD-dhfx / ADR-160, which moved the band classifier out of the kit but left the copy imports: dexScreen (six kit modules), shopScreen (IncidentDesk COPY), gateOutcome (swatchFillsFor, GateChoice), gateReview, bandOutcomes, incident, prepScreen, categoryLeader, pollScreen (gateTitleOf), newRunScreen, scoring, runOverScreen, playerCard and climbLadder (ClimberCard), profileScreen (ProfileRecord). Per ADR-102 the fix is usually to give the string to the viewmodel that picks it, or to shared copy when two surfaces state it. Rule shape from the 2026-09-25 plan: from modules/{ctx}/{agg}/(domain|application|infrastructure)/ to src/ui/, dependencyTypesNot type-only, error; add to ADR-002 §9.
