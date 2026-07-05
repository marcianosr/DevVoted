---
# DVTD-2z7o
title: Shareable daily result — plaintext CI-pipeline build card
status: in-progress
type: feature
priority: high
created_at: 2026-07-03T14:52:06Z
updated_at: 2026-07-03T15:04:35Z
---

Outward-facing acquisition loop: after answering the daily poll, player copies a spoiler-free, ego-safe 'build result' (Wordle-style emoji text) to paste into Slack/Discord/DMs. Everyone gets the same daily poll -> shared substrate.

PRIMARY artifact only this session (90% of value). OG image = follow-up (see DVTD-vp01).

Copied shape (CI-pipeline themed):
  DevVoted — Build #<dayNumber> 🟢
  Pipeline: ✅ ✅ ✅ ✅ ❌   (Gate <n> cleared)
  Coverage:  JS ████░  CSS ███░░  Git ██░░░
  🔥 <streak>-day streak · beat <percentile>% of devs
  Today's <category> check stumped <hardPct>%. Think you'd pass?
  ▶ https://devvoted.com

## Ego-safety hard rules (feature dies if broken)
- NEVER reveal which polls were wrong or the correct answers. ✅/❌ = how FAR, not WHICH.
- Average/bad day must still look worth sharing (gate reached, streak, percentile) — never raw "you failed".
- Last line challenges the READER, never a confession.
- devvoted.com link MUST be in copied text.

## Decisions (from user)
- Scope: primary plaintext card only this session.
- Build #1 = date of first daily poll (global day number).
- Coverage row = player's top 3 categories by coverage in the run.
- Daily-login streak does NOT exist yet -> streak is optional/omitted; flag as prerequisite.

## Architecture (two-tier UI rule)
- Pure string builder: src/domains/runs/utils/buildDailyResultShare.ts (+ .spec.ts). No React.
- UI: src/ui/runs/DailyResultShare.ui.tsx (+ .stories.tsx) plain props, mock-renderable.
- Wiring: src/domains/runs/components/DailyResultShare.component.tsx — zero HTML/CSS, clipboard side-effect.

## Todo
- [x] Pure builder buildDailyResultShare() returns exact string shape
- [x] Build-number helper (days since launch epoch)
- [x] Coverage-bar helper (0..1 -> █████ of fixed width)
- [x] Unit tests: pipeline row, streak omitted when undefined, NO correct-answer text ever in output, ego-safe framing
- [x] DailyResultShare.ui.tsx (Copy result + Share buttons) + inline aria-live confirm
- [x] Storybook story from mock factory data (StrongDay/Copied/RoughDayNoStreak)
- [x] Wiring component: maps data, builds string, clipboard + share intent, mounted in DailyPollContainer
- [x] Flagged daily-login streak prerequisite + percentile decision handoff

## Summary of Changes

Primary artifact shipped end-to-end. All ego-safe rules unit-tested. Reuses existing CommunityStats + Run.categoryCoverage + PipelineEvaluationContext — NO new queries.

Files:
- src/domains/runs/utils/buildDailyResultShare.ts (+spec, 13 tests)
- src/domains/runs/utils/toDailyResultShareData.ts (+spec, 8 tests)
- src/ui/runs/DailyResultShare.ui.tsx + stories
- src/domains/runs/components/DailyResultShare.component.tsx (mounted in DailyPollContainer)
- src/config/app.ts (DEVVOTED_LAUNCH_DATE)

## Open decisions / follow-ups
- derivePercentile() is a STUB (guided TODO) — honest "beat X% of devs" derivation handed to owner. Default: viewerCorrect ? stumpedPct : 0.
- Daily-login streak feature does NOT exist — streakDays optional, currently never passed (line omitted). Prerequisite for full impact.
- OG image (secondary) remains DVTD-vp01.
- DEVVOTED_LAUNCH_DATE placeholder 2026-04-27 must be set to real min(daily_polls.date).
