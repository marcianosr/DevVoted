---
# DVTD-g7ut
title: 'Poll budget: show what today allows, and say why the run parks at community'
status: todo
type: feature
priority: high
tags:
    - ui
    - gameplay
created_at: 2026-08-22T07:51:30Z
updated_at: 2026-09-04T15:03:59Z
parent: DVTD-u35m
---

A gate closes at exactly 5 answered polls (`SLICE_WINDOW`, `run.model.ts:839`) and a day deals exactly 5 (`SEED_LENGTH = SLICE_WINDOW`). When those two fall out of phase — you enter a window with only 3 of today's polls left — you answer the 3, hit the wall mid-window, and the app moves you to the community page with no explanation at the moment it happens.

## What happens today

- `isAwaitingTomorrow` = `status === "answering" && currentIndex >= polls.length` (`run.model.ts:465`).
- `syncTarget` then hard-redirects from any run screen: `if (view?.awaitingTomorrow) return COMMUNITY_ROUTE` (`runRoutes.viewmodel.ts:75`). Silent — the player is simply somewhere else.
- The only sentence explaining it is the `hint` on the community page's *disabled* "Back to your run" button: "Today's polls are spent. Your run picks up when the next segment drops at midnight." You have to hover or tap a disabled button to find out why you were moved.
- Prep shows a countdown on the locked Start button (`RunPrep.component.tsx`, `startLock`), but never the poll arithmetic.

Nothing anywhere states how many polls today holds, or how many are still owed to the window. The player learns the run stalled by being relocated.

## What the player should see

- **How many polls today still allows** — before starting a gate, not after being cut off.
- **How many are still needed to close the window and open the shop** — the gate's demand in polls, alongside its demand in coverage.
- **Why the run parked**, said at the moment of the redirect and on the destination, not hidden in a disabled button's tooltip.

## Open

- Is a stall mid-window the intended shape at all, or should a window never start unless the day can finish it? Blocking the start would trade a confusing interruption for a clear refusal, and is a rules change, not a copy fix.
- The partial window's answers survive to tomorrow. Worth saying so explicitly — the player has no reason to trust that 3 correct answers are not being thrown away.
- Does the countdown belong on the answering screen too, or only where a gate can be started?
