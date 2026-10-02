---
# DVTD-06o0
title: Who cleared what reads the gate outcome and the day's records
status: completed
type: feature
priority: normal
created_at: 2026-10-02T11:45:49Z
updated_at: 2026-10-02T11:55:17Z
---

**What:** The community turnout panel sorts today's players into five gate outcomes and adds a row per day record.

**Why:** "Who showed up" is one number; the outcome and the records give a reason to read the board every day.

## Done when
- [x] Each player who closed a gate today sits in exactly one of PERFECT, HEALTHY, OK, SHAKY, DANGER
- [x] Below a divider, the panel names the record holders: biggest and lightest build, comeback, most audits, most installed config, most expensive build, KB generated, KB spent
- [x] A record nobody holds is not drawn
- [x] The wiki, an ADR and the changelog describe the outcome mapping and how the KB figures are derived

## Notes
- SHAKY = the gate held them, DANGER = the run fell today; a clear on a shaky or danger band files under OK.
- KB generated = sum of each close's kb (the faucet is already inside it). KB spent = start KB + generated − current storage (net of sells).
- "Today" = live session runs plus session runs that fell today.

## Summary of Changes

- New `dayRecords.model.ts` (domain): `outcomeOf`, `outcomesOf`, `dayRecordsOf`, KB derivations, `EMPTY_DAY_TURNOUT`.
- `climbers.repository.ts` selects `closes`, `auditSchedule`, warm boot KB.
- `community.service.ts` adds `climb.turnout` (outcomes + records as voters).
- `communityScreen.viewmodel.ts` exports `turnoutFor`; proto-run uses it too.
- `CommunityScreen.ui.tsx`: row caption, records group under a `today's records` strip.
- ADR-176, wiki 7.1, changelog.
