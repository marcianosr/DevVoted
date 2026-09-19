---
# DVTD-lzds
title: Drop the six legacy tables the new run engine never reads
status: todo
type: task
priority: normal
created_at: 2026-09-19T15:50:43Z
updated_at: 2026-09-19T15:50:43Z
---

Six tables in `src/database/schema.ts` are read by nothing under `src/modules/**`.
They belong to the legacy calendar loop in `src/domains/`. Marked `@deprecated`
in the schema on 2026-09-19 (during DVTD-vs2h); this bean tracks actually
removing them.

Verified by grepping every table's TS export across `src/modules`, `src/domains`
and `src/routes`.

## The six

| Table | Replaced by | Blocked on |
|---|---|---|
| `seasons` | nothing — the concept is gone | **nothing.** Zero references outside `schema.ts`. Only `runs.season_id` still points at it |
| `run_category_coverage` | `run_states.state.coverageByCategory` | `src/domains/runs/api/{coverage,ranking,run,shop}.queries.ts` |
| `leaderboard` | community standouts, computed from `run_states` | `src/domains/runs/api/ranking.queries.ts` |
| `run_shop_offerings` | engine-side `shopDraft` → `RunState.draftOptions` | `src/domains/economy/api/shopOfferings.queries.ts` |
| `daily_exposed_deck` | nothing — legacy shop exposure | `src/domains/economy/api/shopOfferings.queries.ts` |
| `daily_polls` | `daily_run_seeds` + `daily_run_polls` | `src/domains/polls/api/dailyPoll.queries.ts`, `/admin` |

## Order of work

- [ ] Drop `seasons` + the `runs.season_id` column — unblocked today, nothing reads it
- [ ] Retire `/admin`'s daily-poll scheduler, then drop `daily_polls`
- [ ] Retire the legacy shop queries, then drop `run_shop_offerings` + `daily_exposed_deck`
- [ ] Retire `ranking.queries.ts`, then drop `leaderboard`
- [ ] Retire the legacy coverage queries, then drop `run_category_coverage`
- [ ] Remove each from the DROP list in `src/database/reset.ts`
- [ ] Guarded migration per ADR-012 for each drop

## Also dead, same cleanup

`runs` carries ~20 legacy columns no `src/modules/**` file reads:
`pipeline_slots`, `pipeline_slot_snapshots`, `active_config_ids`, `rerolls`,
`total_rerolls`, `reroll_storage_used`, `storage_limit`, `injected_archive_bytes`,
`shop_skipped_date`, `shop_interacted_date`, `deinstall_penalty`,
`correct_polls_count`, `pending_upgrade_cards`, `looted_by_user_id`, `looted_at`,
`loot_amount`, `season_id`.

## Blocker on deleting src/domains entirely

`schema.ts` imports `ScoreCalculation` from `~/domains/runs/services/score.service`
to type `polls_responses.score_breakdown`. That type must be inlined or the
column dropped before `src/domains/` can go.
