---
# DVTD-3ej4
title: 'Design pass: chip title, duplicate refusal, gate marks, drop muisjes'
status: completed
type: task
priority: normal
created_at: 2026-09-27T17:32:25Z
updated_at: 2026-09-27T17:49:14Z
---

**What:** Five design fixes from a live playtest: the config chip loses its title and doubles its refusal copy, the poll press wears an odd gate glyph, the prep press carries a note that belongs in the swatch, and the newborn skin goes.

**Why:** A chip that cannot name itself is unreadable, and two phrasings of one refusal read as two separate facts.

## Done when

- [x] A config sitting a poll out states its reason once
- [x] Every config card shows its title, however tight the row
- [x] The poll press wears the gate's own colour, not a glyph
- [x] The prep press states the gate's poll count in its swatch and carries no note
- [x] The newborn skin is gone from the styles, the config and the changelog

## Summary of Changes

**One refusal, one owner.** `pollPressesOf` drops a press for any config whose
status is `skipped`, so the pewter badge is the only thing that says why. The
lint press's category-naming copy is deleted; it takes the plain refusal map
like peek always did.

**The card keeps its name.** The chip header wraps and the identity column holds
a floor, so presses drop below the name instead of shaving it to nothing. ADR-119
gains decision 6.

**The press wears the gate.** The answered-poll footer takes `gateMarkFor(gate)`
instead of the gate glyph, which ADR-117 decision 4 already asked for.

**The prep press counts its polls.** `prepPressNoteOf` is gone and the current
swatch carries the window instead. A counted mark is text inside the button, so
`Action` now always writes its own `aria-label`. ADR-117 decision 4 amended.

**The newborn skin is gone** — `src/config/skin.ts`, `public/skins/`, the app.css
block, the root and Storybook wiring, and its unreleased changelog bullet.

219 test files / 4280 tests pass, typecheck clean, `npm run lint` clean.
