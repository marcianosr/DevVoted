---
# DVTD-1grg
title: 'Wiki: add death-spiral article, typical-run numbers, check pitch'
status: completed
type: task
priority: normal
created_at: 2026-07-27T15:47:02Z
updated_at: 2026-07-27T15:48:13Z
---

Marciano's review of docs/wiki.md found four gaps: (1) the failure loop as a whole (strip -> no shop -> weaker -> strip more) spread across three sections, (2) calendar-day cost of failing, (3) no sample numbers for a typical run, (4) missing pitch for why to install a check.

- [x] Death Spiral article under Gameplay (consolidates strip, no-shop-on-fail, day cost)
- [x] A Typical Run article with worked numbers from code constants
- [x] Check pitch paragraph in Overview & Families
- [x] TOC entries

## Summary of Changes

Added to docs/wiki.md: (1) The Death Spiral article after Failing a Gate, consolidating the self-feeding loop (strip N configs + no shop on a failed gate + one calendar day per retry -> weaker build faces same demand -> bare build -> death) plus what survives a strip (coverage, storage, Unit Tests); cross-linked from Failing a Gate. (2) A Typical Run article after Victory & Run End: worked example table from shipped constants (4/5 correct per gate: ~4%/12%/24%/40%/61% total coverage and ~100/180/280/300/480 KB across gates 1-5; rule of thumb 20-25% + 250-350KB by gate 3; slot ladder alignment noted). (3) Check pitch in Overview & Families: checks are the income engine, 120KB base with stacking multipliers vs draft prices. No em dashes used.
