# ADR-127: The registry groups the hand by what it gives

## Status

Accepted, 2026-09-27 (Marciano, DVTD-yngy). Live on the new run screen. Amends
[ADR-055](055-config-hue-is-keyed-to-slot-size.md) Decision 1, which said no
replacement grouping axis would be introduced. Retires the advised opening of
[ADR-057](057-gate-0-is-the-calibration-gate.md).

## Context

A new run deals five cards into one flat grid. Each card states its own effect
in a sentence, so choosing means reading five paragraphs with no idea what the
paragraphs are alternatives *between*. A player who has never held a config
cannot tell that `.ts` and Code Coverage do the same job in different ways, or
that IndexedDB does a different job entirely.

The nudge that existed did not teach this. `recommendedPicks` marked two cards
"suggested" — it named a pick without naming a reason, so a player either took
the advice blind or ignored it.

Five families were tried once and deleted. ADR-055 removed `ConfigFamily`
because it was a field set by hand on 33 roster entries that no check, reward,
shop roll or gate ever read, and because it had taken a colour channel that
size needed. The bean that closed it (DVTD-eyud) found the deeper fault: the
taxonomy mixed what a config pays with what it costs, so Deprecated, Overclock
and Freemium all read as "big upside, real cost" from three different families.

## Decision 1: the group is derived, never stored

`configGroupOf(config)` reads the effect fields a config already declares and
returns one of `coverage`, `storage`, `answerHelp`, `risk` or `misc`. No field
is added to `Config`, and no entry in the roster names its own group.

This is what makes it a different thing from the taxonomy ADR-055 deleted. A
hand-set label can disagree with the mechanics, and did. A predicate over the
mechanics cannot: the coverage arm is `touchesCoverage`, the same function the
coverage engine uses to decide whether a config pays at all.

## Decision 2: the axis is a heading, never a hue

ADR-055 gave hue to slot size and asked that nothing else compete for the
channel. Nothing here does. A group is a labelled bar above a row of cards, and
the cards under it are drawn exactly as they are drawn everywhere else.

## Decision 3: a card groups by what it pays, and risk is tested last

The cascade is ordered coverage, storage, answer help, risk, misc, first match
wins. A config whose effect moves the coverage number groups under Coverage even
when it carries a real downside, so Cold Start, Overclock and Deprecated all sit
there rather than under Risk.

This answers DVTD-eyud directly. A gamble is a property a payout can have, not a
payout of its own, so Risk cannot be a peer of the others without double-filing
half the roster. Ordering it last leaves it holding only the configs whose whole
effect is a commitment — `strict: true`, SLA and Planning Poker, which pay
nothing unless you were right about a promise, and Try/Catch and Volkswagen CI,
which exist to absorb an outcome. What a risky coverage config costs is stated
on its own card, where the player reads it before installing.

Misc is a real group, not a bug. `.lock`, WTFPL, vendor lock-in and Dependabot
change the shop, the build space or the roster rather than a run's earnings, and
saying so is more honest than stretching a group to swallow them. A spec asserts
Misc holds exactly those four, so a new config with an unfamiliar effect field
fails the build rather than quietly disappearing into it.

## Decision 4: the groups a hand does not hold do not appear

A dealt hand of five touches three groups at most. Only the groups with cards in
them are rendered, and the filter above them is withheld entirely when the
whole hand pays into one group, where there is nothing to choose between.

The filter is one-of-N: **All** leads, then one item per group, and picking one
cuts the list to that group. Its counts are read from the unfiltered groups, so a
cut list never rewrites the filter that cut it. It cannot be hidden: a row of
five words costs less room than the press that took it away.

## Decision 5: nothing is advised

`recommendedPicks`, `RECOMMENDED_SIZE` and `RunView.recommendedConfigIds` are
deleted. The opening pick is the player's, and the groups are how the screen
argues rather than decides.

## Consequences

- The axis is presentation-only. No check, reward, shop roll or gate reads it.
  If it stops earning its place it is deleted from one viewmodel, not unpicked
  from the roster.
- The shop draws the same `Registry` and is handed no groups, so it is unchanged.
  Whether the shop should group too is deliberately left open: its offers are
  three, not five, and the player reading them has already played a gate.
- Twenty-one of forty-five configs land under Coverage. That is the honest shape
  of a roster skewed to coverage effects, and it is the reading to check first in
  playtest — a group that large may want splitting by how it pays.
