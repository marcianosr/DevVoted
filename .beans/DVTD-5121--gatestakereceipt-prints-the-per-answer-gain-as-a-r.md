---
# DVTD-5121
title: GateStakeReceipt prints the per-answer gain as a raw unit count
status: scrapped
type: bug
priority: normal
created_at: 2026-09-14T13:49:37Z
updated_at: 2026-09-25T20:01:23Z
---

`GateStakeReceipt.ui.tsx:297` renders `+${perAnswer.coveragePerCorrect}% coverage`.
`coveragePerCorrect` is in **units**, not a share of the bar, so the figure is
`scoringSlotsAt(gate)` times too high — at gate 4 a x3 build reads "+3%" where the
honest number is 12%, and at gate 0 "+1%" where it is 20%.

The same mistake was fixed on the prep frame in DVTD-xj95 by
`coverageGainPercentFor(units, gate)` in `coverageRatio.model.ts`; the receipt just
needs the same call.

## Reasons for Scrapping

`GateStakeReceipt.ui.tsx` was deleted with old-theme (DVTD-6crx). No surface prints `coveragePerCorrect` as a percent any more: prep wraps it in `coverageGainPercentFor` and the poll header reads `coveragePerWrong` in units (ADR-106). Verified 2026-09-25 while planning the deepening pass (DVTD-y3vn).
