---
# DVTD-wli9
title: Storage plan tiers 5 and 6 are unusable
status: scrapped
type: bug
priority: high
created_at: 2026-09-06T12:48:46Z
updated_at: 2026-09-14T17:08:29Z
---

Independent of the slot reladder (DVTD-x5y1). Tier 6 rents 1280 KB per gate against a maximum single-gate income of ~816 KB plus Moore's Law interest. Its balance equilibrium is 0.1B + 816 = 1280, so B ~= 4640 KB -- under half its own 10240 KB cap. A tier-6 run can never reach the cap it is paying for, and a single tier-6 bill exceeds the entire cumulative gate reward through gate 6 (896 KB).

Tier 5 (5120 cap, 768 KB/gate) is the same shape one rung down.

With the reladdered slot ceiling at 2304 KB, nothing needs a cap above tier 4 (3072) either, so the top two rungs now have no purpose at all.

Measured numbers, perfect 13-gate run: gate rewards total 2912 KB; a full economy build grosses ~6058 KB; the absolute theoretical ceiling spending nothing is ~9833 KB. Peak holdable is ~1.7 MB bare / ~2.9-3.4 MB with an economy build.

- [ ] Decide whether the top rungs get repriced, removed, or given a reason to exist
- [ ] Consider a spec asserting every plan tier can reach its own cap
- [ ] ADR-046 Decision 3 amendment

## Model change 2026-09-12 (DVTD-nd6r)

Moot as written. ADR-074 retires ADR-046 decision 3 outright: the storage plan
no longer rents a KB cap, so there are no tiers 5 and 6 to be unusable. The
subscription's new job is how much build weight you can run cheaply, sold as
free weight and a discount on the per-gate upkeep bill.

What survives is the lesson and the second todo. Every rung of the new ladder
has to be reachable by a run that buys it, and that belongs in a spec rather
than in a playtest a month later. The measured income figures above are the
input for pricing it: gate rewards total 2912 KB over a perfect 13-gate run, a
full economy build grosses ~6058 KB.

- [ ] Price the free-weight and discount rungs against measured run income, with the spec that each is reachable

## Reasons for Scrapping

Fixed by deletion. ADR-082 removed `STORAGE_PLANS` entirely, so tiers 5 and 6 do not
exist to be unusable. Build space replaces the subscription, and every one of its
seven rungs is reachable: the top rung bills 512 KB a gate against a late-gate clear
worth several times that.
