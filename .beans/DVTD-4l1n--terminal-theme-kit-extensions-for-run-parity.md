---
# DVTD-4l1n
title: Terminal-theme kit extensions for run parity
status: completed
type: task
priority: high
created_at: 2026-09-01T20:03:03Z
updated_at: 2026-09-01T20:15:11Z
parent: DVTD-tduu
---

Extend terminal-theme screens so they can express the live game. Stories updated in the same edit; no new .spec.tsx in the island.

## PollScreen
- [x] choices gain selected / state? / note? (Choice.ui gained selected + aria-pressed)
- [x] onPick -> onToggle(letter)
- [x] onSubmit? + submitLabel + submitLock? (mirrors PrepScreen.ready)
- [x] code?: readonly string[]
- [x] notices?: readonly string[]
- [x] meta?: readonly string[] for question facts

## ShopScreen
- [x] notice?: string band (ADR-038 shop closed)
- [x] continueLock?: string
- [x] ShopOfferRow lock/pin action (ADR-029); locked renamed to refused, new lock: OfferLock

## NewRunScreen
- [x] combos: {meta, rows: StartCombo[]} (ADR-026 three playstyles + recommended)

## Themes
- [x] GateHoldScreen / ReviewScreen / GameOverScreen gain theme?: SwatchTheme

## Keys
- [x] ReviewScreen keys rows by poll id, not row.question (ReviewRow.id added)

## Deferred (flag, do not build)
- Syntax highlighting in code blocks (DVTD-9dn0 known gap)
- HomeScreen at /run (TodayScreen has a daily-poll widget HomeScreen lacks)

## Summary of Changes

Extended six terminal-theme files so the island can express the live game. No
adapter is wired yet; this is purely the kit contract.

### PollScreen: from mock to playable
Was single-pick with a decorative `disabled` button that had no handler, so a
poll could not actually be answered. Now:
- `PollChoice` carries `selected`, `state` and `note`, so multi-answer polls,
  ESLint cross-outs (`state: "dimmed"` + a `crossed out` note) and the Telemetry
  peek split (`62% picked this`) all have a slot. `Choice.ui` already had `state`
  and `note`; PollScreen simply never passed them through.
- `onPick` became `onToggle(letter)`. Single vs multi select is the adapter's
  business, which is where `poll.answerType` already lives.
- `onSubmit` / `submitLabel` / `submitLock`, mirroring `PrepScreen.ready`: the
  lock reason IS the button label, same as modern-theme settled on.
- `code`, `notices` and `meta` slots. Without `code` every code-block poll would
  have rendered as a question with no code.

### Choice gained `selected`
Filled letter bubble plus a themed frame, and `aria-pressed` on the button so a
multi-select poll is announced correctly. `selected` REPLACES the state class
rather than stacking with it: two border-colour utilities on one element let
Tailwind source order pick the winner, which is the bug that painted out the
flat edges in modern-theme.

### ShopScreen
- `notice` band under the header for ADR-038's one shop-closed statement.
- `continueLock` on the footer, same lock-reason-as-label rule.
- `ShopOfferRow.locked` renamed to **`refused`**, and a new `lock: OfferLock`
  ({pinned, label, onToggle}) added for the ADR-029 Lock control. The old name
  meant "you cannot afford this" while ADR-029 sells a control literally called
  Lock; leaving both under one word would have collided the moment Lock was
  wired. Cheap to rename now, expensive later.

### NewRunScreen
`combos` added: ADR-026's three named playstyles with `recommended`. Three
abreast, name + blurb + press, the press pinned with `mt-auto` so the buttons
line up whatever the blurbs wrap to. Without this, two of the three starter
stacks and the recommendation had nowhere to render.

### Consistency
- `theme?: SwatchTheme` on GateHoldScreen, ReviewScreen and GameOverScreen.
  Every other in-run screen already had it.
- `ReviewRow.id`, keyed on instead of `row.question`. Config labels are unique
  across the 30-config roster so the shop was safe, but nothing guarantees two
  polls do not share a question.

### Verification
Baseline recorded before the first edit: 2639 passing / 3 failing (pre-existing,
`modern-theme/screens/RewardScreen.spec.tsx`).

After: `npm run build` green; `npm run lint` + dependency-cruiser clean (897
modules, 3632 deps); `npm test` **2639 passing / 3 failing** — identical to
baseline, same three files. Stories typechecked via a temporary root tsconfig
clearing the `**/*.stories.tsx` exclusion: **0 errors in terminal-theme**.

### Flagged: stories rot silently, and 24 already have
That temp tsconfig (removed after use) surfaced 24 pre-existing story
typecheck errors in files this work never touched: `ConfiguringScreen`,
`RunCommunity`, `GateRewardReport`, `StripScreen`, module `PrepScreen`,
`RunHud`, `modern-theme/GatesPanel`, `Screen`. The build cannot see them
because tsconfig excludes stories. Worth a permanent `typecheck:stories`
script, but that is a tooling change to agree separately, so nothing was left
behind in the repo.
