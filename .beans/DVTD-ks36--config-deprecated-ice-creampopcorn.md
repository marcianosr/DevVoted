---
# DVTD-ks36
title: 'Config: Deprecated (Ice Cream/Popcorn)'
status: completed
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:10Z
updated_at: 2026-08-20T11:53:54Z
parent: DVTD-72d9
---

×2 coverage, loses ×0.25/gate, deletes at ×1

## Summary of Changes

Shipped as specced: x2 coverage, loses x0.25 per gate clear, deletes itself at x1 (four gates of service: 2, 1.75, 1.5, 1.25).

- New axis `coverageDecayPerClear` on Config; `decay.model.ts` owns the clear-time tick (`decayOnClear`). Decay ticks only on clears, never on failed gates (a miss already peels).
- Roster entry: family amplify, rarity uncommon (64KB) — priced as three quarters off AGENTS.md's permanent x2 at 256KB. Not upgradable (decay only runs down). A deleted copy re-enters the draft pool fresh at x2.
- `describeConfig`/`givesOf` read the live multiplier, so the chip fades with the config.
- Deletion announced on the clear screen (`deletedConfigs` state -> viewmodel -> RewardScreen row with a neutral "deleted" corner badge), cleared on finish-reward like the Dependabot merge flag. The run log line stays as an extra, never the channel.
- Name collision resolved (Marciano picked): the gate-10 audit formerly named Deprecated is now **Breaking Change** (same rule, id `breaking-change`, seed string updated). The config's mechanic is what deprecation actually means; the audit was always a breakage.
- Wiki: audit table + gate 10 row renamed, roster row added (26 configs). CHANGELOG: two Unreleased entries.
- Verified: 1629 tests pass (123 files), oxlint + dependency-cruiser clean, tsc clean. Story `Reward/DeprecatedDeleted` added.

## Retune (same day)

Marciano upped it to x3. At x3 the original x0.25/clear decay would live 8 gates and outclass AGENTS.md, so decay steepened to x0.5/clear (his pick from three options): four gates of 3 / 2.5 / 2 / 1.5, then deleted. Still uncommon 64KB. Name stays Deprecated; cadence stays per gate clear, not per poll.
