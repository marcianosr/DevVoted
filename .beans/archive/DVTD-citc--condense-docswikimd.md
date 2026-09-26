---
# DVTD-citc
title: Condense docs/wiki.md
status: completed
type: task
priority: normal
created_at: 2026-08-19T14:12:26Z
updated_at: 2026-08-19T14:22:22Z
---

Shorten the wiki from ~1180 lines into a concise player-facing reference: keep every authoritative table (unlock schedule, audits, config roster, storage plans, glossary, numbers appendix), cut design rationale and ADR archaeology (pointer to docs/adr/ instead), compress planned/parked content to short lists.

- [x] Rewrite docs/wiki.md
- [x] Fix the audit-count inconsistency (prose said seven, appendix said nine; audit.model.ts has ten named rules plus Strip)
- [x] Verify internal anchors still resolve

## Summary of Changes

docs/wiki.md: 1181 -> 816 lines, 12235 -> 7859 words (36% shorter), every authoritative table kept.

Structure: 10 sections unchanged in spirit, renumbered (Polls+Categories merged; Technical Debt section dropped as scrapped; Daily Poll folded into 1.2 Two loops; Borders+Seasons merged; Interference and the loot/custom-poll plans moved under 7).

Cut: ADR archaeology (reversals, superseded ladders, dead checks, dated design notes), per-config legacy check column on the planned roster, design rationale that ADRs already own, and the numbers appendix duplication (now a grouped constant sheet keyed to code identifiers rather than a second copy of the body tables).

Drift fixed against code while rewriting:
- audit count: prose said seven, appendix said nine; GATE_AUDITS holds ten named rules plus the Strip family (now stated as eleven)
- categories: wiki said 11, CATEGORY_CODES has 12 (Vue)
- shipped configs: wiki said 19/20, CONFIGS has 24 (.vue ships as a Vue Focus config)
- scoring example cited Copilot, which only exists in legacy src/domains/, replaced with AGENTS.md

Verified: all 19 internal anchors resolve, no em dashes, lint clean (547 modules), 1599 tests pass.

Not done: the Notion snapshot of the wiki is now stale and needs a re-sync (outward-facing, left for Marciano to trigger).
