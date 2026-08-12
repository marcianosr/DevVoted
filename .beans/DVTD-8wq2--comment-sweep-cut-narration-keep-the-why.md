---
# DVTD-8wq2
title: 'Comment sweep: cut narration, keep the WHY'
status: todo
type: task
priority: normal
created_at: 2026-08-12T10:20:34Z
updated_at: 2026-08-12T10:25:05Z
parent: DVTD-82c4
blocked_by:
    - DVTD-36ct
---

Pre-existing comment bloat across src/modules/run: ~1240 comment lines in 65 files. Cut comments that restate the code; keep ADR/bean references and non-obvious constraints.

## Rule

**Cut** — restating what the JSX renders, describing visual design, narrating what a function obviously does.
**Keep** — ADR/bean references, non-obvious constraints, "why not the obvious thing", and anything a reader would otherwise get wrong.

A tool's own message field (dependency-cruiser `comment`, thrown error strings) is user-facing output, not a comment. Keep those, one line each.

## Worked example

`gate/presentation/SwatchLabel.ui.tsx` carries a 9-line block above a 15-line component:
- "A swatch's colour chip beside a name" — the JSX says it. Cut.
- "Gates are named after the badge they award..." — real domain fact, but already in CONTEXT.md under Swatch. Duplicating it means two places to update. Cut.
- "`align-middle` keeps the chip on the text's baseline" — the only genuine WHY, and it is a recognisable idiom on an inline-flex. Cut or reduce to one line.
- The `label` prop comment ("the badge or its gate") is the one line worth keeping: `label` is genuinely ambiguous between two domain things.

Trimmed it during DVTD-36ct, then reverted so the restructure diff stayed purely mechanical. Start here.

## Worst by ratio (comment lines / code lines)

- [ ] `config/domain/stack.model.ts` 45/88 (51%)
- [ ] `gate/domain/swatch.model.ts` 57/117 (49%)
- [ ] `gate/domain/gate.model.ts` 56/195 (29%)
- [ ] `pipeline/domain/pipeline.model.ts` 62/273 (23%)
- [ ] `community/infrastructure/climbers.repository.ts` 41/158 (26%)
- [ ] `gate/presentation/GateRewardReport.ui.tsx` 69/379 (18%)
- [ ] `community/domain/standouts.model.ts` 68/360 (19%)
- [ ] `config/domain/effect.model.ts` 62/340 (18%)
- [ ] `pipeline/presentation/SlotUnlockRow.ui.tsx` 38/206 (18%)
- [ ] `run/infrastructure/run.repository.ts` 71/583 (12%)
- [ ] remaining 55 files

## Do not blind-sweep

Some comments are load-bearing. `run/domain/seed.model.ts` explains ADR-009 determinism (same seed + same pool = identical sequence, so a mid-day poll-pool change cannot fork the shared climb). That is exactly the WHY the code cannot show. Read before cutting.

## Blocked by

DVTD-36ct — do this after the restructure commits, so a comment judgement call cannot hide a broken import in the same diff.
