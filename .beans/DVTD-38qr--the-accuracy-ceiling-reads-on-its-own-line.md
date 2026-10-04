---
# DVTD-38qr
title: The accuracy ceiling reads on its own line
status: completed
type: task
priority: normal
created_at: 2026-10-04T17:10:17Z
updated_at: 2026-10-04T17:11:22Z
---

**What:** On the poll screen's Accuracy track, the up to figure sits on a line under the current multiplier.

**Why:** Side by side the two figures crowded the track's head.

## Done when
- [x] The current multiplier and the up to figure read on two lines

## Summary of Changes

AccuracyTrack: the ceiling moved out of the bar onto a line under it; spec asserts it sits after, not inside, the bar.
