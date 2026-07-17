---
# DVTD-3gsu
title: Convert conditional className logic to cva
status: completed
type: task
priority: normal
created_at: 2026-07-17T07:57:15Z
updated_at: 2026-07-17T08:14:58Z
---

Convert every conditional/template-literal className pattern in src/ui/ (design system) and src/modules/session-run/presentation/ to cva (class-variance-authority), per CLAUDE.md: "Use CVA to define component variants. Do not concatenate class strings with conditional logic."

class-variance-authority installed as a new dependency.

## Todo
- [x] src/ui/rarityColors.ts — left untouched: consumed by 7+ files outside scope (src/domains/economy, src/routes/admin.tsx). Kept as the Record source of truth; ConfigChip derives its own cva variants from it instead.
- [x] src/modules/session-run/presentation/gate/checkStateStyles.ts
- [x] src/ui/typography/Title.component.tsx
- [x] src/ui/typography/Subtitle.component.tsx — no action needed, false positive (no variant logic)
- [x] src/ui/typography/Paragraph.component.tsx
- [x] src/ui/typography/GradientText.component.tsx — no action needed, false positive (no variant logic)
- [x] src/ui/Badge.component.tsx
- [x] src/ui/Button.component.tsx
- [x] src/ui/Swatch.component.tsx
- [x] src/ui/Popover.component.tsx
- [x] src/ui/Tooltip.component.tsx — no action needed, surfaceClassName is an open prop not an enum
- [x] src/ui/Screen.ui.tsx
- [x] src/ui/Stack.ui.tsx
- [x] src/ui/polls/PollAnsweringScreen.ui.tsx
- [x] src/ui/polls/PollOptionRow.ui.tsx
- [x] src/ui/runs/CurrentPipeline.ui.tsx — no action needed, Records map to icons/labels not classNames
- [x] src/modules/session-run/presentation/configs/ConfigChip.ui.tsx
- [x] src/modules/session-run/presentation/gate/CheckList.ui.tsx
- [x] src/modules/session-run/presentation/gate/GateTracker.ui.tsx
- [x] src/modules/session-run/presentation/gate/RoleList.ui.tsx
- [x] src/modules/session-run/presentation/poll/CommunityAnswers.ui.tsx
- [x] src/modules/session-run/presentation/poll/PollCard.ui.tsx
- [x] src/modules/session-run/presentation/run/AnswerResults.ui.tsx
- [x] src/modules/session-run/presentation/run/RunSummary.ui.tsx
- [x] src/modules/session-run/presentation/run/SummaryDropdown.ui.tsx
- [x] src/modules/session-run/presentation/screens/GameOverScreen.ui.tsx
- [x] src/modules/session-run/presentation/screens/StepHeading.ui.tsx

Scope explicitly excludes legacy src/domains/ and src/routes/ (user chose src/ui/ + session-run only).

Verify at the end: tsc --noEmit, npm run lint, full vitest run, then commit to feat/setup-phase-1 (user asked explicitly).

## Summary of Changes

Installed class-variance-authority. Converted every genuine variant/conditional className pattern in scope to cva. Two files turned out to be false positives from the initial grep (no actual variant logic, just a passthrough `className` prop): src/ui/typography/Subtitle.component.tsx and src/ui/typography/GradientText.component.tsx — left untouched. src/ui/Tooltip.component.tsx's surfaceClassName is an open (non-enum) prop, not a cva candidate — left untouched. src/ui/runs/CurrentPipeline.ui.tsx's Records map to icons/text labels, not classNames — left untouched.

rarityColors.ts's exported Record and Rarity type were kept as-is (not converted) since 7+ files outside the agreed scope (src/domains/economy, src/routes/_authed/admin.tsx) depend on its exact shape. ConfigChip.ui.tsx now derives its own `chipSurface`/`tooltipSurface`/`rarityLabel` cva variants programmatically from RARITY_COLORS, so it still gets cva-based composition without touching the shared token or its other consumers.

Button.component.tsx was the trickiest: variant × size × isDisabled interplay (size only applies to the primary variant) modeled with cva's compoundVariants — verified against all 6 existing Button.spec.tsx assertions.

Mid-task discovered the user had switched branches externally (feat/setup-phase-1 → feat/backend) and committed two rounds of their own work in parallel, including one commit ("fix: comments") that absorbed my earlier PR-review-comment-fix session. Confirmed feat/setup-phase-1 was a clean ancestor of feat/backend (only missing an unrelated docs/adr/002 edit), so checked out feat/setup-phase-1 and committed the cva work there as asked, without losing anything.

Verified: tsc --noEmit clean, oxlint clean, full vitest run — 712 passed / 1 pre-existing unrelated failure (Subtitle.spec.tsx, confirmed failing before this change too) / 6 skipped / 2 todo.
