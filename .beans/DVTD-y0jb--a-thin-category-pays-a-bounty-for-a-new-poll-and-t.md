---
# DVTD-y0jb
title: A thin category pays a bounty for a new poll, and the ad says so
status: completed
type: feature
priority: normal
created_at: 2026-10-07T08:52:16Z
updated_at: 2026-10-07T09:17:48Z
---

**What:** A poll suggested in a category with few published polls pays more archived storage, and the suggest-a-poll advertisement names one such category and its reward.

**Why:** Most advertisements showed borders; the bank is thin in some categories and nothing pointed writers there.

## Done when
- [x] A poll in a thin category pays a larger reward, fixed when it is suggested
- [x] The suggest advertisement names a thin category and what it pays, and opens the form on that category
- [x] An admin sees the suggest advertisement without a reward
- [x] The suggest form states what the chosen category pays
- [x] The approval notice states the reward each poll actually paid

## Notes
Amends ADR-189 D1/D3 and ADR-185. Bounty stored on the poll row (author_reward_kb) at creation; payAuthorOnFirstPublish pays that column.

## Summary of Changes

- Bounty tiers (bountyKbFor): under 10 published polls pays 48 KB, under 25 pays 32 KB, else the 16 KB floor.
- polls.author_reward_kb (guarded migration, default 16) is written when a poll is suggested; the first publish pays it; the approval dialog sums it.
- The suggest advertisement names a thin category, its count and bounty, and links to /polls/new?category=…; admins see it without a reward.
- The suggest form preselects the category from search and its reward badge follows the picked category.
- ADR-193 (amends 185 and 189), wiki §6.1/§6.5, player wiki copy, CHANGELOG.
