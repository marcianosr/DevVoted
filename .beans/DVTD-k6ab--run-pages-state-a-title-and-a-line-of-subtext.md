---
# DVTD-k6ab
title: Run pages state a title and a line of subtext
status: completed
type: feature
priority: normal
created_at: 2026-10-04T09:17:18Z
updated_at: 2026-10-04T09:47:55Z
---

**What:** The shop, new run and prep pages open on a short title with a muted line of subtext beneath it, and no header draws a swatch before its title.

**Why:** Each page should say what it is and why it matters at a glance; the empty swatch before the title read as noise.

## Done when
- [x] The shop reads Registry with its subtext
- [x] The new run page reads New run with its subtext
- [x] Prep reads the gate name with its subtext
- [x] No run header draws a swatch before its title
- [x] The swatch track and KB balance ride the top nav on every signed-in page

## Notes
Header.ui stacks title + subtitle; lead Swatch, swatchState and marked removed; gateTitleOf drops the number prefix.

## Summary of Changes
Header is a headline + subtext; lead swatch, readout, pinned row and the shop phone-footer balance removed. Header publishes swatches + funds to the nav via NavRunContext (useNavRun, mirrors usePageTheme); Nav falls back to navRunFor(run view). runNumber plumbing deleted from the run screens (hub keeps it). Balance motion tests moved from Header.spec to Balance.spec. ADR-183 supersedes ADR-132.
