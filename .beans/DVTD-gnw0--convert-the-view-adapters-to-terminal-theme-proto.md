---
# DVTD-gnw0
title: Convert the *View adapters to terminal-theme (/proto-run)
status: completed
type: task
priority: high
created_at: 2026-09-01T20:16:27Z
updated_at: 2026-09-01T21:05:42Z
parent: DVTD-tduu
---

Rewrite the 8 *View.component.tsx adapters to render terminal screens, one per commit, cheapest first. Signature {view: RunView, ...callbacks} stays; only bodies change. Adapter specs rewritten in the same commit (behaviour kept, copy-exact dropped).

- [x] ReviewView (5 -> 8 specs); ReviewRow gained id + explainer
- [x] RemovalView (5 -> 8); absorbs the held summary, stripStep lost summary, peel counted in SLOTS
- [x] RewardView (14 -> 14) -> GateClearScreen; outcome union collapsed to cleared
- [x] PrepView (13 -> 14); PrepScreen gained prefetch, Audits gained suppressed
- [x] StartView (18 -> 15) -> NewRunScreen; combos + buy/cash slot lines
- [x] RevealView (12 -> 12) -> RevealScreen, its own screen at last
- [x] PollView (35 -> 27) -> PollScreen; owns the shared terminal helpers
- [x] ShopView (42 -> 30); arm/confirm in Tier 2, keeps offerRefusalText only
- [x] GameOverView (new, 9 specs); archive section withheld, DVTD-54gi
- [x] Deleted orphaned run/run/presentation/GameOverScreen.ui.tsx + its story

Throughout: alias imports at every wiring site (name collisions), drop ~/ui/Screen.ui + RunHud on converted branches, lint/peek via BuildList row use slot.

## Summary of Changes

All nine branches of /proto-run now render terminal-theme, through the same nine
Tier-2 adapters. Every adapter keeps its `{view: RunView, ...callbacks}`
signature, so Phase 3 can point `/run/*` at them unchanged.

### Flow change
The held-gate summary and the peel picker are one screen now (GateHoldScreen
does both), so `stripStep` went from "summary" | "removal" | "review" to
"removal" | "review", and `RewardView` lost its outcome union entirely. That
happens to match how `/run/strip` already worked.

### Mechanics the mock had no slot for, added to the kit
Each of these was a silent gameplay regression until caught:
- **ReviewScreen**: `explainer` (the learning payoff) and `id` keys; `gain` now
  renders on a failed row too, so a partial answer still reports what it banked.
- **Audits**: `suppressed` — a defeat device turning an audit off is what the
  config was bought for; hiding the row hides the payoff. Struck, not dropped,
  and left out of the running count.
- **PrepScreen**: `prefetch` — upcoming categories had nowhere to go.
- **RevealScreen**: `explainer`.
- **Trail**: `verdicts` — every answered dot was the same colour, so the window
  could not be read at a glance.
- **NewRunScreen / ShopScreen**: `cashSlot`. The archive and the shop both sell
  width in two directions (ADR-049); only the buy side had a slot.
- **BuildList**: the audit that took a config offline rides the `figure` slot,
  since a blocked row renders no detail in the rail.

### Disabled states
Eight kit buttons rendered enabled with no handler — pressable-looking and
inert. `BuyLine`, `GateHoldScreen` remove, `NewRunScreen` start and deploy,
`ShopScreen` buy/upgrade/remove, `GameOverScreen` share/new-run all now disable
when their handler is absent. `PlanRow` gained an `aria-label`; it had no
accessible name at all.

### Domain change
`AuditView` gained `code` and its `name` went bare. `auditLabel` had baked the
code into the name ("424 Failed Dependency"), which the terminal kit renders as
two elements. Two consumers updated (`GateStakeReceipt`, and PollView, which
never read the name anyway).

Config version now reads `v${level ?? 1}` on every adapter rather than hiding
the tag when `level` is undefined — the domain treats an un-upgraded config as
v1 everywhere else.

### Known gaps
- `GameOverScreen.archive` is withheld, not faked: what a finished run banks is
  DVTD-54gi, still todo. Rendering a zeroed SplitBar would have invented a
  number.
- Code blocks still lose syntax highlighting (pre-existing, DVTD-9dn0).
- The poll rail collapses skipped configs to one "N sitting out" line and drops
  the per-config reason. That is the kit's density choice; prep carries the
  detail.
- `/proto-run` community and the RunHud on it are untouched.

### Verification
Baseline before Phase 1: 2639 passing / 3 failing.
Now: **2632 passing / 3 failing** — the same three pre-existing
`modern-theme/screens/RewardScreen.spec.tsx` copy assertions, red before this
started. The lower total is spec consolidation, not lost coverage: PollView
35->27, StartView 18->15, ShopView 42->30 (copy-exact assertions dropped),
against ReviewView 5->8, RemovalView 5->8, PrepView 13->14 and a new
GameOverView at 9.

tsc 0 errors; oxlint clean; dependency-cruiser clean (897 modules, 3626 deps);
stories typecheck 0 errors in terminal-theme (temp root tsconfig, removed
after); /proto-run serves HTTP 200 with no server errors.

Storybook needs a restart: `bg-theme-soft` on a Choice letter bubble and the
combo card classes are new utilities.
