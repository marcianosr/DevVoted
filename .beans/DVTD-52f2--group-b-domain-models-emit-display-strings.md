---
# DVTD-52f2
title: 'Group B: Domain models emit display strings'
status: todo
type: task
created_at: 2026-08-12T09:11:57Z
updated_at: 2026-08-12T09:11:57Z
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
- [ ] `gateRewardRows` returns numbers and enums; formatting moves to `GateRewardReport.ui.tsx`
- [ ] Same for `configRole` and `standouts`
- [ ] Move `shopExitFor` copy into the screen
- [ ] Decide whether `run.model.ts` `log` stays prose or becomes structured events
- [ ] Break the `gate/` <-> `climb/` package cycle
