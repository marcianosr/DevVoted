---
# DVTD-e8rm
title: A visitor reads the record, not the collection
status: completed
type: feature
priority: normal
created_at: 2026-09-27T17:50:40Z
updated_at: 2026-09-27T18:12:18Z
---

**What:** A visitor's profile page leads with the player's record, states what they are climbing right now, and closes with completion counts.

**Why:** You arrive on somebody's page by pressing their face on a byline, a seat or the climb map, asking how they compare to you, and today the page answers with four bare counts.

## Done when

- [x] A visitor reads the player's deepest gate, swatches, finished runs and category seats
- [x] A visitor reads the standing and build of the run they have open today
- [x] Deepest gate and swatches state the visitor's own figure beside the player's
- [x] Nothing a run knows and the visitor does not is readable, and the page says so
- [x] Your own page is unchanged
- [x] The rule that limited a visitor to four counts is narrowed in writing

## Notes

The new reads are public and validated. Everything a visitor sees already crosses the
wire somewhere else: the live standing and build to the community board, the seats to
the leaders section, the run history to the owner's own collection tab.

Gates are stated once. Depth and swatches are different readings since a swatch needs
a flawless window, so the record carries both and the counts block carries neither.

## Summary of Changes

The visited page is four bands under the card: record, run history, climbing now,
collection. Your own page is untouched.

**Record** states the deepest gate ever reached, the swatches won, runs finished and
the category seats held, over a thirteen-gate swatch strip. Depth and swatches are
stated once each and never both in the counts block, because a swatch needs a
flawless window and depth does not. An open run counts towards depth. The two
headline figures carry the viewer's own beside them; the run count and the counts
block do not.

**Climbing now** draws the standing and build that were already public, and is drawn
even when nothing is open. The card's body became its own component so the community
board and the profile share one drawing of it.

**Collection** is counts only, archive on the heading, and says what it withholds.
Run rows carry no link, since a run's page states its answers.

The rule that limited a visitor to four counts was narrowed in writing rather than
worked around, and the wiki paragraph it came from was rewritten.

### Verified

- 4351 tests across 224 files pass
- lint, architecture boundaries and the wiki sync check all pass
- build and typecheck pass; Storybook builds
