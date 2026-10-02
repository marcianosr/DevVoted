---
# DVTD-l3dz
title: All-coverage bonuses add, they do not compound
status: completed
type: feature
created_at: 2026-10-02T10:09:40Z
updated_at: 2026-10-02T10:09:40Z
---

**What:** The configs that multiply all coverage pool their bonuses (1 + the sum of each N − 1) instead of multiplying each other.

**Why:** AGENTS.md with Intellisense multiplied to ×3 and summited 47% of runs at 60% accuracy against a .25 target, so a build carried a weak player.

## Done when
- [x] AGENTS.md with Intellisense pays ×2.5 and AGENTS.md with a fresh Deprecated ×4
- [x] Focus, opener, Regression Test and Vite still compound
- [x] The receipt rows still sum to what an answer paid
- [x] The four pooling configs say their bonus adds
- [x] The engine guard holds

## Notes
- ADR-172. Coverage gained a boost field (effect.model.ts); answerPayout.model.ts pools it (pooledBoostOf, never below 0) and itemises shares.
- Sim through the guard: ×3 .47/.77 → .24/.57 (target .25/.55); stacked .07/.75 → .02/.53. Repricing Intellisense to 6 weight changed nothing; strongest-only overcorrected (.07/.31).
- Follows the carried-accuracy rejection (ADR-169 Rejected).

## Summary of Changes
Pooled all-coverage bonuses in the payout, receipt and chip status; descriptions, wiki formula and balance prose, CHANGELOG.
