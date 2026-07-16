---
# DVTD-dqhu
title: 'Address PR #97 review comments'
status: completed
type: task
priority: normal
created_at: 2026-07-16T19:59:32Z
updated_at: 2026-07-16T20:13:20Z
---

Fix all of Marciano's own inline review comments on https://github.com/marcianosr/DevVoted/pull/97 (feat/setup-phase-1 -> epic/new-concept).

## Todo
- [ ] docs/adr/002-domain-architecture.md:34 — "Did you actually adhere to this?" — verify claim in doc vs actual code, reconcile
- [ ] docs/adr/007-run-rebuild-conventions.md:24 — "Update this" (Kanto color table)
- [ ] docs/adr/007-run-rebuild-conventions.md:30 — "This changed to jetbrains" (typography section, font is now JetBrains not Pixter Display)
- [ ] docs/adr/007-run-rebuild-conventions.md:34 — "Update" (typography primitives section)
- [ ] docs/adr/007-run-rebuild-conventions.md:49 — Add wording: never auto-add a comment, only when necessary
- [ ] src/modules/session-run/configs/config.model.ts — remove JSDoc comments (multiple), extract magic number 60 in upgradeCost to named const
- [ ] src/modules/session-run/gate/configRole.model.ts — remove JSDoc comments (multiple)
- [ ] src/modules/session-run/presentation/configs/ConfigChip.spec.tsx — describe(ConfigChip, ...) not string literal
- [ ] src/modules/session-run/presentation/configs/ConfigChip.ui.tsx — remove JSDoc comments (multiple)
- [ ] src/modules/session-run/presentation/gate/CheckList.ui.tsx — remove JSDoc comments, running state color saffron not vermillion (2 spots)
- [ ] src/modules/session-run/presentation/gate/GateTracker.ui.tsx — remove JSDoc comment, refactor ugly nested ternaries
- [ ] src/modules/session-run/presentation/gate/RoleList.ui.tsx — dedupe STATE_TEXT/STATE_ROW with CheckList.ui.tsx, remove JSDoc comments, bump remove-button icon size
- [ ] src/modules/session-run/presentation/pipeline/Pipeline.ui.tsx — extract empty-slot into own component, extract showNewBadge variable
- [ ] src/modules/session-run/presentation/poll/CommunityAnswers.ui.tsx — remove JSDoc comments
- [ ] src/modules/session-run/presentation/poll/PollCard.ui.tsx — remove comments, refactor nested ternaries, add/update Storybook story
- [ ] src/modules/session-run/presentation/run/RunHud.ui.tsx — extract CoverageSummary dropdown into its own UI component
- [ ] src/modules/session-run/presentation/screens/RewardScreen.ui.tsx — evaluate reuse of totalCoverageGained-style rounding helper elsewhere
- [ ] src/modules/session-run/presentation/screens/ShopScreen.ui.tsx — remove comments
- [ ] src/modules/session-run/view/sessionView.viewmodel.ts — remove comments (x2), review gainedThisGate rounding formula duplication

## Summary of Changes

Most comments (config.model.ts, configRole.model.ts, ConfigChip.*, CheckList.ui.tsx, ADR-007 doc x4) were already fixed in later commits (65f60f1, a4c7caf, 4466a60) before this pass started. The ADR-002 comment ("Did you actually adhere to this?") is moot — that file's content was reverted to old ADR-002 in a later commit and is no longer part of the PR diff at all.

What I actually fixed this pass:
- Applied `describe(Component, ...)` convention (vs `describe("Component", ...)`) to all 14 remaining spec files that had been missed — only ConfigChip.spec.tsx had it.
- GateTracker.ui.tsx: replaced nested ternaries with a `GateState` type + `BORDER`/`ACCENT`/`LABEL` record lookups; removed stray JSDoc.
- RoleList.ui.tsx + CheckList.ui.tsx: extracted duplicated `STATE_TEXT`/`STATE_ROW` CheckState-color maps into new shared `presentation/gate/checkStateStyles.ts`; fixed inconsistent "running" color (was vermillion in RoleList, saffron in CheckList — unified on saffron); bumped RoleList remove-button icon to `text-lg`.
- Pipeline.ui.tsx: extracted the empty-slot placeholder into a named `EmptySlot` component.
- CommunityAnswers.ui.tsx, PollCard.ui.tsx, ShopScreen.ui.tsx: removed remaining "what" JSDoc comments per ADR-007 §4.
- PollCard.ui.tsx: replaced deeply nested `row`/`box`/`mark` ternaries with an `OptionStatus` type + record lookups (same pattern as GateTracker). Storybook already has a `WithLinter` story covering the flagged linter button.
- Found the *actual* root of "same formula as mentioned earlier" / "we need this on more places": `Math.round(x * 10) / 10` was duplicated 6x across pipeline.model.ts, sessionRun.model.ts (x2), sessionView.viewmodel.ts, and RewardScreen.ui.tsx. Extracted `roundToOneDecimal` into `rules.model.ts` and replaced all 6 call sites.
- sessionView.viewmodel.ts: removed all remaining field-level JSDoc on `SessionView`/`PollView` and the two function-level comments, per the "remove the comments" instructions.
- RunHud.ui.tsx: the flagged "needs its own dropdown component" — the existing `src/ui/Dropdown.component.tsx` is a legacy menu-style dropdown (gray/red palette, click-outside-to-close, menu semantics) used only by `__root.tsx`, wrong fit for a read-only Kanto-themed stat summary. Extracted a new session-run-scoped `presentation/run/SummaryDropdown.ui.tsx` instead and wired both `LoadoutSummary` and `CoverageSummary` (previously hand-rolled duplicates) through it.

Verified: `tsc --noEmit` clean, `npm run lint` clean, `vitest run src/modules/session-run` — 140/140 passing.

Not done (needs a user call): resolving/replying to the review comment threads on GitHub itself — left that to the user since it's a visible, shared-state action.
