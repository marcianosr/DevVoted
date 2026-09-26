---
# DVTD-j7ip
title: 'Run expiry + minimum daily commitment: finalize abandoned runs, decide storage forfeit vs credit, gate-1 social floor'
status: scrapped
type: feature
priority: normal
created_at: 2026-07-17T18:12:59Z
updated_at: 2026-07-18T07:23:55Z
---

Surfaced 2026-07-17 when Marciano quit mid-gate. Facts today: abandoned session runs stay status=active forever (orphaned), leftover storage is never credited (credit only fires on won/dead), and the game-over copy promises leftover storage is archived — inconsistent. Needed regardless of design choice: lazily finalize stale active session runs (seed_date < today) on next getTodaysRun/startRun with completion_reason=expired. Open design decisions (Marciano): (1) expired leftover storage — credit like death, or forfeit as commitment pressure; (2) minimum daily unit — his note: everyone plays at least 5 polls (gate 1) to feed the social layer; maybe a nudge instead of a hard rule. Related: slice 2 (per-answer rows) already feeds what-others-chose from partial runs without forcing completion; the 1-poll-a-day casual ritual remains loop 1 daily poll per ADR-005. Also relates to DVTD-uret (pay-KB revive).

## Reasons for Scrapping

Premise reversed by ADR-011 (2026-07-18): runs never expire — they persist until won/dead, appending each day's shared sequence as a segment. Marciano: one-day runs were never the intent; this is a roguelite. The catastrophic multi-day-death objection from ADR-009 was surfaced and accepted knowingly (softener deferred until playtest data). The two open design calls in this bean (expired-storage credit, minimum daily commitment) are moot — nothing expires and there is no forced daily minimum (ADR-011 Decision 3).
