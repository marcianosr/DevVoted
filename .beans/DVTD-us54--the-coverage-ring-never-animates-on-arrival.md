---
# DVTD-us54
title: The coverage ring never animates on arrival
status: todo
type: bug
priority: low
created_at: 2026-09-13T07:57:25Z
updated_at: 2026-09-13T07:57:25Z
---

app.css says @starting-style is what makes the ring animate on arrival. It does not:
`@starting-style` carries the specificity of its own selector, and both the arc's
`stroke-dashoffset` and the count's `--coverage-count` are set inline by
CoverageRing.ui, so the inline declaration wins and the first paint is already
settled. The starting-style entries for `.coverage-arc` and `.coverage-count` are
dead.

CoverageBar was fixed the same day (DVTD-c76y) by moving the reading onto a custom
property on the bar root and declaring `width` in the sheet, where a later
`@starting-style` block can outrank it. The ring can take the same shape.

- [ ] Move the arc's dashoffset onto an inherited custom property
- [ ] Same for the digits' --coverage-count
- [ ] Put the @starting-style block after the rules it overrides
- [ ] Correct the app.css comment either way
