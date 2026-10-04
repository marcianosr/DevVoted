---
# DVTD-zptd
title: 'Category leaders: one row on the poll screen, twelve on the community board'
status: completed
type: feature
priority: high
created_at: 2026-09-23T13:03:04Z
updated_at: 2026-09-23T13:52:08Z
---

Reshape ADR-100's living record into a `leader` / `seat` vocabulary, and lift it to the community board as a twelve-seat table in place of the standouts panel. Standouts is retired outright (ADR-065 and ADR-067 both die; DVTD-j6t1 is scrapped).

Decisions: all-time (ADR-100 D1 holds, seasons still have no writer) · `your best N` dropped · renamed everywhere including code, no title on the row · categories stay colourless (ADR-020 D1 holds) · the Dex press is dropped with the standouts header.

The mocked footer "A seat opens the moment its holder misses" describes a live streak and is false for an all-time best — copy says a seat changes hands when somebody beats it.

- [x] A: `categoryRecord.model.ts` -> `categoryLeader.model.ts` (`CategoryLeader`, `CategorySeat`, `MIN_LEADER_STREAK`, `seatsFor`; drop `maintainerTitleOf` and `yourBest`)
- [x] B: `categoryLeader.repository.ts` — singular loses its second read, new `fetchCategoryLeaders` folds all twelve in one statement
- [x] C: `HallOfFame.ui.tsx` -> `CategoryLeader.ui.tsx`, one line on two surfaces, plus stories
- [x] C: `pollScreen.viewmodel.ts` — `hallOfFameFor` -> `categoryLeaderFor`
- [x] D: `CommunityScreen.ui.tsx` — `StandingOut` -> `CategoryLeaders` panel
- [x] D: service, presenter, factory, proto-run rig wiring
- [x] E: delete `standouts.model.ts` (rescue `CommunityVoter` first), drop `fetchActiveRunStats`
- [x] F: ADR-103, retire 065/067, collapse ADR-100 D2/D4, CONTEXT.md, wiki 7.3, CHANGELOG
- [x] Verify: test, typecheck, lint, lint:dead, db:refresh + live check

## Summary of Changes

ADR-103 written; ADR-065 and ADR-067 deleted with Retired rows; ADR-100 D2 and D4 collapsed to pointers.

**Domain** — `categoryRecord.model.ts` → `categoryLeader.model.ts`: `CategoryLeader`, `CategorySeat`, `MIN_LEADER_STREAK`, `isLeadingStreak`, and `seatsFor` (pads `CATEGORY_CODES` to twelve, held first by streak, stable on ties). `maintainerTitleOf` and `yourBest` are gone.

**Read** — `categoryLeader.repository.ts`. The island fold now always partitions by `(user_id, category_code)`, so one helper serves both callers. `fetchCategoryLeader` lost its second read; `fetchCategoryLeaders` ranks with `row_number() over (partition by category_code order by best desc, user_id asc)` — one statement for twelve seats, not twelve round trips. The gaps-and-islands cut is untouched.

**Row** — `HallOfFame.ui.tsx` → `CategoryLeader.ui.tsx`: one line, no padding or rule of its own, so the poll screen wraps it in a region and the board hands it a `Panel.Row`. `categoryLeaderRowFor` (`run/application`) is the single owner of the figure and the claim copy, used by both surfaces.

**Board** — `StandingOut` → `CategoryLeaders`: header carries the scope and "N of 12 seated", rows carry the seats (yours themed viridian), footer states how a seat moves. The Dex press went with the old panel; it was only ever supplied by the fixture, never the live presenter.

**Retired** — `standouts.model.ts` + spec, `fetchActiveRunStats` / `ActiveRunStatsRow` and the `json_array_elements` outcomes aggregate. `CommunityVoter` was rescued to `community/domain/voter.model.ts`; `CommunityAnswer` became local to the service, its only consumer. `RunState.configsLost` keeps being written and loses its only reader.

**Copy correction** — the mocked footer "A seat opens the moment its holder misses" describes a live streak and was false for an all-time best. It reads "A seat changes hands when somebody beats it. N seats still open."

Docs: wiki §2.4, §7.1, §7.3 and §8 rewritten (`docs:sync` re-run), CONTEXT.md rows, CHANGELOG (the unreleased hall-of-fame entry rewritten rather than appended to, since it never shipped; a Removed entry for standouts).

Verification: 3570 tests / 186 files pass, `tsc --noEmit` clean, `npm run lint` (oxlint + lint:arch + docs:check) clean, `npm run lint:dead` reports nothing new. No browser check and no `db:refresh`, per standing instruction.

## Follow-up: the dev rig had to fabricate the seat

Reported from `/proto-run`: the poll screen drew no leader line.

`PollView` reads `view.poll.categorySeat`, which `withPollReads` attaches in the
service — not `toRunView`. The rig drives the reducer directly and has no
service, so the field was always `undefined` there. ADR-100's row was invisible
in the rig for the same reason and nobody noticed, because the rig was never the
place it was checked.

`withCategorySeat` in `proto-run.tsx` now fills it, and `git` is left unheld so
both the held and the open state are reachable while playing. `trainerBy` /
`trainerLeader` were lifted to module scope to serve it — neither closed over
component state.
