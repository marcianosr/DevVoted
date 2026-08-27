---
# DVTD-144r
title: 'Brainstorm: showing how often a config is installed'
status: draft
type: feature
priority: normal
created_at: 2026-08-27T11:32:06Z
updated_at: 2026-08-27T11:32:06Z
parent: DVTD-h175
---

Concept exploration, not a build order: what it would mean to show a config's install rate ("14% of climbers ran Moore's Law"), where it belongs, and what it costs the game.

## The number is not one number

These read the same on a screen and are different features:

1. **Install rate.** Share of runs that installed X. Needs a denominator, and the honest one is "runs that were offered X", not "all runs".
2. **Pick rate.** Installs divided by offers. Cheap here for a reason worth naming: the seed is shared daily, so the offer roll is recomputable from `draftSeed` plus the roster. The denominator never has to be logged.
3. **Keep rate.** Installed and still installed at the end. Sells and peels make "installed" ambiguous, and this is the version that tells you whether a config was a mistake.
4. **Depth or win rate with X.** The most useful number and the most dangerous: it hands the player a solved draft.
5. **Today versus all-time.** Today is live data. The standing rule is that a config's check never depends on live social data (quorum-gated payouts, ghosts are completed runs). Display-only may be exempt, but say so on purpose.

Pick rate also measures availability and habit, not strength. Configs offered early, cheap, or in a starter stack look popular. No surface may imply "popular equals good".

## Three homes, three different games

| Where | What it does | Cost |
| --- | --- | --- |
| **Configdex column** (out of run) | Encyclopedia entry beside the effect. No pressure on a live decision | Cheapest, safest, sits next to DVTD-i2jz's Configdex work |
| **Shop row** (at the decision) | Changes drafting outright | Has to be paid for or gated, or it becomes the drafting AI |
| **Run summary or Standouts** ("you and 12% ran this") | Identity and flavour after the fact | Nearly free, and it is where the contrarian framing lives |

## Free information devalues the information axis

Telemetry sells the community answer split for a doubling fee; Prefetch sells upcoming categories; `.length` sells a count. Handing out pick rates in the shop for nothing prices all three down. The clean split is retrospective data free (Configdex, summary) and decision-time data sold, which is also the Telemetry precedent for thin data: percentages at L1, the sample size at L2.

Naming, if it becomes a config: **npm downloads** is the exact real-world analogue (how often is this package installed), and **State of JS** is the survey framing for a roster-wide view. Both name the real thing rather than describing it.

## What it might cost the game

- **Meta convergence.** Showing the popular pick makes it more popular. A roguelite lives on build variety, and a visible pick rate is a feedback loop pointing the other way. Mitigations: publish yesterday's numbers rather than today's, bucket by gate depth so there is no single "best", or invert the framing so rarity is the flattering number.
- **Thin data lies.** 100% of three runs. A quorum floor before any figure renders, withheld server-side rather than hidden in the UI.
- **Privacy.** Aggregates only, never who installed what, with a k-anonymity floor on top of the quorum.

## Spin-off worth keeping separate

Once the data exists, the contrarian is rewardable: an off-meta build could earn a Standouts line, a badge, or a kicker. That is a mechanic rather than a display, and it should not ride in on this bean.

## Data plumbing

- Installs live inside `run_states.state` JSON today, and a config that was sold or peeled leaves no trace, so JSON aggregation answers "holding right now", not "ever installed".
- The honest source is a draft event row (config id, user id, run id, gate, seed date), which also unlocks keep rate later.
- Aggregate precedents to follow: `fetchActiveRunStats` (climbers) and `fetchPollSplit` (Telemetry's split) in `run/community/infrastructure`.

## My pick for a v1

A Configdex column, all-time, quorum-gated, retrospective. It answers "is this thing used" without touching a live draft, and it reuses a panel that is already being worked on. Hold the shop-side reveal back as a paid config, and decide the contrarian reward on its own.

## Todos

- [ ] Decide which number (install / pick / keep / depth) is the one worth showing first
- [ ] Decide the homes: Configdex only, or Configdex plus summary
- [ ] Spike the count off `run_states` JSON to see whether the figures are interesting enough to build a table for
- [ ] Set the quorum floor and where it is enforced (server, not UI)
- [ ] If the shop is ever to show it free, write the ADR that prices the information axis down on purpose
