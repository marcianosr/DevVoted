---
# DVTD-dbuw
title: 'Volkswagen CI: legendary config that hides one failing check'
status: completed
type: feature
priority: normal
created_at: 2026-08-11T13:25:11Z
updated_at: 2026-08-11T13:38:20Z
---

Legendary config. Hides one failing gate check, but only when at least 3 other checks pass. Draft price 384KB (legendary 256 + 128 override). No per-use fee (Marciano, 2026-08-11): the price and the slot are the cost.

## Summary of Changes

Shipped as ADR-028.

**Mechanic.** `check: "defeat-device"` — reports one failing check as passing, but only when at least `DEFEAT_DEVICE_COVER` (3) other checks *ran and passed*. Skipped checks never count as cover (they would let a build pad with rarely-seen Focus configs). Two failures at once and it hides neither. 384KB draft price via a new per-config `draftCost` override; no per-use fee (Marciano's call).

**Why the floor is 3.** Covering takes N passing rows plus the row it hides, so a floor of N needs N+2 slots: 1 works at BASE_SLOTS and is degenerate (immortal run), 2 needs slot 4, 3 needs slot 5. Also pushes against DVTD-ziss (narrow builds coast).

**Files.**
- `configs/config.model.ts` — CheckKind + `draftCost` override
- `configs/effect.model.ts` — excluded from CHECK_BUILDERS (gate.model synthesizes it)
- `gate/gate.model.ts` — `applyDefeatDevice`, runs last on the assembled checklist
- `gate/configRole.model.ts` — classified conditional (demands nothing of the player)
- `configs/configRoster.model.ts` — roster entry
- `docs/adr/028-the-defeat-device.md`, ADR README, wiki §4.1 + roster table, CHANGELOG

**Doc fix picked up on the way:** wiki §4.1 claimed "Copilot carries no check" (the legendary exception). Stale twice over — the config is AGENTS.md and it carries min-correct 1. Rewritten.

**Verification.** lint clean, 0 dependency-cruiser violations, `tsc --noEmit` exit 0, tests 1364 passed / 26 failed — the 26 are identical to the HEAD baseline (diffed via worktree), 10 new tests all green.

**Open risk (in the ADR):** an all-success wide build gets a free failure every gate forever. Cheapest knobs if playtest says it's too strong: the floor constant, or once-per-run.
