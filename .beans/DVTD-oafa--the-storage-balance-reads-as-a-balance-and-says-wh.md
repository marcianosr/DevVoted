---
# DVTD-oafa
title: The storage balance reads as a balance, and says when it moves
status: completed
type: feature
priority: normal
created_at: 2026-09-26T13:45:42Z
updated_at: 2026-09-26T14:06:31Z
---

**What:** Rebuild the header storage readout as a large figure over an icon and word, counting to its new value, with a brief pill naming the change and an after-install preview on the shop shelf.

**Why:** The balance is the one figure that runs the whole run, and it currently reads as just another badge that silently changes.

## Done when
- [x] The figure leads, with the icon and word beneath it
- [x] A climbing balance counts up in green, a falling one in red
- [x] A brief signed pill names the change as it lands
- [x] Hovering or focusing an install press previews the balance after it

## Notes

Four screens share the readout: shop, poll, prep and new run. The install preview is shop-only.

Reuses the house count-up idiom (a registered property interpolated into a counter, no rAF, per ADR-068) and the transient hold pattern the coverage pin already uses. The rise-and-fade keyframe for the pill was already written and had no consumer.

Takes the storage half of DVTD-np66. That bean's third criterion, several gains queueing instead of overlapping, needs a queue shared with the coverage bar and stays open.

## Summary of Changes

The readout is a new `FundsReadout` inside `Header.ui.tsx`, so all four screens that carry a balance got it at once: shop, poll, prep and new run.

Layout: the figure leads at display size with a muted unit beside it, and a new `floppy` glyph plus the word sits underneath. It replaces the small badge the balance used to wear. `HeaderFunds` gained `kb`, the balance as a number, because a formatted string cannot be diffed into a change.

Motion: the digits ride a registered property interpolated into a counter, the same idiom the coverage ring and bar use, with its own duration rather than borrowing the ring's. The figure tints viridian climbing and cinnabar falling, and a pill naming the signed change rises beside it and fades after 1800ms. The lifecycle compares during render and holds with one timeout, matching the coverage pin. Nothing fires on mount, so navigating between screens names no gain.

Two edges handled: the digits do not count across a unit roll, because 999 KB to 1.9 MB would animate downwards, and the pill still names that change since the digits cannot. Reduced motion stops both.

The preview: `HeaderFunds.preview` states what an install would leave. It reaches a keyboard as well as a pointer, because the chip now maps onFocus/onBlur onto the same pair as hover. An offer the balance cannot cover previews nothing, since a balance never goes below nothing and `kbLabel` has no negative reading to give.

Reused rather than rebuilt: the orphaned `coverage-callout` keyframe, which had been written and never consumed, is now the neutral `callout` with a tunable duration.

Verified: 3990 tests pass, tsc clean, lint and dependency-cruiser clean, wiki in sync. The digits are a CSS counter and so never enter the DOM, which moved the balance's reading onto an aria-label; four screen specs now assert the accessible name instead of text content.
