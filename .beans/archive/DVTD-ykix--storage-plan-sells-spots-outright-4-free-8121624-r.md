---
# DVTD-ykix
title: 'Storage plan sells spots outright: 4 free, 8/12/16/24 rented'
status: completed
type: feature
priority: normal
created_at: 2026-08-28T09:26:30Z
updated_at: 2026-08-28T09:55:03Z
---

Marciano's call from a /proto-run playtest: the plan stops renting spots on top of an earned width and simply IS the width. Default 4 spots free; rungs at 8, 12, 16, 24, each dearer. Gate clears no longer grant width, they open rungs.

Also in the same pass, from the same playtest:
- [x] Delete the saffron room-advice line ("IndexedDB needs 2 spots · uninstall something")
- [x] Delete the "worth N KB" chip from pipeline rows
- [x] Unfold the three shop sections (New configs, Your pipeline, Storage plan) — flat, not Fold
- [x] STORAGE_PLANS: absolute `spots`, five rungs
- [x] capacityFor: plan alone, no gatesCleared
- [x] Retire ownedSpotsFor / nextSpotGrantFor / SPOT_LADDER / justGrantedSpots / SpotGrantRow
- [x] Gate Dex advertises the rung that opens, not a spot grant
- [x] Specs, stories, wiki, ADR-044 amendment, CHANGELOG

## Summary of Changes

**The plan is the only source of width.** `STORAGE_PLANS` carries an absolute
`spots` per rung — 4 free, then 8 / 12 / 16 / 24 at 24 / 56 / 96 / 128 KB a gate,
staged from gates 0 / 2 / 4 / 6 / 8 — and `capacityFor(plan)` is
`storagePlanFor(plan).spots`, with no `gatesCleared` argument. The KB cap rides
along on the same rung (512 KB → 1.5 MB).

Retired with the earned ladder: `SPOT_LADDER`, `ownedSpotsFor`,
`nextSpotGrantFor`, `OWNED_SPOTS_CAP` (now `MAX_SPOTS`, read off the top rung),
`RunState.justGrantedSpots`, `RunView.nextSpotGrant`, `SpotGrantRow.ui.tsx`
(deleted), `StartReward.spotsOpenTo`, and the Gate Dex's `spots` unlock kind.
`BASE_SPOTS` and `MAX_SPOTS` are now derived from the ladder's first and last
rungs, so the width numbers exist in exactly one place.

Knock-ons: insolvency drops the pipeline to the free four (was: to the earned
byte); a git-tag rescue carries its KB stipend and no width; the Gate Dex row
reads `12-spot plan · 1 MB`; ConfiguringScreen's width promise now names the
plan.

**Presentation, from the same playtest.** New `Section.ui.tsx` — `Fold` minus the
disclosure — and the shop's New configs, Your pipeline and Storage plan sections
use it, so none of the three can be collapsed. `Fold` survives for the git tag.
The saffron `roomAdvice` line is gone (function and prop deleted, both screens);
pipeline rows dropped the `worth N KB` chip. Plan rows lead with the width and
state `24 KB / gate · 768 KB cap` as terms, with `current` or `burns N KB` as the
right-hand figure.

**Verification.** `npm run lint` clean (787 modules, 3242 deps), `tsc --noEmit`
clean, story typecheck clean of new errors (the 27 pre-existing ones are
DVTD-a8tr), 2547 passed / 3 failed — the three being the documented RewardScreen
copy baseline (DVTD-9dn0).

**Docs.** ADR-044 gained an amendment section plus `> ⚠` markers on Decisions 2
and 3; ADR-023 Decision 1 and ADR-030 Decisions 1, 2 and 6 gained markers. Wiki
§2.2, §2.8's gate table, §3, §5.1, §5.2, §8 and the glossary and numbers tables
all rewritten. Two Unreleased CHANGELOG entries rewritten in place (the earned
ladder and the 3MB plan ladder), one added for the shop tidy-up.
