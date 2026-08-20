---
# DVTD-yl13
title: 'Meta unlock system: verbs, content, vanity'
status: draft
type: feature
priority: normal
created_at: 2026-08-20T09:38:05Z
updated_at: 2026-08-20T10:02:03Z
parent: DVTD-z2r2
---

Consolidates the rival unlock triggers (DVTD-2try gates, DVTD-yuwi stats, DVTD-9d7o KB pull) into one system. Three kinds of unlockables, three triggers:

- **Verbs** (shop controls, plan rungs, git tag): free, unlocked by "first need" milestones. Staged exposure for new players.
- **Content** (configs): between-run draft paid in archived KB (50/150/300/500 by rarity). Deals 3 from the paid band, keep 1, pity on legendary only. Pool staged by swatch bands (e.g. Cascade admits uncommons, Soul admits legendaries). A baseline set (the starter-stack configs) is always unlocked. Reuses the shop draft idiom; never call it a "pull".
- **Vanity** (borders): bought with archived KB, no gameplay effect. Scarcity must say something ("this border means a Champion clear"), not just a catalogue.

First-need verb triggers:

| Unlock | Trigger |
| --- | --- |
| git tag | first death (announced on the death screen) |
| Plan switching + 640 rung | first time storage hits the cap |
| Rebuild | first shop with all 5 offers declined |
| Lock | first rebuild |
| Extend | first shop entered with >200 KB unspent |
| Sell | first full pipeline |
| Starter slot 4 | first victory. The one power-shaped unlock, capped at +1 |

In-run gate staging (Lock gate 2, Extend gate 3, tag gate 4, plan rungs) stays on top: the account unlock decides whether the verb exists at all, the gate decides when it works this run. In-run slots stay gate-granted and are NOT account unlockables (ADR-034: width arrives with depth).

Hard rules:
- The core loop (draft, answer, gate, reward) is never gated.
- Categories are never account-unlockable: the shared daily seed hands everyone the same polls.
- Event triggers over run-count triggers: runs span weeks, so "after 3 runs" paces glacially.
- Unlocks widen options, not raw power (shared-seed leaderboard). Starter slot 4 is the flagged exception.

Surfaces:
- [ ] Dev Card meta-progress strip on the profile: swatch row, verb row, config count ("14 of 45"), unearned entries redacted to ??? (reuse the Dex redaction idiom and the planned ???/Encountered/Mastered states)
- [ ] Locked configs as silhouettes in the Dex, each naming its admitting swatch
- [ ] Unlock notification: announce in-place where the trigger fired (death screen names the tag, cap-hit moment names the rung); toast/popup fallback for shop-verb unlocks
- [ ] Persist unseen-unlock flags so the profile badges new entries until viewed

Persistence: needs an account-level unlock store (unlocked verbs, owned configs, draft history, unseen flags). run_category_coverage is per-run and does not cover this.

Open:
- Starter slot 4: confirm or drop (power on a shared seed)
- The exact swatch-to-band table
- DVTD-xbri injection pricing must sit above config-draft prices so the draft stays the primary KB sink

Supersedes the trigger question in DVTD-2try / DVTD-yuwi / DVTD-9d7o: 2try survives as the band table, yuwi keeps borders and starter slots, 9d7o becomes the content draft.

## Modes (brainstorm, 2026-08-20)

Unlockable run modes, post-victory tier. Frame: a mode is a set of run-rule flags chosen at Configuring; the daily seed stays shared so the water-cooler survives; runs carry a mode tag on leaderboards and the climb map. Hard rule: mode rewards are cosmetic only (shiny swatches, borders, titles), never KB or power, so no mode becomes the optimal farm.

- **Nuzlocke** (unlock: first victory): a wrong answer peels a config immediately (per poll, not per gate), death when bare; each shop offers one take-it-or-leave-it config, no rebuild; every draft gets a nickname, shown on reward report and community board.
- **Modifier stack** (unlock: first victory; subsumes "hard/mixed mode"): opt into extra audits at gate 0, Balatro-stake style. Clears under N+ modifiers earn the **shiny variant** of that gate's swatch in the Dex.
- **Monotype** (unlock: 100% career coverage in a category): pipeline holds one Focus family plus neutrals.
- **Little Cup**: commons only. **Randomizer**: drafts are mystery configs, revealed on install. **Sudden death**: a missed gate ends the run, no peel-and-retry.

Non-mode additions from the same pass: trainer titles from swatch count (Bug Catcher to Champion) on leaderboards/climb map; poll authoring unlocked at the Champion swatch (wiki 7.5 trusted authors); config nicknames outside Nuzlocke at a config's Mastered state; shiny swatches as the hard-mode cosmetic.

Caution: modes fragment a small playerbase and multiply QA surface (audits x peel x daily lock). Build zero until the core loop is nailed; start with modifier stack + Nuzlocke at most.

## Buyable starting width (2026-08-20)

Marciano asked for buyable pipeline slots as an expensive unlockable. It ships as **starting** width, never maximum width, because ADR-035 made configs pure effects: an extra slot no longer carries an extra demand, so raw width is now strictly upside and selling it outright would be selling permanent power on a shared seed.

- Account ladder **3 to 4 to 5** starting slots, hard cap 5, priced as the biggest purchase in the game (order of 1 MB then 2 MB archived KB, against config drafts at 50 to 500 KB). Calibrate against real credit rates before fixing numbers.
- In-run slots stay gate-granted to 14. ADR-034 is untouched.
- Effective width is `max(startingWidth, slotsForGatesCleared)`, so a purchase **front-loads slots you would have earned by gate 2 anyway** and the summit build is identical. The player is buying time, not power, and the advantage decays to zero by mid-run.
- The extra starter slots **begin empty**: starter stacks stay 3 configs and the "all starting slots must be filled" rule applies to the base 3 only. You fund the extra slots yourself from the first shop, so the unlock buys capacity, not free configs.
- Absorbs the earlier "starter slot 4 on first victory" open question: same mechanic, KB-priced instead of milestone-triggered. Decide which trigger, or use first victory to unlock the ladder and KB to climb it.

Not proposed: an in-run buy-a-slot action. That is ADR-034's deleted coverage ladder again and it breaks width-arrives-with-depth.

Watch: slots and config drafts compete for the same archived KB, which is a real choice but can stall the Dex. Check the split when pricing.
