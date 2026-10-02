---
# DVTD-npwa
title: A playtest skill tests balance, fun, mechanics and UX
status: completed
type: task
priority: normal
created_at: 2026-10-01T14:31:19Z
updated_at: 2026-10-01T14:33:31Z
---

**What:** A /playtest skill that drives the game in a browser, sets up state fast and judges it through one of four lenses: balance, fun, mechanics, UX.

**Why:** Every playtest rediscovers which rig to use, which login has which build, how to fake a day and where the wiki states the rule.

## Done when
- [x] The skill picks a rig and a login for a stated focus without asking
- [x] Each lens has a checklist tied to the wiki section that owns the rule
- [x] A playtest ends in a fixed report that separates broken rules from confusion and polish
- [x] Findings become beans only after a yes

## Notes
Lives in .claude/skills/playtest/. No app code. Gaps found while writing it (no clock override, no per-archetype seed, sim prints pass/fail only) are reported by the skill as suggested beans, not built.

## Summary of Changes

Added .claude/skills/playtest/ (SKILL.md, references/rigs.md, references/lenses.md). It drives the game with chrome-devtools MCP in its own page, never Playwright. The balance sim spec passed when run as part of the skill (8/8). The live browser lenses have not been exercised yet.
