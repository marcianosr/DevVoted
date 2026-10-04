---
# DVTD-8i11
title: 'Stack picker polish: cards, compact preview, flow-based Build Summary'
status: completed
type: task
created_at: 2026-08-10T14:21:13Z
updated_at: 2026-08-10T14:21:13Z
---

Sixth same-day round on the onboarding work. Marciano playtested all three named/rebalanced stacks together and gave overall-positive feedback plus six concrete asks in one message:

1. Selected stack still too tall -> compact each config's check+reward to one row.
2. Presets should feel like consistent clickable cards, selected one expands.
3. Blurbs should describe playstyle consistently ("Fast but risky" / "Safer JS/TS focus" / "Balanced across categories").
4. Add "Recommended" to one preset for first-time players.
5. Build Summary should emphasize 5 polls -> reward -> fail consequence as a flow.
6. Shorten "Build your own" copy to "Customize all 3 slots ->".

## Summary of Changes

- StackPreviewList.ui.tsx: replaced two stacked FactRows (needs, gives) per config with one compact wrapping row (new CompactFact); "more details" tap for costs unchanged.
- StackPicker.ui.tsx: rewritten as bordered cards with gap-3 spacing (was border-t divided rows) — selected card highlights border-celadon and grows in place to hold the preview, same frame; added Recommended badge (reused existing Badge component); "Build your own" is now a single dashed-border card reading "Customize all 3 slots ->".
- stack.model.ts: added `recommended?: boolean` field, set true on TypeScript (the only stack with a genuine defense); rewrote all three blurbs to the requested playstyle-consistent phrasing.
- GateStakeReceipt.ui.tsx: full redesign from three headed sections (Objective/On clear/On fail as separate Titles+lists) to one flowing sequence "{N} polls -> clear {reward} -> fail {consequence}"; preserved the hover-preview old->new diff highlighting (previously GainRow, now inline MetricValue) since ConfiguringScreen/PrepScreen/ShopScreen all share this component and none can lose that mechanic.
- Updated dependent specs: ConfiguringScreen.spec.tsx, PrepScreen.spec.tsx, ShopScreen.spec.tsx (removed stale "On clear"/"On fail" heading assertions and the now-deleted plain-sentence objective text; added flow-content assertions). Renamed a stale StackPicker story export (ShipItSelected -> ReactSelected). Fixed a stale doc-comment in GateRewardReport.ui.tsx that claimed GainRow-shape parity with the now-redesigned receipt.
- ADR-026: added Decision 7 covering all six changes; marked Decision 2's stale "one plain sentence" bullet as superseded.
- Verified: tsc clean, oxlint+depcruise clean, 1344 tests pass (same 8 pre-existing failures as HEAD).
