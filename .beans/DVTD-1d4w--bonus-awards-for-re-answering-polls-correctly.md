---
# DVTD-1d4w
title: Bonus awards for re-answering polls correctly
status: todo
type: feature
priority: normal
created_at: 2026-07-22T12:39:04Z
updated_at: 2026-07-22T12:39:10Z
parent: DVTD-u35m
---

Award bonuses when players correctly answer polls they've previously answered, encouraging repeated engagement and memory building

## Mechanics

- [ ] Track which polls a player has answered correctly before
- [ ] Detect when a previously-answered poll appears in a new run
- [ ] Award bonus when re-answer is correct:
  - Coverage bonus (e.g., +5% or +10%)
  - Storage bonus (e.g., +50KB)
  - Or special badge/award visual
- [ ] Scale bonus based on time since original answer or number of correct re-answers
- [ ] Wrong re-answer: no bonus (and maybe slight penalty/reset streak?)

## Data Model

- [ ] Store answer history per poll per player (correct/incorrect)
- [ ] Track re-answer attempts and bonuses earned
- [ ] Query: "has player answered this poll correctly before?"

## UI/UX

- [ ] Show indicator on poll when it's a re-answer (e.g., "You got this before! ✓")
- [ ] Celebrate bonus in reveal screen (animated chip or special highlight)
- [ ] Track re-answer stats on community/profile pages
- [ ] Optional: show streak of consecutive correct re-answers

## Progression Ideas (future)

- Mastery tiers: 1 correct re-answer, 3 correct, 5+ correct on same poll
- Unlock special border or config after mastering N polls
- Leaderboard for most polls mastered or highest re-answer streak
