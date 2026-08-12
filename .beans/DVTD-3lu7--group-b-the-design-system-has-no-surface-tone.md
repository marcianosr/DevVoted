---
# DVTD-3lu7
title: 'Group B: The design system has no surface tone'
status: todo
type: task
created_at: 2026-08-12T09:12:25Z
updated_at: 2026-08-12T09:12:25Z
parent: DVTD-82c4
---

`ParagraphTone` (`src/ui/typography/Paragraph.component.tsx:7-21`) has 13 tones
for **text** and none for **surfaces**. So 40-odd sites hand-roll
`bg-zinc-800` / `border-zinc-700` / `ring-zinc-900` themselves.

83 raw palette classes across `src/modules/run/presentation/**/*.ui.tsx`.
Worst files: `run/AnswerResults.ui.tsx` (14), `screens/ShopScreen.ui.tsx` (9),
`community/ClimbToday.ui.tsx` (8), `gate/GateStakeReceipt.ui.tsx` (5).
11 of 42 files are already clean, so the Kanto migration is mostly done and
this is the residue.

Two holes in the system itself:
- `Title.component.tsx:17` and `Subtitle.component.tsx:17` hardcode zinc and take **no** `tone` prop. Callers escape via `className`, e.g. `src/ui/TerminalPanel.ui.tsx:13` overrides a design-system component with raw zinc.
- `src/ui/runs/difficultyStyles.ts:3` is a second palette (`text-blue-400`, `text-green-400`) still reaching the live app through `ScoreEquationChips` on the answering screen.

Duplication that follows from having no primitive:
- **"filled track" 7 times**: `GainBar`, `StorageGauge`, `MetaStorageBar`, `StorageMeter`, `PipelineProgressBar`, `PollOutcomeBar`, `GateSegmentBar`. Five carry their own `percentOf`/`barPct`/`clamp01` differing only in whether they clamp. `GainBar` and `StorageGauge` are the same component with a different fill colour and identical track classes.
- **disclosure caret 4 times**: `AnswerResults.ui.tsx:377` and `RunCommunity.ui.tsx:133` are character-identical, and **both files already import `Disclosure`** for their inner folds while hand-rolling the outer one.
- **bordered panel at 11 sites**, nine of them `rounded border border-zinc-{600,700,800}`
- **badge/chip 7 times**: `AnswerResults` chip tones and `StatusBadge` outline tones are the same four colours in the same roles, declared five files apart
- **avatar-in-a-ring twice**: `community/Voter.ui.tsx:11` and `community/ClimbToday.ui.tsx:97`, in the same directory. `Voter.ui.tsx:5-10` has a doc comment claiming it exists to prevent exactly this.

Largest job in the review, and the lowest risk. Five of the seven bar
implementations have no spec.

## Todo
- [ ] Add a surface tone vocabulary
- [ ] Add `tone` to `Title` and `Subtitle`
- [ ] Extract one filled-track primitive; retire the seven
- [ ] Route the two outer disclosures through `Disclosure`
- [ ] Extract the panel border
- [ ] Make `ClimbToday` use `Voter`s avatar
- [ ] Retire `difficultyStyles.ts` with its last caller
