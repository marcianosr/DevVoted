---
# DVTD-odq8
title: One config wagers on right answers, the rest pay elsewhere
status: draft
type: task
priority: normal
created_at: 2026-10-02T11:11:44Z
updated_at: 2026-10-02T12:00:08Z
blocking:
    - DVTD-6ce4
---

**What:** Decide which one config keeps paying for how many answers were right, and move the others to a different reward.

**Why:** The accuracy multiplier now rewards the right-answer count itself, so Planning Poker, SLA and strict: true pay a second time for the same thing.

## Done when
- [ ] One of the three is kept as the wager on right answers, with the reason written down
- [ ] The other two each pay on a different axis, or are retired
- [ ] A promised PERFECT no longer stacks with the PERFECT clear bonus unchecked
- [ ] The balance guard runs with the new shapes and stays on target

## Notes
- Planning Poker: `estimateUnitsAt` in `gateClose.model.ts` adds units after `windowOutputOf`, so it stacks on the accuracy multiplier. Related redesign: DVTD-6ce4.
- SLA: `slaUpliftKb` (+10/25/50% of clear) adds to `perfectBonusOnClear` (×1.5), so a promised PERFECT pays ×2 KB. OK and HEALTHY are near free, as prep states the right answers each band needs.
- strict: true: the ADR-161 brainstorm kept "I'm sure" only as an optional config, possibly this one. Its wager sits inside `unitsEarned`, so the accuracy multiplier scales it, and a miss costs twice.
- Watch, separate: Linter, Telemetry, LGTM raise accuracy, now exponential; sim before repricing.
- Resolved 2026-10-02: the streak KB multiplier is removed (ADR-169 amendment).
- Do not propose configs bending the accuracy step (ADR-161 §2).
