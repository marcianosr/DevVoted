---
# DVTD-wra4
title: 'Gate bounty: raise your own gate''s demand for a reward'
status: draft
type: feature
priority: normal
created_at: 2026-08-20T10:23:02Z
updated_at: 2026-09-24T12:49:42Z
parent: DVTD-kulw
---

**What:** Let a player raise this gate's demand on the stake screen, in exchange for storage.

**Why:** A player with a strong build has no way to say so.

⚠️ Two things here are stale: the downside is now a lost day rather than a peel, and every gate already carries an objective in the row this wanted. If it returns, it is a dial on that objective's bonus.

## Done when
- [ ] The name clash with Bug Bounty is resolved
- [ ] Decided: whether it raises the clear line only, or the whole ladder under it
- [ ] The raised demand replaces the normal one, so taking it is a real risk
- [ ] The numbers come from a simulation

## Notes

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

- Resolve the bounty name collision with DVTD-w0ul
- Decide demand/reward numbers via sim
- Decide whether the loot failure clause ships with v1 or waits for loot storage

## Model change 2026-09-12 (DVTD-nd6r)

The mechanic fits the new model better and its downside clause is wrong.

Better: ADR-073 makes the HEALTHY line the only difficulty dial, so a bounty is
literally a player-chosen nudge to that one number. Not an inverted audit any
more, just the dial itself, with a reward attached.

Wrong: "Finishing at 12% is a real miss (peel + re-shop + redo on daily polls)".
ADR-071 deleted the peel. Falling between the raised line and the original one
lands in OK, which pays and then re-runs the same gate tomorrow. So the
bounty's downside is a day, which is a heavier price than the peel was and
carries the anti-auto-take argument on its own.

There is also a new question the four bands raise: does a bounty move the
HEALTHY line only, or the whole ladder of four under it? Moving one shifts what
counts as a clear; moving all four also shifts what kills you.

## Overlap with ADR-082 (2026-09-14)

Every gate now carries one authored objective on the prep panel (DVTD-xj95), so the
third row this bounty wanted is taken. More to the point, a player-declared demand
raise **is** a variable clear requirement by consent, which is the thing ADR-035
Decision 4 replaced and ADR-082 deliberately stayed on the right side of.

If it comes back, it should come back as a dial on ADR-082's `OBJECTIVE_BONUS`
multiplier — raising what the gate's own objective pays — rather than as a second
bonus system with a worse property.
