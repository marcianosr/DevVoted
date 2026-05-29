---
# DVTD-uwwq
title: Auto-reset abandoned runs after 7 days of inactivity
status: todo
type: feature
priority: normal
created_at: 2026-05-29T08:08:30Z
updated_at: 2026-05-29T08:08:50Z
---

When a player has not answered a poll in their active run for 7 consecutive days, the run is automatically reset (marked abandoned/expired). Keeps the daily-poll cadence central to the game loop and prevents players from indefinitely parking half-finished runs.

## Open design questions

- **What gets reset?** Only the `runs` row (status → `abandoned`), or also clear active configs/coverage? Player's `polls_user_performance` should survive either way — that's account-level progress, not run-level.
- **Grace period UX:** silent reset, or warn the player at day 5/6 (in-app banner / email via Resend infra)? Loud reset turns inactivity into a re-engagement hook; silent reset is cleaner but loses the touchpoint.
- **Threshold source:** hardcoded 7 days, env var, or per-run config? Hardcoded is simplest; making it configurable invites future balancing without code changes.
- **Trigger mechanism:** cron job sweeping abandoned runs, or lazy check on next login/poll attempt? Lazy avoids infra but means the run is technically still "active" in the DB until the player returns.
- **Daily polls missed during inactivity:** do they count as wrong answers, or are they skipped? Affects coverage stats and whether the player can ever 100% a run that survives partial inactivity.

## Implementation sketch (placeholder)

- New `runs.status` value: `abandoned` (alongside existing statuses)
- New column or derived field: `last_activity_at` on `runs` (or compute from latest `polls_responses.created_at` joined to run)
- Reset logic likely belongs in `src/domains/runs/services/` as a new service (e.g. `expireInactiveRun.service.ts`)
- If cron-driven: add a server function + scheduled trigger

## Todos

- [ ] Decide on the 5 open questions above
- [ ] Schema change (if `last_activity_at` needed)
- [ ] Implement expiration service
- [ ] Wire up trigger (cron or lazy)
- [ ] Tests: run expires after 7 days, run does NOT expire at 6 days, partial activity resets the counter, `polls_user_performance` survives reset
- [ ] (Optional) Warning notification at day 5/6
