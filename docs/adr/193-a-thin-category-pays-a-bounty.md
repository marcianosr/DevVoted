# ADR-193: A thin category pays a bounty

## Status

Accepted — 2026-10-07 (Marciano, DVTD-y0jb). Amends ADR-185 D1 (the flat 16 KB)
and ADR-189 D1 (no admin poll ad, two kinds of offer).

## Context

The bank is uneven: some categories hold hundreds of published polls, Vue a handful.
Every approved poll paid the same 16 KB, so nothing pointed a writer at a thin
category, and the advertisements were mostly borders: the poll editors card was
never shown to an admin, and it named no category a writer could act on.

## Decision 1: the reward is a bounty over the category's published count

An approved poll pays its author a figure read from how many published polls its
category holds: the fewer, the more. A full category pays the old 16 KB, which stays
the floor. The tiers live in `bountyKbFor`; a category counts its **published** polls
only, so drafts waiting for review do not thin out the bounty for each other.

## Decision 2: the bounty is fixed when the poll is suggested

The figure is written on the poll when it is suggested, and the first publish pays
that figure. The author is paid what the form and the advertisement promised, even
if the category fills while the poll waits for review. Only an admin can edit a poll
after it is suggested, so a changed category keeps the figure it was suggested with.
Polls suggested before this decision were promised 16 KB and keep it.

## Decision 3: the poll editors card names a thin category

When a category pays more than the floor, the poll editors card names one of them,
picked by the same roll that picks a border: `Looking for Vue polls`, how many it
holds, and its bounty as the price. Its press opens the suggest form on that category.
When no category is thin, the card reads as before.

## Decision 4: an admin sees the poll editors card, without a reward

An admin's poll still pays nothing (ADR-185 D5), so an admin's card states no price
and no reward. It still names the thin category, which is where an admin's writing
helps the bank most. ADR-189 D1's "an admin never sees the poll editors card" is
withdrawn.

## Decision 5: the suggest form states the bounty of the picked category

The form's reward badge reads the bounty of the category picked, and the floor before
one is picked. Every figure on the card and the form comes from the same count.

## Consequences

- The approval dialog sums the figure each poll was promised instead of 16 KB a poll.
- The nav and Your suggested polls keep stating the 16 KB floor.
