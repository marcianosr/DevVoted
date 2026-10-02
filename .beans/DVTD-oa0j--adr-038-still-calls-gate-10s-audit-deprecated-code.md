---
# DVTD-oa0j
title: ADR-038 still calls gate 10's audit "Deprecated"; code says "Breaking Change"
status: completed
type: task
priority: low
created_at: 2026-08-23T18:08:18Z
updated_at: 2026-10-01T15:39:18Z
---

Found while checking the Dex Gates mock against the domain (DVTD-gkln).

`docs/adr/038-the-audit-roster.md` names gate 10's audit **Deprecated** in both its schedule table and its mechanics table. The code renamed it **Breaking Change** on 2026-08-20 (comment at `src/modules/run/gate/domain/audit.model.ts:145`) because `Deprecated` is now a config. `docs/wiki.md` is already correct.

- [ ] Rename Deprecated to Breaking Change in ADR-038's two tables

## Summary of Changes

Closed in the 2026-10-01 stale-bean sweep: the code already does this. ADR-038 now reads Breaking Change, with no Deprecated left.
