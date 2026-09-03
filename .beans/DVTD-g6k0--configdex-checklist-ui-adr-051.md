---
# DVTD-g6k0
title: Configdex checklist UI (ADR-051)
status: todo
type: feature
created_at: 2026-09-03T07:10:05Z
updated_at: 2026-09-03T07:10:05Z
parent: DVTD-z2r2
blocked_by:
    - DVTD-clgs
---

The Dex Configs tab becomes the checklist board: locked configs are ? cards showing both unlock paths with live progress; granted rows read as provenance.

## Todos

- [ ] `configdex.model.ts` fold (collection/dex/domain): roster x unlocked ids x progress into `granted | locked` entries; locked entries carry no `Config` (the `?: never` redaction idiom at the domain layer); granted-count helper
- [ ] repository/service/serverfn trio beside polldex; userId from `getAuthenticatedUserId()`
- [ ] `userQueryKeys.unlocks`; invalidation line in `useRunActions.hook.ts` next to swatchesAll
- [ ] `ConfigdexPanel.ui.tsx` takes `entries`: ??? silhouette, FamilyDot, slot figure, both requirement lines as visible captions (DVTD-aiyp: never tooltip-only); one-shot paths render a checkbox without n/m; stories + spec assert the captions are text
- [ ] `Dex.component.tsx`: query + fold + granted/total tab count (replaces the hardcoded total/total)
- [ ] met state (ADR-050 Reveal, named-dimmed): needs a seen-on-shelf ledger nothing writes yet; can land after ???/granted ship
- [ ] terminal-theme `ConfigsPanel` locked-with-progress variant + DexChip progress affordance: coordinate with the in-flight terminal-theme churn, split out if it grows
