---
# DVTD-wli9
title: Storage plan tiers 5 and 6 are unusable
status: todo
type: bug
priority: high
created_at: 2026-09-06T12:48:46Z
updated_at: 2026-09-06T12:48:46Z
---

Independent of the slot reladder (DVTD-x5y1). Tier 6 rents 1280 KB per gate against a maximum single-gate income of ~816 KB plus Moore's Law interest. Its balance equilibrium is 0.1B + 816 = 1280, so B ~= 4640 KB -- under half its own 10240 KB cap. A tier-6 run can never reach the cap it is paying for, and a single tier-6 bill exceeds the entire cumulative gate reward through gate 6 (896 KB).

Tier 5 (5120 cap, 768 KB/gate) is the same shape one rung down.

With the reladdered slot ceiling at 2304 KB, nothing needs a cap above tier 4 (3072) either, so the top two rungs now have no purpose at all.

Measured numbers, perfect 13-gate run: gate rewards total 2912 KB; a full economy build grosses ~6058 KB; the absolute theoretical ceiling spending nothing is ~9833 KB. Peak holdable is ~1.7 MB bare / ~2.9-3.4 MB with an economy build.

- [ ] Decide whether the top rungs get repriced, removed, or given a reason to exist
- [ ] Consider a spec asserting every plan tier can reach its own cap
- [ ] ADR-046 Decision 3 amendment
