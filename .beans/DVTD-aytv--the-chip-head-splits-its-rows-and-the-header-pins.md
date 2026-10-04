---
# DVTD-aytv
title: The chip head splits its rows, and the header pins where you spend
status: completed
type: task
priority: normal
created_at: 2026-09-27T18:53:51Z
updated_at: 2026-09-27T19:06:58Z
---

**What:** Give the config card head two rows so the name and the press share the title line, and pin the header on the shop and the new-run screen.

**Why:** A fixed floor on the name moved the cliff instead of removing it; a flex item's own content is the only honest minimum.

## Done when

- [x] The name and the press share the title line on a shop card
- [x] A badge takes a row of its own rather than squeezing the name
- [x] The balance stays in view while the offers scroll, from md up
- [x] The pinned header clears the app bar and its change pill
- [x] ADR-119 decision 6 is rewritten and ADR-132 is written

## Summary of Changes

**The chip head is two rows.** `HEAD` is a column of `HEAD_ROW` (disclosure, pick, weight, name, presses) and `TAG_LINE` (badges, full width). The name is `flex-1 break-words` and takes no `min-w-0` — a flex item already refuses to shrink below its own content, and the only reason the old `IDENTITY` needed `min-w-0` was the nowrap badge sharing its box. ADR-119 decision 6 rewritten.

**The header pins on the shop and a new run, from md up.** `--nav-seat: 4.5rem` in app.css, `min-h-[var(--nav-seat)]` on AppNav (which was already `sticky top-0 z-30 bg-black`), and a `pinned` prop on Header that bleeds its own ground with 24px of headroom for the balance pill. ADR-132 written, README row added.

**Install matches Uninstall.** Both are an ambient press with the figure capped on the trailing edge. Uninstall keeps viridian; install takes no cap colour, so the price wears the config theme. ADR-123 decision 5.

225 test files / 4381 tests pass, typecheck clean, lint clean.
