---
# DVTD-il1e
title: Shop shelf rows lose the needs line, the grade word and the empty lock rings
status: completed
type: task
created_at: 2026-08-28T10:46:56Z
updated_at: 2026-08-28T10:46:56Z
---

Playtest: every offer row printed "needs a bit", a coloured grade word in its last column, and an empty ring in front of the name at a gate that does not sell locking yet. All three were saying something another mark on the same row already said.

- [x] RowFigures: `needs` deleted (no caller left), `grade` now optional
- [x] ShopView offer rows pass the figure column alone
- [x] lockFor returns nothing where lockAvailable is false; Lock's dim state draws the padlock so a ring is never empty
- [x] Specs, stories, CHANGELOG, wiki

## Summary of Changes

The shop shelf row is now glyph, name, delta, price, and nothing else.

- `RowFigures` lost `needs` outright and `grade` became optional. It stays in the shop as the fixed-width figure column, which is what keeps prices in line down the list: ShopView is Tier 2 and cannot own a className, so the column has to live in the kit.
- The start screen's deal still names the grade in its last column. Flagged to Marciano rather than changed, since only the shop was pointed at.
- `lockFor` returns `undefined` when `lockAvailable` is false, matching StartScreen's own `lockFor`. `Lock`'s `unavailable` state now draws the padlock dimmed, so it reads as a lock you cannot pay for rather than an unticked checkbox (ADR-029: hide what the depth does not sell, disable what the run cannot pay for).
- Also fixed a stale wiki line: 5.2 still said "Nothing grades the exit", which stopped being true when the over-capacity block landed (DVTD-i388).
- Verified: lint clean, tsc clean, 2559 passed / 3 failed (the documented RewardScreen baseline, DVTD-9dn0).
