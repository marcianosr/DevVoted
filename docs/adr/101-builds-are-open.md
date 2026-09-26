# ADR-101: Builds are open

## Status

Accepted — 2026-09-22 (Marciano, DVTD-rawb). Restates the premise
[ADR-099](099-audits-are-fired-by-rivals.md) §4 leaned on as a rule of its own,
and narrows the "aggregates only, never who installed what" line in DVTD-144r
and DVTD-wfkv: an install share stays an aggregate behind a quorum, the build
itself is public.

Built the same day. `publicBuild.model.ts` owns the projection, the
`publicBuildColumn` in `climbers.repository.ts` is the one read, and the prep
attack rows and the community climb track are the two surfaces.

**§2 narrowed 2026-09-26** (Marciano, DVTD-kc5k): a run's storage, the coverage
it has banked so far and its current streak are public. A climber's card on the
community board is the surface that states them. What a run knows and you do
not is still private, and §2 lists it.

## Context

ADR-099 refused a free payload pick *because* "builds are open, and a free pick
would be too surgical". Nothing showed one. Every cross-player read projected
scalars — gate, position, a config count, a slot total — and wiki §7.1 carried
"🟡 Builds, configs and storage are still not shown". The Marketplace draft
(DVTD-8f3i) had already listed what a public build should show and hide, and
the death-loot draft (DVTD-kgch) assumes a fallen run's configs are readable.

[ADR-042](042-design-pillars.md) pillar 2, "nothing is hidden that costs you",
cuts both ways here. A rival you fire at should be readable, or the shot is a
guess. But a build sits inside a run, and a run holds things that would hand
another player an answer.

## Decision

### 1. A build is public

For every live or fallen session run, anyone may read: the installed configs,
each one's version, each one's weight, and which one is vendor-locked. It is
read where a rival is already drawn — under each row of prep's **Your attack**
panel, and on the community climb track by pressing or hovering a climber's
chip, fallen chips included.

### 2. What stays hidden

What a run knows that the reader does not. The current poll and the position
inside it, the picks (`answeredThisGate`, `allAnswered`), Telemetry peeks,
`.length` and its estimates, the committed band, Prefetch's upcoming
categories, an armed `strict: true` wager, and whether an attack is held.
Incidents queued at a rival's next gate are the Incidents page's business, not
the build's.

The line is knowledge, not modesty. Every item above would hand the reader an
answer, or a read on a shot about to be fired at them. **Standing, by contrast,
is public**: where a run is, how its last gate closed, the coverage it has
banked, its streak, its storage, and what it is carrying. None of that can be
played against the player it belongs to — ADR-105 already decides who may fire
at whom off the closing band alone — and a board that draws everyone's position
while hiding how they are doing states the score of a race it refuses to call.

Only `{ id, level, minified, vendorLockedConfigId }` leave Postgres, projected
inside the query like every other cross-player read. The roster restates the
label and the weight (`publicBuildOf`), so a stale embedded config never ships
and no effect field ever crosses the wire. The `run_states.state` blob stays
server-only.

### 3. Display only

No check, payout, eligibility rule or reducer reads another run's build. The
standing rule that nothing in a live run reads live social data is untouched;
this is a readout, not an input.

## Consequences

- `RivalCandidate`, `AttackOffer`, `ClimbClimber` and `ClimbFallen` carry a
  `PublicBuild`; the reads that already scanned every live row select one more
  JSON column.
- Since the 2026-09-26 narrowing, the climbers read also projects the worn
  title, the GitHub handle, `run_states.coverage`, and `streak` and `storage`
  by JSON path. Coverage crosses the wire as the units the column stores and
  becomes a percentage through `runCoverageOf`, never as a percentage computed
  in SQL.
- A future kanto community screen (DVTD-6poh, DVTD-4km2) inherits the reveal
  from the data; its climber chip owes a `build` prop.
- Climbers folded behind the track's `+N` badge have no chip to press, so their
  builds are not readable there. Accepted.
- ADR-099's refusal of a free payload pick now rests on a rule rather than an
  assumption.

## Rejected

- **Shipping `state->'build'` whole.** Stale roster copies and forty effect
  fields nobody needs, on a blob the schema marks server-only.
- **A separate builds-by-run query.** A second round-trip on every prep and
  board load, to join what one column already answers.
- **A visibility config, or a per-player privacy toggle.** DVTD-8f3i already
  rejected the config: a build private until somebody pays to see it makes the
  social layer opt-in. A toggle would let the leaders hide from the shells.
- **A new community section listing builds.** A build belongs beside the
  person, where the rival is already drawn.
- **Keeping storage private while showing the build it bought** (reconsidered
  2026-09-26). The weight a build carries was already public, and weight is
  what storage buys, so the secret was half-told and told misleadingly: a
  reader could see the build and not whether its owner could afford the next
  one. Hiding it protected nothing a rival could act on.
