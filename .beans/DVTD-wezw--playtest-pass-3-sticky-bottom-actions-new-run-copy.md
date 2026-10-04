---
# DVTD-wezw
title: 'Playtest pass 3: sticky bottom actions, new-run copy, and the scoring popover on a phone'
status: completed
type: task
priority: high
created_at: 2026-09-23T19:13:00Z
updated_at: 2026-09-23T19:13:12Z
---

Third round on the kanto run screens (2026-09-23), following DVTD-l0dm and DVTD-lvri.

## Todos

- [x] New-run build note becomes "Select configs up to 4 weight units"
- [x] New-run registry note removed
- [x] Every screen's bottom action is sticky on mobile
- [x] Scoring popover: stack on a phone, head reads "Score info", drop "before the build multiplies it"
- [x] "what each poll paid" becomes "Score"
- [x] The coverage lead line under the bar is smaller
- [x] Panel headings wrap instead of breaking the label mid-phrase

## Summary of Changes

- **`ScreenActions`** (new export in `ScreenFooter.ui.tsx`) replaces the `<Panel><Panel.Body><ScreenFooter rule={false}/></Panel.Body></Panel>` idiom that six screens repeated verbatim, and carries `sticky bottom-0 z-20 md:static`. `PollScreen` deliberately keeps the plain panel: `BuildFooter` already owns that screen's pinned bottom slot and two bars would land on each other.
- `NEW_RUN_BUILD_NOTE` is now `Select configs up to ${BASE_SLOTS} weight units`. `NEW_RUN_REGISTRY_NOTE` and `NewRunScreenProps.registryNote` are deleted outright rather than left unwired.
- `ScoringRule`: `HEAD` is a plain block reading "Score info", `META_WORDS` deleted, and each case is `flex-col` until `sm` (the tooltip is only 288px wide on a phone).
- `WHAT_EACH_POLL_PAID` -> "Score" (shared copy, two surfaces).
- The poll screen's coverage `Lead` went from `paragraph` to `caption`.
- `Panel.Header` gained `flex-wrap`, so meta drops to its own line instead of squeezing "Poll 1 out of 5" in half.

186 test files / 3592 tests pass; typecheck clean; lint clean (4 pre-existing warnings); depcruise and docs:check green.
