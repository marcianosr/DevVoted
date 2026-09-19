---
# DVTD-wg5g
title: 'Version pennant: green when affordable, red when not'
status: completed
type: task
priority: normal
created_at: 2026-09-10T09:05:50Z
updated_at: 2026-09-10T09:57:33Z
---

The offered version was cerulean, matching the kit's "blue reads as pressable"
rule. Marciano asked for the offer to say whether it can be paid for instead:
green if affordable, red if not.

- [x] `VersionState` gains `unaffordable`; `ACCENT` table replaces the ternary
- [x] `Upgrades` derives the pennant state from `disabled`
- [x] Specs + stories for the new state, across all twelve screens
- [x] lint, typecheck, tests

## Summary of Changes

`Version.ui.tsx`: `OFFERED_COLOR = "cerulean"` is gone. One `ACCENT` table keyed
on state: `owned`/`future` take no `data-screen-theme` (the screen's own accent),
`offered` is viridian, `unaffordable` is cinnabar. Unaffordable is NOT dimmed;
dimming stays the mark of `future`, which is out of reach rather than unpaid for.

`Upgrades.ui.tsx`: `pennantStateOf` maps `state === "offered" && disabled` to
`unaffordable`. Affordability reads off the existing `disabled` flag rather than
a second prop, so the pennant and the buy button beside it cannot disagree.

**Convention broken deliberately.** Elsewhere in the kit blue means pressable
(`Badge` press, `Button` tone action). The pennant now trades that for
affordability, which is the reading the player needs off the tag; the row's ring
and hover still carry the press. Recorded in the file and in
`Version.spec.tsx`.

Still cerulean: the chip's `↑ v3 · 96 KB` press (`Button` tone `action`). Left
alone pending Marciano's call, since it is a real button and blue is its
pressable cue.

Verified: 3869 tests pass, lint + depcruise clean, tsc clean, stories typecheck
at the 30 pre-existing errors.

## Follow-up, same session

Marciano chose green/red on the chip press too, and chose the two-card panel.

**Button**: `TONE_THEME.action` is now `viridian`, and `toneThemeOf(tone, disabled)`
turns a disabled action press `cinnabar`. `action` is used at exactly one call
site (the chip's up press), so no other control shifted. A disabled action always
means "this will not go through", so red is honest there in general, not only for
money.

**Upgrades is now the pair, not the ladder.** `installed` card (screen accent,
inert), arrow, `next` card (viridian/cinnabar, and the whole card is the buy
press). Labels lower case. `versionAccentOf` is exported from `Version.ui` so the
card edge and the pennant inside it read one table and cannot disagree. The
footer's cumulative "all the way to v5 costs 384 KB" is kept: the layout choice
was about the rung list, and dropping the ceiling reading too would have cost the
player the climb.

With no offered rung the second card is replaced by a word, and `noOfferLabelOf`
picks it off the rungs: "fully upgraded" only when every rung is owned, "nothing
on offer" otherwise, because a config below its ceiling with an empty shelf is
not maxed.

`upgradesFor` now omits `toMax` when nothing priced is left, so a maxed config no
longer reads "all the way to v5 costs 0 B".

Vocabulary: the panel is no longer a ladder, so `laddered` became `upgrading`,
`LadderOpen`/`LadderUnaffordable` became `UpgradeOpen`/`UpgradeUnaffordable`, the
`LADDER` fixture became `UPGRADES`, and eight ConfigChip test names plus a stale
ConfigInfo comment now say "upgrade panel".

Verified: 3876 tests pass (220 files), lint + depcruise clean, tsc clean,
prettier clean, stories typecheck at the 30 pre-existing errors.

## Panel polish, same session

Four notes off the rendered panel:

**Fits its contents.** `PANEL` was `w-80`, which wrapped the footer's cumulative
figure mid-sentence ("press / to buy v3"). Now `w-fit max-w-100`: the footer is
the widest line in the panel, so max-content is the right width, and the cap
stops a config with a long description opening a panel wider than the screen it
floats on.

**Description takes the accent.** Was `hint` (12px, `text-theme-muted`), the same
muted grey as the footer, which put what the config does at the volume of an
aside. Now `caption` (14px, `text-theme-soft`).

**Card labels are small and fat.** New Typography rung: `label`, `text-xs
font-bold`, tone soft, tag span. `installed` and `next` use it. It fills the one
gap in the size-by-tone grid, and its second obvious call site is Uninstall's
`EYEBROW`, currently a `hint` (not changed, not asked).

**The effect is a green badge.** `+4%` / `+6%` were plain bold faint text; they
are now `Badge color="viridian"`, matching how `Figures` badges every gain
wherever it appears. Viridian on both cards regardless of the card's own colour:
on a refused offer that puts a green gain beside a cinnabar price, which is the
right reading, since the two answer different questions.
