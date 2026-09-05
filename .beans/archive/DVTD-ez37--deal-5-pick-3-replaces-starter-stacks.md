---
# DVTD-ez37
title: Deal 5, pick 3 replaces starter stacks
status: completed
type: feature
priority: normal
created_at: 2026-09-03T08:59:37Z
updated_at: 2026-09-03T09:17:56Z
---

Replace the three starter stacks (ADR-026) with a dealt hand: startingHand deals 5 from STARTER_POOL, recommendedPicks preselects 3 into the build, player toggles, 1-4 picks start the run. Stacks deleted everywhere (domain, terminal NewRunScreen, production ConfiguringScreen). Slot buying stays demoted below the deal. Plan: ~/.claude-work/plans/i-think-deal-5-zazzy-koala.md

- [x] Domain: HAND_SIZE 5, RECOMMENDED_SIZE, recommendedPicks + spec
- [x] Preselection via withRecommendedBuild at run birth (run.service + proto), NOT in createRun — the started()/factory suite assumes an empty opening build; available is the immutable deal; pick-stack deleted
- [x] run.validation drops pick-stack
- [x] proto-run deals from STARTER_POOL with per-mount seed
- [x] NewRunScreen: combos gone, one Dealt section of selectable rows, storage demoted + stories
- [x] StartView rewired + spec
- [x] Production: RunConfigure/ConfiguringScreen bench-only + specs (overflowSlots prop died with the stack branch)
- [x] Delete stack.model, StackPicker, StackPreviewList, modern StartScreen
- [x] ADR-052 + ADR-026 superseded + README index
- [x] wiki §3/§6.2/§10, CHANGELOG
- [x] Beans: scrap 71w3/fkpa, complete 30k6, note pra4
- [x] lint + test + build pass counts

## Summary of Changes

ADR-052. startingHand deals 5 (was 6, seeded, focus-guaranteed); recommendedPicks(hand, maxSlots) picks a deterministic trio (focus → coverage earner → filler, in hand order) and withRecommendedBuild installs it through the reducer at run birth (run.service + proto-run). available is immutable during configuring: install/uninstall toggle build membership without moving cards, so the terminal NewRunScreen renders one stable checkable list (Row-in-button, Dot as checkmark, aria-pressed). Storage/slot-buy demoted below the deal. Starter stacks deleted everywhere (10 files). NewRunScreen stories derive the deal from the real roster and call recommendedPicks — the RecommendedDeal story reproduces the approved mock hand exactly.

Verification: oxlint + depcruise clean (900 modules); npm test 2611 passed, 3 pre-existing RewardScreen failures unrelated (island-only imports, present in branch WIP); npm run build exit 0; both touched story files typecheck under a scratchpad tsconfig (mass pre-existing type rot in other, untouched stories noted).

Marciano may still reshape the recommendedPicks heuristic — the naive greedy (focus, coverage, first-fit) is a placeholder strategy satisfying the pinned contract. agentsMd (8 slots) is a dead card at run start (cannot fit 4 slots) — pool tuning question, pre-existing.
