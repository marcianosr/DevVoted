# ADR-028: Volkswagen CI, the defeat device

**Status:** Accepted
**Date:** 2026-08-11
**Supersedes:** nothing. Carves one narrow exception out of the ADR-022 rule
(reserved and unwritten, but cited throughout `effect.model.ts` and
`run.model.ts`: the checklist is the whole rulebook, and every config owes the
gate something).

## Context

"Volkswagen CI" is the developer joke for a pipeline that is green because it
cheats, after the emissions defeat device that detected test conditions and ran
clean only while it was being watched. Marciano wanted it in the roster as a
legendary config (2026-08-11).

Two things made it non-obvious:

1. **What does it check?** Every config is Effect + Check ([ADR-016](016-the-config-rule.md)),
   and the roster type refuses a config that carries neither a `check` nor a
   `focusCategory` (the ADR-022 rule). A config whose whole point is dodging a
   check still owes the gate something.
2. **What stops it from being a win button?** "Never fail" is not a mechanic.

## Decision

**Volkswagen CI reports one failing check as passing, but only when at least
`DEFEAT_DEVICE_COVER` (3) other checks ran and passed.**

It is the only config that reads the checklist instead of adding a row to it, so
it is synthesized in `gate.model.ts` rather than in `effect.model.ts`: an
`Effect` sees only the window, never its neighbours. `check: "defeat-device"` is
excluded from `CHECK_BUILDERS` the same way `"correct"` already is.

### No per-use fee

The first design charged an escalating KB fine per use, doubling, riding on the
storage plan's insolvency ([ADR-023](023-storage-capacity-is-a-subscription.md))
so repeated fraud eventually bankrupted the run. Marciano rejected it: the
rarity and the draft price are the cost. The config is priced at **384 KB** (the
legendary 256 plus 128) via a new per-config `draftCost` override, since the
rarity table alone could not express it.

### The cover floor is a width demand

Without a floor, "hide one failure" makes a narrow build immortal: a pipeline of
Unit Tests plus the device has two rows, and if `Correct` fails the device hides
it and nothing else can fail.

Covering takes N passing rows plus the failing row it hides, so **a floor of N
needs N + 2 slots**: 1 works at `BASE_SLOTS` and is degenerate, 2 needs slot 4
(8% coverage), 3 needs slot 5 (16%). We chose 3, so a 384 KB legendary cannot be
carried by a starting-width build, and so a build that wants the fraud must
widen — which also gives it more rows that can fail together and take the cover
away. This works against the "narrow builds coast" risk (DVTD-ziss) rather than
feeding it.

### Cover counts `success` only, never `skipped`

A skipped check passes the gate (`gate.model.ts`), so counting skips as cover
would let a build pad with Focus configs for categories that rarely appear:
three of those skip nearly every window, cover is always met, and the hole
reopens at any floor. Only checks that ran and passed count. This is also the
truer reading of the joke, where the fraud is about tests that ran.

### The waived rule

The device can never fail a gate on its own: with nothing failing there is
nothing to hide, and when it cannot cover, the check it failed to hide is
already failing the gate. That is a real exception to the "every config owes the
gate something" rule, accepted here because the price, the slot and the
width floor are the cost, and because a config that punished you for owning it
would not be the joke.

It is classified `conditional` in `configRole.model.ts` for the same reason: it
demands nothing of the player, it only wakes up once another check has failed.

### Naming

The roster is deliberately vendor-neutral (see the AGENTS.md comment in
`configRoster.model.ts`). This config breaks that rule on Marciano's explicit
call: the defeat device *is* the mechanic, "Volkswagen CI" is already what
developers call a pipeline that is green by fraud, and DevVoted is partly about
memeing. `|| true` and `continue-on-error: true` were the vendor-neutral
alternatives considered and rejected as less funny.

## Consequences

- The checklist is still the whole rulebook, but a row can now be rewritten
  before the gate reads it. The faked row keeps its real tally and is marked
  `(reported passing)`, so the fraud is visible to the player, never silent.
- `checkStatuses` is now order-dependent: the device runs last, on the assembled
  list. Any future config that reads the checklist must join it there.
- A per-config `draftCost` override exists now. Prefer the rarity price; reach
  for the override only when a config's cost is the balancing lever, as here.
- Open risk: an all-`success` wide build gets a free failure every gate forever.
  If that proves too strong in playtest, the cheapest knobs are the floor (one
  constant) or making it fire once per run.
