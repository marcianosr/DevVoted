---
# DVTD-8wq2
title: 'Comment sweep: cut narration, keep the why'
status: completed
type: task
priority: normal
created_at: 2026-08-12T10:20:34Z
updated_at: 2026-09-26T14:55:33Z
parent: DVTD-82c4
blocked_by:
    - DVTD-36ct
---

**What:** Cut the comments in the run modules that restate the code, and keep the ones that explain why.

**Why:** About 1,240 comment lines across 65 files, most of them narrating what the line below already says.

## Done when
- [x] Every file in src/ is swept, not just the worst ten
- [x] Nothing remains but functional directives
- [x] No code was cut: token fingerprint matched on every written file

## Notes

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

- `config/domain/stack.model.ts` 45/88 (51%)
- `gate/domain/swatch.model.ts` 57/117 (49%)
- `gate/domain/gate.model.ts` 56/195 (29%)
- `pipeline/domain/pipeline.model.ts` 62/273 (23%)
- `community/infrastructure/climbers.repository.ts` 41/158 (26%)
- `gate/presentation/GateRewardReport.ui.tsx` 69/379 (18%)
- `community/domain/standouts.model.ts` 68/360 (19%)
- `config/domain/effect.model.ts` 62/340 (18%)
- `pipeline/presentation/SlotUnlockRow.ui.tsx` 38/206 (18%)
- `run/infrastructure/run.repository.ts` 71/583 (12%)
- remaining 55 files

## Do not blind-sweep

Some comments are load-bearing. `run/domain/seed.model.ts` explains ADR-009 determinism (same seed + same pool = identical sequence, so a mid-day poll-pool change cannot fork the shared climb). That is exactly the WHY the code cannot show. Read before cutting.

## Blocked by

DVTD-36ct — do this after the restructure commits, so a comment judgement call cannot hide a broken import in the same diff.

## Rule (replaces the 2026-08-12 "keep the why" rule)

Zero comments in src/. No JSDoc, no one-line why, no JSX containers. Reasoning
belongs in an ADR or the wiki. The only survivors are functional directives:
/// references, eslint-disable, oxlint-disable, @ts-expect-error, @ts-nocheck,
@vitest-environment. A tool's own user-facing message field is output, not a
comment, and stays.

src/styles/app.css stays exempt: its comments document the Kanto token system.

## Summary of Changes

1,939 comments removed across 377 of 703 files in src/, plus 10 JSX containers
and line comments hand-stripped from three route/presentation files. What is
left in src/ is one triple-slash reference in __root.tsx and six lines in the
generated routeTree.gen.ts.

Method: comment ranges from the TypeScript compiler API, never regex, with a
leaf-token fingerprint compared before and after each file. A file whose
fingerprint moved was refused rather than written. Zero refusals in the final
run.

One real catch from the fingerprint: parsing every file as ScriptKind.TSX
misread async <T>( in shared/utils/authorization.ts as a JSX element, because
the generic-arrow syntax is only unambiguous in .ts. Picking the kind by
extension fixed it. Without the fingerprint that file would have been written
from untrustworthy ranges.

Prettier ran after the strip, not before, and only over the 20 files that newly
drifted (a removed header leaving a leading blank line, a removed trailing
comment leaving trailing whitespace). The pre-strip set was clean, so no work in
progress was reformatted.

CLAUDE.md updated in the same session: the Database Tables line no longer claims
every table is documented inline in schema.ts, and the comment rule now states
the zero default outright instead of "unless it really needs a why", which is
the loophole the 4,832 lines grew through.

Verification, before and after:

- tsc --noEmit: 0 errors, unchanged
- npm test: 207 files, 4007 tests, all passing, unchanged
- npm run lint: exit 0, oxlint clean, 746 modules cruised with no dependency
  violations, docs/wiki.md in sync
- prettier --check over src: clean
- Stories are excluded from tsconfig, so they were typechecked separately via a
  temporary config: 3 errors, all a ConfigChipProps union mismatch that predates
  this work (two of them in a file the strip never touched)
