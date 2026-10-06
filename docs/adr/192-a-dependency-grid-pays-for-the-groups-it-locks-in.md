# ADR-192: A dependency grid pays for the groups it locks in

## Status

Accepted — 2026-10-05 (Marciano, DVTD-dcfz).

## Context

The wiki planned a puzzle-grid poll type. A grid shows twelve tiles that hide three
groups of four. The player picks four tiles and locks them in, then picks again,
which makes it the first poll you answer more than once. The single and multiple
answer types do not fit it: grading compares one set of picks against a boolean key,
and every answer moves the run to the next poll.

## Decision 1: grid is a third answer type

`grid` joins `single` and `multiple`. Each tile stores the group it belongs to, and
the poll stores the group names in group order. Every tile is stored as correct,
because every tile belongs to some group.

## Decision 2: a wrong lock-in ends the grid like a wrong answer

A lock-in whose four tiles share a group solves that group, and the player stays on
the grid. A lock-in that mixes groups ends the poll at once and breaks the streak, as
a wrong answer does. The game gives no extra lives, so the existing rule for wrong
answers holds.

## Decision 3: two solved groups lock the last one in

Once two groups are solved, only the last group's four tiles are left, so the game
locks them in by itself and the grid counts as correct.

## Decision 4: share is groups solved ÷ 3, at double credit

A grid pays `solved ÷ 3` as its share: 0, ⅓ or 1 (⅔ cannot happen, see Decision 3).
It takes the multiple-answer credit of ×2. The share is graded from the tiles locked
in, so the engine, the community board and the Dex all reach the same outcome from
the stored picks: full share is correct, any share is partial, none is wrong.

## Decision 5: the client never learns the groups

The poll screen receives tile ids and labels only, never group membership. The tiles
are shuffled with a seed taken from the poll id, because the authored order is the
group order. Locked-in groups come back named, with their tiles. A plain `answer`
action is refused on a grid, so twelve posted ids cannot buy a full share. The
Shuffle press only reorders the tiles on the client.

## Decision 6: group names are hidden unless the build names answer types

The chips above the grid read `? ???`. The configs that already name answer types
(`git rebase -i` v2, Prefetch v2) also name a grid's groups. No new config is needed.

## Decision 7: what each audit and config does to a grid

| Piece | Behaviour on a grid | Why |
| --- | --- | --- |
| 207 Multi-Status | does not disguise it; credit stays ×2 | a grid cannot pass for a pick-list |
| 451 Legal Hold | seals no tile | a hidden tile makes its group unsolvable |
| Mirror | no effect | every tile is correct, so there is no wrong tile to mirror |
| Linter, peek | inert | they act on wrong options, and a grid has none |
| Round-up (ADR-086) | rounds a ⅓ grid up to a whole unit | it rounds credited units, whatever the type |
| LGTM approval | refused | the room cannot pick a group for you |

## Consequences

- A grid is worth up to two units, the same as a perfect multiple-answer poll.
- Session responses still write one row per poll, when the grid ends.
- The keyboard letters do not apply to tiles; Enter locks in once four tiles are picked.
