# ADR-016: The Config Rule — every config is Effect + Check

## Status

Accepted (2026-07-31). Amends/supersedes ADR-006 Decisions 3, 4, and 5 (⚠ markers inline there). Implements the resolution recorded in the wiki (§4.1, via DVTD-bojz): configs are **not** split into gates vs perks.

## Context

The roster had drifted into two de-facto species: configs that judged you (Unit Tests, Coverage, Cold Start) and configs that only helped you (ESLint, IndexedDB, Code Coverage, Intellisense). DVTD-bojz originally proposed formalizing that split; the design discussion resolved the opposite way — **every config carries both an Effect (the benefit) and a Check (the requirement)**, so the check is the price of the effect and a "perks-only build" cannot exist. The gate stays a composed checklist: it fails if **any** active check fails.

Structurally, `effectOf` was an exclusive if/else — a config got exactly one effect shape, so it could not carry a benefit *and* contribute a gate check.

## Decision

### 1. `effectOf` composes two orthogonal derivations

```ts
export const effectOf = (config: Config): Effect => ({
	...benefitOf(config), // field-driven: coverage / mask / faucet / storageOnClear / …
	...checkOf(config),   // gateCheck + demand, keyed off CheckKind
});
```

`benefitOf` branches only on which benefit fields are set, never on "what kind of config is this". `checkOf` resolves a builder from the `CheckKind` union (`coverage-gain`, `cold-start`, `min-correct`, `no-double-miss`, `breadth`, `lint-correct`); focus configs derive their mastery check from `focusCategory`; `"correct"` contributes nothing because the baseline Correct check stays synthesized in `gate.model.ts` (a bare pipeline must still demand answers — see DVTD-civm for the open death-model question).

### 2. Only the baseline escalates

`escalation(gatesCleared)` raises the Correct check only. Config check thresholds are flat (Coverage demands +1% at gate 1 and at gate 5). Supersedes ADR-006 §3's "also applied to check-config thresholds".

### 3. The check is the price of the effect — no storage multipliers

Check-configs no longer pay `rewardMultiplier`; their effect is the payment (Coverage: coverage ×2, Cold Start: window-opener ×2, Intellisense: all coverage ×1.5). `rewardMultiplier` stays in the engine for future Risk-configs. Unit Tests' effect is a flat **+32KB on gate clear** (`storageOnClear`, summed by `storageOnClearFor`), and it is **not upgradable** — escalation is the only mechanism raising its demand (wiki §4.4).

### 4. Check-state semantics are per-shape, not one helper

`checkState()` reports success as soon as the target is met — right for sticky-success checks (gains-only tallies). Two checks invert that and resolve manually:

- **no-double-miss** (Code Coverage): failure is sticky (`maxMissStreak >= 2`, never washes out), success only at window close.
- **lint-correct** (ESLint/Stylelint): fails the moment a linted poll is missed, succeeds only at close (a later lint could still fail it), skips when never linted — the lint action is a *pledge*.

`GateWindow` grew the dials these need: `missStreak`/`maxMissStreak` (partial answers hold, mirroring `nextStreak`), `lintedByConfig` (recorded at answer time, before `manualDisabled` resets), and per-category `gained` (breadth). All optional — pre-Config-Rule snapshots hydrate with defaults.

### 5. The roster is authoritative on hydrate

Snapshots embed full `Config` objects, so in-flight runs carry the roster as of slot/draft time. `hydrateRunState` now swaps each embedded config for its current roster version, preserving only `level` (player progress); unknown ids pass through. Accepted drift: a run holding a pre-rule upgraded Unit Tests loses its raised requirement/multiplier mid-run.

### 6. Faucet cap

`FAUCET_CAP_KB = 320` caps per-correct faucet income per run (IndexedDB). One run-wide counter (`faucetEarnedKb`) — split per config id if a second faucet ever ships. `faucetThisGateKb` carries the exact capped income into the gate report.

## Consequences

- **Economy tightens (watch item)**: with no check-config storage multipliers, gate income is flat `80 + 32 = 112KB` for a standard build vs unchanged draft prices (32–256KB). A deliberate wiki-side retune; expect a follow-up balance pass.
- **Coverage config is near strictly-good** (flat 1% check, coverage ×2 effect that compounds with the gate multiplier late). Balance watch item; the wiki already slates it for a rename ("SonarQube").
- **Wrong-answer bleed no longer scales with the build**: the loss formula multiplies by `rewardMultiplierFor`, which is now ×1 roster-wide — closer to the wiki's "losses stay flat", though the gate-multiplier loss scaling (ADR-013) still contradicts wiki §2.5. Left for a separate decision.
- The report/checklist UIs got the Config Rule shape for free: row status now comes from a config's check, value/kind from its benefit (`gateReward.model.ts`); with checks on everything, "perk" effectively means Copilot alone (`configRole.model.ts`).
- Technical debt cards (wiki §2.6) remain unimplemented — strip-on-fail stays the failure model until that lands (tracked in a follow-up bean).
