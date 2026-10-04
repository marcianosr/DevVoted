---
# DVTD-eel2
title: 'Playtest fixes: stack naming, trimmed preview, plain-language receipt'
status: completed
type: task
priority: normal
created_at: 2026-08-10T12:56:55Z
updated_at: 2026-08-10T12:57:25Z
---

Same-day playtest follow-up on DVTD-iyhz (custom-build row + pack demands). Marciano reviewed the running screen and gave four notes:

1. "Pack" reads as an unnecessary extra vocabulary word alongside config/pipeline/gate/stack/storage/coverage — reuse "stack" (already the screen's own heading).
2. The expanded selected-stack view showed too much: a 3-line rules document per config (demand + payoff + fee/counter) when picking is a "preset view", not "expanded config = precise mechanics".
3. The "0/1" live counter on the pre-run screen reads as run progress that doesn't exist yet.
4. The Build Summary's "Clear your pipeline" bullet is DevVoted explaining DevVoted in DevVoted terms; a newcomer doesn't know what it means. Also asked to drop "…and that is the whole receipt."

## Todo

- [x] Rename pack.model.ts -> stack.model.ts, StarterPack -> StarterStack, STARTER_PACKS -> STARTER_STACKS, PackPicker -> StackPicker, pick-pack -> pick-stack, packId -> stackId, throughout the run module + wire schema + specs
- [x] New StackPreviewList.ui.tsx: demand+payoff always visible, fee/costs behind a per-row "more details" tap
- [x] preRunRoleRows in configRole.model.ts: strip live counter/note pre-run (both stack mode and classic bench mode)
- [x] GateStakeReceipt: merged plain-English objective sentence, dropped "Clear your pipeline" and the intro-only closer; removed the now-pointless full/intro variant split entirely (on-clear section shows everywhere)
- [x] Updated specs (ConfiguringScreen, PrepScreen) + new StackPreviewList spec/story
- [x] ADR-026 rewritten + renamed file, CHANGELOG entry rewritten, wiki updated

## Summary of Changes

All four notes addressed:

1. Full pack->stack rename across the run module (files, types, constants, reducer action + wire field, tests) — done same-session since the code was uncommitted and unshipped, cheap to fix now vs. carrying a code/UI vocabulary split forward.
2. New StackPreviewList.ui.tsx (+spec+story): number, chip, always-visible demand (!) and payoff (v) FactRows (reusing PipelineReportRow's now-exported FactRow/emphasizeNumbers), a linter's cost gated behind a local per-row "more details" toggle. Classic bench mode keeps the full RoleList detail unchanged (it is the "precise mechanics" screen).
3. preRunRoleRows (configRole.model.ts): strips status/note before a run exists; applied to both the stack-mode preview and the classic bench pipeline view in ConfiguringScreen.
4. GateStakeReceipt: objective collapsed to one Paragraph ("Answer N polls and satisfy your config checks"); removed the variant prop entirely since decluttering the copy removed the only reason forecasts were hidden pre-pick — on-clear now shows unconditionally, everywhere the receipt renders.

Verified: tsc clean, oxlint+depcruise clean, full suite 1341 passed / 8 pre-existing failures (same ones present at HEAD, unrelated to this work) / 6 skipped / 2 todo.
