# Leaderboards Wireframes ❄️

## Overview

This document contains wireframes for the expanded leaderboard system. All leaderboards support:
- Season filtering (dropdown)
- Category filtering (tabs or dropdown)
- Responsive design (mobile-friendly)

---

## 1. Main Leaderboard Hub

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            🏆 LEADERBOARDS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Season: [▼ Season 1        ]    Category: [▼ All Categories    ]          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Coverage   │ │   Polls     │ │   Streaks   │ │    Runs     │           │
│  │  Rankings   │ │  Answered   │ │  Champions  │ │   Played    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│       ↓ active                                                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ #   Player              Total Coverage   Best Streak   Polls        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  rare_wizard          94.2%           23            156          │   │
│  │ 🥈  banjo_master         91.8%           19            142          │   │
│  │ 🥉  pokemon_trainer      88.5%           17            138          │   │
│  │ 4   kazooie_fan          85.3%           15            125          │   │
│  │ 5   conker_champion      82.1%           14            119          │   │
│  │ 6   diddy_kong           79.4%           12            112          │   │
│  │ 7   mumbo_jumbo          76.8%           11            108          │   │
│  │ 8   gruntilda            74.2%           10            101          │   │
│  │ 9   bottles_mole         71.5%            9             95          │   │
│  │ 10  tooty_bear           68.9%            8             89          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                         [ Load More ]                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Coverage Leaderboard (By Category)

Shows coverage percentage rankings filtered by category.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       📊 COVERAGE LEADERBOARD                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Season: [▼ All Time        ]                                               │
│                                                                             │
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │  All  │  CSS  │   JS  │ React │  TS   │ HTML  │  Git  │General│         │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘         │
│     ↑ active                                                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     GLOBAL COVERAGE RANKINGS                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Coverage    Best Run    Categories Mastered │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  rare_wizard          94.2%      Run #42     7/7                 │   │
│  │ 🥈  banjo_master         91.8%      Run #38     6/7                 │   │
│  │ 🥉  pokemon_trainer      88.5%      Run #55     6/7                 │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


When category tab selected (e.g., "React"):

┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │  All  │  CSS  │   JS  │ React │  TS   │ HTML  │  Git  │General│         │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘         │
│                           ↑ active                                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     ⚛️ REACT COVERAGE RANKINGS                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Category     Polls       Best Streak        │   │
│  │                         Coverage     Answered                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  react_master         98.5%       45          12                 │   │
│  │ 🥈  hooks_hero           95.2%       42          10                 │   │
│  │ 🥉  component_king       92.1%       38           9                 │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Polls Answered Leaderboard

Shows who has answered the most polls, filterable by category.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       📝 POLLS ANSWERED LEADERBOARD                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Season: [▼ Season 1        ]                                               │
│                                                                             │
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │  All  │  CSS  │   JS  │ React │  TS   │ HTML  │  Git  │General│         │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘         │
│     ↑ active                                                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    TOTAL POLLS ANSWERED                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Total       Correct     Accuracy            │   │
│  │                         Answered    Answers                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  grind_master         523         478         91.4%              │   │
│  │ 🥈  poll_addict          498         421         84.5%              │   │
│  │ 🥉  quiz_champion        467         398         85.2%              │   │
│  │ 4   rare_wizard          412         389         94.4%              │   │
│  │ 5   banjo_master         398         352         88.4%              │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              HIGHEST SINGLE-RUN POLLS ANSWERED                      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Polls       Run         Date                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  marathon_runner       89         Run #156    Dec 25, 2025       │   │
│  │ 🥈  endurance_pro         82         Run #203    Jan 1, 2026        │   │
│  │ 🥉  poll_machine          78         Run #89     Dec 13, 2025       │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


When category selected (e.g., "CSS"):

┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │  All  │  CSS  │   JS  │ React │  TS   │ HTML  │  Git  │General│         │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘         │
│          ↑ active                                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    🎨 CSS POLLS ANSWERED                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              CSS         Correct     Accuracy            │   │
│  │                         Answered    Answers                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  flexbox_guru          156         142         91.0%              │   │
│  │ 🥈  grid_master           143         128         89.5%              │   │
│  │ 🥉  css_wizard            132         119         90.2%              │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Streak Champions Leaderboard

Shows longest answer streaks, filterable by category.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🔥 STREAK CHAMPIONS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Season: [▼ All Time        ]                                               │
│                                                                             │
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │  All  │  CSS  │   JS  │ React │  TS   │ HTML  │  Git  │General│         │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘         │
│     ↑ active                                                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    GLOBAL BEST STREAKS                              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Best        Current     Total Correct       │   │
│  │                         Streak      Streak      in Streak           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  streak_legend        47          12          892                │   │
│  │     🔥🔥🔥🔥🔥 LEGENDARY                                              │   │
│  │ 🥈  perfect_pete         38           0          654                │   │
│  │     🔥🔥🔥🔥 EPIC                                                     │   │
│  │ 🥉  consistency_king     35           8          598                │   │
│  │     🔥🔥🔥🔥 EPIC                                                     │   │
│  │ 4   rare_wizard          31          15          512                │   │
│  │     🔥🔥🔥 GREAT                                                      │   │
│  │ 5   banjo_master         28           0          445                │   │
│  │     🔥🔥🔥 GREAT                                                      │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────┐             │
│  │  STREAK MILESTONES                                        │             │
│  │  ────────────────                                         │             │
│  │  🔥     5+   Good Start                                   │             │
│  │  🔥🔥   10+  Impressive                                    │             │
│  │  🔥🔥🔥  20+  Great                                         │             │
│  │  🔥🔥🔥🔥 35+  Epic                                          │             │
│  │  🔥🔥🔥🔥🔥45+  Legendary                                     │             │
│  └───────────────────────────────────────────────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


When category selected (e.g., "TypeScript"):

┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │  All  │  CSS  │   JS  │ React │  TS   │ HTML  │  Git  │General│         │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘         │
│                              ↑ active                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  📘 TYPESCRIPT STREAK CHAMPIONS                      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Best        Run         Date                │   │
│  │                         Streak      Achieved                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  type_master          23         Run #42     Dec 13, 2025        │   │
│  │ 🥈  generic_guru         19         Run #67     Dec 25, 2025        │   │
│  │ 🥉  interface_pro        17         Run #31     Jan 1, 2026         │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Runs Played Leaderboard

Shows who has completed the most runs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         🎮 RUNS PLAYED LEADERBOARD                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Season: [▼ All Time        ]                                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    MOST RUNS COMPLETED                              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Total       Victories   Win Rate            │   │
│  │                         Runs                                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  run_machine          156         42          26.9%              │   │
│  │ 🥈  grind_master         142         38          26.8%              │   │
│  │ 🥉  never_quits          128         29          22.7%              │   │
│  │ 4   rare_wizard          115         45          39.1%              │   │
│  │ 5   banjo_master         98          31          31.6%              │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    HIGHEST WIN RATE (min 10 runs)                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Win Rate    Victories   Total Runs          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  precision_player     52.3%       23          44                 │   │
│  │ 🥈  quality_queen        48.1%       13          27                 │   │
│  │ 🥉  efficient_ed         45.8%       22          48                 │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    MOST VICTORIES                                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ #   Player              Victories   Total Runs  Avg Coverage        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🥇  victory_king         52          98          78.5%              │   │
│  │ 🥈  rare_wizard          45          115         82.3%              │   │
│  │ 🥉  champion_champ       41          87          76.8%              │   │
│  │ ...                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Mobile View (Responsive)

All leaderboards collapse to a card-based view on mobile.

```
┌─────────────────────────────┐
│    🏆 LEADERBOARDS          │
├─────────────────────────────┤
│                             │
│ [▼ Coverage Rankings    ]   │
│ [▼ All Time             ]   │
│ [▼ All Categories       ]   │
│                             │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🥇 #1                   │ │
│ │ rare_wizard             │ │
│ │ ─────────────────────── │ │
│ │ Coverage      94.2%     │ │
│ │ Best Streak   23        │ │
│ │ Polls         156       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🥈 #2                   │ │
│ │ banjo_master            │ │
│ │ ─────────────────────── │ │
│ │ Coverage      91.8%     │ │
│ │ Best Streak   19        │ │
│ │ Polls         142       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🥉 #3                   │ │
│ │ pokemon_trainer         │ │
│ │ ─────────────────────── │ │
│ │ Coverage      88.5%     │ │
│ │ Best Streak   17        │ │
│ │ Polls         138       │ │
│ └─────────────────────────┘ │
│                             │
│         [ Show More ]       │
│                             │
└─────────────────────────────┘
```

---

## 7. Season Filter Dropdown

```
┌─────────────────────────────┐
│ Season: [▼ All Time     ]   │
└─────────────────────────────┘
           ↓ expanded
┌─────────────────────────────┐
│  ✓ All Time                 │
│  ─────────────────────────  │
│    Season 2 (Current)       │
│    Season 1                 │
│    Pre-Season               │
└─────────────────────────────┘
```

---

## 8. Category Comparison View (New Feature)

Shows a user's standings across all categories at once.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    📊 CATEGORY COMPARISON                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Player: rare_wizard                Season: [▼ All Time        ]           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Category          Coverage    Rank    Streak    Polls    Rank      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ CSS               95.2%       #3      18        45       #5        │   │
│  │ JavaScript        92.1%       #7      15        52       #3        │   │
│  │ React             98.5%       #1 🏆   23        48       #2        │   │
│  │ TypeScript        88.3%       #12     12        38       #8        │   │
│  │ HTML              94.8%       #4      16        41       #6        │   │
│  │ Git               78.5%       #25     8         28       #15       │   │
│  │ General Frontend  91.2%       #9      14        35       #11       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STRENGTHS                      AREAS TO IMPROVE                    │   │
│  │  ──────────                     ────────────────                    │   │
│  │  ⭐ React (#1)                   📈 Git (#25)                       │   │
│  │  ⭐ CSS (#3)                     📈 TypeScript (#12)                │   │
│  │  ⭐ HTML (#4)                                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Mini Leaderboard Widget (For Dashboard/Home)

Compact version to show on other pages.

```
┌───────────────────────────────┐
│  🏆 TOP PLAYERS TODAY         │
├───────────────────────────────┤
│  🥇 rare_wizard      94.2%    │
│  🥈 banjo_master     91.8%    │
│  🥉 pokemon_trainer  88.5%    │
├───────────────────────────────┤
│  Your rank: #42 (72.3%)       │
│       [ View Full Board ]     │
└───────────────────────────────┘
```

---

## 10. Data Requirements Summary

### New Metrics Needed

| Metric | Source | Notes |
|--------|--------|-------|
| Total runs per user | `COUNT(runs)` by user | Filter by season/status |
| Victories per user | `COUNT(runs WHERE status = 'victory')` | Need victory status tracking |
| Win rate | `victories / total_runs * 100` | Min 10 runs threshold |
| Total polls answered (cumulative) | `SUM(polls_answered)` from leaderboard | Across all runs |
| Highest single-run polls | `MAX(polls_answered)` from leaderboard | Per category possible |
| Category-specific streaks | Already in `leaderboardTable.best_streak` | Filter by category_code |

### Existing Data (Ready to Use)

- ✅ Coverage per category (`category_coverage`)
- ✅ Total coverage (`total_coverage`)
- ✅ Best streak (`best_streak`)
- ✅ Polls answered per run (`polls_answered`)
- ✅ Season filtering (`season_id`)
- ✅ Category filtering (`category_code`)

### Schema Additions Potentially Needed

```sql
-- Add victory tracking if not present
ALTER TABLE runs ADD COLUMN IF NOT EXISTS
  completion_type VARCHAR(20); -- 'victory', 'threshold_fail', 'manual_break'

-- Or create aggregated user stats table for performance
CREATE TABLE user_leaderboard_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_runs INTEGER DEFAULT 0,
  total_victories INTEGER DEFAULT 0,
  total_polls_answered INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Navigation Structure

```
/leaderboards
├── /coverage           (Coverage Rankings - default)
├── /polls-answered     (Polls Answered)
├── /streaks            (Streak Champions)
├── /runs               (Runs Played)
└── /compare/:userId    (Category Comparison - optional)
```

---

## Component Hierarchy

```
LeaderboardPage
├── SeasonFilter
├── CategoryTabs
├── LeaderboardTypeSelector
└── LeaderboardTable
    ├── LeaderboardHeader
    ├── LeaderboardRow (repeating)
    │   ├── RankBadge
    │   ├── PlayerInfo
    │   └── StatColumns
    └── LoadMoreButton

MobileLeaderboard
├── FilterDropdowns
└── LeaderboardCard (repeating)
    ├── RankBadge
    ├── PlayerName
    └── StatList
```
