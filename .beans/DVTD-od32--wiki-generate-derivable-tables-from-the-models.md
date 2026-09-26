---
# DVTD-od32
title: 'Wiki: generate derivable tables from the models'
status: completed
type: feature
priority: normal
created_at: 2026-09-23T07:26:29Z
updated_at: 2026-09-23T07:26:29Z
---

The wiki restated numbers the models already own, which is how it came to say
"44 configs" in §4.3 and "8 starters + 30 others" in §6.2. `scripts/wiki-sync.ts`
now generates the derivable blocks from the models themselves.

## How it works

A block between `<!-- BEGIN GENERATED:KEY -->` and `<!-- END GENERATED:KEY -->` is
owned by the script. `npm run docs:sync` rewrites them; `npm run docs:check` fails
if they drift and is wired into `npm run lint`.

## Six blocks

| Key | Source |
| --- | --- |
| `GATE_LADDER` | `GATE_RUNGS` + `GATE_SWATCHES` + `failPeelShareFor` + `gateRewardMultiplier` + `AUDIT_TIERS` |
| `BUILD_SPACE` | `BUILD_SPACE_RUNGS` — **two sites** (§3 and §5.1), both rewritten |
| `CONFIG_SIZES` | `CONFIG_SIZES` x `DRAFT_COST_PER_SLOT_KB` |
| `AUDIT_POOLS` | `AUDIT_TIERS`, codes sorted numerically |
| `CONFIG_COUNTS` | `CONFIG_LIST` vs `FREE_CONFIG_IDS` |
| `STARTER_POOL` | `STARTER_POOL` labels |

## Three things that made it work

**Prettier had to be inside the generator.** lint-staged runs `prettier --write` on
`*.md` at commit, so an unformatted block would pass `--check` and then fail it one
commit later, reformatted underneath us. The script formats its own output through
prettier's API, and the result is idempotent.

**Both marker directions are errors.** A marker with no generator and a generator
with no marker both throw, so a typo is caught rather than silently skipped.

**The duplication was the bug, not the staleness.** §6.2 no longer restates the
config counts at all — it points at §4.3, which is the one generated site. Two
copies of a fact drift; one cannot.

## Deliberately NOT generated

The roster's effect descriptions, the audit prose, §10's constant sheet and every
rationale paragraph. Those are authored voice, and a generator would flatten the
part of the wiki a reader is actually there for. The gate ladder's "Also unlocks"
column keeps one authored cell (gate 0 opening the shop); Extend and the win are
derived from `EXTEND_FROM_GATE` and `VICTORY_GATE`.

## Verification

- Idempotent: a second `docs:sync` reports in-sync
- Drift caught: setting `GATE_REWARD_KB` to 64 failed `docs:check` and `npm run lint`
  (exit 1), and restoring it went green
- `npx tsc --noEmit` clean; `prettier --check` clean on all three changed files
- `npm test` → 229 files, 4134 passed, 6 skipped, 2 todo

Follows DVTD-opgd, which fixed the 20 contradictions by hand.
