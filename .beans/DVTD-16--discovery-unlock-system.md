---
# DVTD-16
title: Discovery / unlock system
status: draft
type: feature
priority: normal
created_at: 2026-04-27T15:08:09Z
updated_at: 2026-05-11T10:39:33Z
parent: DVTD-lwvx
---

A system for players to discover and unlock configs, poll types, and cosmetics over time.

- Undiscovered configs show as '???' with visible unlock conditions (e.g. 'Beat 8 CI gates in a single run')
- Config discovery progress page: X/Y unlocked per rarity (Common 24/30, Rare 9/15, etc.)
- Bundles: Stardew/Kirby-style achievement clusters with permanent meta-rewards
- Stacks: grouped category unlocks (Frontend Stack, React Stack, Full Stack, etc.)
- PollDex: collectible poll registry with states (???, Encountered, Mastered) and per-poll stats
- **Category titles** (e.g. Markup Master, Semantic Scholar) are earnable as permanent meta progress within runs — unlocking one persists to the player profile across runs and can yield a one-time reward
- Titles have threshold conditions tied to in-run stats (coverage, streak, correct answers, participation) — unlocking is detected at run end or within a run when the threshold is crossed
- Undiscovered titles show as '???' until earned; earned titles are displayed in the profile/dev card awards gallery
