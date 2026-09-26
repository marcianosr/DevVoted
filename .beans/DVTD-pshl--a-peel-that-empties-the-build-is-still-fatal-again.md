---
# DVTD-pshl
title: A peel that empties the build is still fatal, against ADR-076 and ADR-057
status: todo
type: bug
priority: high
created_at: 2026-09-23T06:52:18Z
updated_at: 2026-09-23T06:52:18Z
---

The wiki says death is a DANGER close and nothing else (§2.6: *"The peel no longer
runs a build to nothing, because refusing the gate is always available to a player
who cannot pay"*). The code still has a second death.

`isPeelFatal` is live and feeds the strip screen:

```ts
// src/modules/run/run/domain/rules.model.ts:198
export const isPeelFatal = (quotaSlots: number, occupiedSlots: number): boolean =>
	quotaSlots >= occupiedSlots;
```

```ts
// src/modules/run/run/application/runView.viewmodel.ts:628
missIsFatal: isPeelFatal(peelSlots, occupiedSlots(state.build.configs)),
```

## The case

A one-config build at Boulder: `peelQuotaSlotsFor` is `ceil(1 × 0.2) = 1`, occupied is
1, so `1 >= 1` → fatal. Every gate from Boulder on kills a one-config build on a miss,
because `Math.ceil` cannot round a non-zero share down to nothing.

ADR-057 D3 deliberately keeps `0 >= 0` fatal for a **bare** build ("narrowing it to `>`
would strand a run that can never pass"). That reasoning covers zero configs. It does
not obviously cover one, which can pass.

## Why it is unclear rather than simply wrong

`gateRulingFor` (`gate.model.ts:198`) already returns `{closing: "held", heldBy: "bare"}`
for a bare build — it does not kill it. So the two paths disagree about what a build
with nothing left even does, and `missIsFatal` may be a screen-level survivor of the
pre-ADR-076 rule rather than a live death.

## What to decide

- [ ] Is a peel that empties a **one-config** build meant to be fatal?
- [ ] If no: does `isPeelFatal` narrow to `>`, or does the refuse-the-gate exit cover it?
- [ ] If yes: §2.6 of the wiki is wrong and needs the second death documented
- [ ] Either way, reconcile `missIsFatal` with `gateRulingFor`'s `heldBy: "bare"`

Found while fixing the wiki (DVTD-opgd). The wiki was left stating the ADR rule and
claiming nothing about `isPeelFatal`, pending this call.

## Two smaller doc/code drifts found alongside

- **ADR-098's Consequences says `Build.slots` is deleted.** It is unused, not deleted:
  `BuildSlots`, the `slots` branch and the `SlotTrack` path still live in
  `src/ui/kanto-theme/Build.ui.tsx:49, 278-285`, kept alive only by specs, stories and
  `src/test/kantoPoll.factory.ts:383`.
- **`demandFactor` is a dormant hook.** `audit.model.ts:44` declares it and
  `auditDemandFactor` (`:377`) reduces over it, but **no audit sets it**, so
  `gateLadderFor` always scales by 1. Either wire an audit to it or drop it.
