---
# DVTD-kctk
title: Improve poll review screen UI
status: in-progress
type: feature
priority: normal
created_at: 2026-07-23T12:00:15Z
updated_at: 2026-07-24T09:39:25Z
parent: DVTD-u35m
---

Enhance the visual design and usability of the poll review screen to make answer feedback clearer and more engaging

## UI Improvements

### Answer Clarity
- [ ] Highlight correct answer clearly (green/viridian accent)
- [ ] Show player's answer with distinction (correct/incorrect state)
- [ ] Add visual feedback: ✓ for correct, ✕ for incorrect
- [ ] Make comparison between right/wrong answers obvious

### Layout & Hierarchy
- [ ] Reorganize answer options for better scannability
- [ ] Use spacing and typography to create clear hierarchy
- [ ] Group related information (e.g., coverage earned, streak impact)
- [ ] Consider card-based layout vs list layout

### Interactive Elements
- [ ] Add explanation/reasoning for why answer is correct (if available)
- [ ] Show coverage breakdown (base + bonuses = earned)
- [ ] Display category/topic context
- [ ] Optional: show related poll hint or "learn more" link

### Visual Polish
- [ ] Smooth transitions/animations when revealing answer
- [ ] Color-coded chips for coverage bonuses
- [ ] Consistent with rest of game UI (borders, spacing, typography)
- [ ] Mobile-responsive layout

### Information Display
- [ ] Show time taken to answer (if tracked)
- [ ] Display streak impact (if applicable)
- [ ] Show if this is a re-answer with bonus (if applicable)
- [ ] Next poll button prominence

## Testing
- [ ] Verify readability on small screens
- [ ] Test with various answer lengths/complexity
- [ ] Check keyboard navigation
- [ ] Story + visual specs

## Implementation: dex-style fold-out review (this session)

Replace the tabs + big-card + prev/next pager in `AnswerResults.ui.tsx` with a dex-style list (mirrors the Dex `DataTable` look) where each poll is a `<details>` row that folds open in place.

- [x] Header row (# / Question / Category / Result) matching Dex header style
- [x] `<details>/<summary>` row per poll; first poll open by default; custom chevron (no default marker)
- [x] Result cell: always shows colored outcome icon (✓/◐/✕); appends `+N%` coverage only when `coverageEarned` present
- [ ] Fold-out body — hybrid: single-answer → compact "Your pick / Correct" lines; multi-select → existing PollOptionReview
- [x] Keep OutcomeCounts export (used by ReviewAnswers)
- [x] Rewrite AnswerResults.spec.tsx for the fold-out structure
- [x] Update AnswerResults.stories.tsx (add coverageEarned; add a no-score variant)
- [ ] Verify: npm test, lint, tsc, build

### Follow-up: reuse the live answer overview (Image #32)

Per follow-up, the multi-select fold-out now reuses the *live poll's* answer overview in its reveal state rather than a lookalike.

- [x] Extract `PollCard`'s option-list block into shared `PollOptionList.ui.tsx` (identical DOM; PollCard delegates; PollCard.spec stays green)
- [x] Review multi-select branch renders `PollOptionList` (reveal state) fed by answered-poll labels (label doubles as id)
- [x] Single-answer keeps compact your-pick/correct; legacy (no correct set) falls back to PollOptionReview
- [x] Open question resolved: single-answer stays compact (hybrid); only multi-select uses the answer-page overview

### Pivot: test-runner reporter (Vitest/Jest style)

Per follow-up (Image #33), the whole review pivoted to a test-runner reporter look, superseding the Dex-table/fold-out + answer-page-overview design earlier this session.

- [x] Each poll = a reporter row: PASS/PART/FAIL badge + question + `(N)` option count + coverage score (right-aligned, tinted; `—` when no history)
- [x] Row folds open into a `describe/it` tree: every option is an assertion — ✓ pass (picked+correct), ✕ fail (picked-wrong OR correct-missed, tagged), ○ skip (untouched wrong); explanation prefixed with ›
- [x] `PollOptionList` no longer used by the review (still used by the live PollCard); CategoryTag/category dropped from the review row per Marciano's "count + score" choice
- [x] SKIP badge wired but dormant — `AnsweredPoll.outcome` only carries correct/partial/wrong today (no missed-poll data fed to the review yet)
- [x] Verified: 20 specs, tsc, oxlint+arch green; reporter layout confirmed via Playwright screenshot
