---
# DVTD-ah61
title: The footer totals wear badges
status: completed
type: task
priority: normal
created_at: 2026-09-28T11:37:27Z
updated_at: 2026-09-28T11:42:28Z
---

**What:** Render the footer's poll, category and config totals as badges instead of bare hint text.

**Why:** Every figure on a surface wears a badge; three bare counts were the last readout stating numbers in plain prose.

## Done when
- [x] Each total renders through the badge primitive
- [x] The counts read as three separate chips without a punctuation separator
- [x] The footer spec covers the new shape

## Summary of Changes

The poll, category and config totals render through `Badge` instead of hint-styled spans, and the two middot separators are gone: three chips already read as three readings, so the punctuation was saying it a second time.

Badged at the call site rather than by widening `Figures` regex. A bare count carries no unit, so `Figures` leaves it alone by design, and teaching the regex to match `96 polls` would badge counts mid-sentence in every config description.

The badges take no colour, so they follow the footer card own pewter rather than pinning a hue, which is what ADR-066 asks of an unsigned figure.

No story: the footer is chrome, not player-visible game feel. No changelog entry either, at that granularity.

Verified: AppFooter 12 tests pass, oxlint clean, tsc reports no AppFooter errors, dependency-cruiser clean. Two community spec files fail on this branch for unrelated reasons that predate this change.
