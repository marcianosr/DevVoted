# ADR-032: Prep is the post-shop hub — the gate starts from prep, and the shop stays open until it does

## Status

Accepted (2026-08-11, Marciano). **Reorders the reward flow (reward → review →
shop → prep) and moves `finish-reward` from the shop exit to prep's
start-gate button.** [ADR-014](014-daily-gate-lock.md)'s community board
stays the *mid-gate* awaiting-tomorrow beat; the *post-shop* wait now parks
on prep. (DVTD-f7hs)

## Context

After the shop the player was pushed straight to the community board, and
leaving the shop fired `finish-reward` — resetting the draft and closing the
shop for good. Playtest direction (2026-08-11): after the shop you should
land on the build-prep page, and from there either go back to the shop and
keep customizing until the next day's polls open, take the nudge to the
community page, or start the next gate when it's ready.

## Decision

1. **`finish-reward` fires from prep's start button, not the shop exit.**
   The "rewarding" status now spans four page turns — reward → review → shop
   → prep (runRoutes.viewmodel) — so the shop stays open, and revisitable,
   until the climb actually resumes. The daily rollover appends segments
   regardless of status (api/queries), so a run can legally park overnight in
   the shop phase.
2. **Prep is a hub, not a page turn.** While parked: "← Back to shop",
   "Community →", and "Start {gate} gate →". When today's polls are spent
   (`RunView.pollsExhausted` — status-agnostic, unlike `awaitingTomorrow`),
   the start button locks behind the countdown (`useNextPollsCountdown`)
   until local midnight flips it open.
3. **The community board's "back to your run" returns to prep while
   rewarding** — bare `/run` would land the detour on the reward summary.
4. **Proto-run mirrors the routed flow**: summary → review → shop → prep,
   community as a side trip off prep. The old answering-phase prep beat is
   gone — prep lives in the reward phase now; gate 0 is unchanged (Configure
   already shows the stake, the gate-0 exception of runRoutes stands).
5. **The width-demand door (ADR-031) moves with `finish-reward`** and keeps
   guarding it in the reducer, but the *shop exit* enforces it in the UI —
   an under-width build never reaches prep in the first place.

## Consequences

- Two waiting beats, one per phase: mid-gate exhaustion still syncs to the
  community board (ADR-014); post-shop exhaustion shows on prep with the
  shop a click away. "Keep customizing until tomorrow" is now real.
- `RunView` gains `pollsExhausted`; the route sync allows prep during
  "rewarding"; prep stays allowed during "answering" for stale deep links.
- PrepScreen sheds its dead editing props (the Edit-pipeline button had
  already been cut) and gains `startLock` — the countdown label the start
  button wears while the gate is closed.
- An answering-status prep visit (deep link mid-gate) still shows the stake
  with no shop behind it — the hub actions belong to the rewarding phase.
