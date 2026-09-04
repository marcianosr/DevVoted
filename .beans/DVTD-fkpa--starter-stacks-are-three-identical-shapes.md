---
# DVTD-fkpa
title: Starter stacks are three identical shapes
status: scrapped
type: task
priority: normal
created_at: 2026-08-27T19:50:19Z
updated_at: 2026-09-03T09:16:32Z
---

All eight configs across the three starter stacks are **bits**, so every opening is 3 spots in a 4-spot pipeline. The three stacks differ in categories and risk but are indistinguishable as *shapes*, which is the axis ADR-044 made interesting — and the card now says so out loud (`three bits · 1 spare` on all three).

The original mock proposed All in (one byte) / Wide (eight bits) / Balanced (a nibble and four bits). Those are all **8 spots**; the ADR-044 opening is **4**, so they cannot be copied. Re-derived for four spots:

| Opening | Shape | Configs |
| --- | --- | --- |
| All in | one nibble | 1 |
| Wide | four bits | 4 |
| Balanced | a crumb and two bits | 3 |

This is a **game-design call, not a rename**, which is why it is not in DVTD-xsrz: `stack.model.ts` carries dated decisions from Marciano (2026-08-10, 2026-08-24) about exactly which configs a first run should hold and why — Code Coverage swapped in for Cold Start as too punishing, ESLint earning its place by covering the two categories .js/.ts force you to get right, Vue/Java/Git chosen to genuinely miss each other. Changing shape means adding a fourth config to one stack and inventing a single-nibble stack, which touches all of that.

Also note `stack.model.ts:20` still has a TODO referring to `BASE_SLOTS`, retired by ADR-044. The rule it names should become "must fit in `BASE_SPOTS`", not "must hold exactly N configs" — a nibble-only stack is one config and perfectly legal.

## Todo

- [ ] Decide whether the three openings should be three shapes
- [ ] If yes: pick the configs, preserving the documented risk profiles where possible
- [ ] Update the `BASE_SLOTS` TODO and the stack spec to a fits-in-BASE_SPOTS rule

## Reasons for Scrapping

Starter stacks were deleted by ADR-052 (DVTD-ez37, 2026-09-03) — the three-identical-shapes question is moot. The stale BASE_SLOTS TODO went with stack.model.ts.
