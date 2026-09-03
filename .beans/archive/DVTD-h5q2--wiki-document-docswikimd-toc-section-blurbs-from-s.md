---
# DVTD-h5q2
title: 'Wiki document (docs/wiki.md): TOC + section blurbs from stories'
status: completed
type: task
priority: normal
created_at: 2026-07-27T14:49:05Z
updated_at: 2026-07-27T14:52:20Z
---

Fan-wiki-style document modeled on the Balatro fandom wiki, sourced from .beans/ stories and ADR-005..015. This pass: table of contents + 1-3 sentence blurb per article, inline status tags (Shipped/Planned/Parked/In flux). Destined to become a Notion doc later.

- [x] Verify canonical numbers against rules.model.ts / pipeline.model.ts / configRoster.model.ts
- [x] Write docs/wiki.md (TOC + blurbs + status legend + glossary + numbers appendix)
- [x] Terminology sweep (pipeline not board, coverage is score not reward)

## Summary of Changes

Created docs/wiki.md: Balatro-fandom-style wiki (TOC + 1-3 sentence blurbs per article) covering gameplay, pipeline, configs, economy, meta-progression, community, interface, glossary, and a numbers appendix. Status tags inline (Shipped/Planned/Parked/In flux). All numbers verified against src/modules/run model files; corrections vs the story summaries: abandon banks 0% (storageCreditRate supersedes DVTD-li9i 50%), coverage losses stay flat (gains-only scaling), MAX_SLOTS=12, selling is shipped (half draft-cost refund), Focus upgrades are coverage-gated (5%/level) while Unit Tests upgrades cost 60KB/level. Open contradictions flagged, not resolved: victory gate 5 vs 12, upgrade currency, swatch naming collision, perks-only balance.
