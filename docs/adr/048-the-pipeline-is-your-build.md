# ADR-048: The pipeline is Your Build

## Status

Accepted (2026-08-30, Marciano, DVTD-811d). Reverses ADR-044's `slots → spots` rename
and retires "pipeline" as the name of the container. `CONTEXT.md` is updated in the
same change.

## Context

"Pipeline" is a CI metaphor, and the gate is already the CI run that judges you. Two
things wearing the same metaphor made the container read as the thing doing the
grading rather than the thing the player assembled. "Spots" was a rename of convenience
made when width and money needed separating; with slots bought in KB the two are
coupled on purpose, and the reason for the odd word is gone.

## Decision: four nouns, one job each

| Word | What it means |
| --- | --- |
| **Storage** | The KB economy and its ceiling |
| **Build** | The active setup, shown as **Your Build** |
| **Slots** | Capacity within that build |
| **Configs** | The things installed in those slots |

No word does two jobs. "Spot" is gone. "Pipeline" is gone as a container name and stays
only where it means an actual CI pipeline.

`slot` and `unslot` — the install and uninstall reducer actions — become `install` and
`uninstall`. They were the older sense of the word and would otherwise sit next to
`buy-slot` meaning something unrelated.

## Consequences

`src/modules/run/pipeline/` becomes `src/modules/run/build/`; `pipeline.model.ts`
becomes `build.model.ts`; the `Pipeline` type becomes `Build` and its `spots` field
becomes `slots`. `Pipeline.ui` → `Build.ui`, `PipelineTrack.ui` → `BuildTrack.ui`,
`SpotTrack.ui` → `SlotTrack.ui`, `spots.ts` → `slots.ts`.

`RunState.pipeline` becomes `RunState.build`, which changes the shape of the persisted
`runs.state` jsonb. In-flight runs do not survive it. On a pre-release branch the
honest answer is `npm run db:refresh` rather than a compatibility shim that would
outlive the reason for it.

Out of scope on purpose: `src/domains/` is legacy-but-live and keeps its own
`pipelineEvaluator.service` and friends, and the `pipeline_slots` tables serve it. They
move when that slice migrates. Accepted ADRs keep their dated text — they record what
was decided at the time, and rewriting them would lose why the word changed.
