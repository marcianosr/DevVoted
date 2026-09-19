---
# DVTD-ucni
title: Run screen polish pass + gate header reveals the next gate
status: completed
type: task
priority: normal
created_at: 2026-09-06T13:13:00Z
updated_at: 2026-09-06T13:28:10Z
---

Playtest pass: 1 sequencing bug + 8 UI points on the terminal-theme run screen.

Plan: ~/.claude-work/plans/few-poiints-how-recursive-squid.md

## Todo
- [x] 1. Gate header shows the NEXT gate during the last reveal of a cleared window
- [x] 2. Unlocks row draws a DexChip instead of bold saffron text
- [x] 3. Audit cue below the code+name
- [x] 4. BuildList rows become DexChips; drop the literal 'paid'
- [x] 5. BUILD header: 'N running' onto its own line
- [x] 6. BUILD header: remove the 'N skipped' legend count
- [x] 7. Capitalise the fact labels
- [x] 8. Shell 1040->1120, sidebar 18rem->20rem, min-height floor
- [x] 9. Transient coverage callout replaces the Equation footer
- [x] Docs: CHANGELOG plainer-line clause, ADR-061 s1

## Summary of Changes

Root cause of the gate bug was sequencing, not arithmetic: closeWindow advances gatesCleared on the 5th answer but answeredThisGate is not cleared until finishReward, so /proto-run rendered the clearing reveal against the next gate. runHeaderFor now takes a standingAt override; RevealView passes view.clearedGate while status is rewarding/won. RunView gained clearedGate. Regression test proven to fail without the fix.

UI: Unlocks and BuildList rows draw DexChip (UnlockNote and BuildListRow gained slots/maxVersion); Audits stack the cue under code+name; BUILD header drops its meta slot so N running sits on its own line beside the surviving usable/stopped legend counts, with skipped filtered out; fact labels capitalised; shell 1040->1120px, sidebar 18rem->20rem, min-h-[32rem] floor; new CoverageCallout replaces the reveal Equation footer, CSS-only animation in app.css.

Docs: CHANGELOG plainer-line clause corrected, ADR-061 s1 amended.
