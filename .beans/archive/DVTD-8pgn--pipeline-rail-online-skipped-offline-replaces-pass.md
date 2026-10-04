---
# DVTD-8pgn
title: 'Pipeline rail: online / skipped / offline replaces pass/fail'
status: completed
type: feature
priority: normal
created_at: 2026-08-25T10:02:42Z
updated_at: 2026-08-25T10:21:46Z
---

The poll rail marks configs with Mark's verdict discs (pass/fail), vocabulary left over from ADR-022's deleted per-config checks. Replace with the three states a config can actually be in on the poll on deck: online (in effect), skipped (not active right now), offline (an audit blocks it). Poll rail only; Start/Prep drop their idle dot.

## Summary of Changes

- `config/domain/effect.model.ts`: `ConfigStatus` (online / skipped / offline), `SkipReason`, `PollStatusContext`, `configStatusFor`. Online = changes this poll's coverage, pays on this answer, sells an action here, reads the run ahead, or suppresses an audit the gate is running.
- `gate/domain/audit.model.ts`: `offlinePairsFor` exported (config + the audit that took it down); `offlineConfigsFor` now a second reading of the same derivation.
- `RunView.offlineConfigs` reshaped to `readonly OfflineConfig[]` (`{ config, audit }`) — one field, no drift between "which configs" and "which audit".
- New `ui/modern-theme/Pipeline.ui.tsx` owns the fold, the status dot, the skip copy and the header counts ("3 online · 2 skipped · 1 offline"). `PollView.component.tsx` is back to pure wiring.
- `Dot` gained `hollow` (tone arm only). `Entry`'s leading is optional, so Start and Prep list configs with no status: all three states are facts about a poll on deck, and those screens have none.
- Docs: ADR-040, wiki §2.9/§8 rail description, CHANGELOG entry + the audits entry's offline sentence, CONTEXT.md (deleted the stale `Check` row ADR-035 had already removed).

Verified: `npm run lint` clean (743 modules, 0 violations), `tsc --noEmit` clean, 2273 tests pass. 3 pre-existing failures in `RewardScreen.spec.tsx` (unmodified files at HEAD, copy the committed component never renders) are untouched by this work.

Deferred: the shop shelf still marks owned offers `pass` and new ones `warn` — same borrowed-verdict problem, own bean.
