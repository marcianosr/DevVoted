---
# DVTD-4dt8
title: Kanto test-data pool (src/test/kanto.ts) + fix stale factory docs
status: completed
type: task
priority: normal
created_at: 2026-07-17T09:37:54Z
updated_at: 2026-07-17T09:39:53Z
---

- [x] Curate canonical Kanto data from Bulbapedia (towns+mottos, gym leaders+badges, landmarks, routes)
- [x] src/test/kanto.ts — typed, immutable test-data pool + canonical test dates (13-05, Christmas)
- [x] CLAUDE.md Mock Data Factory section is stale (createMockDataFactory does not exist in src/) — restored helper + updated section
- [x] Example usage in one spec or doc snippet (CLAUDE.md snippet uses KANTO_QUIZ + TEST_DATES)

## Summary of Changes

src/test/kanto.ts: KANTO_TOWNS (10, with Bulbapedia mottos), GYM_LEADERS (8, city/type/badge), KANTO_LANDMARKS (14), KANTO_QUIZ (5 poll-shaped Q&A), TEST_DATES (birthday 2026-05-13, Christmas). src/test/createMockDataFactory.ts restored with provisional shallow merge — merge-strategy decision (shallow vs deepmerge) left to Marciano, TODO in code. CLAUDE.md factory section updated to real paths + Kanto pool usage. lint (incl. arch) + tsc green.
