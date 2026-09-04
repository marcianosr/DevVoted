---
# DVTD-fnuc
title: Version badges use the designed rung; green text reads as celadon
status: todo
type: feature
priority: normal
created_at: 2026-09-03T09:45:30Z
updated_at: 2026-09-03T09:45:30Z
parent: DVTD-cb52
---

Two things about the green, both about reading a badge at a glance.

## 1. An armed upgrade prints a generic green v2, not the designed one

`Version.ui.tsx` is the designed version badge: a five-rung value ramp (zinc 800 up to zinc 100, text flipping dark at v4) with one more corner milled off per rung, so a version reads in silhouette as well as in fill. `ShopScreen.versionTag` uses it for a resting row.

Arm an upgrade and it switches to `Change`, whose target badge is `<Badge tone="viridian">` — flat green, no rung, no silhouette. So the moment the version actually matters, the design that carries the version is the one thing that disappears, and v2 looks the same as v5.

Fix: a version-aware change that composes two `Version` badges around the arrow, dashed while projected, and `versionTag` uses that instead of the generic `Change`. `Change` itself stays as it is for KB and multiplier steps.

## 2. Viridian as text is hard to read; celadon is the green we mean

`bg-viridian/15 text-viridian` is dark green on a 15 percent green wash. The codebase already worked this out twice and never generalised it: `PriceTag` uses `bg-viridian/15 text-celadon`, and `StatusBadge` carries the comment "Outline picks the lighter half of each pair (celadon over viridian)".

Where green is text or a border label, it becomes celadon:

- [ ] `Badge.ui.tsx` tone `viridian`: `text-viridian` to `text-celadon` (one line, every caller improves)
- [ ] `IconButton.ui.tsx` tone `viridian`, both the resting `border-viridian/40 text-viridian` and the armed `border-viridian bg-viridian/15 text-viridian`. Note this is the **default** tone, so it is most of the shop's icon buttons
- [ ] Audit the `Text tone="viridian"` sites and keep or switch each on its own merit: `Equation` hero figure, `StoragePlan` "free", `Audits` suppressed row, the `ReviewScreen` and `GateClearScreen` check marks

Where green is a fill behind dark text, or a meter, viridian stays: `StatusBadge` `bg-viridian text-black`, `GainBar`, `StoragePlan` HELD and HEADROOM, `Choice`'s expected border.

## Decision needed

Do the two tone names keep their current meaning, or does `viridian` become fill-only? My pick: fill-only. The `viridian` badge tone keeps its name and its wash and just borrows celadon for the glyph, which is what `PriceTag` already does, so no caller has to learn a new token and nothing about "green means gain" changes.

## Todo

- [ ] Version-aware change component + story, wired into `ShopScreen.versionTag`
- [ ] `Badge` and `IconButton` viridian tones use celadon for text
- [ ] `Text tone="viridian"` audit
- [ ] Update the specs that assert on `text-viridian`
- [ ] One line in the theme's own notes on what viridian and celadon each mean now
- [ ] Verify: `npm run lint`, `npm run build`, stories tsconfig, `npm test`
