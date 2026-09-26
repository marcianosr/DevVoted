---
# DVTD-eq16
title: 'Config: Database escrows KB per exact answer, paid on the clear'
status: completed
type: feature
priority: normal
created_at: 2026-09-20T16:11:14Z
updated_at: 2026-09-20T16:29:57Z
parent: DVTD-72d9
---

Each exact answer opens an 8 KB transaction. Clearing the gate commits it at x2; a gate
that holds (SHAKY) or kills (DANGER) rolls it back. 2 slots, sharing the existing 320 KB
faucet cap with IndexedDB and A/B Test's B arm.

The first payout in the engine a band can take back. Every KB today is paid immediately
and irrevocably into `state.storage`; wiki 2.6 even makes a virtue of it ("the faucet KB
earned inside the window is the retry's whole budget"). Database breaks that, on purpose:
a held gate loses the KB *and* the budget the peel would have been paid from.

## Decisions (2026-09-20 session, Marciano)

- **The cap meters commits, not pledges.** Total KB out of all faucets stays <= 320. A
  rolled-back transaction costs no cap room, which is what "rolled back" should mean.
  So the clamp lives at commit, never at the answer.
- **An OK close commits in full at x2.** The config stays binary: cleared or rolled back.
  No third proportional case, even though the gate reward itself is cut on OK. Database
  becomes the thing that rescues a thin gate.
- **A new `escrowPerCorrect` field, not `storagePerCorrect`.** That field's contract is
  "pays into storage now" and three subsystems read it on that assumption. Keeping them
  distinct is also what lets the gate receipt show a commit row and a rollback row apart.
- **2 slots, not upgradable.** Same size and rate as IndexedDB, opposite risk profile;
  they read as a pair. A level ladder on a capped faucet stops mattering once the cap binds.

## Todo

- [x] `escrowPerCorrect` on Config + `escrowKbPerCorrect`
- [x] Roster entry + CONFIG_UNLOCKS row + cast.ts ECONOMY_POOL
- [x] RunState.pendingKb + report fields, healed in hydrateRunState
- [x] Pledge in scoreAnswer, hold in applyAnswer, three-way settle in closeWindow
- [x] Reset the per-gate report fields in finishReward
- [x] effect.model isOnline / skipReasonFor (reuse runCapReached)
- [x] Gate receipt: commit row, rolled-back row
- [x] Prep band table names the rollback against SHAKY
- [x] Poll screen shows the open transaction
- [x] Specs
- [x] ADR-091, wiki 4.3 / 5.1 / 2.6, CHANGELOG

## Summary of Changes

Built as designed, with two deviations found in the code rather than planned:

**`gateReward.model.ts` is dead in production.** The plan routed the escrow pot through
`gateStorageBreakdown`/`shareOf` there. Nothing in `src/` imports that module except its
own spec — the live gate receipt is `gateOutcome.viewmodel.ts`. No escrow pot was added;
the commit and rollback rows went straight onto `clearedStorageRows`/`heldStorageRows`.

**No new `SkipReason` kind was needed.** `runCapReached` already reads correctly for a
Database whose run cap is spent, so the closed `SKIP_WORDS` record was untouched.

### Shape as built

- `Config.escrowPerCorrect` + `escrowKbPerCorrect(configs)` (`config.model.ts`).
- `ESCROW_COMMIT_MULTIPLIER = 2` and `escrowCommitKb(pending, earned)` in
  `rules.model.ts`, beside `FAUCET_CAP_KB` — the clamp lives at the commit.
- `RunState.pendingKb` + `escrowCommittedKb`/`escrowRolledBackKb`. `pendingKb` is healed
  to 0 in `hydrateRunState`; the report pair resets in `finishReward`.
- `scoreAnswer` pledges (unclamped), `applyAnswer` holds, `closeWindow` settles three ways
  via a `rolledBackEscrow` spread on all three non-cleared returns.
- Readouts: prep note (`ESCROW_NOTE`), poll chip badge (`ConfigStatus.holdingKb` →
  saffron `holding 24 KB`), debrief rows (`transaction committed` pulled out of the gate
  row; `transaction rolled back` carries no figure, since the balance never held it).
- Unlock: `polls-correct` at 200, fallback 775. Not upgradable.
- Story page `Database.stories.tsx` (4 pages) registered in `configStories.spec.tsx`.

### Two brittle specs fixed on the way through

Adding a config to `CONFIG_LIST` reshuffles every seeded draft roll, which broke two
specs that took `draftOptions[0]` and assumed it was affordable and would fit. Both now
pick the smallest offer the build can actually take. This will happen again on the next
roster addition unless new specs follow the same rule.

### Verified

3812 passed, **2 failed** — the pre-existing `FLOOR_CORRECT` gate-floor specs, which are
the known clean-run baseline on this branch and are untouched here. `npm run lint`
(oxlint + dependency-cruiser, 769 modules) clean. `npm run build` green.

### Not done, deliberately

`headlineFigureOf` returns undefined for Database, so its chip carries no headline number
next to IndexedDB's `8 KB`. Neither figure is honest on its own — 8 understates what it
pays, 16 hides the condition — and a dozen shipped configs already return undefined, so
the prose carries it instead. Worth revisiting if the shelf reads wrong in play.
