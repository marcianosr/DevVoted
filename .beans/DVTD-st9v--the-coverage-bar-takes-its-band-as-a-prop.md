---
# DVTD-st9v
title: The coverage bar takes its band as a prop
status: todo
type: task
priority: low
created_at: 2026-09-25T19:45:53Z
updated_at: 2026-09-25T19:45:53Z
blocked_by:
    - DVTD-dhfx
---

**What:** The coverage bar receives its band from the viewmodel instead of cutting it from its own props.

**Why:** After the gate-close slice the domain owns the one band classifier, but the bar still carries a private copy so it can draw from plain props; handing it the band removes the last duplicate cut.

## Done when
- [ ] The bar takes a band prop and draws it without classifying
- [ ] Every viewmodel that builds bar props supplies the band from the domain classifier
- [ ] The bar's stories and specs pass the band explicitly

## Notes
Follow-up to the gate-close slice of the deepening pass. Touches every builder of `CoverageBarProps` (prep, poll, gate outcome, run over, the poll factory, the stories), which is why it is not folded into that slice.
