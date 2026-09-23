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

Everything else on the run. The current poll and the position inside it, the
picks (`answeredThisGate`, `allAnswered`), Telemetry peeks, `.length` and its
estimates, the committed band, Prefetch's upcoming categories, an armed
`strict: true` wager, whether an attack is held, and storage. Incidents queued
at a rival's next gate are the Incidents page's business, not the build's.

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
