---
# DVTD-3boj
title: Spot work landed in the legacy shop, not the live one
status: completed
type: bug
priority: critical
created_at: 2026-08-27T19:55:05Z
updated_at: 2026-08-27T20:07:59Z
---

`/proto-run` shows none of the shop-side spot work, because there are **two parallel shop implementations** and I edited the one that is not on screen.

| Screen | File I edited | What `/proto-run` actually mounts |
| --- | --- | --- |
| Start | `ui/modern-theme/screens/StartScreen.ui.tsx` | same ✓ |
| Prep | `ui/modern-theme/screens/PrepScreen.ui.tsx` | same ✓ |
| Shop | `modules/run/shop/presentation/ShopScreen.ui.tsx` | **`ui/modern-theme/screens/ShopScreen.ui.tsx`** ✗ |
| Configuring | `modules/run/pipeline/presentation/ConfiguringScreen.ui.tsx` | **not mounted at all** ✗ |

`ShopView.component.tsx:23` imports the island `ShopScreen`; the module one is only used by `RunShop.component.tsx`, the older `/_authed/run/*` set. `ConfiguringScreen` is only used by `RunConfigure.component.tsx`, which `proto-run.tsx` never renders.

So the SpotTrack, the inline refusal, the way-out line and the plan-rung room copy are all real, tested, and invisible.

The live shop is also shaped differently: it takes composed nodes (`pipeline: FoldItem[]`, `slots: ReactNode`), its rungs are `StoragePlan.ui` → `Plan.ui` rather than inline rows, and its offer rows are `Entry` + `PriceTag` built in `ShopView`, with the refusal on a hover hint.

## Todo

- [x] Extract the deal's two right-hand columns into a kit `RowFigures`, so the deal and the shelf align and the shop can reuse it
- [x] Island ShopScreen: the SpotTrack, in the pipeline Fold's note
- [x] Island ShopScreen: the saffron way-out line
- [x] ShopView offer rows: spots column, and `needs a byte` visible rather than on hover
- [x] `planRows`: what each rung's room holds
- [x] Specs + stories for the island shop
- [x] lint, build, test

## Summary of Changes

The shop work is now in the file `/proto-run` actually renders.

**New `RowFigures` in the kit**, shared by the deal and the shelf so a config met
twice in a run has its size in the same place both times. Two fixed columns (the
figure, then the spots) with the refusal floating to their left.

I got this wrong first: the refusal originally *replaced* the figure, which was
harmless on the deal (the figure is a passive rate) and destructive on the shelf,
where the figure IS the install press — it deleted the button and the price along
with it. `ShopView.spec` caught it. The refusal now sits beside the figure, which
is also better on the deal: a config you cannot fit still shows the rate you are
weighing an uninstall against.

**Live shop (`ui/modern-theme/screens/ShopScreen.ui.tsx`)** gained `track` and
`roomAdvice`. Both are `ReactNode`/string rather than spot props, because this
screen takes every other part of itself pre-composed — its rows arrive as
`FoldItem`s with no config left in them.

**`ShopView`** now feeds it: the SpotTrack (lead = config count, matching Start
and Prep), `roomAdvice` imported from the legacy screen so there is one
implementation, `RowFigures` around every offer's PriceTag, and `planTerms`
appending what each rung's room holds (`8 KB / gate · holds a byte too`) into
`Plan`'s existing middle column, so no kit component changed shape.

`StoragePlan` is now exported from `rules.model` — `planTerms` reads the domain
ladder, not the viewmodel's decorated copy.

## Storybook, which was the other half of the report

Storybook does run (`npm run storybook`, port 6006) and several stories were
broken by earlier spot work, so the screens looked untouched there too:

- the **live shop's own stories** still said `slots="3 of 6 slots"` and drew no
  track; they now carry one, plus a new `OutOfRoom` story for the advice line, and
  `slotRows` became `freeRows`
- the **legacy shop's stories** still passed `slots: 3` / `nextSlotUnlock` /
  `justUnlockedSlots` against props that no longer exist; renamed and re-pointed
  (`SpotsJustGranted`, `LastWideningAhead`, `AtTheByte`)
- `ConfiguringScreen.stories` passed `slots: 3`

Every `slots`-era prop error in the story tree is gone. 27 story errors remain,
all pre-existing rot unrelated to spots (`PerAnswerPreview` shape,
`storageBillKb`, `Screen` `wide`, `ConfigFigure.value`) — DVTD-a8tr.

## Verification

`npm run lint` clean (786 modules, 3240 dependencies) · `npm run build` clean ·
`npx vitest run` **2545 passed, 3 failed** — the documented `RewardScreen`
baseline (DVTD-9dn0). Up 33 tests from the start of this bean.
