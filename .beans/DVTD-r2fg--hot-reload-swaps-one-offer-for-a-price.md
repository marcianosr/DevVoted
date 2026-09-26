---
# DVTD-r2fg
title: Hot Reload swaps one offer for a price
status: todo
type: feature
priority: normal
created_at: 2026-09-25T11:00:10Z
updated_at: 2026-09-25T18:06:09Z
parent: DVTD-r2k9
---

**What:** A registry service that replaces one chosen offer with a fresh roll, paid with run storage.

**Why:** Rebuild throws away four offers to replace one.

## Done when

- [ ] The press sits on the offer it replaces
- [ ] The price never undercuts what a Rebuild costs at that moment
- [ ] A locked offer cannot be reloaded
- [ ] The Dex row states it

## Notes

- ADR-115 D5. Not a rebate: ADR-110 D6's fifth-press rebate is dead with that ADR.
- Price is a dial with one constraint: never below Rebuild's current rung (`rebuildCost`, 4 to 512 KB doubling per visit), or a targeted reroll dominates the full one and Rebuild dies at 4 KB. A flat price becomes the cheap reroll late in a visit, so a ladder of its own is the likelier shape.
- Needs a per-offer action, the `lock-offer` shape (`configActionSchema` in `run.validation.ts`).
- The replacement must roll off a seed that counts the press, or a fixed price fishes for a wanted offer for free (the DVTD-trc0 lesson).
- Name clash: DVTD-ecyi holds "Hot Reload" for a draft config that opens the shop between polls. ADR-115 recommends the service keeps the name, since swapping one module while the rest keeps running is what the term means; ecyi settles it.

2026-09-25 (ADR-116): **unlock: Rebuild the Registry 5 times** — the `rebuilds` metric already ticks on every `rebuild-draft`, target 5; redacted until then with that line. Marciano's shop mock names the row **Hot reload one offer · reroll a single card, keep the rest · 12 KB** (a flat 12 KB would undercut Rebuild's 16 KB fourth press; keep the constraint above).

2026-09-25, later (DVTD-lm8p): roster row and counter built: `hotReload`, caption `Rebuild 5 times`, sold in the shop from the first shop, listed locked in the shop and the Dex; once earned it reads *not for sale yet* in the Dex and the shop shows nothing until this bean adds the press. Marciano's table adds **cost doubles per use during the visit**, opening at the mock's 12 KB; 12 sits below Rebuild's 16 KB fourth press, so the doubling has to start from Rebuild's rung or the constraint above gives. Settle here.
