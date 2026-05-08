---
# DVTD-w5pb
title: Social interference mechanic
status: todo
type: feature
priority: normal
created_at: 2026-05-08T00:00:00Z
updated_at: 2026-05-08T00:00:00Z
parent: DVTD-1
---

When passing certain gates, player can choose to send interference to another active player instead of taking a standard reward.

Target is picked from the leaderboard (not random). Target knows interference happened, not necessarily from whom.

## Interference types (coding-themed)

- **Breaking change** — push a difficulty upgrade onto a random slot in the target's pipeline.
- **Dependency conflict** — force a specific gate type into one of their next upgrade card offers, crowding out a natural option.
- **Regression** — reset one category's streak for the target back to zero.

## Open questions

- Is interference a gate-type reward (tied to a specific gate) or a double-pick reward (only available via the risky path)?
- Does this need a new DB table to track sent/received interference per run?
- Is the sender always anonymous or optionally revealed?
