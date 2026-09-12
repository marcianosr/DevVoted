# ADR-072: Prep opens on the stakes, not on the build

## Status

Accepted — 2026-09-12 (Marciano, DVTD-2h6o). Rebuilds the kanto prep screen.
Amends [ADR-032](032-prep-is-the-post-shop-hub.md) decision 2: prep is still the
post-shop hub, but it no longer carries a way back to the shop. See the
consequence below, which is not resolved.

## Context

The kanto prep screen showed the build, the window and the gate's audits, then
asked the player to start. It never said what the gate would do to them. The
only stake it priced was a clear and a peel, on one line in the footer.

[ADR-076](076-the-closing-band-decides-what-it-costs.md) made that the wrong shape.
There are four outcomes now, three of them survivable and only one of them
advancing, and the difference between them is worth more to a player standing
in front of the gate than a list of configs they have already bought.

## Decision

1. **The coverage bar runs across the header**, empty, labelled with the band
   names rather than the boundaries between them
   ([ADR-070](070-coverage-reads-as-a-banded-bar.md) `marks="bands"`). Prep is
   the one screen where every band matters equally, because none of them has
   happened yet. The poll screen keeps the boundary labels, where the question
   is how far away the next line is.

2. **The four outcomes are a table, full width, above everything else.** Band,
   range, what happens, what it pays. It is the first thing under the bar
   because it is the decision: start now, or go and do something else.

3. **The build comes off the screen.** It was reviewed in the shop, one screen
   earlier, and it is locked the moment the gate starts. Showing it again
   invited a change that prep cannot make.

4. **"What it pays" comes off too.** The outcome table states the payout for
   every band, so a separate card repeating the best case was saying the same
   number twice.

5. **The gain is stated as a range.** Prep redacts the answer types, and model F
   pays 5% for a single-answer poll and 8% for a multiple. The player genuinely
   does not know which they will be dealt, so the row says `+10 – 16%` rather
   than pretending to one figure. The redaction above it is the reason for the
   range.

## Consequences

**Prep no longer links back to the shop.** ADR-032 decision 2 lists "← Back to
shop" among prep's three exits and rests on it: the point of that ADR was that
the shop stays open and revisitable until the climb resumes, with
`finish-reward` firing from prep's start button rather than the shop exit. With
the link gone the shop becomes a one-way door in the kanto kit, and the only
exits from prep are the community board and starting the gate. **Unresolved**:
either the link comes back, or ADR-032's flow changes and `finish-reward` moves.

The footer still reads "Starting locks this build for the window" while the
build is not on screen. That is deliberate — it is a warning about what starting
costs, not a caption for something visible — but it is the sentence to watch in
playtest, because a player who has not seen their build in two screens may not
know what is being locked.

Nothing enforces the four outcomes yet. `survivesGate` still resolves a gate
with one boolean, so the screen is currently a promise. ADR-076 owns closing
that gap.

Figures come from the model, not the mock: the ranges from `healthyAt` / `okAt`
/ `floorAt`, the payouts from `gatePayoutKb`, the gain from `gainPerCorrectFor`.
The mock's own numbers predate both the 5%/8% base and the pay-against-the-line
payout, so the shipped screen reads differently from it on purpose.
