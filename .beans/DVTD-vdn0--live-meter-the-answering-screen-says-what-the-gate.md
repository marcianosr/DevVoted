---
# DVTD-vdn0
title: 'Live meter: the answering screen says what the gate still needs'
status: todo
type: feature
created_at: 2026-08-26T16:02:25Z
updated_at: 2026-08-26T16:02:25Z
---

The gate verdict lands on the window's 5th poll, but while answering nothing says whether the gate is still reachable. The Build Summary's "To pass" line states the stake before the gate; during the gate the player is doing meter arithmetic in their head. When the last poll decides the gate — the most dramatic moment in the game — the math is invisible.

Add one live line to the answering surface, test-runner idiom: **"12% of 25% · needs 13% from 3 polls · a correct pays ~9%"**.

Four states, in the test-runner tones:

- **met** — demand reached, remaining polls are payout only (celadon)
- **on-track** — reachable at the current pace (celadon)
- **needs-perfect** — reachable only if every remaining poll lands (saffron)
- **dead** — unreachable even if every remaining poll lands under the most optimistic estimate (vermillion)

Rules:

- The per-correct estimate reuses the stake receipt's per-answer preview formula (matching config = max Focus multiplier). Withhold precision, never falsify: "dead" may only be declared when even the optimistic bound cannot reach the demand. The estimate must not read upcoming polls' categories — that knowledge is Prefetch's product.
- The gate meter is net of wrong-answer bleed and floored at 0, so the line reads the same window meter the gate judges, nothing new.

- [ ] Domain: reachability calc (window meter, demand, polls remaining, optimistic per-correct bound) beside the meter math
- [ ] Tier 1: the line as a `.ui.tsx` with a Story — game-design reason: turns the closing polls of a window into a visible cliffhanger instead of hidden arithmetic
- [ ] Tier 2: wire onto the answering screen from run state
- [ ] Specs: boundaries of met / on-track / needs-perfect / dead, including the floor-at-0 meter and a mid-window bleed
- [ ] Wiki §8 (Run HUD) line
