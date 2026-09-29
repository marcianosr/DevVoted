---
# DVTD-fmcf
title: A run states what you did, not just what it paid
status: draft
type: feature
priority: normal
created_at: 2026-09-28T11:51:03Z
updated_at: 2026-09-28T11:51:03Z
---

**What:** The run-over screen lists the named things you did this run, the way a fighting game lists bonuses at the end of a match.

**Why:** The run ends with a payout and a tally, and nothing anywhere tells a player how they played; the facts are already computed and then thrown away.

## Done when

- [ ] A finished run names the notable things about how it was played
- [ ] An archived run shows the same list when it is reopened later
- [ ] A run with nothing notable says so instead of showing an empty region
- [ ] Whether a bonus pays anything is decided and written down

## Notes

The engine for this is already built and already the right shape. One pure function turns each step of a run into the names of facts that just became true, and a family of them are one-shot facts about a whole run: a perfect window deep in the climb, a clear under a mirror with no miss, gate four reached lean, three sold in one shop. They are counted for life and never shown.

Recommended shape is derived, never stored, the way the category boards are. The final snapshot already carries every input a bonus needs, so this needs no column and no new persisted field, and it works on runs that finished before it shipped. The surface is a new region beside the one that already lists what the run unlocked.

The open question is whether a bonus pays. In the game it names, the bonuses *are* the score. Here coverage is the score and storage is the reward, and the run is over by the time the list is drawn, so the only currency left is archive credit, which is tuned. First cut should probably pay nothing and let the readout earn its payout.

Inspiration and the full source list live with the plan: `~/.claude-work/plans/i-had-these-old-enchanted-rabbit.md`
