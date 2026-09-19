---
# DVTD-1p5b
title: 'Shop and new-run polish: install button, pluralised weight, badged free, wired End run'
status: completed
type: task
priority: normal
created_at: 2026-09-15T10:31:19Z
updated_at: 2026-09-15T10:51:45Z
---

Playtest feedback on the kanto new-run / shop / gate-outcome screens.

- [x] One install affordance on both New Run and Shop: a Button labelled "Install" that extends to "Install · xKB" (shop carries the price, new run is free so carries none). Drop the shop's pressable price badge.
- [x] Capitalise "Install".
- [x] ConfigInfo popover pluralises weight: "weight 1 slot", not "weight 1 slots".
- [x] Registry header badges its slot price so "free" wears a badge like "32 KB" does.
- [x] "End the run" on the gate-hold choice actually ends the run and lands on game over.
- [x] Empty "Build changes" fold says "none" when expanded instead of showing nothing.
- [x] Objectives optional lead reads "Extra objectives", not "also on the table, not required".

## Summary of Changes

**Install is one affordance again.** `Button`s plain shape now takes `detail`/`detailOn`, so `ChipInstall` gained a `price` and the shop installs through the same press the opening hand uses, reading `Install · 64 KB` (`priceOn="always"` in the registry, renamed from `upgradePriceOn` and now governing the upgrade press too). The shops pressable price badge is gone. An unaffordable offer keeps the press, disabled, so the price still shows. `src/test/kantoPoll.factory.ts` `offerFor` now delegates to `offerChipFor` instead of duplicating the shape, and `inertChip` disables `install` so the 405 audit still kills every press.

**ConfigInfo** pluralises its own noun (`slotWordOf`): the count beside it is the Weight bar, not text, so `plural(count, noun)` does not fit.

**`RegistrySummary`** replaces `registrySummaryOf` across three call sites and badges the slot price directly. `Figures` only badges what it parses as a figure, which left `free` bare beside a badged `32 KB`; teaching `Figures` the word would have badged it inside config prose ("A free random config upgrade"). Spaces stay inside the text nodes so `textContent` still reads as a sentence in both the flex panel header and the inline heading.

**The refusal ends the run.** New `refuseGate` in `strip.model.ts` and a `refuse-gate` action gated on `awaiting-strip`, per ADR-076 Decision 4. `GateOutcomeView` takes `onRefuse` and overrides `tail.choice.refusal.action.onPress`; the viewmodel keeps its `noop` because `GateOutcomeScreen.spec` asserts the exit stays live while the peel is unpaid. `run.validation.ts` has a type-level exhaustiveness assert, so the build failed until the zod union learned the action.

**Empty build changes** reads `none`: `GateOutcomeBuildPanel.emptyLabel`, set by `changesPanelOf`, following `Build.ui`s `emptyLabel` convention.

**Optional objectives lead** is `Extra objectives`.

Docs: `CHANGELOG.md` gained one Unreleased entry for the install press and had the stale `also on the table, not required` quote amended in place (the ADR-076 refusal gets no Fixed entry: it never shipped, so per `docs/changelog-maintenance.md` the bug was never experienced). `docs/wiki.md` §5.2s Draft row described a two-tap green price badge that no longer exists.

Verified: 4320 passed, 2 failed. Both failures are pre-existing `gate.model.spec.ts` floor-rule tests, confirmed failing on a clean tree before any of this. `npm run build` 0 type errors, lint clean, no new story type errors.
