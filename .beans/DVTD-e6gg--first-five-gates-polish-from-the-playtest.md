---
# DVTD-e6gg
title: First-five-gates polish from the playtest
status: todo
type: task
priority: low
created_at: 2026-10-01T14:53:22Z
updated_at: 2026-10-01T14:53:22Z
parent: DVTD-lk20
---

**What:** Small wording and empty-state issues seen in the first five gates, plus two proto-run-only content and rendering slips.

**Why:** Each is minor, but together they make a first run read less sure of itself than the rules are.

## Done when
- [ ] Coverage counts use the glossary word for codebase slots instead of changes
- [ ] Warm boot on a run with nothing archived says why nothing can be bought
- [ ] The empty build shows one empty state, not two dashed boxes
- [ ] Proto-run's centring poll and its first registry draw are fixed

## Notes
"You have covered 1 of 3 changes" (poll screen, prep "3 changes", "+0.6 changes to OK"); ADR-139 names the pool the codebase.
Warm boot lists Extend the registry 64 KB and git tag 128 KB beside "0 B archived" with no unaffordable state.
Proto-run: the hard-coded CSS poll accepts place-items: center for centring a flex item (justify-items is ignored in flexbox); the start registry draws unseeded, causing a hydration mismatch (server Code Coverage, client .js).
