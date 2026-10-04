---
name: playtest
description: Playtest DevVoted through one lens (balance, fun, mechanics or UX) by setting up game state fast, driving the game in a browser (chrome-devtools MCP) or the balance sim, and reporting findings against the wiki. Use when the user says "playtest", "test the game", "is this balanced", "is this fun", "check mechanic X", "test the UX of X", or asks whether a screen is easy to understand.
argument-hint: <balance|fun|mechanics|ux|all> [focus, e.g. "shop after gate 3", "Linter v2", "first run"]
---

# Playtest

Judge the game as it plays, not as it is coded. Read code only to know what to expect or to set up state.

Args: `$ARGUMENTS` → first word is the lens, the rest is the focus. No lens → infer it from the focus; no focus → ask one question: "Which screen, mechanic or build?"

## Workflow

1. **Scope.** Find the focus in the lens map of [references/lenses.md](references/lenses.md). Read only that wiki section (`grep -nE "^#{1,4} " docs/wiki.md` for line numbers) and the code owner it names.
2. **Pick a rig** from the decision table in [references/rigs.md](references/rigs.md). Cheapest rig that can show the thing wins.
3. **Set up state**, cheapest first: proto-run control → a seeded login whose build fits → a SQL recipe. State what you set up in the report.
4. **Write expectations before playing** (mechanics and balance lenses): the numbers or behaviour the wiki/ADR promises. A finding without a prior expectation is an opinion.
5. **Play** with chrome-devtools MCP (`mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`), never Playwright (memory: `no-playwright-mcp-use-chrome-devtools`):
   - `new_page` for your own tab; never navigate a tab Marciano is playing in.
   - `take_snapshot` for structure and text; `take_screenshot` only for visual/UX judgements.
   - `list_console_messages` after each screen; an error is a 🔴 finding.
   - Note every press you make, so the finding is reproducible.
6. **Judge** against the lens checklist. Every finding carries: what you saw, what was expected (wiki § / ADR / checklist item), how to reproduce.
7. **Report** (format below), then offer to file findings as beans following ADR-107. Create none without a yes.

`all` → run ux, mechanics, fun in that order on one shared rig, then balance. Keep one report.

## Report format

```
## Playtest: <lens>, <focus>
**Rig:** proto-run | app as <login> | sim · **State:** <what was set up>
**Verdict:** one sentence.

### Findings
🔴 Broken rule: <title>
   Saw: … · Expected: … (wiki §x.y) · Repro: …
🟠 Confusing / unbalanced: …
🟡 Polish: …

### What worked
- …

### Not tested
- <thing>: <why: rig can't show it, gap in tooling, out of scope>
```

Keep it short. Three sharp findings beat twelve vague ones. No findings is a valid result; say so.

## Hard rules

- Never edit app code, seed files or spec assertions during a playtest. A failing sim assertion is a finding, not something to loosen (memory: `a-unit-threshold-is-divided-by-your-multiplier`).
- Never run `npm run db:refresh`, `db:reset` or `db:seed` without asking: they wipe local data and the owner account's state.
- SQL writes to the local DB only, and only the recipes in rigs.md. Say what you changed.
- Wiki and code disagree → that is a 🔴 finding naming both. Don't silently pick a side (CLAUDE.md docs boyscout rule applies only if the user asks for a fix).
- Missing tooling (no clock override, no per-gate seed, sim without a table) → list under "Not tested" and suggest a bean; don't build it mid-playtest.
- Don't press abandon/delete presses that open a confirm dialog unless the focus needs it; then answer it with `handle_dialog`.
- Close your page (`close_page`) when done.
- Invoking /playtest is the explicit browser ask; outside it, don't open a browser (memory: `do-not-open-chrome-mcp`).
