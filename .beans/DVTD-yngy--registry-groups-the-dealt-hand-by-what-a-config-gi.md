---
# DVTD-yngy
title: Registry groups the dealt hand by what a config gives
status: completed
type: feature
priority: normal
created_at: 2026-09-27T13:10:46Z
updated_at: 2026-09-27T13:24:43Z
---

**What:** The new run Registry groups its dealt configs under Coverage, Storage, Answer help, Risk and Misc headings, with a row of filter chips above them.

**Why:** A new player reads five effect paragraphs and guesses. Naming the axes a build can be built on teaches the choice instead of making it for them.

## Done when

- [x] Every config in the roster resolves to exactly one group, derived from its effect fields
- [x] The Registry on a new run reads as headed sections, one per group the hand holds
- [x] A chip cuts the offers to one group and a second press restores them
- [x] The helper row can be hidden, and stays away when the hand holds one group
- [x] No config wears a suggested badge, and nothing computes one
- [x] The shop registry is unchanged

## Notes

Supersedes ADR-055 Decision 1's "no replacement grouping axis is introduced". The axis is derived from effect fields rather than stored on the roster, is a heading rather than a hue, and is read only by the new run viewmodel.

## Summary of Changes

`configGroup.model.ts` derives one of coverage / storage / answerHelp / risk / misc from the effect fields a config already declares, reusing `touchesCoverage` for the coverage arm so the group cannot drift from the coverage engine. First match wins and risk is tested last, so a coverage config with a cost groups by what it pays.

`newRunScreen.viewmodel.ts` took over the hand-to-chip mapping and gained `newRunGroupsFor`, `newRunHelpFor` and a `newRunRegistryFor` that filters groups and offers in one expression. `Registry.ui.tsx` renders `role="group"` sections when handed groups and is byte-identical without them, so ShopScreen is untouched. `RegistryHelp.ui.tsx` is new, built entirely from the existing `Button` primitive.

Deleted: `recommendedPicks`, `RECOMMENDED_SIZE`, `RunView.recommendedConfigIds`, `SUGGESTED_LABEL` and the `suggested` field on `HandCard`, with their specs and fixtures.

ADR-127 records the decision and amends ADR-055 D1. `docs/wiki.md` gained a generated `CONFIG_GROUPS` block wired into `scripts/wiki-sync.ts`, so the counts fail CI if they drift.

Verified: `npm test` 4194 passed (one pre-existing unrelated failure in `Screen.spec.tsx`), `npm run lint` clean, `npm run build` + `tsc --noEmit` clean.
