---
# DVTD-72d9
title: Expand config roster
status: in-progress
type: feature
priority: normal
created_at: 2026-07-24T15:25:42Z
updated_at: 2026-08-13T15:56:00Z
parent: DVTD-d0fw
---

Grow the run config roster. Phase 1: focus configs for every category lacking one (python, general-frontend, general-backend). Later phases (parked in chat): rm -rf (strip-all + 2x refund), localStorage (storage burst), storage extender (raise 1MB cap, sticky/non-removable risk).

## Phase 1 — done
Added focus configs `py` (.py → python), `frontend` (.fe → general-frontend), `backend` (.be → general-backend) to configRoster.model.ts. Every category now has a focus config. Auto-surfaces in draft/shop (rollDraft), no allowlist change. tsc clean, 46 config/draft/pipeline tests pass. Changelog updated.

Parked in chat for later phases: rm -rf, localStorage, storage extender.

## Phase 2 (designed, not built): four configs off score-space

The roster leans hard on coverage multipliers. These four move into
information-space, shop-space, and run structure instead. Ordered by engine
cost, cheapest first.

### .includes / .length (uncommon)

- [ ] `.includes` gives: on multiple-choice polls, tells you whether at least one of your picks is correct.
- [ ] `.length` gives: on multiple-choice polls, shows how many correct answers exist.
- Both need: assisted multiple-choice polls must be answered correctly.
- Engine: fires only when `poll.answerType === "multiple"` (field already exists).
  One new `CheckKind` serves both, same self-binding shape as `lint-correct` but
  scoped by answer type instead of category. A window with no multiple-choice
  polls passes trivially (ESLint precedent).
- Why: makes poll type a build axis, which nothing on the roster does today.
- Revived from legacy `src/domains/economy/data/configs.ts`.

### Tree Shaking (uncommon)

- [ ] gives: selling a config refunds its full draft price instead of half.
- [ ] needs: enter each gate carrying no more configs than it admits.
- Engine: `sellRefund` in `config.model.ts` (today `floor(draftCost / 2)`), plus a
  new exact-width check at gate start; shop shows the boosted sell prices.
- Answer first: can an over-width build even exist after ADR-027? Only
  under-width is policed today (ADR-031). If over-width is unrepresentable, the
  check needs another form (fallback: `min-correct` 2).

### Try/Catch (rare)

- [ ] gives: survive one failed gate per run.
- [ ] needs: the next gate must clear, or the error rethrows and the run ends (uncatchable).
- Engine: gate resolution in `rules.model` / `run.model`, where failure currently
  ends the run. A caught gate pays nothing (no `storageOnClear`, no bank event,
  since it is not a loss). Needs a `caught` flag on run state, a prep warning
  line ("catch consumed, next gate must pass"), and a receipt state.
- Revived from legacy configs.ts, where it sat disabled because
  `protection.tryCatch` only fired on a pipeline path the model no longer routes
  through.
- Most rules-sensitive of the four: it redefines what gate failure means for one
  window.

### Telemetry (rare)

- [ ] gives: see one other player's answer before committing.
- [ ] needs: beat that player's window coverage at the gate.
- Engine: pair against a *completed* run at the same gate number from the daily
  pool (a ghost, so no live sync). Per-poll chip marks the ghost's picked option.
  The check computes at the gate receipt, where window coverage already lives
  (`coverage-gain` precedent).
- Cold start: if no same-gate run exists yet, pair from yesterday's pool. General
  principle this establishes: a check never depends on social data, only benefits
  and payouts may.
- Undecided, decide before building: random ghost (fair, swingy) vs matched-skill
  ghost (rubber-banding, always tense). It changes the feel.
- Legacy Telemetry showed a random player's answer with no competition attached;
  this version adds the check.

## Rejected or parked this round

- Per-category draw suppressors (`display: none`, `@ts-ignore`, `.gitignore` as
  separate configs): nine configs for one mechanic is waste. If revived, it is a
  single `.gitignore` whose ignored category is picked at draft time. Balance risk
  either way: suppressing your weak category is pure aim-shaping, and aim swings
  win rate 5x (see the build-aim measurement).
- Social payouts (Bug Bounty, Stack Overflow, npm publish, Merge Conflict): wait
  for the community/marketplace registry, DVTD-8f3i.
- Still-live ideas, blocked on data or engine work: Vite (bonus coverage under
  35s, needs answer timing), Regression Test (previously-seen polls pay x2, needs
  poll history), Dependabot (a free upgrade you cannot decline, and the raised
  demand *is* the check), `Math.random()` (metronome: a random config per poll,
  and it must inherit that config's check too, else it breaks the
  every-config-owes-the-gate rule).
- Superseded by ADRs, do not revive from legacy: Local Storage (ADR-023, the cap
  is a subscription), yarn.lock and legacy Hot Reload (ADR-029, shop controls own
  that space), Copilot (already reborn as AGENTS.md).
