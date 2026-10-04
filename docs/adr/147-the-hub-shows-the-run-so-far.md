# ADR-147: The hub shows the run so far

## Status

Accepted, 2026-09-29 (Marciano, DVTD-y7hk). Amends
[ADR-128](128-the-hub-leads-with-its-press.md): the press still leads, but the
standing line and the coverage card are gone.

## Context

The hub told a returning player where they stood (one hint line) and what the gate
needed (a coverage ring). It did not say what the run had earned so far or what the
build held, and both are what a player wants to know before deciding between the
press and the shop.

## Decision 1: four blocks

1. A top panel. A strip leads it: the gate squares, `run #N · gate X of 12` and the
   balance. The press and the shop sit under the strip, and any rival incident
   waiting at the next gate sits below them.
2. **Run so far**: one row per closed gate with its grade and the KB it banked,
   then the next gate with the band its held coverage reads and what a clean clear
   pays.
3. **Build**: each installed config with its weight and version, then the weight
   free, with a link into the shop while the shop is open.
4. A community strip: players who answered today, and how many others stand at the
   next gate or ahead.

## Decision 2: two press states

- **Ready**: `Continue to <gate>`. Before the gate starts, the note reads
  `N polls ready · prep first` and the shop says `open until you start`.
- **Waiting**: `<gate> opens in Xh Ym`, with the note
  `today's polls are done · come back tomorrow`. The press is refused. The shop is
  the live press and names the balance to spend.

A part-answered day still warns that its leftovers do not carry to tomorrow, now in
the press note. The shop opens by the same rule as before; only its wording changed.

## Decision 3: every close is recorded

The run state keeps a `closes` list: gate, band, cleared, KB. It is optional JSON,
so no migration is needed. Runs from before this decision read as empty and show no
history. A held gate appears once, by its last close.

## Decision 4: the run number is a count

`run #N` counts the player's session runs, including the current one. No column
was added.

## Decision 5: the incident keeps the audit's style

A waiting incident is drawn as the existing `Audit` row (saffron, code, name, sender),
not as a new red banner.

## Consequences

- The next gate's KB figure is a quote for a clean clear, not a promise.
- The logo lands on `/run` for a signed-in player instead of hopping through `/`.
