---
# DVTD-rte1
title: Return Policy refunds the last config bought this visit
status: todo
type: feature
priority: normal
created_at: 2026-09-25T11:00:11Z
updated_at: 2026-09-25T18:06:10Z
parent: DVTD-r2k9
---

**What:** A registry service that refunds the last config installed this visit at its full price.

**Why:** An install is final the moment it lands, and a wrong press costs a whole draft.

## Done when

- [ ] Only the last config installed this visit can be returned
- [ ] The refund equals what was paid
- [ ] It is gone once the shop closes
- [ ] Sell's half refund is unchanged

## Notes

- ADR-115 D6. Bought with run storage; its own price is a dial (the service is the right to return, the refund is the draft price back).
- Needs the last install of the visit: the tail of `draftedThisGate` (reset in `finishReward`) or a dedicated marker.
- Decide at build whether the returned config goes back onto the offers or is discarded.
- Roster row: `scope: "registry"`; opening gate to decide.

2026-09-25 (ADR-116): **unlock: Sell 5 drafted configs** — the `configs-sold` metric already ticks on every sell, target 5; redacted until then with that line. Marciano's shop mock names the row **Return policy · sell a drafted config back at full price · 16 KB**.

2026-09-25, later (DVTD-lm8p): roster row and counter built: `returnPolicy`, caption `Sell 5 configs`, sold in the shop from the first shop, listed locked; earned reads *not for sale yet* until this bean adds the press. Marciano's table reads "undo the most recent install before leaving; full refund minus a small service fee": the fee is the service's own price (16 KB in the mock), the refund is the full draft price.
