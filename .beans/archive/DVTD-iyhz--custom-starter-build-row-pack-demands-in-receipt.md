---
# DVTD-iyhz
title: Custom starter build row + pack demands in receipt
status: completed
type: feature
priority: normal
created_at: 2026-08-10T12:19:12Z
updated_at: 2026-08-10T12:27:43Z
---

Follow-ups on DVTD-46q8 from playtest: (1) veterans want to assemble the starter build themselves — add a "Build your own" row after the packs that opens the classic bench, with a way back; (2) picking a pack gives no feedback on what the build demands ("I chose Cold Start, but... ok?") — the intro receipt's Objective must itemize the picked build's demands (view.demands) instead of the vague "Clear your pipeline".

## Todo

- [x] PackPicker: onCustomBuild row
- [x] ConfiguringScreen: customBuild state + back-to-packs
- [x] ~~GateStakeReceipt: demands list~~ superseded mid-build: selected pack expands into RoleList instead (Marciano flagged the receipt itemization as inconsistent with bench mode)
- [x] Wire proto-run + RunConfigure (no demands plumbing needed — RoleList reads configs+checks already on the screen)
- [x] Specs + stories
- [x] CHANGELOG

## Summary of Changes

- PackPicker: "Build your own" action row (outside the radiogroup) + `selectedDetail` — the selected pack renders as a container (header radio button + detail below) so interactive RoleList rows never nest inside a button; unselected packs keep plain chips.
- ConfiguringScreen: `customBuild` local state — Build your own opens the classic bench with a "← Back to packs" button (only when packs were offered); selected pack expands into `<RoleList rows={roleRows(configs, checks)} />` (read-only: no onRemove/slots).
- Receipt demands itemization built then REVERTED same session: Marciano playtested it and flagged the inconsistency (pack pick itemized objectives, self-assembly did not). Consistent answer: the pipeline rows are the single "what am I playing against" surface in both modes; receipt identical everywhere.
- ADR-026 Decision 1 updated with the expansion + no-duplication rationale; CHANGELOG reworded.
- Verified: tsc clean, lint clean, 683 run-module tests pass (same 8 pre-existing failures as HEAD).
