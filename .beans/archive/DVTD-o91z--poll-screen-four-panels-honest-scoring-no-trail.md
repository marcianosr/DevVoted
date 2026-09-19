---
# DVTD-o91z
title: 'Poll screen: four panels, honest scoring, no trail'
status: completed
type: task
priority: normal
created_at: 2026-09-14T11:15:09Z
updated_at: 2026-09-14T11:32:22Z
---

The poll screen is the last run screen still laid out as a flat column. Move it
onto PanelV2 (coverage / audits / poll / build) on a bare screen ground, and
apply five pieces of feedback.

None of the quoted strings existed in the repo: the screenshot was a mockup, so
most of this is new work rather than copy edits.

## Todo

- [x] Delete Trail fully (component, spec, stories, viewmodel dead code)
- [x] Drop the live answers hint; KEEP answered.explanation on the same prop
- [x] Drop KANTO_COVERAGE_BAR_NOTE from the factory
- [x] New kanto Tooltip.ui.tsx + story + spec
- [x] pollLabelFor: "poll N out of 5"
- [x] coverageMetaFor: "62% SHAKY / 34/55 correct"
- [x] PanelV2.Header gains a badge slot
- [x] Question sheds its facts row; 7 specs relocate to PollScreen.spec
- [x] PollScreen onto PanelV2, ground bare
- [x] Fold reskinned to PanelV2 chrome (BuildFooter keeps sticky + fold, ADR-069 stands)
- [x] wiki + CHANGELOG
- [x] test, lint, build green; the 2 PollScreen reds fixed

## Summary of Changes

The poll screen is four PanelV2 panels on a bare ground: Coverage, Audits, the
poll, and the build. All five feedback items are in.

**None of the quoted strings existed in the repo** — the screenshot was a
mockup, so most of this was building readouts rather than editing copy.

### Deleted

`Trail.{ui,spec,stories}.tsx` and everything that fed it: `trailFor` and its
private `holdsFor`, `answeredTrailFor`, `createKantoTrailProps`, the
`describe("trailFor")` block, and three story args. `terminal-theme/Trail` is a
different component and was left alone.

**This fixed the two `PollScreen.spec.tsx` tests that had been red all session.**
They expected a `<nav>` as a direct child of the screen body; Trail actually
rendered nested inside `Question`'s facts row, so the nav was never there.

### Built

- `Tooltip.ui.tsx` — the hover panel extracted from `ConfigChip`'s hand-rolled
  classes. `{ hint?, label, children }`; the panel is `aria-hidden`, so the
  trigger is a real `<button aria-label>` and the rule is reachable by keyboard.
  Returns children bare when there is no hint.
- `ScoringRule.ui.tsx` — the popup body, in Marciano's wording.
- `pollLabelFor` → "Poll 4 out of 5"; `pollCorrectFor` → "34/55 correct" from
  `gateStake.unitsHeld` (which existed with no consumer, documented for exactly
  this) over `scoringSlotsAt(gate)`.
- `coverageReadingOf` in `CoverageBar.ui.tsx` → "62% SHAKY", reusing the exported
  `coverageBandOf` rather than adding a third band classifier.
- `auditsFiringOf` in `Audit.ui.tsx` → "2 firing". `auditPropsOf` already filters
  to unsuppressed audits, so the count is honest.
- `PanelV2.Header` gained `badge?: { label, color? }` for the category, and its
  `META` lost `shrink-0` (five state badges would have run off a phone).

### Moved

`Question` shed its facts row — category, categoryColor, wrongCost — to the poll
panel's header. `questionFactsOf` is exported so the header and the component
cannot drift. Seven `Question.spec` tests were RELOCATED to `PollScreen.spec`,
not deleted: the behaviour still exists, one level up.

`Fold` now wears `PANEL_V2_SURFACE` with a padded summary and a
`group-open/fold:border-b` rule, so BuildFooter matches the other panels while
keeping its sticky pin and its fold. ADR-069 stands untouched.

## A regression worth remembering

Deleting Trail silently removed the `.length` config's ONLY visible surface — its
"3 correct answers in this gate" badge. `configStories.spec.tsx` caught it. The
tally is now a cerulean badge in the poll panel's head, via `pollHoldsFor`.
Deleting a component can delete a config's whole effect; check what reads a
viewmodel helper before deleting it with its caller.

## Flagged, not silently fixed

The popup wording is illustrative, not exhaustive. The real ladder clamps partial
shares to quarter steps of 1/4-3/4, so "2 of 3 right -> 1.5" is right but "1 of 3"
also lands on a quarter share and pays 0.5, which the three lines do not cover.

Panel labels are capitalised ("Coverage", "Audits", "Poll 4 out of 5", "Build")
to match the panels already shipped on New run and Prep, not lowercase as the
mock drew them. One word each to change if he prefers the mock.

## Verification

- `PollScreen.spec.tsx` 31/31, including the two that were red all session.
- `npm test` — 4299 passed, 6 skipped, 2 todo. Only the 2 pre-existing
  `gate.model.spec.ts` "floor rule" failures remain, untouched by this work.
- `npm run lint` clean, `lint:arch` no violations (983 modules),
  `npx tsc --noEmit` 0 errors.
- wiki "three standing facts" and "one column" sections rewritten (both were
  already stale, still describing the ADR-068 ring); CHANGELOG entry added.
