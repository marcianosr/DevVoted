---
# DVTD-52f2
title: 'Group B: Domain models emit display strings'
status: completed
type: task
priority: normal
created_at: 2026-08-12T09:11:57Z
updated_at: 2026-08-13T10:38:26Z
parent: DVTD-82c4
---

Several domain files produce formatted copy instead of numbers, which puts
Tier 1 work below the seam where Storybook cannot reach it.

- `gate/gateReward.model.ts` — returns `value: "+12.3%"`, `"+32KB"`, `"—"`. **Every** export has 0 or 1 consumer and every consumer is a `.ui.tsx`. This is a viewmodel wearing a model suffix.
- `gate/configRole.model.ts` — returns `description`, `status`, `note` strings
- `community/standouts.model.ts:5` — imports `formatDurationMs` from `~/lib/dateUtils`; every award returns a preformatted `value: string`
- `view/runView.viewmodel.ts:384` — `shopExitFor` returns ``End run — gate ${n} demands ${m} configs →`` with the arrow glyph baked in
- `climb/run.model.ts` — `log: readonly string[]` holds full English sentences (`:264`, `:285`, `:391`, `:806`)

The dependency arrow is legal (ADR-002 holds, nothing imports React). The
altitude is wrong.

Related, found while reading: `gate/gateReward.model.ts:2` imports
`AnsweredPoll` from `climb/run.model.ts` while `climb/run.model.ts:45` imports
from `gate/gate.model.ts`. Type-only so it compiles, but `gate/` and `climb/`
are mutually dependent at package level.

## Todo
- [x] `gateRewardRows` returns numbers and enums; formatting moves to `GateRewardReport.ui.tsx`
- [x] Same for `configRole` and `standouts`
- [x] Move `shopExitFor` copy into the screen
- [x] Decide whether `run.model.ts` `log` stays prose or becomes structured events (decided: prose)
- [x] Break the `gate/` <-> `climb/` package cycle (resolved differently, see summary)

## Summary of Changes

Three domain models now emit quantities and enums; the screens write every
character the player reads.

### gateReward.model.ts

`GateRewardRow.value: string` became `GateRewardValue`, a union of
`percent | kb | checkProgress | none`. `GateRewardRow.description: string`
became `GateRowReason`, a union of
`config | gateRequirement | noPollInCategory | focusMissed`.

`GateRewardReport.ui.tsx` gained `formatValue`; `PipelineReportRow.ui.tsx`
gained `describeRow`. Both report screens and the role list share the second
one, so a passed row and a failed row cannot drift into different phrasings of
the same fact.

`checkProgress` is the one variant that still carries a string. It passes
through `CheckStatus.progress`, whose shapes vary per check ("2/3", "not seen",
"3/5 categories") and which `effect.model.ts` owns across 7 format sites.
Naming it as its own variant isolates the remaining debt instead of hiding it.
See the follow-up below.

### configRole.model.ts

`RoleRow.description` became `reason: GateRowReason`; `gateRowDescription` became
`gateRowReason`. The union lives here rather than in `gateReward.model.ts`
because `gateReward` already depends on `configRole` one way, and defining it
the other way round would have created the very cycle this bean also asked
about.

Its other strings stay: `gives`, `needs`, `costs` and `describeConfig` are roster
*content*, the config's own rules text, not formatting. Moving those to the UI
would have been the wrong reading of the bean.

### standouts.model.ts

`CommunityStandout.value: string` became `StandoutValue`
(`duration | count | percent | configs | text`), and the file no longer imports
`formatDurationMs` from `~/shared/lib/dateUtils` at all. `Standouts.ui.tsx`
gained `formatStandoutValue` and now owns the "1 config" / "7 configs" plural.

`text` covers the two awards whose value genuinely is prose: a gate's name and a
question snippet.

### shopExitFor

Split the decision from its copy. The viewmodel returns a `ShopExit` verdict
(`open | blocked | stuck`, carrying gate/demand/shortfall numbers); the label,
hint and danger variant now come from `shopExitAction` in `ShopScreen.ui.tsx`.
`endsRun` is gone as a field: the caller reads `state === "stuck"`, which is the
same fact without a second name for it.

### The log: staying prose

Decided rather than changed. `state.log` has **no shipped consumer**: it reaches
`RunView.log`, and the only code that renders it is `proto-run.tsx` and
`proto-session-slice.tsx`, both dev rigs printing the last 4 lines as a debug
tail. Structuring 19 write sites for a surface nothing ships is speculative.
Revisit when a real screen shows run history, or when the game needs
translation.

Noted in passing: `RunView.log` is carried through the viewmodel and rendered by
no shipped screen, which makes it dead surface — DVTD-ylsm's territory, not
filed here.

### The cycle: resolved, but not the one the bean described

`gate/` and `run/` are mutually dependent at *directory* level, but the file
graph is acyclic: `gateReward.model.ts` imports `AnsweredPoll` from
`run.model.ts`, `run.model.ts` imports from `gate.model.ts`, and `gate.model.ts`
imports neither. CONTEXT.md line 131 assigns `AnsweredPoll` to the Answer
aggregate in `run/`, so `gate/` importing that type is a legal downstream
dependency, and `.dependency-cruiser.cjs` states as policy that "type-only
imports pass every rule: types are contracts, not coupling."

The real gap was that **nothing checked for cycles at all**: 14 rules about
layering, none about circularity. Added `no-circular-runtime`, which forbids
runtime (non-type-only) cycles.

It found three, none of them this one:

- `router.tsx` ↔ `routeTree.gen.ts` — TanStack generates the pair; exempted by name
- `Login.component.tsx` ↔ `routes/_authed.tsx` — legacy
- `progress.service.ts` ↔ `turn.service.ts` — legacy

`src/domains/` is exempted with the two legacy cycles named in the rule comment;
they belong to DVTD-wj1t. **Config change flagged explicitly**: this adds a rule,
it does not relax one, and the exemptions are scoped to generated and legacy
code rather than to whatever happened to be failing.

Verified non-vacuous: temporarily adding a runtime import from `gate.model.ts`
to `gateReward.model.ts` made it fail with the full 3-hop path, then reverted.

### One deliberate visual change

Two edge cases that rendered an empty value cell now render an em dash: a check
row whose `progress` is absent, and the final fallback row. A blank cell in a
column of numbers reads as a rendering fault; the em dash reads as "nothing
here". Everything else renders byte-identical copy.

### Verification

`npx tsc --noEmit` clean · `npm run lint` clean, 0 dependency violations across
529 modules · `npm test` **1465 passed**, 6 skipped, 2 todo, 0 failed.
