---
# DVTD-s9v4
title: 'Config: Try/Catch'
status: completed
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:11Z
updated_at: 2026-09-22T07:05:32Z
parent: DVTD-72d9
---

Survive one failed gate per run

## Re-aimed 2026-09-21 (Marciano)

The 2026-09-06 note on DVTD-72d9 parked this as obsolete: *"guards a rule that no longer
exists: since ADR-037 a missed gate peels configs and reruns, it does not end the run."*
This is the re-aim it asked for.

**DANGER converts to SHAKY, once, and then Try/Catch deletes itself.** The metaphor is
literal: it catches the fatal exception. It is expensive insurance, not extra scoring —
the player still owes the SHAKY peel and still has to retry.

4 slots / 128 KB. At `BASE_SLOTS` 4 that makes it a mid-run purchase rather than an
opening card, which is right for insurance.

## Decisions

- **It catches fully.** A caught close is guaranteed `held`. The second death path,
  `isPeelFatal` (`answer.model.ts:191`), is skipped on a caught close — otherwise the
  config dies in exactly the thin, deep build it was bought for. That branch is a live
  remnant of a retired rule anyway (ADR-037 Decision 2 is dead; rejected.md rejects "peel
  to zero, then die on the strip screen").
- **It pays itself into the peel.** The quota is drawn on the FULL build including
  Try/Catch, then its removal discharges `slotsOf(catcher)` of it — `stripOne`'s exact
  arithmetic. The catch is the first thing the peel takes. If its 4 slots cover the whole
  quota, `peelSlotsRemaining` is 0 and the run resumes straight to the shop.
- **Its absence from the build is the record that it fired.** Config-object flags do not
  survive hydration (`refreshConfig` keeps only `level`), but build membership does. No
  "used" flag needed.
- **Re-drafting buys a second catch at full price.** "Once" is a property of the instance.
- **The conversion lives in `closeWindow`, not `gateClosingFor`** — that function takes a
  `GateClose` with no `RunState` and is a pure predicate with nowhere to spend a charge.

## Todo

- [x] `Config.catchesFatal` + `catcherFor`
- [x] Converted inside `gateRulingFor` as a fourth `heldBy` reason — better than planned
- [x] Quota drawn on the full build, discharged by the catcher's slots
- [x] Skip `isPeelFatal` on a caught close
- [x] Prep: the DANGER row names the catch
- [x] Debrief: a saffron alert line on the held screen
- [x] Roster entry + CONFIG_UNLOCKS (an existing metric — it cannot unlock on catching)
- [x] Specs
- [x] ADR-096 (092-095 were claimed by a parallel session), wiki, CHANGELOG

## Summary of Changes

Built 2026-09-22 as **ADR-096** (092-095 were claimed by a parallel session mid-build).

**One thing landed better than planned.** The plan put the fatal→held conversion in
`closeWindow`, on the grounds that `gateClosingFor` is pure and takes no `RunState`. While
building, a parallel session had already replaced it with `gateRulingFor` returning a
discriminated `GateRuling` with `heldBy: "bare" | "floor" | "band"` — and the catcher lives
on `close.build`, which that function *does* receive. So the catch is simply a fourth hold
reason, `heldBy: "catch"`, decided in the ruling where every other verdict is decided, and
`closeWindow` only spends the charge. Every surface that already read a hold reason picked
it up for free.

**A second thing the plan did not anticipate.** `closedHeldFor` clamps a held gate's bar up
into the SHAKY zone. A caught close really was under the floor, so clamping it up prints a
bar the run never had — the exact inverse of the bug ADR-094 had just fixed for floor holds.
Caught closes now keep their true reading and the *copy* carries the verdict, which is what
makes the catch worth naming on the screen.

### Shape as built

- `Config.catchesFatal` + `catcherFor` (`build.model.ts`), `heldBy: "catch"` in `GateRuling`.
- `closeWindow`: quota drawn on the full build, the catcher's slots discharge it
  (`Math.max(0, quota - slotsOf(catcher))`), `stripConfig` removes it, `isPeelFatal` skipped.
- `RunState.caughtFatalBy` for the receipt, cleared by `finishReward` and `resumeClimb`.
- Readouts: prep's DANGER row reads `caught · peel instead`; the debrief carries a saffron
  `Try/Catch caught` chip, a subtitle reason, and the honest sub-floor bar.
- `armedForFatal` skip reason so the poll chip reads as standing insurance, not idle.
- Unlock `gates-cleared` 40 — it cannot unlock on catching, since you must own it to catch.
- 8 domain specs + 5 debrief specs + a 2-page story.

### Verified

3969 passed, **0 failed** (217 files). `npm run lint` clean (787 modules). `npm run build`
clean. Note the branch baseline moved: it was 2 failed before the parallel session wired
`FLOOR_CORRECT`; it is 0 now.
