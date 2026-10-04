---
# DVTD-gbgp
title: 'Poll screen: say when this gate can no longer finish today'
status: todo
type: feature
priority: normal
created_at: 2026-09-24T13:45:35Z
updated_at: 2026-09-24T13:45:35Z
blocked_by:
    - DVTD-bf40
---

Split out of DVTD-bf40 because `PollScreen.ui.tsx`, `pollScreen.viewmodel.ts`,
`PollScreen.stories.tsx` and `kantoPoll.factory.ts` were all mid-rewrite in a parallel
session (sticky coverage readout, `PollCommit` moved into `BuildFooter.ui.tsx`). Re-read
them before starting -- the design below cites pre-rewrite structure.

The poll panel header states `Poll 3 out of 5`, which is the **gate window** and so spans
days for a partial-day player. Add a second, narrower fact that appears only when the two
counters disagree.

`dayNoteFor(view): string | undefined` in `pollScreen.viewmodel.ts`, beside `pollHoldsFor`:

- `pollsLeftInWindow = view.pollsPerGate - view.answeredThisGate.length`
- `undefined` when `pollsLeftToday >= pollsLeftInWindow` -- the gate can still finish today.
  This is the 5-a-day player's path: they never see it. The warning is self-targeting, with
  no flag and no "casual mode".
- else `${pollsLeftToday} left today - this gate finishes tomorrow`

`pollsLeftToday` counts the poll on screen, so "1 left today" means "this one, then done".

Depends on `pollsLeftToday` landing on RunView in DVTD-bf40.

## Todo

- [ ] Re-read the four files; confirm where the panel `meta` block and `PollCommit` now live
- [ ] `dayNoteFor` in `pollScreen.viewmodel.ts` + spec
- [ ] `dayNote?: string` on `PollScreen.ui.tsx`, Badge in the `meta` block, pewter (neutral --
      cerulean and cinnabar are taken by `holds` and `wrongCost`)
- [ ] `PollView.component.tsx` passes it
- [ ] Story case; `kantoPoll.factory.ts` forwards the copy rather than restating it (ADR-102)
- [ ] lint + test + build
