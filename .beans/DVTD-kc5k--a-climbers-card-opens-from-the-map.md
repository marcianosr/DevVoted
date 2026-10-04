---
# DVTD-kc5k
title: A climber's card opens from the map
status: completed
type: task
priority: normal
created_at: 2026-09-26T09:12:18Z
updated_at: 2026-09-26T09:23:02Z
parent: DVTD-2fy8
---

**What:** Tapping a climber opens a card about them: who they are, the title they wear, where they stand, what they run, and how they are doing.

**Why:** The map says where everyone is and nothing about who they are, and a build row under the track is not the card the board deserves.

## Done when

- [x] Pressing an avatar opens a foldout on a phone and a popup on a wide screen, and closing it is obvious
- [x] The card names the player, links them to GitHub and shows the title they wear
- [x] It states their gate, how their last gate closed, their coverage, their weight and their storage
- [x] It draws their build the way every other screen draws a build
- [x] Streak, best category and current gate each read as their own tile
- [x] The card says plainly what about a run stays private
- [x] Specs and stories cover the card, and the map still passes

## Notes

- Plan: `~/.claude-work/plans/1-example-2-yeah-glowing-liskov.md` (top section), approved 2026-09-26 from two mocks.
- Decisions (Marciano, 2026-09-26): storage, coverage and streak become public on a live run and ADR-101 is amended to say so; best category means most correct answers lifetime, off the objective counters; no action buttons yet, and "Pin as rival" is explicitly out.
- The popup anchors to the map, never to the chip: the track is a horizontal scroller and would clip it. That is the same reason the first version put the build in a row under the track.
- Dismissal uses the house patterns only, a real close press plus the existing toggle-off. Nothing in this repo traps focus, handles Escape or locks scroll, and this is not the bean that introduces the first.
- The board spends its one primary press on the header (ADR-117), so every press on the card is secondary.
- The gate is stated twice on purpose: the status line carries it as the mock draws it, and it also gets its own tile as asked.
- Builds on DVTD-4nkm, which drew the map itself.

## Summary of Changes

Pressing a chip on the climb map now opens a card about that climber: a foldout on a phone, a
panel under the track from `sm`.

**The card** (`ClimberCard.ui.tsx`): avatar wearing the same marks its chip does, the name
linked to GitHub when the account has a handle, the worn title beneath it, then a status line
(gate, closing band as a coloured word, coverage percent), a weight-and-storage line, the whole
build as config chips with the vendor lock badged, three tiles (streak, best category, current
gate) and a footer stating what a card never shows. It closes on its own press or on a second
press of the chip, which already toggled.

**It anchors to the map, never to the chip.** The track is a horizontal scroller and would clip
a panel hung inside it. `CARD_PANEL` is exported as the kit's fifth copy of the sheet-then-
anchored recipe, and the first one that is a shared constant.

**Privacy moved, deliberately.** ADR-101 §2 was narrowed: storage, coverage banked so far and
streak are public on a live run. The rule is now "what a run knows that you do not" rather than
"everything else", so picks, peeks, estimates, the promised band, an armed wager, whether an
attack is held and prefetch stay private for a stated reason. The ADR carries the amendment,
its date and a rejection note explaining why hiding storage protected nothing.

**New public reads**, all on the existing climbers query, no extra round trip per card: GitHub
handle, equipped title resolved through the roster, `run_states.coverage` in units (converted
by `runCoverageOf`, never in SQL), streak and storage by JSON path, and a best category from
the lifetime objective counters in one grouped query for the whole board. `publicSpaceOf`
gives the "of 16" half of the weight, vendor lock exempt, mirroring what a live build rents.

**Storybook**: new `Kanto/ClimberCard` with four stories (a rival, a bare build, a fallen run,
your own), `Kanto/ClimbMap` gains a phone-width foldout story, and the community screen gains a
board-with-a-climber-open story. `npm run build-storybook` passes.

**Docs**: ADR-101 amended, CONTEXT.md gained Climb standing and Public build space rows, the
wiki's climb-map paragraph rewritten (it still claimed storage was not shown), CHANGELOG entry
naming the privacy change in plain words.

Verified: typecheck clean, lint clean (741 modules, 0 dependency violations, wiki in sync),
full suite 204 files / 3917 tests pass, Storybook builds.

Not done, by decision: no action buttons. Profile pages render nothing for another player and
the Dex is your own collection, so the only working destination is the GitHub link. "Pin as
rival" was explicitly out of scope.
