---
# DVTD-nd6r
title: Restate the current model across the ADRs and open beans
status: completed
type: task
priority: critical
created_at: 2026-09-12T12:28:22Z
updated_at: 2026-09-12T12:59:29Z
---

Marciano restated the live model in one block (2026-09-12). Several accepted ADRs and open beans now contradict it. Bring the decision record in line.

## The model as given

**Coverage**
- Every gate starts at 0%. 5 polls per gate.
- A normal correct answer gives a fixed amount, currently ~+5%.
- Poll value does NOT increase per gate.
- Configs modify coverage: multipliers, bonuses, spillover.
- Coverage caps at 100%.
- Coverage resets next gate, unless a config allows spillover.

**Gate difficulty** — each gate raises the HEALTHY line, and that is the only difficulty dial:
0:5 1:10 2:15 3:20 4:25 5:30 6:40 7:50 8:60 9:70 10:80 11:90 12:95

**Bands**
- DANGER: the run ends.
- SHAKY: the same gate again, broken streak, thin balance.
- OK: paid for the coverage proved, but the gate stays shut and runs again on five fresh polls.
- HEALTHY: cleared. Swatch won, next gate tomorrow.
- PERFECT (100%): clear plus a special bonus, still undesigned.

Corrected from the block as given: ADR-071 was revised the same morning
(DVTD-2h6o) to delete the KB bribe and stop OK clearing, so only HEALTHY
advances. The version above is the live one.

**Configs** beat the rising line: category multipliers, global multipliers, opener bonuses, streak/cache effects, spillover, audit protection.

**Weight**
- Weight does not affect coverage and does not directly affect score.
- Weight is what the build costs to operate. First 4 weight is free; above that, recurring KB upkeep per gate.
- Given rungs: 4 -> 0, 6 -> 16, 8 -> 32, 12 -> 64, 16 -> 128.

**Storage subscription** — determines how much build weight you can run cheaply: more free weight, cheaper upkeep, or both.

## Todo

- [x] Settle the open forks with Marciano (slot ladder, storage plan job, miss cost, upkeep curve)
- [x] Write the new ADRs
- [x] Fix the ADRs that now contradict
- [x] Update the ADR README index
- [x] Update the open beans that now contradict
- [x] File follow-up beans for the code and wiki drift

## The four forks, settled

1. **Miss cost.** The repeat wins; ADR-037's peel retires. OK and SHAKY cost a
   day, a swatch and (SHAKY) the streak. Nothing comes off the build for
   missing. Retrying a gate with a build 25% smaller than the one that just
   failed it is a doom loop, which is what made the peel wrong here.
2. **Slot ladder.** Upkeep replaces it. Capacity is soft: install what you can
   pay for and keep paying. A price paid once stops being a decision; a bill
   that lands every gate has to be beaten every gate.
3. **Storage plan's job.** Free weight and a cheaper bill. The seven-rung KB cap
   retires, for the third time.
4. **Unpaid upkeep.** Peels configs until the bill fits. That gives the peel a
   trigger you can see a gate in advance, instead of a punishment for a wrong
   answer.

## Summary of Changes

**New ADRs**

- **073, coverage is a flat gain, reset every gate.** Supersedes ADR-013
  decision 1. The gain does not scale with the gate, the HEALTHY line is the
  only difficulty dial, configs are the only thing that beats it, the window
  caps at 100% and reopens at 0% with spillover the one exception.
- **074, weight is what the build costs to run.** Supersedes ADR-046 and
  ADR-049. Carries all four settled forks.

**ADRs corrected** (13, 037, 046, 049, 008, 015, 019, 044, 006, 035, 014, 032,
068, 071). Dead decisions collapsed to pointers rather than annotated, per the
README convention. Ten "ADR-046 owns it" pointers re-aimed at 074.

**046 and 049 are marked superseded but not deleted**, against the usual
delete-don't-annotate rule, because their code is still what runs. They retire
with it (DVTD-uhub).

**rejected.md**: three entries added, the bought slot ladder, the storage cap's
second deletion, and the KB bribe past a missed gate.

**Beans corrected** (22): gv0v, 7uil, wli9, s04t, d1ei, 8gns, yzyg, 0h4n, 54gi,
ziss, rl5z, b78a, 6vw2, b9xx, z4rl, wra4, nljz, ihao, vdn0, h9s5, 2try, 815w,
mpd4, gxce, uret. Four are now moot and say so rather than being scrapped
unilaterally: ziss, rl5z, ihao, 0h4n.

**Beans filed**: DVTD-uhub (build the upkeep bill and soft capacity),
DVTD-1zzz (delete gateBaseMultiplier), DVTD-d16l (wiki drift). DVTD-7uil
promoted from draft to todo, high, now that its open fork is closed.

**No code changed.** The whole model is decided and unbuilt except for the
coverage half, which lives in `coverageRatio.model.ts` behind the proto route.

## Still open, deliberately

- The upkeep curve's shape between and above the five given rungs. Wants a sim
  (DVTD-8gns), not a hand-set table.
- What the archive spends on, now that it cannot buy start slots.
- Whether a per-category coverage measure survives the per-gate reset. Three
  beans depend on it (h9s5, 2try, gxce).
- What the PERFECT band pays.
- ADR-032's shop link, which ADR-072 removed from prep and left unresolved.
