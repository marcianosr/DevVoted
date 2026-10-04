---
# DVTD-s6c6
title: The peel names the move that pays it
status: completed
type: feature
priority: normal
created_at: 2026-10-03T16:32:24Z
updated_at: 2026-10-03T16:50:31Z
---

**What:** A held gate shows one press that names the move that pays the peel: storage, one config, or a mix when nothing covers it alone.

**Why:** Today every route shows at once and the player has to work out which one settles the bill.

## Done when
- [x] When storage and a config can each pay, both show, storage first, and picking a config renames the press
- [x] When only configs can pay, the press waits for a pick and states how short storage is
- [x] When nothing pays alone, the player can still combine drops and storage
- [x] A caught close still asks for the catch first
- [x] Ending the run sits in the same panel as the retry

## Notes
Plan: ~/.claude-work/plans/depending-on-the-possiblity-witty-wind.md

## Summary of Changes
- peelPlanOf / peelPicksOf in gateOutcome.viewmodel derive the move (settled, single, mix, stuck); the held frame's picks are normalised so the press sends the move shown.
- GateChoice.ui rebuilt: headline, catch section, one Action press, radio rows (Pick gained a radio shape) or the ADR-126 mix block, End the run in Panel.Footer.
- Retry press now comes from the choice; GateOutcomeScreen passes it as press.
- Fixtures for each mode, stories per mode, specs rewritten. ADR-179, wiki, changelog.
