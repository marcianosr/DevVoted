---
# DVTD-kf5t
title: Draw what .length reveals, then give it its payout back
status: todo
type: feature
priority: normal
created_at: 2026-09-19T17:56:54Z
updated_at: 2026-09-24T12:49:13Z
parent: DVTD-72d9
---

**What:** Show the count .length reveals on the poll screen, then restore its storage payout.

**Why:** The count is worked out and never drawn, so the config's whole effect is invisible.

## Done when
- [ ] The poll screen shows the count .length reveals
- [ ] The per-pick payout is back on the config, in that order
- [ ] The two specs pinning the payout at zero are updated
- [ ] The wiki row states the payout is live again

## Notes

`.length` is a 2-slot config whose entire effect is currently invisible.

## What exists

- `runView.viewmodel.ts:488-491` computes `correctCount` and `correctCountSource` from `budgeterFor(liveConfigs)`
- **No component reads either field.** The reveal is produced and never drawn.

## Why the payout is off

`storagePerExtraPick` is fully built (`build.model.ts` `extraPickPayoutFor`, `answer.model.ts:208`, `gateReward.model.ts` `extraPickKb` with per-config attribution) and attached to **no config**. That is deliberate — from the spec comment in `run.model.spec.ts`:

> `.length` sells knowledge, not KB. It used to pay per extra pick as well, which made a config bought for its reveal earn its keep on the ledger — and left the reveal itself unbuilt on the screens that were meant to carry it.

Re-adding `storagePerExtraPick: 16` today restores exactly that masking. (Attempted during DVTD-z1z2 and reverted on finding this.)

## Order of work

- Draw the count on the poll screen, sourced from `RunView.correctCount` / `correctCountSource`
- Then restore `storagePerExtraPick: 16` on `CONFIGS.length`
- Update `build.model.spec.ts` "pays nothing to a build with no config on the axis" — it currently asserts `extraPickPayoutFor([CONFIGS.length], 3) === 0`
- Update `run.model.spec.ts` ".length's pick budget > pays nothing for the count it reveals" and its comment
- Wiki 4.3: the `.length` row now states the payout is off and why; restore it

## Note

The wiki row used to document the payout as live while the code had removed it. That drift is fixed (the row now states the removal and its reason), so this bean is the thing that makes the wiki's original claim true again.
