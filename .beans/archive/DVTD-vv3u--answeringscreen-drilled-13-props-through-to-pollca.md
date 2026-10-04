---
# DVTD-vv3u
title: AnsweringScreen drilled 13 props through to PollCard
status: completed
type: task
created_at: 2026-08-25T18:54:23Z
updated_at: 2026-08-25T18:54:23Z
---

Follows DVTD-ay66. That pass took AnsweringScreen from 44 props to 31 by clustering `paidActions`; the remaining 31 still read as a dump.

## What it actually was

Of AnsweringScreen's 31 props, **13 had exactly one use each: forwarding to `<PollCard>`**. The screen was not using them, it was a conduit. And `PollCard`'s own first six props were exactly `PollView` — the slice DVTD-slqv already extracted, and the shape `RunAnswer` already holds as `view.poll` before unpacking it field by field.

Same sin as `gatePayout`, one level deeper.

## Landed

| file | before | after |
|---|---|---|
| PollCard.ui | 14 | **8** |
| AnsweringScreen.ui | 31 | **23** |
| RunAnswer.component | 38 | **30** |

Three clusters, all reusing types that already existed:

- `poll: PollView` — the six poll fields, at both levels. Zero new vocabulary.
- `reveal?: AnswerReveal` — new type, added beside `AnswerScore` in `answerScore.viewmodel.ts` which already owns that concept. Replaces `correctOptionIds` + `chosenOptionIds` + `revealScore`. "Reveal" was already the codebase's word (`RevealState`, `revealScore`, `revealFor`).
- `clock?: PollClockProps` — reuses `PollClock`'s own prop type, exported for it. Replaces `timeLimitMs` + `remainingMs`.

## Two things fell out

The `clock` prop deleted a prose comment. It used to read "Both or neither — a rail with no cap cannot be drawn", enforcing by convention what one optional object now enforces by type.

The Next/Submit switch was testing `correctOptionIds !== undefined` — using one of the reveal's id lists as a proxy for "are we revealing". Now `reveal ? ... : ...`, which is what it meant.

## Rejected

- **`card: PollCardProps`** (forward all 13 as one blob) — biggest drop, but ties the screen's contract to its child's, and stories set an opaque object.
- **`card: ReactNode`** slot, which is what modern-theme's PollScreen does with `rail?: ReactNode` — best decoupling, but puts JSX in a `.component.tsx` and ADR-010 says Tier 2 is zero HTML. Worth revisiting only together with the existing leaks (ShopView/RewardView have 3 JSX-in-data sites each, and ShopView:113 holds a Tailwind string).
- **Extracting the pipeline column** into its own `.ui`. Still available; would take AnsweringScreen to ~16.

## Verification

- `npm test`: 2337 total / 2326 passed / 3 failed / 6 skipped / 2 todo — identical to baseline, same three pre-existing failures in `src/ui/modern-theme/screens/RewardScreen.spec.tsx`. Targeted: PollCard 14/14, AnsweringScreen 25/25.
- `npm run build`: clean, 0 tsc errors.
- `npm run lint`: clean; `lint:arch` 763 modules / 3118 dependencies, no violations.
- Four story files (PollCard, AnsweringScreen, ScoringReveal + the two already in DVTD-ay66) typechecked separately via a scratchpad tsconfig, since `tsconfig.json` excludes `**/*.stories.tsx` — see DVTD-j3bg. All clean.

## Note on the spec/story rewrite

Scripted the attribute-to-cluster transform, and it mangled two `PollCard.stories` entries where prettier had wrapped a `question:` value onto its own line — the regex read the key as having an empty value. Caught by the story typecheck, repaired by hand. A scripted edit over JSX attributes needs the multi-line-value case or a manual pass.
