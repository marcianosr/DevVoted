---
# DVTD-1x7w
title: Balance checks must be excused when you could not shop
status: todo
type: task
priority: high
created_at: 2026-08-14T09:07:11Z
updated_at: 2026-08-14T09:07:11Z
parent: DVTD-d0fw
---

Prerequisite for the technical-debt / debt-card work (wiki §2.6, no bean of its own yet). Found while building Redis (DVTD-72d9).

## The problem

A balance-reading check (`storage-floor`, today only Redis; Replication would be the second) is the only kind of check whose difficulty **does not reset each window**. Every other check gets a fresh 5 polls. This one carries your economic position forward, and the only way to improve that position is to clear a gate — which is exactly what you just failed to do.

Today this is survivable:
- The free tier bills 0KB, so a failed gate costs no storage and there is no shop to drain it. The balance freezes, so a met floor stays met.
- A paid plan bleeds 8–112KB per gate while failing, but an unpaid bill auto-downgrades to the free tier, which stops the bleed.
- The peel is an escape: shed the config on failure and its check leaves with it.

It stops being survivable the moment **debt cards** ship. A card disables the host config's *effect* and keeps its *check* live (wiki §2.6). For a balance check that is a floor you can never earn toward, with no payout, and no shop to fix it in.

## The rule

**A balance check is skipped on any gate the player could not shop for.**

- Precedented: focus and lint checks are already excused by the draw, a circumstance the player does not control. A gate you were given no shop for is the same shape.
- Cheap: a "last gate failed" bit on run state plus the existing `skipped` CheckState, which already counts as passing (`passes()` in `gate.model.ts`).
- Covers the whole class, not just Redis.

## Note

**Hotfix** (DVTD-72d9 Phase 3: a failed gate still opens the shop) dissolves this problem instead — with a shop after failure there is always a route back over the floor. If Hotfix ships first, close this as unnecessary rather than implementing both.
