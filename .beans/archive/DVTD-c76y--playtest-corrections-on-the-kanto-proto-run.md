---
# DVTD-c76y
title: Playtest corrections on the kanto proto-run
status: completed
type: task
priority: high
created_at: 2026-09-13T07:46:17Z
updated_at: 2026-09-13T07:57:31Z
---

First live pass over /proto-run in the kanto kit turned up six corrections.

- [x] Poll screen must not offer config upgrades (the registry is where you upgrade)
- [x] Screens run 1150px wide
- [x] A start slot is paid from the archive, and the screen must say so
- [x] Band outcome copy is too long
- [x] Answer why the WeightTrack storage component is unused
- [x] The coverage bar does not animate

## Summary of Changes

**Upgrades left the poll screen.** `chipFor` no longer carries `upgrades`, so no
installed chip draws the `↑ v2` press. Nothing wired `onToggleUpgrades` anywhere,
so the press was dead on every screen that showed it (poll, new run, shop build).
A version is bought from the registry's own upgrade offer, which builds its panel
through `upgradesFor` directly and is untouched.

**One screen width, 1150px.** `ScreenWidth` lost its `wide` arm: the kit ran two
caps (896 and 1152) and the run reads as one surface. `default` is now
`max-w-[1150px]`; four screens dropped `width = "wide"` and three part stories
dropped the prop.

**The archive pays for a start slot.** The new-run screen passes `buildNote`
(`NEW_RUN_BUILD_NOTE`) under the build, naming where the KB comes from. The header
funds already read "archive"; the offer said nothing until the refusal fired.

**Band copy is about half as long.** `bandOutcomesFor` and `nextGateLine` rewritten,
and the BandOutcomes story fixtures follow so the design reference and the app agree.

**The coverage bar animates again**, which needed two fixes:

1. `/proto-run` rendered `PollView` and `PollAnsweredView` in two sibling slots, so
   answering a poll swapped component types and React rebuilt the whole screen. A
   remounted bar cannot transition. The two adapters are now one `PollView` with an
   optional `answered` prop, so `PollScreen → Header → CoverageBar` keeps its
   instance across the answer beat and the fill travels. Spec'd by DOM identity:
   the `.coverage-bar-fill` node must survive the rerender.
2. The fill's arrival sweep never worked. `@starting-style` carries the specificity
   of its own selector, so the inline `width` on the fill outranked it and the first
   paint was already settled. The reading now rides `--coverage-held` on the bar
   root, the width lives in app.css, and a second `@starting-style` block sits after
   that rule (order matters at equal specificity).

The ring has the same inline-versus-starting-style flaw in `.coverage-arc` and
`.coverage-count`, so its "animates on arrival" comment is currently false: see
DVTD-us54.

**WeightTrack** is not unused, it is unbuilt: `Build`'s `weight` arm renders only in
the kanto mocks (`kantoNewRunAt`, ShopScreen stories). The engine has slots and a
capacity, not weight and an upkeep bill, so the wired screens use the `slots` arm.
It lights up when ADR-074 lands (DVTD-uhub).

Verified: 240 test files / 4162 tests pass, lint clean (946 modules, 0 depcruise
violations), `npm run build` exit 0.
