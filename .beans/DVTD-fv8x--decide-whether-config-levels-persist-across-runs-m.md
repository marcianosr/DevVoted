---
# DVTD-fv8x
title: Decide whether config levels persist across runs (meta upgrade system)
status: draft
type: feature
priority: normal
created_at: 2026-08-06T16:44:19Z
updated_at: 2026-08-06T16:44:52Z
parent: DVTD-d0fw
---

Split out of DVTD-z94q (2026-08-06) when that bean was closed on the shipped in-run upgrade mechanic.

DVTD-z94q was written 2026-07-24 assuming upgrades would be **persistent meta-progression**: a per-user level on every config, paid for out of the archived-storage vault, driven from the Config dex. What shipped instead is an **in-run** upgrade: a config's level lives on the run's own instance, is bought during that run, and is gone when the run ends. Max level also changed 10 to 5 (Marciano).

So none of the scope below was cut for being wrong; it was never part of the in-run mechanic and needs its own decision about whether persistent config levels should exist at all alongside in-run ones.

## Open question first
- [ ] Should config levels persist across runs at all? In-run levels are a per-run build decision; persistent levels are power creep. Answer this before building any of the below.

## If persistent levels are wanted
- [ ] Config level per user (default 1) + upgrade history log for analytics
- [ ] Spend archived storage (the vault), not run storage
- [ ] Cost by rarity — the July plan was common 50KB / uncommon 100 / rare 200 / legendary 400 per level. The in-run system prices differently (Focus upgrades are free behind a coverage gate, Unit Tests pays 32KB x next level), so this needs re-deciding rather than copying.
- [ ] Config dex: click a config, Upgrade button, confirmation dialog naming the cost

## Education and discovery (unbuilt either way)
- [ ] Hub screen highlights configs available for upgrade
- [ ] Achievement: "Upgrade your first config!"
- [ ] Onboarding explains what upgrading buys
- [ ] Success animation on upgrade
- [ ] ROI line ("costs 100KB, gains 0.2x coverage")
- [ ] Side-by-side compare of upgraded vs un-upgraded

## Small gap in the shipped system
- [ ] The chip shows an `L3` badge but never the ceiling. "L3/5" would make the cap visible — the only item from the original plan's "Upgrade Path Clarity" section that is genuinely missing in-run.
