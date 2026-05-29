---
# DVTD-bb32
title: Show DevCards in Community voter breakdown
status: todo
type: feature
priority: normal
created_at: 2026-05-28T08:41:53Z
updated_at: 2026-05-28T08:41:53Z
parent: DVTD-3wpy
blocked_by:
    - DVTD-ek7k
---

Render each voter in the Community section's per-option breakdown as a DevCard (or compact DevCard variant) rather than a plain username/avatar row. Turns the voter list into a wall of identities — leaning into the "another player's identity placed in front of you uninvited" goal called out in the Player Identity & Social epic.

## Context

[[DVTD-ek7k]] is currently building the per-option voter breakdown in `PostAnswerCarousel`. That bean stops at "list voters under each option." This bean picks up after it: replace the row representation with a DevCard.

## Design Questions (resolve before implementing)

- Full DevCard or a compact variant? Full cards in a list of 20+ voters will be visually noisy and tall.
- Hover-to-expand vs always-expanded?
- How does this interact with the `telemetry-config` config (which surfaces *one* random voter's pick)? Should that one be highlighted/foregrounded among the wall?

## Todo

- [ ] Decide compact-vs-full DevCard variant for this context
- [ ] Build/reuse the variant component
- [ ] Wire it into the Community section voter breakdown (after [[DVTD-ek7k]] lands)
- [ ] Verify layout at 5, 20, and 100 voters
- [ ] Check interaction with `telemetry-config` highlighting
