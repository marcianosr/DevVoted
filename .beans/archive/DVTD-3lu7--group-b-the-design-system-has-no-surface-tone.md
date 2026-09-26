---
# DVTD-3lu7
title: 'Group B: The design system has no surface tone'
status: completed
type: task
priority: normal
created_at: 2026-08-12T09:12:25Z
updated_at: 2026-08-13T08:24:56Z
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
- [x] ~~Add a surface tone vocabulary~~ → moved to DVTD-8ksp (needs a palette decision)
- [x] ~~Add `tone` to `Title` and `Subtitle`~~ → dropped: reverses the 2026-08-01 flattening. Marciano reconfirmed 2026-08-13 that they stay single-style; meaning-carrying colour goes via `className` (4 call sites, 3 of them colour)
- [x] Extract one filled-track primitive — retired **three**, not seven (see corrections)
- [x] ~~Route the outer disclosures through `Disclosure`~~ → done differently: extracted `FoldCaret` (see corrections)
- [x] ~~Extract the panel border~~ → moved to DVTD-8ksp (needs a canonical shade)
- [x] Make `ClimbToday` use `Voter`s avatar
- [x] Retire `difficultyStyles.ts` — already dead: went with the src/ui island in `1cbe58e`

## Summary of Changes

Done 2026-08-13 as **phase 1: the dedup that needs no palette decision**. The vocabulary half moved to DVTD-8ksp with DVTD-wbwz folded into it (Marciano's call: settle text grays and surface grays together so the ~42 files are touched once).

### Corrections to this bean

It was written before the 2026-08-12 island retirement, and a fresh audit found several claims wrong. Recorded so they are not re-attempted:

- **"filled track 7 times" was 3.** `StorageMeter` and `PipelineProgressBar` died with the island. `PollOutcomeBar` and `GateSegmentBar` are documented as deliberately *not* progress bars ("the segments are a record, not a fill") and were left alone. Two more filled tracks the bean never counted survive in legacy `src/domains/` (`StorageBreakdown`, `CategoryWeightsDisplay`), untouched here.
- **"Route the outer disclosures through `Disclosure`" was the wrong fix.** Both outer folds are `<details>` whose summary carries a badge plus a trailing score or percentage, with a data-driven `open`. `Disclosure` hardcodes a faint `Paragraph` summary and cannot express that; routing through it would have lost the badge, the score column and the breakpoint-driven default-open. Its own doc comment says it namespaces itself `group/disclosure` *so a caller can nest one inside its own fold* — the arrangement was intended. The duplication was the 6-line caret, so that is what was extracted.
- **"badge/chip 7 times, same four colours" is mostly wrong**, so nothing was done. `Badge` is commerce vocabulary (`neutral`/`positive`/`price`, no fail state); `StatusDot` diverges by design; `AnswerResults` **already** imports `StatusBadge` for its row badge. The only real overlap is 4 lines between `StatusBadge.OUTLINE` and `CHIP_OUTLINE`, and unifying would mean growing `StatusBadge` a `filled` variant nothing else wants.
- **"Add `tone` to Title/Subtitle" reverses the 2026-08-01 flattening.** Marciano reconfirmed they stay single-style. Only 4 call sites pass `className` at all, 3 of them for colour.
- **`difficultyStyles.ts` was already dead**, deleted in `1cbe58e`.
- `StatusBadge` is at `src/ui/StatusBadge.ui.tsx`, not `modules/run/gate/presentation/`.

### 1. `src/ui/Meter.ui.tsx` — one filled track

Owns the rail markup *and* the percentage, because the three bars each declared their own `percentOf` and one quietly disagreed: `MetaStorageBar`'s never clamped, so `carried > total` would have overflowed the rail. Segments carry their own fill class rather than a tone enum, since the colour is the caller's meaning (viridian for a gain, saffron for a banked share), not the track's.

Rewired `GainBar` (now a 10-line semantic wrapper over it), `StorageGauge` and `MetaStorageBar`. `MetaStorageBar` keeps its own rounding for the displayed `{percent}%` caption — that is *why* its helper differed, and the caption is unchanged; only the fill width moved onto the clamped helper. `StorageGauge`'s existing "clamps a run that somehow overshot the cap" test still passes untouched, which is the point: it pinned behaviour `Meter` now owns.

`Meter.spec.tsx` (11 tests) + a story. `GainBar` had no spec and is now covered through it.

### 2. `src/ui/FoldCaret.ui.tsx`

The caret was byte-identical at `AnswerResults.ui.tsx:377` and `RunCommunity.ui.tsx:133`, with a third copy in `StatusLine.stories.tsx` — a story documenting the pattern, which is good evidence it was an unowned idiom. All three now use it. `FoldableRow`'s `FoldMarker` was left alone: its rotation is state- and breakpoint-driven, not `group-open:`.

### 3. `AvatarRing` in `Voter.ui.tsx`

`ClimbToday.ui.tsx:97` restated the same 8 lines in the same directory, against a file whose doc comment already claimed to be the shared home. Two things genuinely differ and are now props:

- `titled` — inverse of `Avatar`'s `noTitle`. Voters suppress the native hover name because a `Tooltip` supplies it; climbers have no Tooltip and must keep it. Getting this backwards silently kills or doubles the name, so the spec pins both directions.
- `focusable` — the mobile tap affordance, voters only.

**Only the leaf was unified.** The pins were deliberately left apart: the "you" label is a sibling of the stack rather than of the avatar, the stack axis differs (`-space-x-1` vs `-space-y-3`), and `ClimbToday` also has `+N` overflow, a dashed `BestPin` with a null-user fallback and a grayscale `FallenPin` — five more props for no gain.

`Voter.ui.tsx` had neither spec nor story and was covered only transitively; it now has a spec (7 tests), since two callers depend on it.

Verified: tsc clean, oxlint clean, 0 arch violations (529 modules, +5 = exactly the files added), **1457 tests passing** (+18).
