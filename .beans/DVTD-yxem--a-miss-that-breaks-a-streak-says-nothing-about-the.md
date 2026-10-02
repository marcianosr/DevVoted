---
# DVTD-yxem
title: A miss that breaks a streak says nothing about the streak
status: todo
type: bug
created_at: 2026-10-01T14:53:22Z
updated_at: 2026-10-01T14:53:22Z
parent: DVTD-lk20
---

**What:** After a wrong answer ends a running streak, the poll's receipt shows only that it paid nothing; the line saying the streak is lost never appears.

**Why:** The streak feeds both the next answer's units and the gate's KB, so losing it silently hides the real cost of the miss.

## Done when
- [ ] A miss that ends a streak of two or more shows the streak-lost line under its receipt
- [ ] A miss with no streak running shows no such line
- [ ] Wiki §2.5 and the screen agree

## Notes
Seen at Pallet, poll 4, after three right in a row: receipt reads "wrong answer · base 0.00 · paid 0" and nothing else.
Wiki §2.5: "Anything the answer changed beyond its coverage follows underneath, one line ('streak lost · your next correct answer starts at ×1.0')."
If the line was removed on purpose, fix the wiki instead and scrap this bean.
