---
# DVTD-qfrl
title: Extract PollLayout shell from PollScreen/RevealScreen
status: completed
type: task
priority: normal
created_at: 2026-09-06T10:13:40Z
updated_at: 2026-09-06T10:18:35Z
---

PollScreen.ui.tsx and RevealScreen.ui.tsx duplicate 6 class constants and ~35 JSX lines, including the ADR-061 coverage-suppression invariant. Extract a shared PollLayout.ui.tsx shell at the terminal-theme root (beside PollInfo.ui.tsx) with children + footer ReactNode slots. Public prop types of both screens stay identical, so no consumer churn.

- [x] Add src/ui/terminal-theme/PollLayout.ui.tsx
- [x] Rewrite PollScreen.ui.tsx over the shell
- [x] Rewrite RevealScreen.ui.tsx over the shell
- [x] Verify build/test/lint against baseline

## Summary of Changes

Added `src/ui/terminal-theme/PollLayout.ui.tsx` (root, beside `PollInfo.ui.tsx`) owning the frame both poll states share: `Panel sidebar`, the ADR-061 coverage-suppression line on `RunHeader`, the `PollInfo` call, the COLUMNS/QUESTION_COLUMN/GAUGED/ASKED nesting, the Build sidebar and the `Byline` tail. Two `ReactNode` slots: `children` (the ASKED column) and `footer` (below the gauge).

Both screens now compose it and keep only what differs by state. Public prop types are structurally unchanged (`build` is now the shared `PollBuild`, same shape), so no story, spec, Tier-2 adapter or route changed.

Reused rather than re-declared: the already-exported `CoverageGaugeProps` as `Omit<..., "className">` for the shell coverage prop; `PollInfo` internal defaults instead of `audits = []` / `facts = []` in each screen.

Boy-scout in RevealScreen: lifted the inline `border-t border-edge pt-4` to an `EQUATION` constant, named the anonymous choices element type as exported `RevealChoice`.

Removed duplication: 6 byte-identical class constants and ~35 byte-identical JSX lines that existed twice now exist once.

## Verification

Baseline captured first because the branch carries unrelated WIP. Build clean before and after (exit 0, 0 TS errors). Lint clean before and after (925 -> 926 modules). Tests 3 failed / 3554 passed before and after, the same 3 pre-existing `src/ui/modern-theme/screens/RewardScreen.spec.tsx` failures, unrelated to terminal-theme.

Equivalence proven with a throwaway spec that rendered every Poll and Reveal story against the HEAD versions of both screens: 15/15 stories produced byte-identical `container.innerHTML`. Scaffolding deleted after.

No story for `PollLayout` (CLAUDE.md excludes layout components; `PollInfo.ui.tsx` and 8 other terminal-theme files are likewise storyless). No CHANGELOG entry, no wiki change: zero player-visible change.
