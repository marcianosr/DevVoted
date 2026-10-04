---
# DVTD-4bk5
title: Design pillars and anti-pillars (ADR-042)
status: completed
type: task
priority: normal
created_at: 2026-08-27T10:56:36Z
updated_at: 2026-08-27T10:58:17Z
---

Five pillars with design tests, five anti-pillars, and Decision 3 killing wiki §2.1's pay-past-the-daily-lock monetization note. Derived from the 2026-08-27 brainstorm: 41 ADRs with no tiebreaker document, several reversing each other within days.

- [x] Write docs/adr/042-design-pillars-and-anti-pillars.md
- [x] Add the ADR-042 row to docs/adr/README.md
- [x] Delete wiki §2.1's monetization note (the yellow 'spending storage to keep climbing past the daily lock' line)
- [x] Decide whether wiki §1 gets a short pointer to ADR-042 (Marciano chose ADR-only; revisit if contributors need it)

## Summary of Changes

- docs/adr/042-design-pillars-and-anti-pillars.md: five pillars with design tests, four recorded pillar tensions, five anti-pillars each naming the pillar it protects, and Decision 3 confining monetization to what does not buy attempts.
- docs/adr/README.md: index row added.
- docs/wiki.md: three lines removed from §2.1 (the pay-past-the-daily-lock note). Nothing else in the wiki changed.
- Recorded as rejected in the ADR consequences: shortening a run from 13 gates to 6 or 7. The 12-plus-day first victory is accepted as the top structural retention risk.
- Derived work split out: DVTD-1wjl (streak rule), DVTD-0s9s (it.skip), DVTD-0z1y (staggered reveal), DVTD-ixjg (postable result), DVTD-rl5z (early-gate calibration, draft).
