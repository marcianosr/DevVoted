# ADR-140: The shelf holds the rank ladder

## Status

Accepted — 2026-09-29 (Marciano, DVTD-ls8r). Replaces
[ADR-134](134-a-category-title-is-named-not-derived.md) Decision 6 and trims its
Decision 5.

## Context

ADR-134 kept the fourteen ranks off the shelf: a rank replaces the one before it,
so storing rungs would leave `Poll Newbie — voted less than 7 times` on a veteran's
shelf. The second roster had grown to twenty-nine names, most of which read as
noise on a shelf that is meant to say what you have done.

## Decision 1: a rung is a threshold title

Each rank becomes a title earned on `polls-answered`, at the poll that enters it:
`Poll Newbie` at 1, each later rung one past the previous rung's ceiling,
`Polls Galore!` at 786. The bar says what you did (`36 polls answered`), not what
you have not done yet, so a held `Poll Newbie` is a true statement for life. That
answers ADR-134's objection. The rank line on the card stays derived.

## Decision 2: an unreached rung hides its name

A poll-count rung shows its bar and withholds its name until earned. The ladder is
the one group where the next name is a reveal; a category or behaviour title names
the thing you are aiming at, so it stays named.

## Decision 3: the shelf has three groups, derived

Poll count, category and other. The group is read off the title's metric
(`polls-answered`, `category-*`, anything else), never stored, like the config
groups in ADR-127.

## Decision 4: twenty-five titles are retired

Twenty-one of the second roster and all three non-category mechanisms: Completer,
Summit, Flawless and the race title First Ascent. The `race` and `every-category`
earn kinds go with them. The `run-streak-*` emissions existed only for two retired
titles and are removed. The `exclusive` column and its index stay in the schema,
always false.

A guarded migration clears the retired ids from `equipped_title_ids` before it
deletes their `user_titles` rows (see ADR-134 Decision 3 for why the order
matters), then grants every rung an account has already passed, marked announced.
