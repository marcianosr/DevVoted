---
# DVTD-z1z2
title: 'Config roster pass: names, effects, and three orphaned mechanics'
status: completed
type: task
priority: normal
created_at: 2026-09-19T17:46:48Z
updated_at: 2026-09-19T18:20:01Z
parent: DVTD-72d9
---

Review of all 40 configs in `src/modules/run/config/domain/configRoster.model.ts` against ADR-042 pillar 4 ("Real tools, real names").

Plan: `~/.claude-work/plans/go-over-my-config-lazy-spindle.md`

## Todo

- [x] A. Cold Start: invert to opener x0, throttle x1.5 (power-neutral at x1.20 avg)
- [x] A.1 `minifiedFactor` in effect.model.ts so ADR-044 D5 holds when the opener is the cost
- [x] B. Rename Unit Tests -> Build Artifacts (label only, id stays)
- [x] B. Rename .prettierrc -> Math.ceil() (label only, id stays) + ADR-086 amendment
- [x] C.1 Fix Cache description/gives (says "+25% coverage up to x2"; code adds +0.25 flat units capped +1.0)
- [x] C.2 Reword Overclock `costs` ("cools off each gate clear" reads as a nerf, means the x4 returns)
- [x] C.3 upgradesFor() renders raw `description` next to the rung ladder - 17 upgradable configs show stale prose at level 2+
- [x] D. REVERTED - the payout was removed deliberately; see DVTD-kf5t
- [x] E. Add `.env` focus config for general-backend + CONFIG_UNLOCKS row (ADR-051 D5)
- [x] F. rewardMultiplier -> optional, drop the 40 literals, guard effectOf
- [x] F. Delete streakCapSteps (unowned cap-raiser; ADR-015 + ADR-090 argue against an owner)
- [x] H. Docs: wiki 4.3/4.4, ADR-086 amendment, ADR-051 D3, CONTEXT.md stale rows, ADR-028 citation, CHANGELOG

## Balance caveat

No sim harness in the repo (DVTD-8gns, DVTD-qkiq open on exactly this). The Cold Start x1.20 equivalence is arithmetic over a full 5-poll window, not a validated win rate, and it diverges when a gate is not fully answered.

## Deliberately out of scope

- AGENTS.md strict dominance -> DVTD-qvi6
- Dual-focus configs -> DVTD-9hm8
- Intellisense keeps its name (Marciano's call); `-O2`/`JIT` stay available
- `.vue` / `package.json-config` id warts: persisted, need a migration

## Summary of Changes

41 configs (was 40). `npm test` 3774 passed / 2 failed — the same two `gate.model.spec.ts > the floor rule` specs that fail at HEAD with this work stashed. `tsc --noEmit` and `npm run lint` (oxlint + depcruise) clean.

### Reversed mid-implementation

**D. `.length` payout.** The plan read `storagePerExtraPick` as an orphan field never attached to its config. It is the opposite: a spec comment in `run.model.spec.ts` records that it was taken OFF `.length` deliberately, because paying KB let a config bought for its reveal earn its keep on the ledger while the reveal went unbuilt. Verified the reveal is still unbuilt — `runView.viewmodel.ts:488-491` computes `correctCount`/`correctCountSource` and no component reads either. Reverted; filed DVTD-kf5t to build the reveal first. The wiki row (which documented the payout as live) now states the removal and its reason.

### Effects

- **Cold Start inverted**: `openerCoverageMultiplier: 0`, `throttleCoverageMultiplier: 1.5`. Power-neutral at 1.20x over a full window (was 2/1). Used 0 rather than the 0.5 first sketched, which would have averaged 1.30x — a silent buff to a starter config.
- **`minifiedFactor`** in `effect.model.ts`: the minify rule now follows the factor, not the field. ADR-044 D5 says a config's costs are never halved; the old code hardcoded that as "opener = bonus, throttle = cost", which only held for Overclock. Without this, minifying an inverted Cold Start softened the dead opener AND kept the full 1.5x.
- **`.env`** (1 slot, general-backend focus) + its ADR-051 D5 unlock row. Roster/unlock parity verified: 41/41.

### Names

- Unit Tests to **Build Artifacts**; `.prettierrc` to **Math.ceil**. Labels only, ids untouched, no migration. The Math.ceil rename overturns ADR-086's formatter framing, recorded as an amendment rather than an edit.
- Intellisense kept (Marciano's call).

### Prose and one live bug

- **Cache** described its pre-ADR-083 design ("+25% coverage, up to 2x"); it adds +0.25 flat units capped at +1.0.
- **Overclock**'s costs line said "cools off each gate clear", which reads as a decay but means the 4x returns.
- **upgradesFor** passed `config.description` raw while its sibling `infoFor` used `describeConfig`. All 17 upgradable configs showed level-1 prose beside a rung ladder that disagreed.

### Dead code

- `rewardMultiplier`: optional now, 40 literal `: 1` lines gone. Channel KEPT — it multiplies `gateClearPayout` (KB, a separate axis from coverage) and the backlog's "Replication" is its named owner.
- `streakCapSteps`: DELETED end to end (`Config`, `Effect`, `streakCapStepsFor`, `PerAnswerPreview.streakCapMultiplier`, the `streakCapMultiplier` helper, `streakMultiplier`'s now-unreachable `capSteps` param, `cast.ts`'s RISK_POOL). Unowned, and ADR-015 + ADR-090 both argue against giving it one.

### Left alone, deliberately

- **`openerOnly` SkipReason is now unreachable** — both configs carrying `openerCoverageMultiplier` also carry a throttle, so neither is ever skipped. Kept: a correct branch for a future opener-only config, not dead weight.
- `.vue` / `package.json-config` id warts (persisted, need a migration). `.env` ships with a bare `env` id rather than repeating it.
- ADR-055's consequence note still says "16 of 33 configs" — stale count, not touched.
- Wiki designed-not-built still has a second `Overclock` row colliding with the shipped config.

### Docs

wiki 4.3 (count 40 to 41, Cold Start, `.env`, both renames, `.length`, deleted the now-duplicate "Cold cache" row, removed the "General Backend has no Focus config" open item), wiki 4.4 + lines 253/448, ADR-086 amendment, ADR-051 D3, ADR-028 (cited a comment that does not exist; the vendor-neutrality rule now lives in the ADR, honestly stated as a preference given Dependabot/Intellisense/IndexedDB/yarn.lock), CONTEXT.md (`ConfigFamily` deleted by ADR-055, `CONFIG_ROSTER` to `CONFIGS`/`CONFIG_LIST`), CHANGELOG (3 new entries; corrected 2 existing Unreleased entries that named the old shapes).

### Not verified

No sim harness exists (DVTD-8gns, DVTD-qkiq). The Cold Start 1.20x equivalence is arithmetic over a full five-poll window and diverges when a gate is not fully answered.

## Correction — .env reverted (2026-09-19, same day)

Marciano questioned whether `.env` fits General Backend. It does not, and the repo already said so twice:

- **The category is concepts, not a file.** Its 8 seeded polls are 5 databases (ACID, indexes, N+1, ON DELETE CASCADE, transactions), 2 HTTP (status codes, idempotency) and 1 auth (password hashing). Nothing about configuration or secrets.
- **`.env` is not backend anyway** — Vite, Next and CRA all read it; this repo's own `.env` holds Supabase keys for a fullstack app.
- **DVTD-9hm8 already names the fix** and rejects this exact species of error: "`Node.js` (JavaScript + General Backend) — this is the literal fix for the missing General Backend focus config. Note: DVTD-72d9 Phase 1 claims a `.be` focus was added, but the roster has none; `.be` is not a real extension." `.env` is `.be` again: a file-shaped name reached for because the other eleven focus configs are files.

Reverted from the roster, CONFIG_UNLOCKS, ADR-051 D3, wiki and CHANGELOG. Roster is back to **40**, parity 40/40, unlock-count spec back to 32. Tests 3774 passed / 2 pre-existing failed; tsc, oxlint, depcruise, prettier all clean.

The wiki's "Open: General Backend has no Focus config yet" line is restored and now carries the reason and the pointer to DVTD-9hm8, so the next person does not invent a third fake extension for it.

Everything else in this pass stands.
