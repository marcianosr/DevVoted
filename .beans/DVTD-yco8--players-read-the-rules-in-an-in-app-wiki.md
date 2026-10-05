---
# DVTD-yco8
title: Players read the rules in an in-app wiki
status: in-progress
type: feature
priority: normal
created_at: 2026-10-05T17:18:26Z
updated_at: 2026-10-05T17:35:39Z
---

**What:** A public wiki inside the game that explains how to play and lists the rules, with every number read from the live balance.

**Why:** Players have no rules reference in the app; the design wiki mixes shipped rules with plans and rationale, and hand-typed numbers drift.

## Done when

- [x] A visitor can open the wiki without signing in and reach it from the nav
- [x] Each article states only shipped rules, in a player's voice
- [x] Every figure on the page comes from the game's rules, not typed by hand
- [x] The design wiki and the player wiki draw their shared tables from one source
- [ ] The glossary names the game's words a new player meets first

## Notes

Plan: ~/.claude-work/plans/can-we-generate-a-snuggly-yao.md. New context guide, aggregate wiki; routes /wiki and /wiki/$articleId; ADR-190. Glossary definitions authored by Marciano (learning mode).
