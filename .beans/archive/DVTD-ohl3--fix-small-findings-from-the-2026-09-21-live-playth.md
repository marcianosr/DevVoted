---
# DVTD-ohl3
title: Fix small findings from the 2026-09-21 live playthrough
status: completed
type: task
priority: normal
created_at: 2026-09-21T07:50:43Z
updated_at: 2026-09-21T08:10:35Z
---

Found by playing gate 0 live as lt.surge. Each item is a small, self-contained fix.

- [x] Answer rows show a verdict (right/wrong) and the explanation after submit
- [x] Keyboard answering: letter keys pick, Enter submits, Enter no longer toggles the focused row
- [x] Debrief payout fold itemises the clear (base, correctness, streak, perfect, Build Artifacts) and prep quotes the same formula
- [x] Debrief "five answers" reads units, matching the poll screen
- [x] "Start today's climb" lands on the new-run screen in one press
- [x] Coverage bar drops the OK label when it sits on the HEALTHY line
- [x] Poll header keeps the answered poll's number during the reveal

## Summary of Changes

- `Choice.ui` gained a `verdict` (right / wrong / missed) that themes the row and adds a tick or cross; `Question.ui` passes it through; `answeredOptionsFor` in `pollScreen.viewmodel` derives it from `picked` and `correct`. The `Answered` story shows all three states.
- New `usePollKeyboard.hook`: letter keys pick, Enter presses the footer action and is claimed only while there is one, so a clicked row is never toggled by Enter. The footer notes "Enter submits" / "Enter continues".
- `pollLabelFor(view, revealing)` keeps the answered poll's number on the reveal.
- `RunStart` navigates into the run on a successful start (one press).
- `CoverageBar` anchors boundary labels away from each other (survive ends on its line, HEALTHY starts on it) and drops a label whose band has no width.
- The close records `clearThisGateKb`, `overflowThisGateKb` and `streakAtClose`; `gatePayoutFor` exposes them; the debrief itemises the gate row (base, streak), flat clear payouts per config (`flatClearPayoutsOf`), surplus, interest and extra picks, and counts them in the strip. The streak chip now reads the answer streak, not gates cleared.
- Debrief answer rows read units (`+1.35`) like the poll screen.
- Prep footnote states that band pays are quoted at the fewest right answers, before the streak or surplus.

Verified: tsc clean, 3846 tests pass (2 known floor failures), oxlint + depcruise clean, Prettier clean. Live re-check of the keyboard and one-press start pending a fresh login.

Open, not fixed: `PERFECT_BONUS` (x1.5) is applied only by story fixtures (`gatePayoutKb`), never by the live close (`gateClearPayout`), yet the debrief help text and the wiki promise it. Needs a decision.
