---
# DVTD-k2aw
title: Strip every comment from the files this session touched
status: completed
type: task
priority: normal
created_at: 2026-08-28T15:06:55Z
updated_at: 2026-08-28T15:07:17Z
---

Marciano: "Strip every comment on the files you touched". Every `//`, `/* */`, JSDoc block and `{/* */}` JSX container removed from the 161 src files edited during the rarity-glyph + spots-and-rent session. Reasoning now lives only in the ADRs and the wiki.

## Summary of Changes

**Scope.** The 161 `src/**` files edited during this session, recovered from the session
transcript (Edit/Write calls plus the paths written by bash helper scripts), filtered to
files that still exist. 137 of them carried comments; 24 had none. 24 more paths were
skipped because the file was deleted during the session (`Rung`, `PipelineCapacity`,
`Plan`, `StoragePlan`, `RarityStripe`, `RarityWord`, `ChipGrid`).

**Result.** 1467 comments gone: 2358 deletions against 107 insertions (code lines that
had carried a trailing comment, rewritten without it).

**Method.** A scratchpad Node script using the project's own TypeScript API, not regex:
regex cannot tell a comment from `//` inside JSX text or a regex literal. Comment ranges
come from `getLeadingCommentRanges` / `getTrailingCommentRanges` over every leaf token,
with any range falling inside a `JsxText` span discarded. Comment-only `{/* ... */}`
containers are removed whole, braces included, since an empty `{}` child is legal but junk.

**The safety net.** Every file is fingerprinted before and after: the concatenation of
every leaf token's kind and text must be identical, and the JSX prose must survive with
only whitespace collapsed. A file failing either check is left untouched. It fired twice
and both were real:

- With `setParentNodes` on, **JSDoc is a real AST subtree**, so `getChildren()` walks into
  it and its prose counts as code. Exactly the documented files failed; the `//`-only ones
  passed. Fixed by skipping `FirstJSDocNode..LastJSDocNode` subtrees.
- Removing a `{/* */}` container legitimately drops `{` and `}` tokens, so those spans are
  excluded on the original side rather than the check being loosened.

**Formatting.** prettier ran on the 157 files that were prettier-clean beforehand. The
four that were already drifting (`config.model.ts` / `.spec.ts`, `strip.model.ts` /
`.spec.ts` — Marciano's parallel WIP) got manual blank-line collapsing instead, so his
in-flight formatting was not rewritten. Their drift is unchanged.

**Not stripped: `src/styles/app.css`.** It is the one non-code file in the set, it had a
single edit this session, and its 60 comments are Marciano's own, one of them signed
("Dark-only (Marciano, 2026-08-13)") and recording why the light halves were removed.
Flagged rather than deleted; say the word and it goes.

**Six comments carried his attribution and went with the rest** (`configRoster.model.ts`
sellRefundIn note, two `ConfiguringScreen.spec.tsx` notes, `RunConfigure.component.tsx`,
`answer.model.spec.ts` bug-report note, `rules.model.ts` single-config-opening note).

## Verification

- `npx tsc --noEmit` — 0 errors
- `npm run lint` — clean, no dependency violations (787 modules, 3230 dependencies)
- `npx vitest run` — 2576 passed, 3 failed, 6 skipped, 2 todo. The 3 are the documented
  `RewardScreen.spec.tsx` copy baseline (DVTD-9dn0), unchanged.
- Stories (excluded from `tsconfig.json`) via a scratchpad config clearing `exclude` —
  25 errors across 9 files, the same pre-existing 25 (DVTD-a8tr).
- `npx prettier --list-different` over the 157-file clean set — empty.
- Independent re-scan of all 161 files for comment ranges — none remain.
