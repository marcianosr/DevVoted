# ADR-027: A gate only admits a build that can survive its own stake

## Status

Accepted (2026-08-10, Marciano). **Amends [ADR-017](017-no-baseline-check.md) §3
(the bareness rule scales from ≥1 to a per-gate width demand), amends
[ADR-021](021-death-at-the-gate-that-empties-the-build.md) §3 (the shop's
last-config guard generalizes to the demand), and qualifies
[ADR-019](019-depth-and-width-are-independent.md)'s "width never gates the
climb".**

## Context

Checks come only from configs (ADR-017), so a thin build owes a short
checklist. DVTD-ziss measured the consequence side and concluded width is the
run's hit-point pool — a narrow build dies at the gate-4 cliff on one bad
window — and closed ADR-019's open risk on that basis. What it did not close
was the demand side: `dropCount` scales the strips a failure costs, but a
player who rarely fails never pays it, and every config removed *lowers* the
next window's demands. A strip is a self-negating penalty.

Marciano demonstrated it live (2026-08-10): standing at the Soul gate holding
one config (Code Coverage), the whole gate demanded "never miss twice in a
row". The shop's only width rule was `holdsLastConfig`, so selling down to a
one-line checklist was legal at any depth — a glass cannon, but for a player
who rarely misses, a free climb to the summit.

There was also a sharper hole: the reducer accepted `drop` throughout the
`answering` status and `gatePassed` grades the *current* pipeline, so a
failing check could be shed mid-window before the gate closed.

## Decision

1. **`minConfigsForGate(gate) = min(gate, dropCount(gate) + 1)`**
   (rules.model). The demand ramps with the early gates — Pallet 0, Boulder 1,
   Cascade 2, Thunder 3 — then follows one-over-the-strip-quota: 4 at gate 4,
   8 at the summit. From Thunder on, under the demand and "a failure is fatal"
   (ADR-021's `quota >= installed`) are the same predicate, so the rule reads:
   *the gate refuses builds that cannot survive its stake*. Thinness stops
   discounting the checklist because width is now itself a demand.

   The ramp is same-day tuning (Marciano): a pure `dropCount + 1` would
   demand 2–3 configs from the opening gates, where a run has earned nothing
   yet — a broke early run stripped thin could never buy its way back over
   the demand. The first gates stay easy and farmable instead; the price is
   that an at-demand build *can* be fatally stripped before Thunder, which
   ADR-021's fatal rule already prices honestly.
2. **Graded at the door, not the window.** `finishReward` ends the run
   (`dead`) when the build is under the coming gate's demand, with the gate
   named in the log. `gatePassed` and `checkStatuses` are untouched: a strip
   may legally sink a build below the demand and the **replay is exempt** —
   ADR-021 already owns that spiral, and grading the demand at window close
   would recreate the zombie window it killed (no shop sits between a strip
   and its replay). ADR-021 rejected a shop button that ends a run because "no
   failed gate has charged for it"; here one always has — under-demand states
   are reachable only through a strip — so the door executes a charge the
   player was warned about, in cinnabar, on the Build Summary before the click.
3. **Voluntary thinning below the demand is refused.** ADR-021 §3's
   `holdsLastConfig` becomes `atMinimumWidth`: the shop's Uninstall and the
   prep doorstep's drop are disabled at or under the coming gate's demand, with
   the demand named in the tooltip. The early gates demand less than one
   config, so the last-config rule stays the hard bottom there (ADR-021 §3
   survives unchanged as the ramp's floor). Nothing but a failed gate can put
   a build under the demand.
4. **Drop is doorstep-only while answering** (`window.answered === 0`).
   Mid-window a drop would shed the very check about to fail; the gate grades
   the build it admitted.
5. **The Build Summary names the demand** (Marciano, same day): a muted
   "Demands N+ configs installed" line while met, cinnabar "Demands N configs —
   the build holds K. Climbing on ends the run." once under it. The line only
   appears once the demand is real (≥ 2) — the early gates carry no line.

**Rejected: a flat or capped demand curve.** A flat 3 kills only the 1-config
crawl; past gate 4 the quota outgrows it and thin-at-demand stays a
low-demand cruise. The ramped quota-following curve was chosen knowing what
it re-couples (below).

**Rejected: blocking the shop exit while the repair is affordable.** It needs
solvency math (draft prices, offer counts, rebuild costs) to decide when the
player is stuck, and an insolvent player would be soft-locked with abandon
(banks nothing) as the only exit — a worse deal than the death the door gives
(banks `storageCreditRate`).

## Consequences

- **ADR-019 is qualified, deliberately.** The summit demands 8 configs, which
  transitively demands 8 slots (70 coverage). Depth is re-coupled to the
  coverage ladder — mildly (8 slots by gate 12, not ADR-018's 12) and via a
  different mechanism: the gate demands *installed configs* (buyable every
  shop), not slots. "A run can be five gates deep on its starting three
  slots" is no longer true past gate 3.
- The freeloader build (wide, conditional checks that skip on the draw) still
  climbs; it satisfies any width demand. That stays priced out by
  correctness-scaled payouts (ADR-017 §2) and the victory-prize gating noted
  in DVTD-g1p0.
- A post-strip build must spend storage to re-widen before the next gate, so
  storage becomes the run's safety currency, not just its shopping budget.
- `gateStake.fatal` is unreachable for freshly admitted builds from Thunder
  on (the demand guarantees quota < configs there); it still fires on
  under-demand replays and on the deliberately-thin early gates.
- The starting three configs meet every demand through gate 3; the first
  forced widening lands with gate 4 — the same depth ADR-021 named as where
  fragility begins.
