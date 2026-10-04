# ADR-124: The balance names every change, one at a time

## Status

Accepted, 2026-09-26 (Marciano, DVTD-y06t). Live: the header balance queues a
burst of changes and plays them in order. Extends
[ADR-077](077-the-pin-rides-the-fill-it-names.md) from the coverage bar to the
balance, and reuses the CSS count-up of
[ADR-068](068-coverage-reads-as-a-ring.md) decision 4.

## Context

The balance readout already named a change: a signed pill above the figure, the
figure tinted green or red, and the digits counting to the new reading. It holds
one change at a time, because it infers the change by diffing the incoming
reading against the last one it saw.

A second change inside the hold overwrites the first before it can be read. Two
shop installs in quick succession name only the second, and the figure never
lands on the balance the first one left.

## Decision

1. **A burst plays in order, one change per hold.** The readout keeps a queue of
   moves instead of a single one. Each move gets its own pill, its own tint and
   its own count. A move measures from the last reading accepted, not from the
   one still showing, so the figures always sum to the true balance.

2. **The figure steps through each reading.** While the queue drains, the figure
   reads the move being named, not the balance the server has already sent. A
   pill saying "−32 KB" over a figure that has absorbed the next spend is a lie,
   and a mixed burst would tint green while the number falls.

3. **The preview stays quiet while the queue drains.** "After install" is
   computed from the true balance, so it would contradict a lagging figure. Same
   call as refusing the preview outright when the price is above the balance.

4. **The queue belongs to the readout, not to the run.** Overlap is a problem of
   space. The coverage bar's pin and the balance pill do not share space, so
   they can play at once, and each keeps its own queue. This reverses the note on
   DVTD-np66, which assumed one shared queue.

## Consequences

The figure lags a draining queue by one hold per queued change, 1.8 seconds
each. That is the price of decision 2. The single knob is
`BALANCE_PILL_HOLD_MS` with its matching `--callout-duration`.

A backlog does not drain faster. Shortening the hold of a pill already playing
would re-time its animation in flight, since the pill is a keyframe rather than
a transition (ADR-077's reason, inverted: the pill is remounted per move, so the
keyframe replays).

Changes arriving in one render still collapse into one net figure. Outside a
gate close the server ships only the new total, so an answer that pays the
faucet and burns to an audit cannot be split into its two parts.

`HeaderFunds` no longer carries a formatted `amount` and `unit`. The readout
renders intermediate values the viewmodel never produced, so it formats the
reading itself, and one number with two formatters would drift.
