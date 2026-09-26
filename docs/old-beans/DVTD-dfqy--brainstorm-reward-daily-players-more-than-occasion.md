---
# DVTD-dfqy
title: 'Brainstorm: reward daily players more than occasional players'
status: todo
type: task
priority: normal
created_at: 2026-05-29T08:09:41Z
updated_at: 2026-05-29T08:10:14Z
---

Engagement-loop design: how do we make playing every day meaningfully better than playing once a week, without punishing casual players so hard they churn? Sister bean to DVTD-uwwq (which handles the punishment side — abandoning runs). This bean handles the carrot side.

## Design tensions

- **Retention vs. anxiety.** Duolingo's streak model proves daily-reward loops work, but it also proves they can drive churn through guilt. The reward should pull players back, not shame them when they miss a day. A streak that snaps to zero on a single miss is psychologically harsher than one that decays.
- **Engagement vs. pay-to-win.** Daily players should feel rewarded, but rewards that compound into permanent gameplay advantages (more starting score, better configs) turn DevVoted into a grind-gated game. Casual players who pick it up months later shouldn't face an unwinnable wall.
- **Cosmetic vs. mechanical rewards.** Cosmetics (devcard frames, badges, awards) are safe retention bait. Mechanical rewards (configs, score multipliers) directly affect run viability. The split matters.
- **In-run vs. meta-progression.** Daily-play bonuses could apply *during* the current run (e.g., extra storage), or accumulate at the *account* level (e.g., unlocked devcard slots). The economy already separates these via `runs` vs `polls_user_performance`.
- **Streak granularity.** Calendar-day streaks (Duolingo) vs. "5 of last 7 days" (Apple Fitness) vs. weekly cadence. Strict daily is the strongest pull but also the easiest to break.

## Seed directions to explore

1. **Streak counter with grace.** Visible "X-day streak" on devcard. One free skip per week ("weekend" or "sick day"). Streak gives cosmetic milestones at 7/30/100/365 days. Pure cosmetic = no balance risk.
2. **Daily multiplier on run progress.** Each consecutive day of activity adds a small multiplier (e.g., +5% score, capped at +50%) to current run progression. Resets on miss. Felt by active runners, invisible to casuals.
3. **Loyalty currency.** Separate currency earned only by daily play, spendable on cosmetics or out-of-run boosts (reroll tokens, shop refreshes). Decouples "playing a lot" from "winning more" — daily players get more *stuff*, not better *runs*.
4. **Tiered awards.** Existing awards system (see [[awards-feature]] memory) already has the infrastructure. Add streak-based awards: "7-day Compiler", "30-day Architect", etc. Pure social-flex layer.
5. **Catch-up mechanic for returning players.** Inverse: if you've been gone N days, the next daily poll gives bonus rewards. Re-engages lapsed players without punishing them further. Sister mechanic to streaks, not a replacement.
6. **Pipeline/gate unlock cadence.** Some pipeline variants are gated behind streak milestones. Mechanical, but framed as "unlocking depth" rather than "better stats" — closer to roguelike unlocks than to pay-to-win.

## Key questions to answer in brainstorm session

- What does the player **feel** when they hit day 7? Day 30? Day 100? (Pride? Obligation? Boredom?)
- What does the player **feel** when they break a streak? (Devastation? Mild annoyance? Nothing?) The answer dictates how forgiving the system should be.
- Are we okay with **stratifying** the playerbase between daily and casual, or do we want every player to feel viable?
- Does the reward show up **inside the run** (felt during play) or **outside the run** (felt on the devcard / profile)? Both?
- How does this interact with the **paid-pack monetization model** ([[marketing-and-monetization-goals]])? Daily rewards must not cannibalize what paying players get.

## Cross-references

- [[devcard-design]] — devcard is the natural surface to show streak/loyalty badges
- [[awards-feature]] — existing awards system can absorb streak achievements without new infra
- [[marketing-and-monetization-goals]] — daily-play rewards are the core of DUA (daily user) targets
- Sister bean: DVTD-uwwq (auto-reset abandoned runs — punishment side of the same loop)

## Todos

- [ ] Run the brainstorm session and capture in `docs/brainstorm/`
- [ ] Decide: cosmetic-only, mechanical-only, or hybrid
- [ ] Decide: streak vs. catch-up vs. both
- [ ] Spin out child beans for chosen directions
- [ ] Mark this bean as completed with a summary linking to the brainstorm doc
