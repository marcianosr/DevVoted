# ADR-196: The game day is one UTC day

## Status

Accepted — 2026-10-11 (Marciano, DVTD-1z09). Pins the day that
[ADR-009](009-session-run-cadence-daily-seeded-shared-run.md) seeds on.

## Context

The server named "today" by its own clock, UTC on Vercel. The browser named it by
the player's: the countdown ran to local midnight and the query keys carried the
local date. A Dutch player saw the clock hit zero one to two hours before new polls
existed, and cached tomorrow's key against today's data.

## Decision

Every player shares one game day, from UTC midnight to UTC midnight, on the server
and in the browser. `dateUtils` is the only place that turns a moment into a game
date.

| Where | Summer | Winter |
|---|---|---|
| Netherlands | 02:00 | 01:00 |
| New York | 20:00 | 19:00 |
| Los Angeles | 17:00 | 16:00 |

## Rejected

- **A local day per player** (Wordle). The seed, the audits and the community board
  are shared. A player in Tokyo would answer the day's polls 17 hours before one in
  Los Angeles, and the board's answer spread would spoil them. "Filed today" and
  "fell today" would stop meaning one day.
- **Amsterdam midnight.** A natural midnight for Dutch players, but the code would
  follow its clock changes, and production dates were already UTC.

## Consequences

In summer the reset falls at 20:00 in New York, so an evening session can span two
game days. No migration: production always wrote UTC dates.
