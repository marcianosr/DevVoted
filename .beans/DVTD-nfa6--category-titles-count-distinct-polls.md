---
# DVTD-nfa6
title: Category titles count distinct polls
status: completed
type: feature
priority: normal
created_at: 2026-09-29T11:28:07Z
updated_at: 2026-09-29T11:34:15Z
---

**What:** A category title is earned by answering 50 distinct polls in that category (entry) or 50 distinct polls correctly (mastery).

**Why:** Counting answers let a player earn a category title by replaying the same few polls; a title should state breadth of knowledge.

## Done when
- [x] The entry title of a category is earned at 50 distinct polls answered, not at 10 answers
- [x] The mastery title of a category is earned at 50 distinct polls answered correctly, not at 25 correct answers
- [x] The title shelf shows progress towards 50 distinct polls
- [x] The wiki and changelog state the new requirement

## Notes
- Target is a flat 50 for every category by decision; vue, java, python, ruby and general-backend have no polls yet, react 24 and git 13, so those titles are unearnable until the bank grows.
- Counts are derived from polls_responses joined to polls, not from user_objective_progress counters. The category-answered and category-correct counters stay for config unlocks and climbers.
- Title ids unchanged, owned titles are kept.

## Summary of Changes
- Category titles read derived metrics category-seen and category-mastered at 50 (ADR-145, replaces ADR-134 D2).
- fetchCategoryPollCounts in run.repository reads polls_responses joined to polls; used by the run-end grant and the title state service.
- Wiki, changelog titles entry, ADR index, specs and TitleShelf story fixtures updated.
- Unverified: responses with a null outcome do not count as mastered; local DB was not reachable to count them.
