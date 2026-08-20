---
# DVTD-wra4
title: 'Gate bounty: opt-in demand raise for KB, unclaimed bounty feeds ghost loot'
status: draft
type: feature
created_at: 2026-08-20T10:23:02Z
updated_at: 2026-08-20T10:23:02Z
parent: DVTD-kulw
---

Player-declared difficulty on the stake screen: TAKE BOUNTY raises this gate's demand (e.g. 14% instead of 10%) for a KB reward (e.g. +48KB). "My build is cracked — make Boulder harder."

## Design notes (2026-08-20 session)

- **Mechanically an inverted audit.** Audits already carry `demandFactor` (audit.model.ts); a bounty is a player-chosen `demandFactor > 1` plus a reward row. No new reducer machinery.
- **Home: stake screen** (`GateStakeReceipt.ui.tsx`), not shop, not config. You price "my build is cracked" only after shopping, looking at the gate's demand. No slot, no check of its own — it modifies the gate's.
- **Demand REPLACES, never adds a tier.** Finishing at 12% is a real miss (peel + re-shop + redo on daily polls). If 10% still cleared, the bounty is a free option → auto-take → non-decision.
- **Failure clause (loot tie-in):** if the run dies at this gate, the unclaimed bounty posts to the ghost's loot / category pool — a bug bounty going public. Feeds loot storage (DVTD-545v, DVTD-in1b) with story-carrying KB. Check stays deterministic; only payout routing is social.
- **Numbers** (14% for +48KB vs the gate's own +64KB) are a sim question, tune after the mechanic is decided.

## Open: name collision

"Bug Bounty" is already a todo config (DVTD-w0ul, +16KB per wrong answer). Two mechanics sharing "bounty" breaks one-term-one-meaning. Resolve before building: rename this, or rename/fold DVTD-w0ul.

## Todo

- [ ] Resolve the bounty name collision with DVTD-w0ul
- [ ] Decide demand/reward numbers via sim
- [ ] Decide whether the loot failure clause ships with v1 or waits for loot storage
