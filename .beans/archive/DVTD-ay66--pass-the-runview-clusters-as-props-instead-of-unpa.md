---
# DVTD-ay66
title: Pass the RunView clusters as props instead of unpacking them
status: completed
type: task
priority: normal
created_at: 2026-08-25T17:40:22Z
updated_at: 2026-08-25T17:50:27Z
---

Follows DVTD-slqv, which sliced RunView into GatePayout / PaidActions / ShopControls / GateStake cluster types. The viewmodel shrank; the call sites got longer, because the components still pass one prop per field, now reached through a deeper path.

RunReward.component.tsx shows both patterns in one JSX block: 11 props unpack `view.gatePayout.*` (renaming on the way out — gateRewardPaidKb -> gateReward, clearedGateNumber -> clearedGate, autoUpgradedConfig -> autoUpgraded with a `?? undefined`), and the next line passes `nextStake={view.gateStake}` whole.

Counted across the 11 live Run*.component.tsx: 165 props, 38 unpacking a cluster.

## Scope rule

Cluster where the consumer reads most of it or saves >= 4 props. Left flat as over-delivery: RunStrip (2 of 12 GatePayout), RunLayout (2 of 12 GateStake), RunShop's lone upgradedConfigId.

## The three changes

1. RewardScreen takes `payout: GatePayout` — 11 props -> 1. RunReward 18 -> 8.
2. ShopScreen takes `controls: ShopControls` + `busy` — 14 -> 2. RunShop 38 -> 26. The `busy` flag exists because canRebuild/canLock/canExtend/canPin are gated `&& !busy` at the call site; that gate moves into Tier 1 where enabled/disabled already lives.
3. AnsweringScreen takes `paidActions: PaidActions` + `interactive` — 8 -> 2. RunAnswer 44 -> 38. Same gating story (`&& !busy && !reveal`).

Tier 1 taking an application viewmodel type is already precedented in all three files: RewardScreen imports GateStake, AnsweringScreen imports AnswerScore and AuditView, ShopScreen imports GateStake and runView types.

## Not this bean

useReducer was raised. It does not reduce the prop count (only ~8 of RunAnswer's 44 props derive from local state) and cannot replace useTodaysRun on live routes, because the engine runs server-side and redactPoll strips the `correct` flags before the client sees a poll. Two genuine useReducer wins were split out as their own beans.

## Todo
- [x] Baseline the test totals first
- [x] RewardScreen + RunReward
- [x] AnsweringScreen + RunAnswer
- [x] ShopScreen + RunShop
- [x] Specs and stories via the existing createMock* factories
- [x] lint, build, test at the same totals

## Summary of Changes

All three landed at exactly the predicted counts.

| component | props before | after | Tier 1 before | after |
|---|---|---|---|---|
| RunReward | 18 | **8** | RewardScreen 18 | **8** |
| RunShop | 38 | **26** | ShopScreen 37 | **25** |
| RunAnswer | 44 | **38** | AnsweringScreen 37 | **31** |

### How each screen took the cluster

`RewardScreen` reads `payout.*` directly in the body, which removed the whole rename
layer (`gateRewardPaidKb` -> `gateReward` and four others) and two `?? undefined`
conversions. The two `billKb !== undefined && billKb > 0` guards collapsed to
`payout.gateBillPaidKb > 0`: the cluster's fields are required numbers, so the
undefined arm was unreachable.

`ShopScreen` destructures `controls` into locals at the top of the body, so all 30-odd
existing references (`locked`, `lockCost`, `pinnedAtGate`...) stayed untouched. Only
the four gated ones are computed: `const canRebuild = controls.canRebuild && !busy`.
That turned a 14-prop change into a 4-line diff in the body.

`AnsweringScreen` needed no local aliases — the cluster is read in exactly one place,
`useActionFor`, which now destructures it per branch.

### The two extra booleans

`busy` (ShopScreen) and `interactive` (AnsweringScreen) exist because the call sites
were ANDing request state into the affordance: `canRebuild={...canRebuild && !busy}`,
`lintReady={...lintReady && !busy && !reveal}`. Passing the cluster alone would have
silently dropped that. They are deliberately separate props: `controls` says what the
run can *afford*, `busy` says what it is mid-way through *doing*.

### Test-fixture work

Added `createMockPaidActions` to `src/test/runView.factory.ts` — the one slice
DVTD-slqv did not give a factory. `createMockRunView` now composes it instead of
inlining the same eight fields.

Each affected spec/story got a small local helper over the factory (`payout()`,
`controls()`, `lintWith()`, `peekWith()`) holding that file's baseline, so override
sites read as one named field rather than four restated ones:

```
- render(<ShopScreen {...base} rebuildAvailable={false} />);
+ render(<ShopScreen {...base} controls={controls({ rebuildAvailable: false })} />);
```

### Left flat on purpose

Per the scope rule: `RunStrip` (2 of 12 GatePayout fields), `RunLayout` (2 of 12
GateStake), and `RunShop`'s lone `upgradedConfigId`. Passing twelve fields to read two
is over-delivery.

### Boy-scout fix

`ShopScreen.stories.tsx`'s `perAnswer` fixture was missing three `PerAnswerPreview`
fields — pre-existing drift, unrelated to this change, in a file already being edited.
Fixed. The same drift in `PrepScreen.stories.tsx` and `ConfiguringScreen.stories.tsx`
was left alone and filed as DVTD-j3bg.

### Verification

- `npm test`: **2337 total / 2326 passed / 3 failed / 6 skipped / 2 todo** — identical
  to the pre-change baseline, same three pre-existing failures in
  `src/ui/modern-theme/screens/RewardScreen.spec.tsx`. Targeted: RewardScreen 27/27,
  AnsweringScreen 25/25, ShopScreen 51/51.
- `npm run build`: clean, 0 tsc errors.
- `npm run lint`: clean. `lint:arch` 763 modules / 3108 dependencies (up 10 from 3098
  — the new type-only imports), no violations.
- Stories are excluded from `tsconfig.json`, so `npm run build` does NOT check them.
  Typechecked all three edited story files separately via a scratchpad tsconfig that
  clears the exclude: clean. That detour is what turned up DVTD-j3bg.

### tsc did the finding

Every renamed prop is a compile error at its call site, so `tsc` enumerated the work
rather than grep. It flagged 50 sites in `ShopScreen.spec.tsx`; 46 were just `base`
missing `controls`, and only 4 were real per-test overrides — plus 3 `base.lockCost`
reads that a grep for JSX attributes would have missed entirely.

### Follow-ups filed

- DVTD-j3bg — stories excluded from tsconfig, 25 accumulated type errors
- DVTD-zlpr — proto-run hand-rolls a reducer that `useReducer` already is
