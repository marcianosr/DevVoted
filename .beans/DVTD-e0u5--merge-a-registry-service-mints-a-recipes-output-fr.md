---
# DVTD-e0u5
title: 'Merge: a Registry service mints a recipe''s output from two configs'
status: todo
type: feature
priority: normal
created_at: 2026-09-27T17:34:00Z
updated_at: 2026-09-30T09:15:46Z
parent: DVTD-72d9
---

**What:** A shop service that consumes two installed configs named by an authored recipe and mints the recipe's output at version 1.

**Why:** Buys back build weight and replaces ten near-identical draftable linters with one generic Linter plus tools the player builds.

⚠️ Linter shipped on its own on 2026-09-30 (ADR-158): draftable, weight 2, free seat, ladder from 8 KB that carries at v1, resets at v2 and halves at v3. ESLint and Stylelint are deleted from the roster, not merge-only. The 32 KB two-rungs-up ladder below is superseded; recipes would re-mint the specialised linters. Check before starting.

## Done when
- [ ] The shop sells Merge as a repeatable service, priced at 64 KB per weight removed by the merge
- [ ] Each of the eleven authored recipes consumes both installed ingredients and mints its output at version 1, weighing half the combined weight rounded down, minimum 1
- [ ] A recipe is unavailable while its output is installed; consumed ingredients return to the draft pool as normal offers
- [ ] A generic Linter replaces draftable ESLint and Stylelint, crossing out one wrong option on any poll for a fee that starts at 32 KB and doubles within the gate
- [ ] Merged linters keep their category's ×1.25 focus and lint their category from 8 KB on the same per-gate doubling meter; when two linters cover a poll, the cheaper one sells the lint
- [ ] The .tsx output rewards both TypeScript and React polls through one shared version, and one outage downs both halves

## Notes

Settled with Marciano, 2026-09-27. Supersedes DVTD-jgpo's Monorepo (free-form pair
merging, per-child levels) and the wiki §4.3 "Dual-focus configs" draftable pool —
`.tsx` and friends now arrive through merge crafting.

### Rules

- Merge is a **registry service** (ADR-115 scope: shop, run KB, repeatable).
  Irreversible; selling the output refunds the output's own sell value, never the
  ingredients.
- **Only authored recipes merge** — no free-form combining (keeps AGENTS.md +
  Intellisense from becoming an automatic super-build).
- Fee = `64 KB × ((w1 + w2) − output weight)`, always ≥ 64 KB. Output weight =
  `floor((w1+w2)/2)`, min 1.
- Output starts at **v1**, one shared version, normally upgradable afterwards. A
  dual-focus output's upgrade coverage gate reads the **best** of its categories.
- **Re-merge rule (output-installed lock):** consumed ingredients leave the build
  and naturally return to the draft pool (rollDraft only filters owned). A recipe
  is closed only while its output is installed; sell or lose it and it reopens.
- **Focus stacking allowed:** merged ESLint (js focus) + re-drafted .js stack
  multiplicatively (×1.5625) — costs a slot, KB, and a merge; audits punish the
  concentration. Zero engine change.
- Generic **Linter** lints **all 12 categories** (breadth is its selling point),
  priced two rungs up the existing LINT_COSTS ladder (32/64/128/256, per-gate
  reset, shared window.linted meter). Accepted quirk to pin in a test: generic
  then specialised prices 32 then 16 on the shared meter.
- Today's roster `eslint` narrows to js only (typescript-eslint takes ts) and both
  eslint and stylelint become merge-only outputs. Linter takes ESLint's
  STARTER_POOL seat. Roster 45 → 55 = 8 free + 36 earned + 11 merge-only.

### Recipes (11)

| Ingredients | Output | Focus |
|---|---|---|
| .jsx + .ts | .tsx | react AND ts, ×1.25 each, one shared version |
| Linter + .js | ESLint | js |
| Linter + .ts | typescript-eslint | ts |
| Linter + .css | Stylelint | css |
| Linter + .html | HTMLHint | html |
| Linter + .jsx | eslint-plugin-react | react |
| Linter + .vue | eslint-plugin-vue | vue |
| Linter + .git | commitlint | git |
| Linter + .java | Checkstyle | java |
| Linter + .py | flake8 | python |
| Linter + .rb | RuboCop | ruby |

Each merged linter: weight 1, keeps the category's ×1.25 focus, lints that
category from 8 KB (LINT_COSTS index 0). General Frontend / General Backend get
no recipe: concepts, not one lintable language. Python linter is flake8, not Ruff
(Marciano's call).

### Implementation sketch (verified against code 2026-09-27)

Full plan: `~/.claude-work/plans/merge-becomes-a-registry-synchronous-abelson.md`.

- Migrate `focusCategory` → `focusCategories: readonly CategoryCode[]` (13 reader
  files, compiler-enumerated; `focusCoverageHeld` = best-of for the upgrade gate).
- New Config fields `mergeOnly` and `lintFeeOffset` (Linter carries 2; the
  cheapest covering linter sells via `linterFor` preferring the lowest offset).
- Merge outputs must be **real roster entries** (`refreshConfig` re-resolves
  persisted configs by id keeping only level — synthetic objects don't survive).
  Append new entries LAST (positional slices in seed/runs.ts, kantoGate.factory,
  run.factory). Export `DRAFTABLE_LIST` (filters mergeOnly) for rollDraft and the
  count specs.
- New `mergeRecipe.model.ts` (shop/domain) + `merge.model.ts` (run/domain); RunAction
  `{ type: "merge", configIds: [id, id] }` via a new pairActionSchema; SHOP_WRITES;
  metric `merges-completed`; RegistryControlId `"merge"` with unlock proposal
  `earned("gates-cleared", 10)` (dial), glyph ⇄, opens from the first shop.
- New `merged` unlock kind: Dex shows the recipe caption, never metric-satisfied;
  `poolFor` must also filter mergeOnly so grants never deal outputs into hands.
- Docs when built: new ADR (next free number), wiki §4.3 Merge-crafting rewrite
  (dual-focus paragraph dies), §4.4/§4.5/§5.2/§6.2 touch-ups, wiki-sync
  configCounts third clause, CHANGELOG entry for the roster swap.
- Follow-up UI beans to create when the engine lands: shop merge panel (recipe
  rows, fee, two-press confirm) · poll-screen lint row names the selling linter +
  stories (ESLint stories move off ts polls) · Dex rendering of merge-only cards.
