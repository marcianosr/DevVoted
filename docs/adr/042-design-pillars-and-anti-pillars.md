# ADR-042: Design pillars and anti-pillars

## Status

Accepted — 2026-08-27 (Marciano, DVTD-4bk5). Supersedes nothing: this ADR adds a
lens rather than a rule, and the only text it deletes is wiki §2.1's monetization
note (Decision 3). Every later ADR that has to choose between two defensible
options cites a pillar here.

## Context

Forty-one ADRs in, several have reversed each other inside days: ADR-018 lasted one
day before ADR-019 replaced it, ADR-035 reversed three of ADR-034's decisions, and
the shop's kill-at-door rule was reversed the same session it shipped. Every one of
those decisions was locally sound. What was missing was a written statement of what
the game is for, so two sound decisions pointing opposite ways had no tiebreaker and
the more recent one simply won.

## Decision 1: five pillars

| Pillar | Definition | Design test |
| --- | --- | --- |
| **1. The teaching survives the loss** | Every answer leaves you knowing something you did not, whatever it cost you. | Choose the explanation over the punishment. A timed-out answer still teaches. |
| **2. Nothing is hidden that costs you** | Every price, demand, audit and fatal outcome is on screen before you commit. | Choose clarity over surprise. A mechanic that only works as an ambush does not ship. |
| **3. Friction belongs to the gate** | Configs give; gates demand. No config asks anything of the player. | Put a new cost on the gate. If it must sit on a config, it is a fee on a chosen action, never a condition. |
| **4. Real tools, real names** | Content comes from the actual developer world, named literally. | Rename the mechanic to fit an existing dev term rather than coining a word for it. |
| **5. The day is the unit** | One shared seed, five polls, then it locks. | Cut the feature or move it outside the window rather than lengthening the window. |

Pillar 2 was already being enforced before it was written down: the defeat device
reports its fraud visibly ([ADR-028](028-the-defeat-device.md)), locked shop actions
state why, the fatal peel is red on the stake receipt, a clean gate names the audit
waiting ahead, and the Subscriptions section exists so the bill is readable before
the commit rather than after it.

The pillars are meant to pull against each other. Recorded tensions, so a later
reader knows they are deliberate:

| Tension | Shape |
| --- | --- |
| 1 vs 5 | Teaching wants repetition and follow-up; the day allows five polls. |
| 2 vs 3 | All friction sits on gates, which stack three audits by the summit; disclosing all of it grows the receipt without limit. |
| 3 vs build-craft | If configs never demand anything, a config is pure upside and drafting is never a hard choice. |
| 4 vs 1 | The real dev term is sometimes the opaque one. |

## Decision 2: five anti-pillars

| We will not | Because it compromises |
| --- | --- |
| Make reflex a skill axis. Timing appears only as an audit, never as the thing a player gets good at. | Pillar 1 |
| Generate polls procedurally. | Pillars 1 and 4 |
| Offer any path to more than one gate attempt per day. | Pillar 5 |
| Let competitive ranking drive design. Leaderboards, awards and the Dex report the climb; they never shape it. | Pillar 1 |
| End a run on an ordinary miss. | Settled already in [ADR-021](021-death-at-the-gate-that-empties-the-build.md) / [ADR-037](037-a-missed-gate-peels-a-config.md) |

Anti-pillar 4 is a boundary, not a ban: an award for a behaviour teaches players to
farm that behaviour, so new awards are checked against pillar 1 before they ship.

## Decision 3: the daily lock is not for sale

Wiki §2.1 carried a note that spending storage to climb past the daily lock was a
"designed monetization lever, cost curve undefined." That sells the thing pillar 5
and anti-pillar 3 exist to protect. The note is deleted.

Monetization is confined to what does not buy attempts: cosmetics, poll packs,
archived storage, seasons and borders.

## Consequences

- An ADR that has to pick between two defensible options cites a pillar. An ADR that
  cannot find one is a signal the pillar set is incomplete, not that the pillar set
  is optional.
- Wiki §2.1's monetization note is removed. The cost curve question is closed rather
  than deferred.
- Early-gate calibration is now a pillar-1 problem, not only a balance problem. Wiki
  §2.7 records that the coverage demands "were priced when a miss was free," and a
  player who cannot clear gate 2 is being taught nothing. Tracked separately.
- Two rule changes were derived from this set in the session that wrote it: the streak
  rule (a false assertion breaks it, an under-pick does not) and `it.skip`. Both get
  their own ADRs.
- **Rejected 2026-08-27:** shortening a run from 13 gates to 6 or 7 so a victory
  arrives inside a week. The first victory sitting 12 or more calendar days out is
  accepted as the top structural retention risk; archived storage, swatches and the
  Dex pay out along the way. Run length and daily cadence are independent variables,
  so this can be revisited without touching pillar 5.
