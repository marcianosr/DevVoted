---
# DVTD-pu0s
title: 'Team runs: one weekly bar a team fills together'
status: draft
type: feature
priority: normal
created_at: 2026-09-24T10:27:57Z
updated_at: 2026-09-24T12:49:40Z
parent: DVTD-u35m
---

**What:** A team of accounts with one weekly bar that every gate a member clears adds to, beside the team's split on today's polls.

**Why:** Nothing in the app knows two people work together, and comparing answers with colleagues is the whole point.

## Done when
- [ ] How a team is formed is decided and written down
- [ ] Clearing a gate records something a weekly total can count, including on a run that later dies
- [ ] The team screen shows the weekly bar and the team's split on today's polls
- [ ] Whatever it pays, if anything, is paid outside the run and never into a gate
- [ ] Empty states: no team, a team of one, nobody climbed this week

## Notes

The north star is comparing answers with colleagues, and today nothing in the app
knows two players work together. The community screen ranks strangers by ladder
position; there is no company, no team, no shared goal.

## The shape

A team is a named group of accounts. Every gate a member closes in a calendar
week adds one to the team's weekly total, which is drawn as one bar with a real
ceiling: 5 polls a day means at most one gate a day per member, so a team of six
tops out at 30 gates in a working week, 42 across seven days. A dead run still
counts the gates it closed. Showing up is the contribution.

The bar is the frame. The water cooler is the other half of the screen: the
team's split on today's shared polls. The daily seed is already shared by date
(`daily_run_polls`), so teammates answering on the same day genuinely saw the
same five polls, and "you picked B?" is a real conversation the app can start.

## Open decisions

1. **What makes a team.** Email domain off `users.email` is zero friction and
   nails the company case, but a domain is not consent to be listed, and it does
   nothing for gmail accounts. A join code is honest, opt-in, and works for a
   guild that spans companies. Domain-suggested, code-confirmed is the middle.
2. **What counts as a gate this week.** `run_states.gates_cleared` is a counter
   on the live run, not a log: it cannot answer "how many gates on Tuesday", and
   it resets when a run dies. A weekly sum needs a timestamped row per gate
   close. Cheapest is a `gate_clears` event table written where the close already
   persists; deriving it from `run_polls.segment_date` is possible but guesses.
3. **Whether the climb pays.** Config checks must never read social data (the
   check has to be evaluable from the run alone), so the team total can only ever
   drive a payout, never a gate. If it pays, it pays meta: Archive KB, a swatch,
   a border. Never in-run coverage.
4. **Sum or comparison first.** The comparison is the north star and is nearly
   free (`pollSplit.service.ts` needs a team filter); the weekly sum needs the
   team entity and the event table. They ship in that order, or the sum ships
   first as a bar with no story behind it.
5. **Week boundary and timezone.** Runs already roll over on a local day
   (`localDayRange`). A team spanning timezones needs one anchor, probably the
   team's, not each member's.

## What already exists

- `run/community/` has the aggregate: `climbers.repository.ts` projects other
  players' scalars (`gates_cleared`, ladder `position`, public build) without
  opening the state blob, `pollSplit.service.ts` computes per-poll splits,
  `climbMap.model.ts` owns the ladder maths.
- `run_states` carries `gates_cleared`, `coverage`, `polls_answered` per run,
  denormalized exactly so cross-player reads stay out of the blob.
- ADR-101 already decided builds are public, so a team screen may show a
  teammate's configs without a new privacy call.
- No team, org or company exists anywhere in `src/database/schema.ts`.

## Todo

- Decide 1 to 5 above, record the team definition and the payout rule as an ADR
- Team entity: table, membership, join path
- A gate close writes a timestamped row (or: prove `run_polls` can derive it)
- Weekly total query, scoped to team and week, counting dead runs
- Team screen: the weekly bar plus the team's split on today's polls
- Decide what the bar pays out, if anything, and pay it in meta only
- Empty states: no team, team of one, nobody climbed this week
