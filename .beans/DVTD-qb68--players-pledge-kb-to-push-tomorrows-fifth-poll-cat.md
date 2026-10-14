---
# DVTD-qb68
title: Players pledge KB to push tomorrow's fifth poll category
status: draft
type: feature
priority: deferred
created_at: 2026-10-11T13:10:29Z
updated_at: 2026-10-11T13:10:29Z
---

**What:** Players spend KB to back a category for tomorrow's fifth poll, and everyone sees the live totals on the community page.

**Why:** It ties daily content, social behaviour and the KB economy into one shared event, in the place players already wait between gates.

## Done when

- [ ] The community page shows tomorrow's fifth poll as a live tally of KB pledged per category
- [ ] A player can pledge KB to a category, add more, or change category, and sees their own pledge
- [ ] The panel says which category leads and when the pledge closes
- [ ] The copy frames it as a live category push, not a guaranteed pick
- [ ] Built after launch stabilization

## Notes

Source: an outside design review, kept for consideration. Its verdict: worth building, but only after launch has stabilized.

Proposed panel:

```
┌ Tomorrow's fifth poll ──────────────────────────┐
│ CSS          144 KB  ████████████               │
│ Git           96 KB  ████████                   │
│ TypeScript    48 KB  ████                       │
│                                                 │
│ Your pledge: CSS · 16 KB                        │
│ [ +8 KB ] [ +16 KB ] [ change category ]        │
│                                                 │
│ CSS currently leads · closes in 4h 12m          │
└─────────────────────────────────────────────────┘
```

Put it on the community page, not only in the shop: players wait there between gates and builds are already public there.

Open questions:
- Is pledged KB spent whether you win or lose, or refunded to those who backed a losing category?
- Do players get the leading category for sure, or does it only raise its odds? This decides how the copy reads.
- Does it overlap with DVTD-y0jb (thin categories pay a bounty for a new poll) and DVTD-4ova (configs that steer categories)?
- Does a KB sink here compete with the shop for the same KB?
