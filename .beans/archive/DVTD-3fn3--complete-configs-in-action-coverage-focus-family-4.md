---
# DVTD-3fn3
title: 'Complete configs-in-action coverage: focus family + 4 effect facets'
status: completed
type: task
priority: normal
created_at: 2026-09-04T06:18:59Z
updated_at: 2026-09-04T06:24:51Z
---

Extends DVTD-ryhp's showcase to full roster/facet coverage. Game-design reason: seeing each config's effect at its acting moment is how build feel gets tuned. Adds 5 engine-driven stories: FocusFamilyWaitsItsCategory (all 11 focus configs on one js poll), AbTestArmBDripsStorage (switchArm, +8KB at reveal), CacheFlushesOnWrong (✓✓✓✗ cools the cache), FreemiumBillsTheClear (subscriptions −8 KB ledger row), WtfplVoidsTheWarranty (0 KB refund in the shop).

- [x] Add the 5 stories to ConfigsInAction.stories.tsx
- [x] Scratchpad tsconfig typecheck
- [x] Throwaway vitest smoke render of all 26 stories
- [x] npm run lint + npm test

## Summary of Changes

`src/ui/terminal-theme/screens/ConfigsInAction.stories.tsx` grew from 21 to 26 stories; one new import (`switchArm` from config.model). New stories, each reusing the existing helpers: FocusFamilyWaitsItsCategory (all 11 focus configs on a js poll — .js online ×1.25, ten rows dot-off with `waits for <Category>`), AbTestArmBDripsStorage (switchArm flips to arm B, reveal shows +8 KB), CacheFlushesOnWrong (✓✓✓✗ on JS_GATE, poll 5 shows `cache is cold here`), FreemiumBillsTheClear (gate-clear ledger: +32 KB payout, muted −8 KB subscriptions), WtfplVoidsTheWarranty (unfunded shop, uninstall quotes 0 KB refund).

Verified: scratchpad tsconfig tsc clean (needed both `~/*` and `@/src/*` aliases), throwaway vitest smoke spec 32/32 (26 renders + 5 proof-text assertions + count), lint + lint:arch clean. Full suite 2672 passed; 3 pre-existing failures in src/ui/modern-theme/screens/RewardScreen.spec.tsx (superseded theme, stale copy expectations, untouched by this work).
