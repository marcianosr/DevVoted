# ADR-028: Volkswagen CI, the defeat device

## Status

Accepted (2026-08-11). Amended by [ADR-035](035-gates-are-auditors.md): the
checklist this config read is gone, so the device suppresses the gate's **first
audit** instead. The price, the naming call and the fraud-is-visible rule all
carry over unchanged.

## Context

"Volkswagen CI" is the developer joke for a pipeline that is green because it
cheats, after the emissions defeat device that ran clean only while it was being
watched. Marciano wanted it in the roster as a legendary.

Two things made it non-obvious: what does a config whose whole point is dodging
a rule owe in return, and what stops "never fail" from being a win button?

## Decision

**Volkswagen CI reports the gate's first audit as passing**, struck through on
the stake receipt. `suppressesAudit` on the roster entry; `suppressorOf` and
`suppressedAuditFor` in `audit.model.ts`.

Order inside a gate is therefore load-bearing, which is why ADR-038 authored the
audit order deliberately and ADR-056 gave a drawn gate a roster rank rather than
an arbitrary array: the entry a player would most want suppressed leads, so
suppression is a real choice rather than a lottery.

### No per-use fee

The first design charged an escalating KB fine per use, doubling, so repeated
fraud eventually bankrupted the run. Marciano rejected it: **the price is the
cost.** The config is 384 KB via a per-config `draftCost` override, since the
size rate alone could not express it.

Prefer the size-derived price (ADR-047); reach for the override only when a
config's cost is the balancing lever, as here.

### Size is what stops a narrow build carrying it

Without a floor, hiding one failure makes a thin build immortal. The original
mechanic paid for this with a cover requirement: it only fired when three other
checks had run and passed, so the fraud needed width, and width gave it more
rows that could fail together and take the cover away.

Checks are gone and the cover with them. The **8-slot size** does that job now:
at `BASE_SLOTS` of 4 the device cannot be installed at all, so buying the fraud
still means buying width first. This keeps working against the narrow-builds-coast
risk rather than feeding it.

### The fraud is visible, never silent

The suppressed audit is shown struck through rather than removed. A rule the
player cannot see was suppressed reads as the game forgetting its own rulebook.
This is the same principle as ADR-006's live checklist and ADR-038's
"an offline config says so": the receipt always names what is in force.

### Naming

The roster is deliberately vendor-neutral (see the AGENTS.md comment in
`configRoster.model.ts`). This config breaks that rule on Marciano's explicit
call: the defeat device *is* the mechanic, "Volkswagen CI" is already what
developers call a pipeline that is green by fraud, and DevVoted is partly about
memeing. `|| true` and `continue-on-error: true` were the vendor-neutral
alternatives, rejected as less funny.

## Consequences

- A config that demands nothing of the player and only wakes up once something
  else has gone wrong is classified `conditional` in `configRole.model.ts`.
- Its real home is the strip audits, where suppression saves a build rather than
  a few KB. If it trivialises those, DVTD-ud69 reprices it.
- Open risk: a build deep enough to carry 8 slots of dead weight gets one audit
  waived every gate forever. The cheapest knobs are the size or firing once per
  run.
