---
# DVTD-2n6h
title: 'Terminal theme round 3: swatch scaling, mobile rows, RunHeader, Rewards + Coverage'
status: completed
type: task
priority: normal
created_at: 2026-09-01T10:09:48Z
updated_at: 2026-09-01T10:16:27Z
---

13-point design feedback on the late-run stories: wrapping/pip swatch tracks, responsive tile size, Row detail below name on mobile, RunHeader gate label xs above swatches + full-width coverage bar, Ledger balance prominent, Home Career→Collection + best-gate swatch, Poll meter for capped configs, Reveal xs results + meta removed, GateClear Rewards + per-category Coverage grid, Dex ??? for unseen, story capitalization sweep.

## Summary of Changes

Primitives:
- SwatchTrack wraps on overflow (flex-wrap, shrink-0 dropped)
- Swatch tile size responsive: size-10 → size-5 under @max-md (GameOver header fits phones)
- Row: on mobile the detail drops to a full-width line under the name (@max-md:flex-wrap + order-last basis-full); name column fixed-width on desktop only
- RunHeader: gate label is xs and sits directly above the swatch track on mobile (flex-col-reverse, CSS-only); coverage meter goes full-width on mobile
- Ledger: non-muted value rows (balance) render size title + bold

Screens:
- Home: Career → Collection (section + prop), swatches row at pip size, best gate carries its swatch (bestGate is now { swatch?, label })
- Poll: PollBuildRow gains meterPercent; IndexedDB rows show a w-24 Meter instead of the duplicate +8 KB figure
- Reveal: build.meta deleted ('2 paid' removed), result texts xs
- GateClear: Storage → Rewards; new required coverage prop ({ rows: {category, polls, gain}[], total }) rendered beside Rewards in a 2-col grid (stacks @max-md), per-category rows with viridian check + neutral poll-count badge + total row; GateHold keeps 'Storage'
- Dex: unseen chips render '???' (keys stay on the real label)

Stories: career→collection + bestGate objects; 'the ladder ends at 24' removed; IndexedDB meterPercent 30/90; reveal metas dropped; coverage data added to both GateClear stories (sums match the chips: 62.4 / 91.2); config description strings capitalized across all 11 stories files (audit + coverage-requirement descriptions intentionally left lowercase — not configs).

Verified: lint + depcruise clean, tsc clean, story typecheck 0 terminal-theme errors, vitest 2622 passed / 3 pre-existing RewardScreen failures. Not committed.
