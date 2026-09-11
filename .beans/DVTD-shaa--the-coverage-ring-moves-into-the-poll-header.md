---
# DVTD-shaa
title: The coverage ring moves into the poll header
status: completed
type: task
priority: normal
created_at: 2026-09-11T15:43:17Z
updated_at: 2026-09-11T15:45:10Z
---

`CoverageRing` had a row of its own under the trail (ADR-068 decision 1). Move it
into `Header` as a tall leading element beside the title and track rows, which is
where the mock puts it.

Decisions taken with Marciano:
- Ring only. The title stays `Gate 8 · Volcano`, the audit strip stays a strip.
  The mock's `2 audits ▾` is the prep header's badge, not part of this.
- `Header` already draws coverage as a `label / held / of / demand` reading plus
  a `Meter` (prep uses it). Ring and Meter both stay, made mutually exclusive by
  a discriminated union so ADR-068's "coverage appears exactly once per screen"
  is enforced by the type rather than by prose.

## Todo

- [x] CoverageRing: copy column optional, so the header can take a bare donut
- [x] Header: `ring` prop, union with `coverage`, ringed layout
- [x] PollScreen: drop its own `coverage` prop and row
- [x] Factory: the poll header carries the ring
- [x] Specs: Header, CoverageRing, PollScreen
- [x] Stories
- [x] ADR-068 decision 1 restated
- [x] lint, typecheck, tests

## Summary of Changes

- `CoverageRing`: `title` became optional and the copy column is skipped when
  neither `title` nor `note` is given. The aria-label already carried the whole
  reading, so the bare dial loses nothing an assistive reader needed.
- `Header`: new `ring` prop. When present the header lays out horizontally,
  ring first, with the title and track rows in a column beside it. `HeaderProps`
  is now `HeaderBase & ({ ring } | { coverage })`, so a header cannot draw both.
- `PollScreen` lost its own `coverage` prop and the row that drew it. The layout
  order spec is down to six children.
- The poll fixture passes the bare dial, matching the mock: the header names the
  gate one line to the right, so a second `Coverage toward Volcano` would repeat
  it. `WithRingCaptioned` in Header.stories keeps the captioned form visible.
- ADR-068 decision 1 restated: the ring rides in the header, and the once-per-
  screen rule is enforced by the union rather than by prose.

Verified: 4406 passed, 0 TS errors, depcruise clean.
