---
# DVTD-u42k
title: The pipeline row list repeats the spot track
status: completed
type: task
priority: high
created_at: 2026-08-27T20:12:20Z
updated_at: 2026-08-27T20:18:47Z
---

Marciano, on the New run screen: *"I still also see the pipeline list items, these are redundant I think."* Correct, and his mock shows why — its "Your pipeline" panel is the **track and nothing else**.

Adding the track without removing what it replaced left every fact drawn twice:

- a picked config is a labelled bar **and** an `Entry` row
- a free spot is a dashed cell **and** a "Not filled yet" row
- the widening is a "opens when gate 3 clears" row, while the track's own `note` slot exists for exactly that

I even wrote a test asserting a picked name appears *three times* (deal row, pipeline row, track bar) and treated that as a fact rather than the smell it was.

## The rule

**The track owns the room; rows own detail and actions.** So:

- Empty-spot rows and the grant row go **everywhere** (Start, Prep, Shop). The track draws free room; the widening moves into the track's `note` (`4 spots · 6 at gate 3`).
- **Start**: the config rows carry name, glyph and rate — all three already on the deal row beside them and on the bar. The whole list goes, matching the mock.
- **Prep** and **Shop**: config rows stay. Prep's carry the facts line and explainer, the shop's carry minify/upgrade/uninstall. Neither is derivable from a bar.

## Todo

- [x] StartScreen: drop the pipeline item list; widening into the track's note
- [x] PrepScreen: drop the free-spot rows and the grant row
- [x] ShopView `pipelineRows`: same
- [x] Rewrite the specs that assert the deleted rows
- [x] lint, build, test

## Summary of Changes

**The rule applied: the track owns the room, rows own detail and actions.**

Empty-spot rows and the grant row are gone from all three surfaces (Start, Prep,
the live Shop). The track's dashed cells already draw free room, and the widening
moved into the track's own `note` slot: `4 spots · 6 at gate 3`.

**Start's pipeline panel is now the track and nothing else**, matching the mock.
Its rows carried label, glyph and rate — every one of which is on the deal row
sitting beside it and on the labelled bar. `Slot` is no longer imported there.

**Prep and the Shop keep their config rows.** Prep's carry the facts line and the
explainer; the shop's carry minify, upgrade and uninstall. Neither is derivable
from a bar, so neither is redundant.

`PrepSpotGrant` gained `spots` so the note can state the width rather than only
the gate.

## The test that should have caught this

I had written, and defended in a comment, an assertion that a picked config's name
appears **three times** — deal row, pipeline row, track bar. That was the
duplication stating itself, and I recorded it as a fact. It now asserts twice, and
the comment says which two.

Six other specs asserted the deleted rows ("Not filled yet" counts, "opens when
gate N clears") and were rewritten against the track: the meter's `aria-valuenow`
/ `aria-valuemax`, and the note's text.

## Verification

`npm run lint` clean (786 modules, 3236 dependencies) · `npm run build` clean ·
`npx vitest run` **2545 passed, 3 failed** — the documented `RewardScreen`
baseline (DVTD-9dn0). Same count as before: seven assertions were rewritten rather
than added, which is what removing a duplicated surface should look like.

Story fixtures updated with the screens (`PrepScreen.stories`,
`screens/ShopScreen.stories`); no `slots`-era errors remain in the story tree.
