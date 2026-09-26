---
# DVTD-g6k0
title: Configdex checklist UI (ADR-051)
status: completed
type: feature
priority: normal
created_at: 2026-09-03T07:10:05Z
updated_at: 2026-09-06T12:01:07Z
parent: DVTD-z2r2
blocked_by:
    - DVTD-clgs
---

The Dex Configs tab becomes the checklist board: locked configs are ? cards showing both unlock paths with live progress; granted rows read as provenance.

## Todos

- [x] `configdex.model.ts` fold (collection/dex/domain): roster x unlocked ids x progress into `granted | locked` entries; locked entries carry no `Config` (the `?: never` redaction idiom at the domain layer); granted-count helper
- [x] repository/service/serverfn trio beside polldex; userId from `getAuthenticatedUserId()`
- [x] `userQueryKeys.unlocks`; invalidation line in `useRunActions.hook.ts` next to swatchesAll
- [x] `ConfigdexPanel.ui.tsx` takes `entries`: ??? silhouette, FamilyDot, slot figure, both requirement lines as visible captions (DVTD-aiyp: never tooltip-only); one-shot paths render a checkbox without n/m; stories + spec assert the captions are text
- [x] `Dex.component.tsx`: query + fold + granted/total tab count (replaces the hardcoded total/total)
- [x] ~~met state~~ DEFERRED (2026-09-06): needs the seen-on-shelf ledger nothing writes yet (ADR-050 Reveal, named-dimmed): needs a seen-on-shelf ledger nothing writes yet; can land after ???/granted ship
- [x] ~~terminal-theme `ConfigsPanel` locked-with-progress variant~~ DEFERRED (2026-09-06) to DVTD-e15y + DexChip progress affordance: coordinate with the in-flight terminal-theme churn, split out if it grows

## Summary of Changes

Shipped 2026-09-06 on top of DVTD-clgs.

- `unlockCaption.model.ts` (run/config/domain): the ONE place unlock copy lives — `thematicCaptionFor`/`fallbackCaptionFor` return structured `UnlockPathCaption` (counted vs one-shot), `provenanceOf` prints "Starter config" / "Earned: …" off `via_metric`. Dex and the announce surfaces both read it.
- `configdex.model.ts` fold: `granted | locked` union; a locked entry carries NO `Config` (`config?: never`) — only id (React key), slots and the two captions. Free set reads granted without a ledger row (presentation guard for pre-seed accounts, noted divergence from strict ADR-064 row-exists).
- Trio: `configdex.repository.ts` (flat rows), `configdex.service.ts` (+spec), `configdex.serverfn.ts` (`withAuthenticatedUser`). Fold is client-side — the roster ships in the bundle; locked labels are no wire secret (shop shelf shows them), the redaction is presentation integrity.
- `userQueryKeys.unlocksAll`/`unlocks(userId)` two-level pair; `invalidateSideViews` third line + spec.
- `ConfigdexPanel.ui.tsx` takes `entries`: header + per-group granted/total counts, locked rows = dashed ??? silhouette (slot-sized `sizeFill` mark) + BOTH paths as visible captions ("… · 3/5"; one-shot = ☐/☑ without n/m, DVTD-aiyp). Granted rows = ConfigChip + provenance caption. Stories rewritten (EarlyAccount/MidCollection/AllCollected over the real fold); spec asserts captions as visible text and that a locked label never renders.
- `Dex.component.tsx`: fourth query under `userQueryKeys.unlocks`, tab count = granted/total (undefined while pending), local ConfigsTab with pending/error states. Hardcoded total/total gone.

FamilyDot from the original todo was stale wording — `ConfigFamily` is deleted (ADR-055); hue is slot size via `sizeFill`.
