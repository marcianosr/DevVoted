---
# DVTD-tfjr
title: The debrief reads its balance through the animated readout
status: completed
type: task
priority: normal
created_at: 2026-09-27T08:21:30Z
updated_at: 2026-09-27T08:39:50Z
---

**What:** The debrief header states its storage balance as flat text while four other screens count it, and a config panel's second line right-aligns when it wraps.

**Why:** The balance moves on the debrief (dropping configs refunds storage) and says so in silence, and a wrapped meta row reading right-to-left breaks the left edge every other row holds.

## Done when

- [x] The animated balance readout is a kit primitive, not a private part of Header
- [x] The debrief header carries it
- [x] A Fold's meta row starts at the left edge once it wraps
- [x] lint, typecheck and tests pass

## Summary of Changes

Pulled the readout out of Header into its own kit primitive as Balance / BalanceProps / BalancePreview, with a new optional color for the resting tint. Header renders it for shop, poll, prep and new run; the debrief screen now renders it directly, replacing its own figure type. All three debrief bands lead with the balance: the peel owed is already stated by the retry panel, the coverage reached by the bar, and the gate reached by the subtitle.

The fold stopped pushing its meta strip right with an auto margin and grows the title instead, so a strip that wraps in a narrow column starts at the left edge.

Added a shaky-collecting fixture so a spec can prove the debrief pills a drop refund. 4162 tests pass, lint and dependency-cruiser clean.
