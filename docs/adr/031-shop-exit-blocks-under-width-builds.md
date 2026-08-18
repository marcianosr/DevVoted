# ADR-031: The shop exit blocks an under-width build; death is an explicit dead-end click

## Status

Accepted (2026-08-11, Marciano). **Amends [ADR-027](027-gate-width-demand.md)
Decision 2 (the door refuses instead of killing) and reverses its rejected
option "blocking the shop exit while the repair is affordable".**
[ADR-021](021-death-at-the-gate-that-empties-the-build.md)'s "death belongs
to a gate" survives — as an explicit click, never a surprise. (DVTD-jnlj)

> ⚠ Superseded by [ADR-035](035-gates-are-auditors.md) (2026-08-17): the shop exit is always open — nothing grades it and the End-run click is gone.

## Context

ADR-027 grades the width demand at the gate's door: leaving the shop under
`minConfigsForGate` ended the run, with the charge named in cinnabar before
the click. Marciano hit it live (2026-08-11): a strip at gate 4, a replay
passed holding 3 configs, gate 5 demanding 4 — and the "continue" click
killed the run. The warning didn't save it: the player's model in the shop is
*"this is where I repair the build"*, not *"leaving is entering the gate"*. A
warned click that ends the run is still a trap.

ADR-027 had rejected exit-blocking on two grounds: it needs solvency math to
know when the player is stuck, and a stuck player would be soft-locked with
abandon as the only exit. The playtest showed the death is the worse deal —
so this ADR pays for the solvency math and gives the stuck run a door.

## Decision

1. **The exit refuses while the shop can repair the width.** `finishReward`
   returns the state unchanged when the build is under the demand and
   `canRepairWidthDemand` holds: a free slot to install into, and either an
   unowned offer on the table the storage can pay for, or storage for a
   rebuild plus the cheapest thing a roll can return
   (`CHEAPEST_DRAFT_COST_KB`, the rarity table's floor — config.model). Not a
   proof of repair: a rebuild may roll nothing affordable. But every miss
   drains storage, so the bound is eventually crossed and the verdict stays
   honest — *has a move* vs *provably stuck*.
2. **The UI blocks the exit and names the shortfall.** `shopExitFor`
   (runView.viewmodel) is the one place the exit is graded — the routed shop
   and the proto-run rig both render it: disabled "Continue to gate N →" with
   "install K more" in the hint while repairable.
3. **Provably stuck → an explicit cinnabar end-run click.** The exit becomes
   "End run — gate N demands M configs →" (Button `danger` variant); the
   reducer keeps the dead verdict and the log names the shop's inability.
   Under-demand states are still reachable only through a strip, so the
   charge still traces to a failed gate (ADR-021) — but the player closes the
   run, the run never closes on the player.
4. **Receipt copy follows.** The Build Summary's cinnabar line becomes
   "Demands N configs — the build holds K. Install X more to climb on."
   ("Climbing on ends the run" described the trap; it's gone with it.)

## Consequences

- The under-demand replay build now parks in the shop until repaired. The
  DVTD-kokk cheese stays closed — the build can't cruise past the next gate —
  it just can't die by mis-click either.
- An insolvent under-width run ends by consent. The abandon-vs-death
  economics of ADR-021 are unchanged; only who clicks first moved.
- A slot-capped build (demand outgrows the slot ladder) is a dead end no
  storage can fix — `canRepairWidthDemand` calls it stuck immediately. The
  coverage ladder outpacing the demand curve is what keeps this rare
  (DVTD-5u32 measured the ladder generous); if tuning ever slows the ladder,
  this dead end is the place it will surface.
