---
# DVTD-rpl9
title: 'Poll Dex: unlocked configs + per-category polls-answered stats'
status: draft
type: feature
created_at: 2026-07-16T20:30:19Z
updated_at: 2026-07-16T20:30:19Z
parent: DVTD-u35m
---

Idea captured, mechanics still TBD.

A collection/stats screen, Pokédex-style: shows which configs the player has unlocked (DVTD-2try) and, per category, how many polls they've answered and which ones — question text only, not the answer options or correctness (avoids leaking answers for polls not yet attempted).

Rough direction: a new route, likely outside src/modules/session-run — closer to domains/polls/profile territory, since ADR-007's scope boundary says outside-the-run features (profile, border shop, etc.) stay as-is for now. This may need a small ADR note carving out an exception, or living under the legacy domains/ area instead of modules/.

Open questions:
- Data source: polls_responses already has poll_id/user_id/run_id — a per-user "polls seen" list can be derived by joining it to polls/polls_categories, no new table strictly required. A dedicated aggregate (something like the CLAUDE.md-documented but currently nonexistent polls_user_performance table) would be an optimization, not a hard requirement.
- "Which ones... only questions visible" — does this mean: list every poll's question text the player has answered at least once, hiding options/correctness? Or does it also list unanswered polls in a category as "???" placeholder rows, classic Dex "not yet encountered" style?
- Layout: one section per category (reusing the existing Kanto categoryTheme + Swatch component, consistent with RunHud's coverage dropdown) with a config sub-grid and a poll list underneath — or two separate tabs (Configs / Polls)?
- Overlaps with DVTD-g8ty (Collect Swatches, also category-progression) and DVTD-2try (config unlocks) — feels like these three (swatches, config unlocks, poll dex) want one shared "Collection" surface rather than three separate screens. Worth a single design pass across all three before building any of them.
