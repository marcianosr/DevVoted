---
# DVTD-ah7g
title: The community screen leads with the map, then polls beside records
status: completed
type: feature
priority: normal
created_at: 2026-10-03T17:05:08Z
updated_at: 2026-10-03T18:13:59Z
---

**What:** The community screen puts the climb map across the top, the day's polls on the left, and records, incidents and leaders on the right.

**Why:** Six stacked panels at one weight gave the screen no reading order; the map and the polls are what a player came to see.

## Done when
- [x] The map spans the screen and two columns sit below it on a wide screen, stacking on a phone
- [x] The day's polls read as rows in one panel with how many you got right
- [x] Today's records lists the outcome bands and the day records in one list
- [x] Leaders switch between streak and correct inside their panel and show every category
- [x] Incidents always show, stating when none were filed

## Notes
Plan: ~/.claude-work/plans/redeisgn-the-community-screen-bright-crab.md. Header keeps swatch, title, stats, shop; no 'you're at' badge.

## Summary of Changes
CommunityScreen recomposed: full-width map, then a two-column grid with polls on the left and records, incidents and leaders on the right. PollResult became a panel row (verdict, question, 'Category · N% right', share badge; 'answer' badge on the right option; dashed mark plus 'Poll N · not dealt yet' when sealed). Leaders moved from Tabs to Segmented inside the panel head; the held-seat count and the 'leader' word are dropped. Turnout is retitled Today's records and its rows are merged. A quiet IncidentsPanel states its empty text in the head. New pollTallyFor. Wiki §7.1/§7.3, ADR-103/176 amendments, CHANGELOG.

## Follow-up (2026-10-03)
- Incident rows show both parties' faces (feed query selects photo and border), and the count sits under the heading.
- DANGER lists every run that fell today, even after a restart (ADR-176 amended at Marciano's call). A DANGER face opens that run's map card, so it can be looted from the records panel.
