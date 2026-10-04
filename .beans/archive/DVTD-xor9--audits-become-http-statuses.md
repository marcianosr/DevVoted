---
# DVTD-xor9
title: Audits become HTTP statuses
status: completed
type: feature
priority: normal
created_at: 2026-09-01T14:13:23Z
updated_at: 2026-09-01T14:33:55Z
---

Audit gains a code; names become HTTP reason phrases; every surface renders '408 Request Timeout' via auditLabel.

## Summary of Changes

- `Audit` gained `code`; names are now HTTP reason phrases (300/402/403/405/408/409/410/424/502/503/507). Ids untouched, so nothing persisted migrates.
- `auditLabel(audit)` is the single join; the three read models (gateStake.viewmodel, auditdex, gatedex) and runView's offlineConfigs emit it, so no UI file needed a change.
- modern-theme's own AUDIT label map updated in parallel (the island cannot import the domain at runtime).
- Story-only gate audits coded too: Marsh Mirror -> 406 Not Acceptable, Volcano Burn -> 507.
- Wiki 2.3 table + gate ladder + glossary + dials, CHANGELOG entry, and ~20 spec/story files updated.
- New specs: auditLabel reads a status line, one code pairs with one name both ways, per-gate dials of one audit share a status.
