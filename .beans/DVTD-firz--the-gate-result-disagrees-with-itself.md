---
# DVTD-firz
title: The gate result disagrees with itself
status: completed
type: bug
priority: normal
created_at: 2026-10-01T14:53:22Z
updated_at: 2026-10-01T16:16:21Z
parent: DVTD-lk20
---

**What:** The gate result shows two different counts for the same window, a payout headline that is not the balance change, and the previous gate's scores without a label.

**Why:** The debrief is where a player learns what the gate was worth; three contradictions on one screen teach them to stop reading it.

## Done when
- [x] The score line counts the same thing as the headline (right answers, or it says answered)
- [x] The payout headline equals the balance change, or says it is before bills
- [x] A gate's result shows only its own window, or labels each earlier one by gate

## Notes
Seen on Pallet: headline "4 of 5 right", Coverage fold "Score 5 out of 5".
Seen on Boulder: "Payout 3 payouts, 1 bill +85 KB" while the balance moved 365 → 434 (+69; the 16 KB storage plan is excluded from the headline). Boulder's Coverage fold also lists Pallet's five chips above its own, both rows "5 out of 5", unlabelled.
Repro: proto-run, clear gate 0 and gate 1, open Coverage and Payout on the gate 1 result.

## Summary of Changes

- Coverage rows count right answers ("3 of 5 right"), the figure the headline states; with more than one row each is named by its gate ("Pallet · 3 of 5 right"), a single row on the poll screen stays unnamed. The `TODO(human)` left in `PollScores.ui.tsx` is resolved.
- A closed gate's row states the accuracy multiplier it landed beside its total ("Covered 3.95 ×1.52"): every close now records its accuracy tally (`LastClose.accuracy`), so the result no longer reads pre-multiplier units against a post-multiplier PERFECT and surplus.
- The storage fold's headline is the balance change, bills taken off (+69 KB, not +85 KB).
- "Total units" reads "Covered".
