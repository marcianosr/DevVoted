---
# DVTD-uixi
title: The build sits in a sticky folded footer on the poll screen
status: completed
type: feature
priority: normal
created_at: 2026-09-11T14:53:49Z
updated_at: 2026-09-11T15:03:30Z
---

The kanto poll screen renders the build band third from the top, pushing the
question down the page. Move it into a footer pinned to the bottom of the
screen: shut it is one summary row, open it is the whole band as it renders
today.

The shut row counts config states rather than configs-against-slots, which is
what ADR-040's Consequences already predicted ("the fold header counts the
states ... instead of configs against slots").

| Count | Means | Colour |
|---|---|---|
| usable | a paid press is ready on this poll | cerulean |
| running | online, in effect on this poll | viridian |
| offline | an audit is holding it down | cinnabar |
| changing | its figure moves on this answer | vermillion |

`skipped` stays on Build's own inner fold. A zero count draws no badge.

Scope is kanto only. src/ui/kanto-theme is Storybook-only; the live poll screen
at /run/answer stays on terminal-theme. Not player-visible, so no CHANGELOG.

Default open state: shut on phones, open from sm up, read once at mount
(the RunCommunity.ui.tsx matchMedia pattern). `open` overrides it.

## Todo

- [x] Build.ui.tsx: drop paying/ready from the poll arm, add `heading`
- [x] Build.spec.tsx + Build.stories.tsx follow the prop change
- [x] BuildFooter.ui.tsx + spec + stories
- [x] Screen.ui.tsx: body gets flex-1 so the footer can sit at the bottom
- [x] PollScreen.ui.tsx: Build leaves position 3, footer becomes the last child
- [x] PollScreen.spec.tsx: order test + the two fold tests
- [x] kantoPoll.factory.ts: counts, and vermillion badges on changing chips
- [x] ADR-069 + README index row
- [x] lint, typecheck, tests

## Summary of Changes

New `src/ui/kanto-theme/BuildFooter.ui.tsx`: wraps `Build` in a `Fold` inside a
`sticky bottom-0` footer. Shut it is one row (total + four coloured figures),
open it is the band unchanged. `open` overrides a mount-time matchMedia read.

- `Build.ui.tsx` lost `paying`/`ready` from the poll arm of `BuildCount` and
  gained `heading` so the `Fold` carries the title instead of stacking a second
  one. `configCountOf` exported so the footer reuses the one format.
- `PollScreen.ui.tsx`: `build: BuildProps` became `buildFooter: BuildFooterProps`
  and moved from position 3 to the last child.
- `Screen.ui.tsx`: body column gained `flex-1` so a short poll does not strand
  the footer mid-page.
- `kantoPoll.factory.ts`: `createKantoBuildFooterProps`; Deprecated and
  Dependabot chips moved saffron -> vermillion to agree with the changing count.
- ADR-069 records the placement, the state readings, why `consumable` and
  `passive` were not used, and that `changing` has no producer yet.

Counts partition the chip field as usable | running | offline, with `changing`
as an overlay rather than a fourth bucket.

Verified: 246 test files, 4396 passed (baseline 245 / 4383); 0 TS errors;
depcruise clean. The one oxlint warning (Screen.stories.tsx) is pre-existing.

Not player-visible: kanto is still Storybook-only, so no CHANGELOG entry.
