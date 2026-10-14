# ADR-192: A pairs poll pays for the pairs you match

## Status

Accepted — 2026-10-11 (Marciano, DVTD-dcfz). Replaces the dependency grid this ADR
first described (twelve tiles, three groups of four), which felt too slow for a
five-poll day and never shipped.

## Context

Some polls hide several facts in one question. Poll #6 asks what the adjacent sibling
selector is, and `+` alone gives the answer away without the player knowing `>`, `~`
or a space. A matching pairs poll asks for all four facts and stays quick on a phone:
two columns, tap a tile on each side. A typed answer (De Slimste Mens' puzzle) was
considered and dropped: a correct answer can be misspelled.

## Decision 1: pairs is a third answer type

`pairs` joins `single` and `multiple`. A poll holds four to six pairs of two tiles. Each tile
stores its pair index, and within a pair the lower option id is the left tile. Every
tile is stored as correct, because every tile belongs to a pair.

## Decision 2: a miss burns the pair you started from

Replaced by ADR-197: every pair is linked first, then checked at once.

## Decision 3: the last pair locks itself and pays nothing

Replaced by ADR-197: three right links force the fourth, and the share below
already pays at most three.

## Decision 4: share is pairs matched ÷ 3, at double credit

A pairs poll pays `matched ÷ 3`: 0, ⅓, ⅔ or 1. It takes the multiple-answer credit
of ×2. The share is graded from the matched tiles, so the engine, the community board
and the Dex reach the same outcome from the stored picks: full share is correct, any
share is partial, none is wrong.

## Decision 5: the client never learns an unresolved pair

The poll screen gets the left and right columns, each shuffled with a seed taken from
the poll id. It never gets pair indexes. A plain `answer` action is refused on a pairs poll, so eight posted ids
cannot buy a full share.

## Decision 6: what each audit and config does to a pairs poll

| Piece | Behaviour on a pairs poll | Why |
| --- | --- | --- |
| 207 Multi-Status | does not disguise it; credit stays ×2 | two columns cannot pass for a pick-list |
| 451 Legal Hold | seals no tile | a hidden tile makes its pair unmatchable |
| Mirror | no effect | every tile is correct, so there is no wrong tile to mirror |
| Linter, peek | inert: both presses refuse with "nothing to act on" and charge nothing | they act on wrong options, and a pairs poll has none |
| Round-up (ADR-086) | rounds a ⅓ or ⅔ share up to a whole unit | it rounds credited units, whatever the type |
| LGTM approval | refused | the room cannot match a pair for you |

## Consequences

- A pairs poll is worth up to two units, the same as a perfect multiple-answer poll.
- Session responses still write one row per poll, when the poll ends.
- Letter keys do not apply to tiles. The Check press is ADR-197.
