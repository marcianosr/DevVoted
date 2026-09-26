---
# DVTD-ppuz
title: Storage plans get Dex rows that read unmet until reached
status: todo
type: feature
priority: low
created_at: 2026-09-24T18:26:51Z
updated_at: 2026-09-24T18:26:51Z
parent: DVTD-z2r2
---

**What:** Give the storage plans rows in the Dex that read as unmet until the player first reaches the gate that sells them.

**Why:** Every other staged thing has a Dex row that tells you it exists; the plans are the one ladder a player meets only by getting there.

## Done when
- [ ] Every plan has a row, unmet ones naming the requirement rather than the plan
- [ ] A row flips to named and readable once its gate has been reached
- [ ] The tab counts how many of the ladder you have met
- [ ] Reaching a plan changes nothing about what it costs or when it is offered

## Notes

Split out of DVTD-2try on 2026-09-24. It is the last item of that bean's
Reveal / Grant / Stage framework left unbuilt: shop controls got the Dex controls
tab, storage plans were meant to ride the same treatment and never did.

Reveal only, never Grant. The plans stay staged by gate exactly as they are
today, so this is zero balance change: it tells a player the ladder continues
above them without giving them anything. Same argument as the controls tab — the
player who keeps dying at gate 3 should still learn that the ladder goes to 10.

Which gate each plan arrives at is already authored in the domain, so the Dex
fold reads it rather than repeating it, in the same shape as the controls fold.
