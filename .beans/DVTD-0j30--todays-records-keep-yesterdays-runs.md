---
# DVTD-0j30
title: Today's records keep yesterday's runs
status: completed
type: bug
priority: normal
created_at: 2026-10-08T07:14:38Z
updated_at: 2026-10-08T07:31:46Z
---

**What:** The community panel's records and outcomes count only what happened today.

**Why:** A live run started yesterday counted in full, so the records never reset at midnight.

## Done when
- [x] A gate close remembers the day it closed and the storage it left
- [x] A live run with no close today is missing from outcomes and records
- [x] KB generated and KB spent count today only
- [x] A run that fell today stays in DANGER
- [x] ADR-176, wiki and changelog say what "today" means

## Notes
Root cause: fetchActiveClimbers has no date filter and dayRecordsOf reads the whole run's closes. Legacy closes carry no date and never count as today.

## Summary of Changes

Every recorded close is stamped with the day it closed on and the storage left after it. The community turnout keeps a live run only through a close made that day, splits its closes into that day and before, measures KB spent from the storage after the last earlier close, and lets a comeback see an earlier day hold. A run that fell today stays in DANGER. ADR-176 amended, wiki and changelog updated.

Shipped alongside: a ready upgrade pennant wears a notched prismatic border instead of a glow.
