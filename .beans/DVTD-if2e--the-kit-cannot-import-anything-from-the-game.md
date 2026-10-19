---
# DVTD-if2e
title: The kit cannot import anything from the game
status: completed
type: task
priority: normal
created_at: 2026-10-16T08:07:20Z
updated_at: 2026-10-16T08:40:11Z
parent: DVTD-5303
blocked_by:
    - DVTD-3gsf
---

**What:** The last kit parts that know a game type take plain values instead, and a lint rule blocks any new game import into the kit.

**Why:** Without the rule the kit drifts back into knowing the game.

## Done when

- [x] No kit file imports a game type, game copy or game helper
- [x] The architecture lint fails on a game import into the kit
- [x] The decision record for the two UI tiers states the stricter rule
- [x] Memories describing the old type-only rule are updated

## Notes

Screen + usePageTheme: KantoColor prop instead of SwatchTheme. Keycap: own state type instead of AnswerType. NewBadge: label prop instead of copy import. depcruise ui-stays-presentational: drop the type-only exemption for ^src/modules/, add ^src/shared/lib/(copy|storage|categories|profilePath|answerTypes). Flag the config change in the PR. Update ADR-010 Enforcement section, memories ui-takes-types-not-values-from-modules, build-new-run-ui-in-modules, index-kanto-kit.

## Summary of Changes

Fold lost four props no production caller passed (lead, leadShare, leadWidth, meta). Action takes a leading slot; the swatch drawing is PressSwatch in run/gate. Screen and usePageTheme take the kit's own GateTheme type. Keycap and NewBadge carry game meaning, so they moved to run/run instead of getting a made-up generic API. depcruise ui-stays-presentational became ui-is-a-portable-kit: no imports from modules (types included) or the game's shared/lib files; proven by two probe files that it rejected. Stories stay exempt (ADR-200). ADR-010 Enforcement updated.
