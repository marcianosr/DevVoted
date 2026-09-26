---
# DVTD-hthx
title: Kirby's Air Ride checklist for polls and awards discovery
status: draft
type: feature
priority: normal
created_at: 2026-05-14T07:15:47Z
updated_at: 2026-05-14T07:16:04Z
parent: DVTD-lwvx
---

A grid-based checklist (inspired by Kirby's Air Ride City Trial checklist) applied to two collections: discovered polls and earned awards. The grid is the core mechanic — filled cells show what you have, dark/unknown cells create curiosity and pull players forward.

## The mechanic

A grid where each cell is either filled (discovered/earned) or a dark slot (unknown). The shape of what you don't have is as motivating as what you do.

Two grids, same concept:

### Poll checklist
- Rows: categories (CSS, JS, HTML, etc.)
- Columns: individual polls within the category
- States: ??? (never encountered) → Encountered (answered at least once) → Mastered (answered correctly)
- Unknown polls show a blurred/silhouetted question mark — you know something is there, not what it is
- Connects to the existing PollDex concept in DVTD-16

### Award checklist
- Rows: categories (11 total)
- Columns: award metrics (coverage, streak, participation + future ones)
- States: locked (dark slot, shows award name but not condition) → earned (filled, shows when you earned it)
- Alternative: fully hidden until earned — name and condition both ??? — players discover the system by playing
- 33 cells total (3 × 11), expandable as new metrics are added

## What makes it curious

- You see the shape of the full collection immediately — the gaps do the work
- Unknown cells create questions: 'what is that third HTML award?'
- Fully hidden variant is more mysterious but less actionable — players can't work toward something they can't see
- Recommended: show award name, hide condition until earned — gives direction without spoiling the unlock moment

## What makes it impactful

- First time players realise the awards system exists is when they see the empty grid
- Category completion (all 3 awards in a row filled) should trigger something — ties into bundle mechanic from DVTD-16
- Grid lives on profile page alongside PollDex — your personal record, visible to others on your profile

## Open questions

- Should others be able to see your checklist on your profile, or only you?
- Should the poll checklist and award checklist be the same page or separate?
- What triggers the cell fill animation — on earn, or on next page load?
