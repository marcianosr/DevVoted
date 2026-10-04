# ADR-145: A category title counts distinct polls

## Status

Accepted, 2026-09-29 (Marciano, DVTD-nfa6). Replaces
[ADR-134](134-a-category-title-is-named-not-derived.md) Decision 2.

## Context

The two category rungs read the counters `category-answered:<code>` at 10 and
`category-correct:<code>` at 25. A counter adds one per answer, so replaying the
same few polls earned a title that claims you know a subject.

## Decision 1: both rungs count distinct polls, at 50

The entry rung reads `category-seen:<code>`: distinct polls in the category you
answered at least once, right or wrong. That is the Dex's "seen". The mastery
rung reads `category-mastered:<code>`: distinct polls you answered correctly at
least once. One correct answer is enough; the Dex's 70% accuracy "mastered" is
a different reading and stays the Dex's.

## Decision 2: the counts are derived, not counted

`user_objective_progress` holds counters with no poll identity, so it cannot
express distinct. `fetchCategoryPollCounts` reads `polls_responses` joined to
`polls` and returns the two metrics per category, for the grant at run end and
for the shelf's bars. Nothing increments them. The `category-answered` and
`category-correct` counters stay: config unlocks and the climbers' best
category read them.

## Decision 3: the bar is fifty in every category

A subject with fewer than fifty polls cannot award its titles until the bank
grows. Chosen over scaling the bar to the bank, which would move a title's
meaning every time a poll is published.

## Consequences

The ids do not move (ADR-134 Decision 3), so titles already held are kept. A
response row with no `outcome` does not count as correct.
