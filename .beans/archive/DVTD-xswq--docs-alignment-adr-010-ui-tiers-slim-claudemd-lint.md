---
# DVTD-xswq
title: 'Docs alignment: ADR-010 (UI tiers), slim CLAUDE.md, lint:arch in pipeline'
status: completed
type: task
priority: normal
created_at: 2026-07-17T09:28:09Z
updated_at: 2026-07-17T09:30:53Z
---

- [x] Chain lint:arch into npm run lint (covers local habit + existing CI lint step)
- [x] ADR-010: two-tier UI separation (extracted from CLAUDE.md)
- [x] CLAUDE.md: replace duplicated architecture sections with pointers to ADR-002/010, fix stale paths
- [x] Update docs/adr/README.md index

## Summary of Changes

lint script now runs oxlint + depcruise, so the existing CI 'npm run lint' step covers architecture boundaries with no workflow change. ADR-010 created (two-tier UI separation, incl. enforcement notes); CLAUDE.md's three duplicated architecture sections (~80 lines) replaced by ~15 lines of pointers to ADR-002/010 with the operational checklist kept inline. README index updated.
