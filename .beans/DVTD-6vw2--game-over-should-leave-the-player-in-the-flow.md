---
# DVTD-6vw2
title: Game over should leave the player in the flow
status: draft
type: feature
priority: normal
created_at: 2026-08-24T12:48:34Z
updated_at: 2026-08-25T11:45:24Z
parent: DVTD-kulw
---

A dead run currently ends on a screen with one way out. Game over should hand the
player their next thing to do, not a summary and a door.

## Decided (2026-08-25, Marciano)

- The screen gets a **redesign**, not just an extra exit.
- **Game over routes to the community page.** That is the answer to "what next" for a
  finished run, so the options below collapse to one primary action plus whatever else
  survives the redesign.
- The start screen needs its own community entry point too, tracked separately.

Scope note: `src/ui/modern-theme/screens/` has Start, Poll, Prep, Shop, Review, Reward,
Removal and Dex, and **no run-over screen**. The end of the run is the one surface the
reskin never reached, which is part of why it reads as an afterthought. The redesign is
that missing screen (see DVTD-9dn0, wiring modern-theme screens into the run).

## Where it stands today

- `routesForStatus` (`run/application/runRoutes.viewmodel.ts`) maps both `won` and
  `dead` to exactly one route: `RUN_ROUTES.over`. The end screen is terminal by
  construction, not by styling.
- `RunOver.component.tsx` offers a single `rightAction`, "Start a new run →". If the
  mutation fails, the screen renders the raw error string in a `Paragraph`. That is
  the current worst case: a broken build, then an error message.
- `RunSummary.ui.tsx` already earns attention: gate ladder, coverage, swatches earned
  ("kept forever"), configs held, the meta storage bar, and a fold-out answer review.
  The content is there. The routing is what dead-ends.
- One escape hatch already exists but only for a different state: `syncTarget` sends
  `awaitingTomorrow` players to the community route.
- Deaths are now rare (ADR-037 left one: a peel with nothing left to take), which
  makes the moment higher stakes, not lower. It is the run's only real loss.

## The precedent worth copying

ADR-026 Decision 3 settled this exact question one screen earlier: the gate clear is
a payoff, not a report, and it routes straight into spending the storage at the shop.
Run over is the same shape and does not do the same thing. Whatever the run just
produced (banked meta storage, swatches, dex progress, a pile of wrong answers) should
have a place to be spent or continued, and the end screen should point at it.

## What "in the flow" could mean

Not mutually exclusive; the decision is which one is the primary action.

- **Straight into the next run.** Cleanest when the day's window still has polls.
  Needs an honest answer for when it does not: today that path produces an error
  paragraph, and `pollsExhausted` plus the countdown already model the state properly
  elsewhere (`RunPrep.component.tsx`). Reuse that, do not invent a second story.
- **Into the community screen.** Same-day comparison against other climbers is the
  most natural "so how did that go" follow-on, and the route already exists.
- **Into the wrong answers.** The run just generated a list of things this player got
  wrong. Reviewing or retrying them is the one action that turns a loss into progress.
  Pairs directly with the poll backlog bean.
- **Into meta spending.** If banked storage buys anything permanent, the end screen is
  where that purchase wants to happen, exactly as the gate clear routes into the shop.

## Rules any answer has to respect

- A loss screen may not read as a punishment screen. "Build broke!" plus a percentage
  of storage burned is already the sting; the next line should be forward-facing.
- Do not stack four buttons. One primary action, the rest inline, per the compact
  affordance preference.
- Whatever is offered must be true when polls are exhausted. That state is the common
  case for a second run in one day, not an edge case.

## Todo

- [x] Pick the primary next action: the community page
- [ ] Build the missing modern-theme run-over screen as part of the redesign
- [ ] Decide whether a won run exits the same way a dead one does
- [ ] Define the exhausted-window variant so no player ever lands on a raw error string
- [ ] Decide whether `routesForStatus` should allow more than one route for a finished run
- [ ] Amend ADR-026 Decision 3 to cover run end, or write the sibling decision
