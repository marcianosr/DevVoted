---
# DVTD-q519
title: Flatten Title/Subtitle typography to single styles
status: completed
type: task
priority: normal
created_at: 2026-08-01T07:52:05Z
updated_at: 2026-08-01T07:56:05Z
parent: DVTD-oed6
---

Strip all variant styling from the shared Title/Subtitle components (grew out of DVTD-oed6's PanelHeading prototype).

## Summary of Changes

- Title: no more size/tone/category props — always 'text-md text-zinc-200 tracking-tight', default h1, 'as' + className kept.
- Subtitle: always 'text-xs text-zinc-400 font-medium tracking-tight', default changed p -> h2; StatBadge and OutcomeTile labels pinned to as="p" to keep the heading outline sane.
- ~14 call sites swept (size/tone/category props removed). Pass/fail headline colors in GateRewardReport and RunSummary preserved via className (game feedback, not decoration). PollCard question title lost its category tint; the card container still themes badges.
- ConfiguringScreen PanelHeading now uses Title/Subtitle again (components render the prototyped markup exactly).
- Title/Subtitle specs rewritten, category/gradient stories removed.
- Verified: tsc clean, 975 tests pass (106 files), oxlint + depcruise clean.

## Follow-up (same day)

Marciano asked the themed title back: Title regained the optional `category` prop (categoryTheme attrs + text-theme replacing text-zinc-200 when set). PollCard question title re-themed; themed spec test and CategoryAccent/ThemedTitle stories restored. size/tone stay gone.
