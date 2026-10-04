---
# DVTD-d7sd
title: End the run states what banks, and the score stands apart
status: completed
type: feature
created_at: 2026-10-04T10:35:11Z
updated_at: 2026-10-04T10:35:11Z
---

**What:** A held gate's way out says how much storage banks into the archive, and the gate result's Score is its own section with each poll's figure under the count.

**Why:** "keep 256 KB" promised storage the archive never pays, and the score read as part of the bar.

## Done when
- [x] End the run names the banked share, not the run balance
- [x] Score is ruled off as its own section of the Coverage panel
- [x] What each poll paid sits on the line under the right-answer count

## Notes
Uses bankedKb(balanceBeforeKb, gate, false), the run-over screen's rule. ADR-179 amended.

## Summary of Changes
gateOutcome.viewmodel choiceOf note; GateOutcomeScreen CoveragePanel is a flush Fold with two sections; PollScores adds a basis-full break before the chips on paid rows (also applies to the run-over table).
