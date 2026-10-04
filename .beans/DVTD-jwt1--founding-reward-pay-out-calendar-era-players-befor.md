---
# DVTD-jwt1
title: 'Founding reward: a border only the old game''s players can have'
status: todo
type: feature
priority: high
tags:
    - meta-progress
created_at: 2026-09-09T10:36:05Z
updated_at: 2026-09-24T13:24:03Z
parent: DVTD-z2r2
---

**What:** Give the accounts that played the calendar game a border no later account can ever get.

**Why:** The old loop disappears at 2.0, and the people who played it should keep something from it.

## Done when
- [ ] The tiers are set from the real distribution, not guessed
- [ ] The border art exists, one file per tier
- [ ] A border can be marked not for sale: owners see and equip it, nobody else learns it exists
- [ ] The grant runs once, does nothing on a re-run, and never overrides a border someone already equipped
- [ ] Somewhere says what it is, and that it can no longer be earned

## Notes

Before DevVoted 2.0 replaces the calendar loop, pay out the accounts that played the
old one with something no account created after the cutoff can ever obtain.

**Decided 2026-09-09:** cosmetic only, and retroactive with no announcement.

## Cosmetic only, so nothing forks the balance

A limited config with a real effect is a permanent balance fork: every future roster
and gate-demand pass would have to carry "and some accounts hold a config that cannot
be re-earned, re-tuned out, or removed without taking something away". Nerf it later
and the promise breaks; leave it and seniority is an advantage.

This also drops the entire risky half of the work. **No changes to `CONFIG_UNLOCKS`,
`configdex`, `provenanceOf` or the `???` checklist.** ADR-051's dual-path rule keeps
its no-exceptions form, so no ADR is needed either.

## The reward is a founding border, and it is already visible in 2.0

The vanity system exists end to end: `Border` catalog in
`domains/economy/data/borders.ts` (32 entries, rarity up to a single `legendary`), art
under `public/borders/`, `owned_border_ids` + `equipped_border_id` on `users`, and a
`BorderShop` on the profile route.

Crucially it is **not legacy-only**. `src/modules` already reads it in four places, so
an equipped border shows up today on:

- community screen climbers (`climbers.repository.ts` `borderUrlOf` -> `borderUrl` ->
  AvatarChip)
- the profile avatar (`account/profile/presentation/Avatar.ui.tsx`, square shape only)
- poll author chips (`runPolls.repository.ts` `authorBorderId`)

So this ships standalone. It does **not** wait on DVTD-2try's border work.

Catalog changes needed:

- `Border` gains `limited?: true`. `cost` is a required `number` and a founding border
  is not for sale, so the flag is what carries that rather than a sentinel cost.
- `BorderShop` maps over the whole `borders` array today. Filter the grid to
  `!border.limited || owned`, so owners can equip it and non-owners never learn it
  exists. `BorderCard`'s `canAfford` / purchase branch needs a not-for-sale state for
  the owned case.
- Keep the entry inside `borders` regardless, or `findBorderById` cannot resolve the
  image on the four surfaces above.
- Art: a new file in `public/borders/`. Existing filenames are content hashes; match
  the convention. This is a real deliverable, not a code task.

Borders live in `src/domains/economy/`, which DVTD-wj1t is migrating. `src/modules`
already imports the catalog, so appending an entry is the minimal move; migrating the
border slice is out of scope here.

## The seam already exists

`polls_responses.mode` discriminates `'calendar'` (old loop) from `'session'` (2.0),
so calendar-era play is exactly `mode = 'calendar'`. The oldest rows also have
`run_id IS NULL` ("legacy responses before this column existed"), identifying the
earliest cohort if a deeper tier is wanted.

Measurable today, no new columns:

| axis | source |
| --- | --- |
| days played | distinct `polls_responses.answer_date` where `mode = 'calendar'` |
| volume | count of those rows |
| correctness | join `polls_response_options` -> `polls_options.correct` |
| coverage earned | `polls_responses.coverage_delta` (null on the oldest rows) |
| best streak | `leaderboard.best_streak` |
| contribution | `users.total_polls_submitted` |

## Retroactive, so the tiers must fit the data that exists

No announcement means nobody can play toward this, so the thresholds cannot be
guessed: a tier that holds every player or no player is not a reward. Run the
distribution against **production** first, then pick cuts that actually separate
people. Expect two or three borders, not one, so the top tier reads as rarer.

The correctness axis is the one that needs care: it is a two-join count, and
`coverage_delta` is null on the oldest rows, so a coverage-based cut silently excludes
the earliest players, who are exactly the cohort this is meant to honour.

## The grant

One-off backfill against a frozen cutoff, shipped as a guarded
`supabase/migrations/*.sql` per ADR-012. `array_append` is not idempotent, so guard on
containment rather than relying on re-run safety:

```sql
update users u
set owned_border_ids = u.owned_border_ids || array['border-founding'],
    equipped_border_id = coalesce(u.equipped_border_id, 'border-founding')
from (
  select r.user_id, count(distinct r.answer_date) as days
  from polls_responses r
  where r.mode = 'calendar' and r.created_at < '<cutoff>'
  group by r.user_id
) elig
where u.id = elig.user_id
  and elig.days >= <days>
  and not (u.owned_border_ids @> array['border-founding']);
```

`coalesce` on the equip is deliberate: equip it for anyone with no border so the
reward is visible the moment they log in, without overriding a choice someone already
made.

## Todo

- Query the production distribution of the axes above; set tier thresholds from it
- Decide how many tiers, and name them
- Border art in `public/borders/`, one file per tier
- `Border` gains `limited?: true`; catalog entries appended
- `BorderShop` hides limited borders you do not own; `BorderCard` not-for-sale state
- Guarded backfill migration, containment-guarded, keyed to the frozen cutoff
- Somewhere that says what it is and that it can no longer be earned (profile is
      the natural home, since that is where the shop already lives)
- Specs: an ineligible account is not granted; a re-run is a no-op; an already
      equipped border is not overridden
- CHANGELOG (player-visible)
- lint, typecheck, tests

## Deferred

A mechanical limited reward was considered and dropped for the balance-fork reason
above. If it ever comes back, the notes are worth keeping: it would need a third
`ConfigUnlock` kind (`{ kind: "closed" }`) because `configdex` reads both
`unlock === undefined` and `via_metric = null` as the free starter set, so a limited
config would otherwise render as "Starter config" to its owners and as granted to
everyone who does not have it.

## Related

DVTD-2try (unlock system: configs, starter slots, borders) owns the wider border work.
DVTD-z4rl (trainer card) and DVTD-0imu (unlockable titles) are further display
surfaces for the same kind of reward.

DVTD-n1pr pays the same cohort a title and an archive credit off the same cutoff and
the same distribution query. Ship them together, or that query gets written twice and
the two rewards can disagree about who is eligible.
