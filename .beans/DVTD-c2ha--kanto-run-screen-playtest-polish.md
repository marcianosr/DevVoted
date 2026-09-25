---
# DVTD-c2ha
title: Kanto run-screen playtest polish
status: completed
type: epic
priority: normal
created_at: 2026-09-24T12:30:14Z
updated_at: 2026-09-24T13:22:15Z
---

22 pieces of playtest feedback across the new-run, poll, gate-outcome, shop and registry screens. Mostly presentation-tier spacing/alignment/mobile/copy fixes, plus three behaviour bugs (registry upgrade press, drop presses live after the peel settles, footer press invisible on mobile) and one missing readout (subscriptions).

Plan: /Users/marciano/.claude-work/plans/this-should-have-splendid-quill.md

## Summary of Changes

All 22 items addressed. Six workstreams, all complete (DVTD-bnx7, DVTD-11i0, DVTD-3ueg, DVTD-9szc, DVTD-58ib, DVTD-0e8o). One follow-up filed: DVTD-y340.

Verification: 3643 tests pass (188 files), `npm run lint` clean, dependency-cruiser reports no violations, `tsc --noEmit` clean, wiki in sync, `release.ts --dry-run` validates the changelog at a minor bump.

### Three decisions the user was asked for
- Audits: one panel while locked, not two saying the same thing.
- Peel copy: "Paid when the gate shuts. Miss it and you owe a peel, settled in KB or in configs."
- Registry pennant (ADR-097 tension): keep the rolled-upgrade route, fix the glyph collision. ADR-097 gained decision 7.

### Where the plan was wrong
- **Item 9** (sticky coverage bar): the plan said pin the bar inside `Panel.Body`. That cannot work — a sticky element travels only as far as its own parent's box, so it would have unpinned the moment the panel scrolled off. The whole Coverage panel pins instead.
- **Item 15** (gate title wrapping): the plan pointed at `Header.ui.tsx`. It is `NextGate.ui.tsx` on the shop screen — the only one of the two whose row actually wraps.
- **Item 19**: the plan proposed swapping the upgrade press for an install press. That would have deleted ADR-097's coverage-gate bypass. Only the pennant was wrong.

### Bugs found while working, not reported
- `isGainRow` counted any row carrying a gain-coloured figure, so the new balance delta made the payout strip report one payout too many. A total can never be a payout.
- `Tooltip`'s panel has been `pointer-events-none` with no path to re-enable, so no tooltip in the kit has ever been scrollable.

### Item 22 is not confirmed
The invisible Retry press on mobile was never reproduced. No containing-block culprit exists and `bg-theme-faint` is opaque, so the root cause is still unknown. `ScreenActions` was rewritten from `fixed` + a guessed `h-16` spacer to `sticky`, which removes the whole class of fixed-bar/spacer bugs — but it needs a look on a real phone before being called fixed.
