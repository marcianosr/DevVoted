---
# DVTD-d9ol
title: Guests stay off the board and are counted in the header
status: todo
type: task
priority: high
created_at: 2026-10-20T10:18:35Z
updated_at: 2026-10-20T10:18:38Z
parent: DVTD-nr8f
blocked_by:
    - DVTD-ojkl
    - DVTD-y7oz
---

**What:** Community faces, records, turnout and hover cards exclude guests; the header counts them apart.

**Why:** ADR-178 Decision 3 as amended 2026-10-08.

## Done when
- [ ] No guest appears among faces, records, turnout or hover cards
- [ ] The header reads N players · M guest players, without the guest figure at zero
- [ ] Loot rules for guests are decided and written down

## Notes
- Slice 4 of DVTD-nr8f. Filter users.is_guest in climbers, community, hallOfFame repositories and playerCard. guestPlayers beside totalPlayers in the community view.
