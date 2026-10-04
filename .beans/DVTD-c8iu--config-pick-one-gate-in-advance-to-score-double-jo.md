---
# DVTD-c8iu
title: 'Config: pick one gate in advance to score double (joker round)'
status: draft
type: feature
tags:
    - config
created_at: 2026-10-01T11:22:24Z
updated_at: 2026-10-01T11:22:24Z
parent: DVTD-72d9
---

**What:** A config that lets the player pick one gate in advance, hidden from rivals, whose answers score double.

**Why:** It adds a planning decision to the run and lets a category specialist cash in on the gate that plays to their strength.

## Done when
- [ ] Decided: what a round is (a gate, or one poll) and what doubles (coverage, the gate's KB payout, or both)
- [ ] Decided: when the pick is made and locked, and what the player knows about that gate's categories at that moment
- [ ] The player picks the gate once, and the pick can't be changed after it locks
- [ ] Rivals can't see the pick on the climb map or a hover card until the gate closes
- [ ] The doubled gate is marked on prep and the poll screen, and the receipt names the double
- [ ] The config has a name, weight and price, and appears in the Dex

## Notes

Source: Marciano, 2026-10-01, from the pub quiz "joker round": "Joker round lets each team secretly pick one round in advance to score double. It adds strategy and lets specialists shine in their category." No name yet.

Translation to DevVoted: team → player, round → gate (five polls), secretly → hidden from rivals.

Open questions:
- **What makes it a specialist's tool.** In a pub quiz, rounds are announced by topic, so you aim the joker at your topic. That only works here if the player can see a gate's categories before picking. If the categories are unknown, the joker is a blind bet on timing, not on knowledge. Options: pick a gate whose categories prep has already revealed; pick a category instead of a gate (every poll in that category doubles once); or pair it with the category visibility configs (DVTD-4ova).
- **In advance by how much.** At new run (a whole-run plan, strongest strategy, weakest information) vs. in the shop before a gate (more information, closer to a plain multiplier).
- **Secret from whom.** Single-player has no opponent at the table, so the secret only matters against rivals who loot or file incidents (ADR-138, ADR-141). If the double is visible, a rival could time an incident against it, so hidden is the safer default.
- **Balance.** It overlaps with the ×2 face of Math.random() (DVTD-krh0) and with Overclock-style multipliers. What sets it apart is that the player chooses the target, so it should cost more weight than a random ×2.
- **Name ideas (not decided):** `git cherry-pick`, `@Pinned`, `feature flag`, `HOTFIX`.
