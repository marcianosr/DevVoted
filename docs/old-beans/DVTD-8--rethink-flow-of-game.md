---
# DVTD-8
title: Rethink flow of game
status: completed
type: feature
priority: high
created_at: 2026-04-27T12:10:00Z
updated_at: 2026-04-30T17:59:23Z
parent: DVTD-4
---

The game flow doesn't feel right after submitting an answer to a poll. Currently: answer → results page → optional shop. Issues to address:

- The shop needs a stronger nudge/call to action — players miss it
- There is a lot happening post-answer: scoreboard, community stats, category chances, shop, etc.
- Priority of these elements needs to be decided — what should the player focus on first?

## Design decisions

- **Single URL** (`/daily-poll`) — no redirects between steps, solves the tab-close escape problem
- **Full-viewport steps** — each step takes up the full screen like a game screen, no scrolling required. Focus over document.
- **Existing components stay as-is** — pipeline display, shop, community blocks are kept. Structure changes, not content.

## New flow

```
[Poll answering page]
  Gate check tension surfaced HERE — player knows a gate is coming before answering
       ↓ submit answer
  [If gate fails] → /game-over
  [If gate passes] → pipeline selection (this IS the celebration moment)

[Step 1] Result + Pipeline status (combined, full viewport)
  — correct/wrong, score delta, coverage change
  — pipeline progress, what's needed, polls left to gate
  — existing pipeline display component

[Step 2] Pipeline selection (forced, only when applicable)
  — selecting your next stake/gate = the gate clear reward

[Step 3] Shop (forced step, requires deliberate skip)
  — skip is allowed but a conscious action, not an accident
  — skip label should clearly show reward: "Skip (+50KB)"
  — auto-expires when next poll opens (current behaviour, keep it)

[Step 4] Community + leaderboard + tomorrow's category chances
  — revealed after completing/skipping shop
  — browsing content, low urgency, high dwell time

[Stepper nav]
  — free back navigation between all steps at any time
  — player can revisit result, reopen shop, check pipeline after completing flow
```

## Player states (state machine)

- `answered` — just submitted, sees Step 1
- `pipeline_pending` — must select next gate/stake (forced)
- `shop_pending` — hasn't visited shop yet this round
- `shop_done` — visited shop or deliberately skipped
- `waiting` — nothing left to do until tomorrow's poll

## Key principles

- Pipeline status is the #1 priority after answering — concrete urgency ("You need 4% more CSS, 3 polls left")
- Shop requires a deliberate skip, not an accidental miss
- Gate check drama (every 5 polls) belongs on the poll answering page, not post-answer
- Pipeline selection screen doubles as gate-clear celebration
- Config effect timing (some active during answering, some after) is a separate discussion

## Summary of Changes

Implemented a 4-step post-answer flow on a single URL (`/daily-poll`), replacing the everything-at-once results page.

**New files:**
- `PostAnswerFlow.tsx` — step orchestrator with stepper nav, step state, auto-advance logic
- `CommunitySectionDisplay.tsx` — community section extracted from SelectedOptionsSummary

**Modified:**
- `SelectedOptionsSummary` — community section removed (now in step 4)
- `DailyPollContainer` — uses PostAnswerFlow instead of PollResultsSection/PipelineUpgradeContainer
- `ShopContainer` — skip button now shows reward: Skip (+64KB)

**Deleted:**
- `PollResultsSection.tsx` — replaced by PostAnswerFlow
- `PipelineUpgradeContainer.tsx` — replaced by PostAnswerFlow

**Step sequence:**
- Step 1: Results + pipeline status
- Step 2: Pipeline selection (only when gate passes, auto-advances after selection)
- Step 3: Shop (deliberate skip = +64KB, Continue button always available)
- Step 4: Community + leaderboard + category weights

Back navigation via stepper dots to any visited step.
