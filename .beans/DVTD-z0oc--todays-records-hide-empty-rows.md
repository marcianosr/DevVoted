---
# DVTD-z0oc
title: Today's records hide empty rows
status: completed
type: bug
created_at: 2026-10-08T07:43:07Z
updated_at: 2026-10-08T07:43:07Z
---

**What:** Every outcome and record row on the community panel is drawn, empty or not.

**Why:** Hiding unreached rows left one row before anybody closed a gate, which read as the records being removed.

## Done when
- [x] An outcome nobody reached reads 0 with no faces
- [x] A record nobody holds reads a dash with no faces
- [x] ADR-176, wiki and changelog say empty rows stay drawn

## Notes
Follow-up to DVTD-0j30. Record order is fixed in the community screen viewmodel.

## Summary of Changes

The turnout viewmodel maps every DAY_OUTCOME (count 0 when empty) and every record kind in a fixed order through one row table; an unheld record gets a dash. ADR-176 amended.
