---
# DVTD-jjyw
title: Category Bounty (rarity-based coverage for drought categories)
status: todo
type: feature
priority: normal
created_at: 2026-07-11T17:44:33Z
updated_at: 2026-07-11T17:53:23Z
parent: DVTD-7dqm
blocking:
    - DVTD-g5lp
---

Fixes: rarely-shown categories (e.g. Git) just starve you — a drought is pure punishment with no payoff for the wait. Player-confirmed pain point.

## Mechanic
Track days-since-last-seen per category. Longer drought -> a VISIBLE, ANNOUNCED bounty accrues. Next CORRECT answer in that category pays a coverage multiplier (e.g. 2x at 4 days -> 3x at 8 days, capped). Wrong answers get nothing (reward the knowledge, not the luck of the poll appearing).

## Split by loop
- **Daily poll = GLOBAL bounty.** Daily is shared -> drought is shared. 'Git hasn't been the daily in 8 days -> next Git day pays 3x for everyone.' A social event: the whole team logs in hoping for Git day. Turns weakest content into the most-anticipated moment.
- **Run practice-bank = PERSONAL bounty.** Based on your own run history (fairer; per docs/brainstorm/23-03-2026-rarity-based.md, personal rarity preferred over global).

## Visibility
Announce it loud — a bounty board / banner showing each category's current drought + payout. Creates anticipation and steers attention to neglected categories.

## Sequencing
- Daily/GLOBAL half ships NOW, standalone — needs nothing from the two-loop restructure (daily poll already exists + is shared).
- Personal/run half waits on the run practice bank (two-loop, DVTD-kg2e).
- Hard PREREQUISITE for Tags (DVTD-g5lp): Focus tags + strip-on-fail both make payoff hostage to whether your category shows up; the bounty is what makes betting on a category fair.

## Open
- Multiplier curve + cap (needs balancing).
- Does bounty stack with streak bonus? (brainstorm open question)
- Personal rarity: based on polls seen, or polls in current run only?

## Todos
- [ ] Daily/global bounty: track per-category drought, visible banner, multiplier on correct
- [ ] Balancing pass on multiplier curve + cap
- [ ] Personal/run bounty (after two-loop practice bank exists)

## Build-ready map (parked — revisit AFTER the two-loop+tags prototype proves the core loop)
Deprioritized: the risky, unproven thing (session-run + tags) goes first; the bounty is known-good and safe to ship later.

- **ZERO schema changes** — drought derives from daily_polls + polls join.
- Reuse pattern: getLastGlobalDailyPollDate() at src/domains/polls/api/dailyPoll.queries.ts:13 — clone it filtered by category_code instead of poll_id.
- New service: src/domains/polls/services/categoryBounty.service.ts — calculateCategoryBountyMultiplier(categoryCode) -> e.g. min(1 + daysInDrought/4, 3).
- Injection point: src/domains/runs/services/progress.service.ts:97 — multiply into coverageMult: (coverageMods.coverageMult ?? 1) * bountyMult.
- 11 categories in src/domains/shared/categories.ts.
- UI: BountyBanner in DailyPollContainer.component.tsx header (~line 347); pipe bountyInfo through dailyPoll.handlers.ts -> polls.ts.
- TDD the pure multiplier curve first (spec mirrors score.service.spec.ts).
