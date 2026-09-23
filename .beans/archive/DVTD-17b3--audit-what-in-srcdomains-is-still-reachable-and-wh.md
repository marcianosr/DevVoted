---
# DVTD-17b3
title: 'Audit: what in src/domains is still reachable, and what modules/run already replaces'
status: completed
type: task
priority: high
created_at: 2026-08-13T11:18:05Z
updated_at: 2026-09-19T16:04:49Z
parent: DVTD-82c4
---

129 files across `domains/{runs,polls,economy}`. Nobody has established which are dead, so every decision so far has defaulted to 'it's live' and pointed at migration. Migration is the wrong verb if the code is superseded.

Known signals, gathered while closing the account slice (DVTD-wj1t):

- `runs/prototype/{sessionRun,sessionSlice}.ts` — the old engine. Only importer outside its own folder is `routes/proto-session-slice.tsx`, a dev rig.
- `economy/data/configs.ts` is **1134 lines**; the new `modules/run/config/domain/configRoster.model.ts` is 298. Old config system.
- `polls` authoring IS live: `/polls/new`, `/polls/$pollId/edit`, and `modules/collection/dex/application/polldex.service.ts` imports `pollAnswerEvaluation.service`.
- `economy` borders ARE live: `modules/account/profile/presentation/Avatar.ui.tsx` imports `findBorderById`.

The tangle is why per-directory judgement fails: `economy` and `polls` both import `runs` heavily (`run.model`, `score.service`, `turn.service`, `pipelineEvaluator.service`). Judge them separately and all three read as live; judge them against the old engine's death and large parts of all three go together.

## Deliverable

A file-level table: reachable-from-live-route / reachable-only-from-proto-route / unreachable, cross-referenced against the `modules/run` symbol that supersedes it.

## Specific questions to answer

- Does `__root.tsx`'s nav (`getActiveRun`, `useFinishRun`, `deriveNavRunState`) drive the OLD run table or the new one? If old, the new game has a nav bar wired to the wrong engine.
- Which `domains/polls` files are authoring (keep) vs old-game scoring (delete)?
- Is anything in `domains/economy` besides borders still live?
- What does the old app still do that `modules/run` does not? (overlaps DVTD-3dxo)

## Todo
- [ ] Map every src/domains file to reachable / proto-only / unreachable
- [ ] Cross-reference each against its modules/run replacement
- [ ] Answer the four questions above
- [ ] Produce the delete list, the keep list, and the genuinely-unclear list

## Summary of Changes (2026-09-19)

The audit this bean asked for was done by import-graph reachability from
`src/routes/**` + `scripts/**` + the db entrypoints. Results, and the deletions
they justified, are recorded on DVTD-9qyd (domains) and DVTD-7tof (UI kits).

**What is still reachable in `src/domains/`, and from where:**

| Subfolder | Reached from |
|---|---|
| `economy/components` | `/profile/$userId`, `/presentation` |
| `economy/data` | `/admin`, `Footer`, 3× `src/modules/` |
| `economy/hooks`, `economy/models` | `/profile/$userId`, `/admin`, `/dex` |
| `economy/api`, `economy/services` | only via the above (no external importer) |
| `polls/api`, `polls/components`, `polls/models` | the four poll routes, `/stats`, `Footer`, 2 scripts |
| `polls/services` | `modules/collection/dex`, `scripts/test-weights.ts` |
| `runs/api`, `runs/utils` | `__root.tsx` (`getActiveRun`, `deriveNavRunState`) |
| `runs/data`, `runs/models`, `runs/services` | `database/seed/`, `database/schema.ts`, `/presentation` |
| `runs/components` | `/presentation` only |

**The finding that matters most:** `__root.tsx` runs the *legacy* run engine
(`runs/api/runs.ts::getActiveRun` + `runs/utils/deriveNavRunState`) while every
`/run/*` route runs the new `modules/run` engine. Two engines, one app.

Also: 4 `src/modules/` specs still import the legacy fixture
`domains/runs/models/run.mock.ts` — a migration blocker for DVTD-wj1t.

16 distinct domains↔modules concept duplications remain (two config rosters, two
`createRun`, two run repositories, pipeline vs gate, score vs coverage). Those are
migration work, not cleanup.
