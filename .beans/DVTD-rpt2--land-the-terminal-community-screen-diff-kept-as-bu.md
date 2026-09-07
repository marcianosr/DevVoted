---
# DVTD-rpt2
title: Land the terminal community screen diff (kept as built)
status: todo
type: task
created_at: 2026-09-07T14:02:06Z
updated_at: 2026-09-07T14:02:06Z
---

The full DVTD-wii3 implementation sits UNCOMMITTED in the working tree, scope re-confirmed 2026-09-07 as keep-as-built: /run/community serves the terminal CommunityScreen via CommunityView.component, six-award standouts rework (ADR-065), RunState.configsLost counter, borders on all community reads, ADR-065 + wiki 7.1/7.3 + CHANGELOG entries. Verified: lint+depcruise clean, build clean, 3790/3801 tests (3 pre-existing modern RewardScreen failures). Parked behind the modern-theme / legacy UI deletion Marciano wants to do first; review and commit this diff after (or alongside) that cleanup. A narrowed storybook-only counter-proposal from a planning agent was explicitly rejected in favour of keep-as-built.
