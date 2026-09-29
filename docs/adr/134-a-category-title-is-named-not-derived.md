# ADR-134: A category title is named, not derived

## Status

Accepted — 2026-09-28 (Marciano, DVTD-iru4). Extends
[ADR-109](109-a-title-is-earned-and-worn-one-at-a-time.md); reaffirms
[ADR-103](103-the-board-seats-twelve-category-leaders.md) Decision 3.

## Context

Every category carried one title, generated as `${name} Maintainer`. Twelve rows
that differ only by the category beside them, on a shelf whose whole job is to
say what you have done.

The game that came before DevVoted had nineteen written names for the same
subjects — HTML Hobbyist, Markup Master, Git GOAT, every()thing Correct — and
they have had nowhere to live since the awards screen was deleted. Each was
awarded to whoever had the *most* of something, which is the one reading a title
cannot have.

## Decision 1: the names are written, not derived

`CATEGORY_TITLE_NAMES` in `title.model.ts` holds a pair per category, checked
with `satisfies Record<CategoryCode, …>` so a thirteenth category is a compile
error rather than a silently unnamed title.

A generated name costs nothing to add and says nothing when it arrives. Seven
pairs are the pre-DevVoted names unchanged; five categories are newly named.

## Decision 2: a category has two rungs

One for answering polls in a subject, one for getting them right:
`category-answered:<code>` at 10 and `category-correct:<code>` at 25.

This is the shape the old roster already had — a participation award beside a
mastery award — and it is the shape the names come in pairs for. The entry rung
is 10 rather than "your first", which is what `docs/old-beans/DVTD-vje6`
sketched: at one, all twelve land inside two runs and the announcement notice
becomes a wall.

## Decision 3: the ids do not move

The mastery rung keeps `title-maintainer-<code>`. Only the `name` field changes.

`users.equipped_title_ids` is a bare `text[]` with no foreign key to
`user_titles`, and both the equip and the unequip service send the whole array
back for validation. An id in that array with no matching row therefore blocks
equipping *and* unequipping, while `visibleTitles` draws no row to click. It can
only be cleared by a direct write.

Accounts already hold these ids. The cost is an id that no longer reads like its
name; the alternative is a two-table migration that soft-locks anybody it misses.

## Decision 4: the comparative reading does not come back

A title stays a threshold on your own record. Whoever has the *most* correct CSS
answers is the category seat's question, and ADR-103 Decision 3 already refused
that row a title. Nothing here reopens it.

## Decision 5: a second roster names how you play, unflattering entries included

Trimmed to eight by [ADR-140](140-the-shelf-holds-the-rank-ladder.md) Decision 4.

Twenty-nine titles beyond the categories, over builds (`node_modules`, `Vanilla JS`,
`Serverless`), volume (`Green Build`, `Touch Grass`), and behaviour
(`Works On My Machine`, `Bikeshedder`, `Stack Overflow`, `Off By One`, `Heisenbug`).

They cost almost nothing because the engine was already counting. Before this,
`objectiveIncrementsFor` emitted twenty-four metrics for every player, for life, and
exactly two of them fed a title; the rest existed only to unlock configs. Naming them
is a row in `TITLES`, not new plumbing. Only three needed a new emission:
`bare-build-clear` and the two run-streak bars.

**Six are unflattering** and are earned, held and worn like any other. The register is
developer-native self-deprecation, and the shelf is opt-in: nothing is ever worn
without being chosen, so an unkind title is a joke its holder gets to tell.

A one-shot metric is no longer exclusively an unlock's. `ONE_SHOT_METRICS` is now a
shared vocabulary, so the completeness guard that asserted every one-shot belonged to
a config or service moved to the title spec, where both consumers are visible.

## Decision 6: the rank ladder is derived, and is not a title

Replaced by [ADR-140](140-the-shelf-holds-the-rank-ladder.md) Decision 1.

## Consequences

- The roster goes from nineteen titles to fifty-nine. The worn cap stays three,
  so a fuller shelf is a longer choice, not a louder card.
- Config labels are named in the same register as these titles, and `Cold Starter`
  collided with the `Cold Start` config before it shipped. A spec now asserts no title
  name equals a config label. It matches exactly, so it catches duplicates and not
  near-misses; that one was caught by reading.
- The profile card gains a rank line, so `publicProfile.service` and `getTitleState`
  each read `user_objective_progress`. Both are single-table reads keyed by user.
- `category-answered:<code>` is new, so every existing account would start at
  zero on a counter their play already earned. A guarded migration backfills it
  from `polls_responses`, counting session answers and *including* mirrored
  ones, because the emitter counts them too.
- Five names are drafts and expected to be overwritten; they are marked in
  DVTD-iru4, not here.
- Five more names from the old roster have no mechanism and are parked in
  DVTD-vpmw rather than deleted: three rank players against each other on a
  shared poll, and two are Next.js, which is not a category.
