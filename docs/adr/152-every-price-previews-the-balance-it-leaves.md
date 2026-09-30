# ADR-152: Every price previews the balance it leaves

## Status

Accepted, 2026-09-29 (Marciano, DVTD-6hqm). Extends
[ADR-124](124-the-balance-names-every-change-one-at-a-time.md) decision 3 from
the install price to every config price, and closes the consequence
[ADR-123](123-a-card-states-a-figure-only-where-it-is-paid.md) left open.

## Context

The shop previewed one price. Hovering a registry offer fed its price to the
header, which stated `after install · 378 KB` above the balance. Nothing else on
the screen did this.

Selling was the gap that mattered. `Uninstall ↩ +32 KB` says what a refund pays
but not what the run ends up holding, which is the figure the decision actually
turns on. Upgrading said nothing at all: the registry's rolled upgrades never
carried the hover, and a build card could not carry it, because `Build` spends a
chip's hover on the weight-track highlight.

The trigger was also on the wrong thing. A build card carries two prices, an
upgrade and an uninstall. A hover on the card cannot say which of them it means.

Under all of it sat a figure that was not true. A build card quoted
`sellRefund`, the undiscounted half of a draft cost, while the reducer pays
`sellRefundIn`. A build holding WTFPL — whose own description says *nothing
sells back for anything* — quoted `+32 KB` and paid nothing.

## Decision 1: the price press is the trigger, not the card

A preview belongs to the press that would charge it. `ConfigChip` takes one
`onQuote?: (quote?: ChipQuote) => void` and each of its three presses reports its
own name on hover, on focus, and `undefined` on leave. The kit names *which*
price is pointed at and never learns what a KB is.

This leaves the card's own `onHover` to the weight track, which is what made the
build panel reachable at all.

## Decision 2: a pointed price is a signed delta, and the header resolves it

The viewmodel hands the header a `PointedPrice` — a label and a `deltaKb`,
negative for a spend and positive for a refund. One arithmetic serves both
directions, and one guard covers them: a preview is refused when the resulting
balance would be below nothing, which is the old `priceKb > balanceKb` refusal
generalised. `kbLabel` has no negative reading, so a difference is never handed
to it unbounded.

A spend stays vermillion. A refund is viridian, the colour ADR-123 decision 5
already gave the refund cap, so the tint says which way the number moves before
the word does.

## Decision 3: the refund quoted is the refund paid

A build card quotes `sellRefundIn` against the installed build. Where that is
zero the card states no refund at all rather than `+0 B` — the press reads a bare
`Uninstall` — because a zero figure is a rule, not a price, and the config that
causes it already states the rule in its own description.

This is the box ADR-123's consequences left open and `DVTD-ea7h` tracked.

## Consequences

An unaffordable install previews nothing, because a refused press fires no
pointer events. That was already the outcome, by a different route.

`buildChipFor` takes an options object. It needed the installed build to price a
refund and a pointer handler to preview one, which is six things to say
positionally.

Services, the incident desk and the build-space rungs are still unpreviewed.
They state a shortfall where they refuse, which is the other half of the same
question, and they are rows rather than cards, so nothing is ambiguous about
what a hover would mean there. Worth revisiting once the config prices have been
played.
