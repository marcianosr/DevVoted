---
# DVTD-dt1k
title: Sync docs/wiki.md from latest Notion wiki (debt-card redesign)
status: completed
type: task
priority: normal
created_at: 2026-07-31T09:26:15Z
updated_at: 2026-07-31T09:29:15Z
---

Pull the rewritten Notion DevVoted Wiki (page 3aa07387-6297-81d9-b2fd-dff8d1b45d24) back into docs/wiki.md, restoring repo markdown conventions (H1, linked TOC, anchor links).

- [x] Fetch Notion page content
- [x] Rewrite docs/wiki.md with Notion content + repo conventions
- [x] Flag doc/code discrepancies (debt system not in code; status tags dropped)

## Summary of Changes

Replaced docs/wiki.md wholesale with the rewritten Notion wiki content (fetched 2026-07-31), reversing the three publish transforms: restored the H1, rebuilt a linked TOC (now with numbered subsections), and re-anchored internal cross-references. Content deltas taken from Notion: strip/death-spiral failure model replaced by Technical Debt cards (2.6/2.7), section 4 rebuilt around the universal Effect+Check Config Rule (families removed, 19-config shipped roster plus 11 planned entries), Kanto/Johto category color tables, coverage formula with worked example, Strictness/Mastery section removed, Swatch dual-meaning resolved, Unit Tests no longer upgradable.

Flagged to Marciano (not fixed): code still implements strip (rules.model.ts dropCount) so the debt sections are design-ahead-of-code despite the appendix claiming values are code-verified; per-paragraph status emoji were dropped in the Notion rewrite while the legend still promises them; section 1.1 still references strip-on-fail and bare-build death.
