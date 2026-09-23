---
# DVTD-3q07
title: Start new run fails silently on /run/over when the day's polls are spent
status: todo
type: bug
priority: high
created_at: 2026-09-22T18:49:00Z
updated_at: 2026-09-22T18:49:14Z
parent: DVTD-0x5c
blocking:
    - DVTD-ecjo
---

Split out of DVTD-6vw2, whose screen shipped. This is the one behaviour still missing.

## What happens

A player whose daily window is spent lands on `/run/over`, presses **Start new run**, and
nothing happens. No error, no explanation, no countdown.

`RunOver.component.tsx:19-22` fires the start mutation with only a pending guard and no
result handling, and `RunOverView.component.tsx:11-17` has no error or refusal prop to
surface one. Compare `RunStart.component.tsx:93`, which does pass
`error={start.data?.success === false ? start.data.error : undefined}`.

The bean this came from notes the failure used to render a raw error string. Deleting that
string moved the failure from ugly to invisible, which is worse.

`pollsExhausted` is modelled and used in 7 places — `runView.viewmodel.ts:254,540`,
`RunStart.component.tsx:53`, `RunPrep.component.tsx:59`, `PrepView.component.tsx:114`,
plus spec and factory. **Zero of them are on the RunOver path.**

## Two patterns already in the repo

Prefer the first — it needs no kit change:

```ts
// RunPrep.component.tsx:58-60
startRefusal={view.pollsExhausted && !countdown.isOpen ? countdown.label : undefined}
// PrepView.component.tsx:114
onPress: view.pollsExhausted ? undefined : onStart
```

Both read the window via `useNextPollsCountdown`
(`~/modules/run/community/presentation/useNextPollsCountdown.hook`), which
`RunOver.component.tsx` does not yet import.

The footer action is built at `runOverScreen.viewmodel.ts:393-403`
(`NEW_RUN_LABEL = \"Start new run\"`, `:43`). `RunOverScreen.ui.tsx` has **no**
`error`/`refusal`/`disabled` prop, so nulling `onPress` is the route that avoids a kit
change — but the countdown still has to be visible somewhere, or the refusal is just a
dead button.

## Shares a root cause with DVTD-ecjo

DVTD-ecjo is the same gap at the other entry point: `TodayScreen.ui.tsx:134-149` only
consults `polls.ready` on the live-run branch, and `/run/new` has no window gate at all
(`StartView.component.tsx:60` gates on `view.canStart`, which is build-completeness only).
Worth fixing together — one rule about when the day is spent, applied at every door.

- [ ] Refuse the press on `/run/over` when the window is spent, stating the countdown
- [ ] Decide whether the refusal needs a `RunOverScreen.ui` prop or rides `onPress`
- [ ] Spec: exhausted window shows the countdown, open window still starts a run
