---
# DVTD-dfyy
title: .prettierrc rounds a partial up to a whole unit
status: completed
type: feature
priority: normal
created_at: 2026-09-15T13:01:25Z
updated_at: 2026-09-15T13:17:49Z
parent: DVTD-72d9
---

A 2-slot coverage config: a partial select-all answer earns the fraction it needs to reach a whole unit. A quarter caught pays 1 instead of 0.5, three quarters pays 2 instead of 1.5. The top-up is a flat add, so no multiplier amplifies it (ADR-083) — which means any coverage multiplier restores the near-miss/full-answer ordering that ADR-079's three-quarter ceiling protects. Unlocks on a new partials-paid objective. Needs ADR-085, a select-all-capable story harness, and a Kanto/Configs story page.

## Todo

- [x] `roundsPartialUnitsUp` field + `topUpUnitsFor` in config.model.ts
- [x] `Effect.coverage` takes the credited figure; touchesCoverage, skipReasonFor
- [x] Thread the credited figure through build.model.ts
- [x] Roster entry at 2 slots
- [x] `partials-paid` metric + CONFIG_UNLOCKS row + the counter
- [x] SKIP_WORDS copy for both new reasons
- [x] Harness: select-all polls + a partial answer outcome
- [x] Prettierrc.stories.tsx + configStories.spec registration
- [x] Specs
- [x] ADR-086 + README index row (085 was taken mid-session)
- [x] wiki 4.3 / 6.2 / 2.5
- [x] CHANGELOG

## Summary of Changes

Built as ADR-086 (085 was claimed by another session mid-work, so this renumbered).

**The effect is a `Coverage.add` whose amount is computed from the answer.** That
choice is what made it small: the receipt row, the gate-debrief row, the Dex
entry and shop availability all fell out of machinery that already existed.
`topUpUnitsFor` returns `ceil(credited) - credited` and `flatUnitsOf` sums it
beside `coverageAdd` and `cacheUnitsFor`.

`Effect.coverage` now takes the answer's credited figure as an optional second
argument (defaulting to 0 = "no answer scored", which left `coverageOnPoll`
untouched). It takes the already-credited `share x credit` product rather than
the share, so `creditFor` stayed in `coverageRatio.model.ts` and `config/domain`
gained no edge into `build/domain` - depcruise confirms 0 violations.
`BASE_UNIT x share x credit` was inlined at four sites; the two carrying a real
share now name it once as `creditedUnitsFor`.

**Three things worth not re-deriving:**

- **The receipt needed no new code.** `coverageBreakdownForAnswer` derives
  `base` by subtraction, so a naive rounding would have landed the half-unit in
  the base and credited the answer rather than the config. Routing through the
  add branch fixed that for free, and `configBonuses` already drops zero-valued
  rows, so a half catch (already whole) produces no row at all.
- **`ScoringRule` was deliberately left alone.** Its ladder reads 0/0.5/1/1.5/2
  under the note "before the build multiplies it", and the top-up is build, not
  poll - so the panel is true within its own scope. Parameterising it would make
  a component titled "what a poll pays" describe a build. Disclosure lives on
  the chip: `select-all only` on a single, `pays on a partial` on a select-all.
- **`prettierrc` sits BEFORE `dryRun` in the roster.** `gate.model.spec` pins
  Dry Run last because fixtures slice the roster from the front and must not
  pick up a projector. Appending would have broken that invariant's letter, so
  the entry was inserted above it instead of editing the spec.

**The harness could not build a select-all poll.** `configRun.harness.tsx` had
one factory hardcoding `answerType: "single"` and `answerNext` took a boolean,
so "caught 1 of 4" was unrepresentable - the only state this config acts on.
Added `SELECT_ALL_BANK` (4-key polls, so rungs land on clean quarters), a
`selectAll()` gate marker with `SELECT_ALL_GATE`, and widened the answer outcome
to `boolean | number`. Both additive: all 26 existing pages compile unchanged.

**Two fixtures had hardcoded roster counts** and were made drift-proof rather
than bumped: `draft.model.spec`'s seed sample now scales as
`CONFIG_LIST.length * 3` (30 fixed seeds stopped covering a 37-config pool - the
config it missed was `garbage-collection`, not this one, and `prettierrc` is
reachable), and `ConfigdexPanel.spec` derives its total from `CONFIG_LIST.length`.
`configUnlock.model.spec`'s earned count went 28 -> 29, which is the intended
consequence.

**Verification:** 4435 passing, 2 failing. The two are the pre-existing "floor
rule" pair - `gate.model.ts:173` still carries the live `TODO(marciano)` where
`clearsGateFloor` belongs (DVTD-xl63), and gate.model.ts was not touched here.
`npm run lint` clean (2 pre-existing story warnings in untouched files),
`npm run build` green, stories typecheck with 0 errors in the new files and no
TS2304. Story render output verified by hand: the receipt reads
`base 0.5 / .prettierrc +0.5 / paid 1`.
