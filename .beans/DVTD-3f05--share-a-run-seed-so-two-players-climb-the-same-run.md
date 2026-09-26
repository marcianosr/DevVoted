---
# DVTD-3f05
title: Share a code so two players climb the same run
status: draft
type: feature
priority: normal
created_at: 2026-09-12T13:08:40Z
updated_at: 2026-09-24T12:49:08Z
parent: DVTD-h175
---

**What:** Let two players climb the identical run from a shared code, so the only difference left is their decisions.

**Why:** Everyone answers the same polls already, but each player is dealt a different hand, so builds cannot be compared.

## Done when
- [ ] Decided: shared by default or only when a code is pasted, and what the code is called
- [ ] A run stores its own code, so a reload deals the same hand
- [ ] The code is readable, shareable from the run summary, and pasteable on the new run screen
- [ ] A code from another day is refused, with a reason
- [ ] A same-day restart stops dealing the identical hand

## Detail

"What did you build today?" is the water-cooler moment ADR-009 was designed
around, and it half works: everyone answers the same polls, but nobody can
compare builds, because each player is dealt a different hand. Give a run a
shareable seed and two people climb the identical run, so the only difference
left is the decisions.

## The run is already deterministic, on one string

Worth knowing before designing anything: almost nothing about a run is random
per player.

| What | Seeded by | Same for everyone today? |
| --- | --- | --- |
| The day's five polls | `dailyRunSeedsTable.seed`, keyed by date | yes (ADR-009) |
| The audit schedule | `drawAuditSchedule(date)`, `run.service.ts:134` | yes |
| Shop drafts | `draftSeed(gatesCleared, rebuildsUsed, extensions)` | yes, it has no entropy at all |
| **The starting hand** | **`${userId}:${date}`, `run.service.ts:132`** | **no** |

One string is the whole divergence. Replace it with a run seed and the feature
exists; everything else already lines up.

## What a shared seed can and cannot reproduce

**Can, same day, cheaply.** Share today's seed, your friend starts a run with
your hand, your audits and your polls, because the date supplies the last
three. A true head-to-head with no new poll machinery.

**Cannot, without real work: a past run.** The polls come from the day you play,
not from the run you copied, so "replay the run I finished last week" needs a
stored per-run poll sequence and then collides with the daily gate lock
(ADR-014): one gate a day means replaying a twelve-gate run takes twelve days.
Out of scope here, and worth a separate bean if it is ever wanted.

So the shareable thing is the *build* conditions, not the climb. Name it
accordingly.

## The decision this actually asks for

`${userId}:${date}` is not plumbing, it is a design choice, and unpicking it has
two consequences worth deciding on purpose:

1. **Should the hand be shared by default?** If the seed is the date alone,
   every player is dealt the same five and diverges at the pick (deal 5, pick 3,
   DVTD-ez37). That is arguably a better water-cooler moment than a shared code
   nobody sends: "I got dealt the same five as you, I took Prefetch." It also
   makes the same-seed leaderboard (ADR-009 decision 5, DVTD-1q2y) a fair
   comparison rather than a rough one.
2. **Or is the seed opt-in?** Keep `${userId}:${date}` as the default and use a
   supplied seed only when the player pastes one. Safer, and preserves the
   feeling that your hand is yours.

Recommend opt-in first: it is additive, it cannot regress the daily experience,
and it answers question 1 with a playtest instead of a guess.

## A bug this surfaces

`${userId}:${date}` is not unique per run. A same-day restart (DVTD-li9i allows
several runs per day) is dealt the **identical hand**, so "abandon and try
again" cannot try a different opening. A run seed fixes this whether or not the
sharing ships.

## Naming

"Seed" already means the day's poll sequence, in `seed.model.ts`, `seed_date`
and `dailyRunSeedsTable`. A second meaning on the same word breaks
one-term-one-meaning, and the two are genuinely different things (one picks
polls, one deals a hand). Settle the word before building. The share code is
probably not called a seed.

## Todo

- Decide opt-in versus date-seeded-by-default, and the word for the shared code
- Thread a run seed through `startingHand`, stored on the run so a reload deals the same hand
- Generate a readable code (Balatro-style short string), not a raw hash
- Entry point: paste a code on the new run screen, beside the dealt hand
- Share point: the code on the run summary and the community board, copyable
- Reject a code from another day with a message that says why, since the polls will not match
- Check ADR-009 decision 4 still holds: a shared seed must never let a config change which polls appear

## Notes

- ADR-062 shapes the deal (budget, smallest-three-fit, focus band). A seed picks
  within those guarantees, it does not bypass them.
- `startingHand`'s third argument is `BASE_SLOTS`, which ADR-074 replaces with
  free weight. Coordinate with DVTD-uhub rather than hardcoding 4 again.
- DVTD-2wwl exposes the day's seed on `RunCommunityView` and is the natural
  place for the share affordance to live.
- `seededRandom.ts` is an LCG and `seed.model.ts` is mulberry32 + xmur3. Two
  PRNGs already. Do not add a third.
