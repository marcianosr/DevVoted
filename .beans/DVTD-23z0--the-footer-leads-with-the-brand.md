---
# DVTD-23z0
title: The footer leads with the brand
status: completed
type: feature
priority: normal
created_at: 2026-09-28T09:18:51Z
updated_at: 2026-09-28T09:23:18Z
---

**What:** The site footer becomes a bordered card led by the brand mark, with the word, a tagline and the counts stacked beside it, and the commit provenance plus a bug link trailing right.

**Why:** The footer is the last pre-logo surface in the app, so the brand stops at the top bar and the page ends in a centred wall of grey text.

## Done when

- [x] The mark sits left of a stacked block, not inline with the word
- [x] The word, the tagline and the counts read as three lines of one block
- [x] The trailing row names who made the last change and when
- [x] Reporting a bug is one press from every screen
- [x] The footer keeps its own colours instead of following the screen
- [x] The ampersand in the tagline renders as a character, not as its escape

## Notes

The lockup gains a slot rather than the footer rewriting the word, because the brand name has
one owner and the mark-only mode hides the word instead of dropping it, so a hand-written copy
would be announced twice.

The trailing byline is build data, not a constant. The two sources disagree in shape: the host
hands back a login, the local fallback hands back a display name, so a local build reads a full
name after the at-sign. Accepted rather than mapping one to the other.

The card pins itself to the neutral colour. Without the pin it repaints with whatever screen
sits above it, which contradicts the decision that the brand keeps its own colours.

## Summary of Changes

The lockup gained one optional slot. With nothing in it the markup is byte-for-byte what it
was, so nothing that already draws the brand moved; with something in it the word and the
slot share a column and the mark sits beside that column rather than beside the word. The
size classes stayed on the outer element because the gap and the mark are both sized in ems
off the word, so moving them would have broken the one thing the lockup guarantees.

The slot holds two lines: what the game is, and what it holds. The counts kept their exact
shape, including dropping their own separator while the poll total is still unknown.

The trailing row states the last change and offers the bug report as a press rather than a
sentence with a link inside it. The press is drawn as a link because it navigates; the kit's
own press renders a button with no way to carry a destination, and teaching it one for a
single use would have touched every screen that presses anything.

An unused slot on the footer's props was deleted. Nothing outside the file had ever filled it.

Verified: 4424 tests pass across 227 files, boundaries clean, docs in sync, build and types
clean. The build's new value was confirmed by reading it back out of the compiled bundle
rather than trusting the config.

### Reversals worth knowing

The escaped ampersand in the tagline never shipped. It was introduced in this same unreleased
stretch when the sentence moved out of markup and into a value, where an escape stops being
an escape and becomes six literal characters. It is fixed here but earns no changelog line,
because the rule is that a fix is only logged when the break was released.

The footer sits inside the page's main region, so it is not read as the page's foot by a
screen reader. That predates this work and was left alone: the only element making the footer
sink to the bottom of a short page is the main region it sits in, so moving it out is a layout
change, not a one-line fix. Wants its own bean.
