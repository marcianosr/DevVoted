---
# DVTD-6vw2
title: Game over should leave the player in the flow
status: completed
type: feature
priority: normal
created_at: 2026-08-24T12:48:34Z
updated_at: 2026-09-22T18:50:32Z
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

## Todo (historical — the live list is **Still open** at the foot)

- [x] Pick the primary next action: ~~the community page~~ **start a new run**, community beside it (see Reversal below)
- [x] Build the missing run-over screen as part of the redesign (kanto, not modern-theme)
- [x] Decide whether a won run exits the same way a dead one does: yes, one screen, won copy
- [x] ~~Decide whether `routesForStatus` should allow more than one route~~ — the
      shipped design needs no second route: `/run/community` is deliberately
      outside the policed set (`runRoutes.viewmodel.ts:16`), so the aside works
      without one. Only owes a sentence; folded into the ADR item below.

The exhausted-window variant and the ADR-026 amendment moved to **Still open**
rather than being repeated here.

## Model change 2026-09-12 (DVTD-nd6r)

The end of a run got more abrupt, which raises this bean's stakes.

Under ADR-037 a run died at the end of a peel chain, three or four shrinking
gates with a receipt warning each time. ADR-071 replaced that: closing a gate in
DANGER ends the run on the spot, with no warning step in between. The screen
this bean is about is now the only place the player finds out.

It also has a new sibling state. OK and SHAKY are not clears and not deaths:
the gate stays shut and runs again tomorrow on five fresh polls. That outcome
has no screen at all today, and it is going to be the most common one.

- [x] ~~Design the repeat outcome as well as the death~~ — **obsolete**. ADR-071
      was deleted and ADR-076 supersedes it: OK now *clears, thin*, and SHAKY
      holds the gate and owes a peel, both drawn on the gate outcome screen
      (`gateOutcome.viewmodel.ts:297`). The repeat is not game over and correctly
      does not live here. ADR-076's own open end, that `survivesGate` is one
      boolean so nothing routes on it, is DVTD-7uil.

## Reversal 2026-09-15 (Marciano)

The 2026-08-25 decision above said game over routes to the community page. Working
from the run-over mockup, that is reversed: **Start new run** is the primary action and
**Community** is an ambient aside beside it. The bean's actual goal was "do not dead-end",
and an aside satisfies it without making the player take a detour to start again.

## What shipped

A dedicated kanto run-over screen reporting the whole climb, not the last gate.

- `src/ui/kanto-theme/RunOverScreen.ui.tsx` (+ story, spec) — header, coverage, gate by
  gate, by category, the build at the end, storage, unlocked, footer.
- `src/modules/run/run/application/runOverScreen.viewmodel.ts` (+ spec) — frame in,
  props out, mirroring `gateOutcomePropsFor`. Owns every string.
- `src/modules/run/run/presentation/RunOverView.component.tsx` (+ spec) — Tier 2.
- `src/test/kantoRunOver.factory.ts` — fixtures for the story and both specs.
- `PollScoreRow` gained optional `label` and `tag`, so `runPaidFor` rows can name their
  gate instead of counting answers, and the best gate can be flagged.
- `RunState.upkeepPaidKb` — a run-wide upkeep tally; only the last gate's bill survived.
- Adopted on the real `/run/over` route (`src/routes/_authed/run/over.tsx` →
  `RunOver.component`). The old-theme `RunSummary` was deleted in `1cbe58ee`;
  `archiveAfterKb` is populated server-side at `run.service.ts:44`.

## Still open (audited 2026-09-16)

This section used to repeat the `## Todo` list verbatim, which made the bean read
3/12 when it was 3 of 8. Two items are genuinely open:

- [x] **The exhausted-window variant on `/run/over`.** Split out as **DVTD-3q07**. The raw error string is
      gone, but nothing replaced it: `pollsExhausted` is modelled in
      `runView.viewmodel.ts` and the prep/start components and appears nowhere in
      `RunOver.component.tsx`. A player with no polls left presses **Start new
      run** and the mutation fails silently. The failure moved from ugly to
      invisible.
- [x] **Amend ADR-026 Decision 3, or write the sibling ADR.** Split out as **DVTD-dl2n**. Its only amendment
      (`:69`) covers the gate-clear ledger; Decision 3 never mentions run end.
      Fold in the one-sentence `routesForStatus` note while writing it.

The other three are resolved above: the screen is adopted on `/run/over`, the
repeat outcome moved to the gate screen under ADR-076, and `routesForStatus`
needs no second route.

## Closed 2026-09-22

The feature this bean names shipped: a dedicated kanto run-over screen, adopted on the
real `/run/over` route. Verified present today — `RunOverScreen.ui.tsx` (+ story, spec),
`runOverScreen.viewmodel.ts` (405 lines, + spec), `RunOverView.component.tsx` (+ spec),
`kantoRunOver.factory.ts`, and the route `src/routes/_authed/run/over.tsx`.

Both remaining items were re-verified as genuinely open, and both were split out rather
than carried here — neither is about the screen this bean asked for:

- **DVTD-3q07** — Start new run fails silently when the day is spent. `pollsExhausted`
  appears in 7 places, none on the RunOver path. Filed as a bug under DVTD-0x5c and
  marked as blocking DVTD-ecjo, which is the same gap at the other entry point.
- **DVTD-dl2n** — ADR-026 Decision 3 never mentions run end. Confirmed by grep: zero
  matches for `run end|run over|end the run|game over|final|last poll|exhaust` across the
  whole 115-line file.

The bean's actual goal — "do not dead-end" — is met: **Start new run** is the primary
action with **Community** as an ambient aside, per the 2026-09-15 reversal.
