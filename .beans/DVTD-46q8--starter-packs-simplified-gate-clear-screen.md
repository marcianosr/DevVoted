---
# DVTD-46q8
title: Starter packs + simplified gate-clear screen
status: completed
type: feature
priority: normal
created_at: 2026-08-10T10:29:48Z
updated_at: 2026-08-10T10:45:42Z
---

First slice of staged onboarding (from the approved mock):

1. **Starter packs**: run start offers curated config packs (one flavor decision) instead of free 3-of-N bench slotting. Pack pick fills the pipeline atomically; Start run commits.
2. **Trimmed build summary** during pack picking: objective + on-fail only — no on-clear forecast rows, no swatch lore.
3. **Simplified gate-clear screen**: payoff-first — "Gate N · cleared", big "+XKB storage", one teaching line, route to shop. Replaces the dense reward report on clear.

Account-level unlock flags (bench returns run 3, etc.) are follow-up work — no account state exists yet.

## Todo

- [x] pack.model.ts: STARTER_PACKS + spec
- [x] run.model.ts: pick-pack action + spec
- [x] GateStakeReceipt: intro variant (objective + on-fail only)
- [x] ConfiguringScreen: pack mode + spec + story
- [x] RewardScreen: simplified payoff layout + spec + story
- [x] Wire proto-run.tsx and RunConfigure/RunReward components
- [x] schemas.validation.ts: pick-pack action schema
- [x] CHANGELOG + wiki + ADR

## Summary of Changes

- `configs/pack.model.ts` (+spec): STARTER_PACKS (Ship it / Test everything / Full stack), starterPackFor, packMatching (selection derived from pipeline contents).
- `climb/run.model.ts` (+spec): atomic `pick-pack` reducer action — swaps the whole pipeline, no-ops on unknown packs/missing members/started runs.
- `validation/schemas.validation.ts` (+spec): pick-pack wire shape.
- `presentation/configs/PackPicker.ui.tsx` (+story): radiogroup rows — dot, underlined name, blurb, noTooltip chips.
- `ConfiguringScreen.ui.tsx` (+spec/story): pack mode (packs+onPickPack props) — wide pack panel + intro receipt; bench mode unchanged.
- `GateStakeReceipt.ui.tsx`: variant="intro" hides On-clear forecast rows, adds closing line.
- `RewardScreen.ui.tsx` (+spec/story rewrite): payoff-first — gate name, one storage number (gateStorageGained), teaching line, bill/downgrade news, Review + Spend it buttons. GateRewardReport stays on the fail path.
- Wired proto-run.tsx, RunConfigure, RunReward. ADR-026 + index row, CHANGELOG (2 entries), wiki §3.2 + §swatches.
- Verified: tsc clean, lint clean, 1329 tests pass; the 8 failures reproduce at HEAD (pre-existing branch WIP).

Follow-up (not built): account-level intro flags — bench returns run ~3, forecast rows after first shop visit, rarity legend with shop, "I've played before" flip-all.
