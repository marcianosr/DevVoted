# ADR-006: Session-run mechanics — the config pipeline, composed gates, and failure model

## Status

Accepted (design capture). Decisions 1, 7, and 10 are amended or superseded by [ADR-008](008-reward-shop-multibuy-coverage-gated-slots.md); Decisions 3, 4, and 5 are amended or superseded by [ADR-016](016-the-config-rule.md) (the Config Rule) — see the ⚠ markers inline. Validated in the throwaway prototype (`src/domains/runs/prototype/`, multiple playtests: "still fun"); this ADR records the *decisions* the prototype settled so the production port has a north star. Depends on ADR-005 (session-run container).

## Context

ADR-005 established *where* a session run lives (a `mode: "session"` row on `runsTable`, played at poll-speed). It did not specify *what the player does* inside one. The prototype's job was to answer that: is building a loadout, facing escalating gates, and surviving strip-on-fail actually fun at session speed? Multiple playthroughs say yes.

The prototype deliberately broke the `src/ui` vs `src/domains` split (it is throwaway). Its **value is the decisions below, not its code** — those port; the code is deleted.

A prior iteration tried **multiple pipelines** (each a different lens on the window, all must pass). It was scrapped: the "which pipeline does this config go on?" choice was mostly meaningless (most config effects are global), and adding a pipeline was pure downside (a new demand with no reward). Both problems dissolved by collapsing to one pipeline — see Decision 1.

## Decision

### 1. One pipeline, not many

> ⚠ **Amended by ADR-008**: the cap is `MAX_SLOTS` (live-tuned in `pipeline.model.ts`), not 5, and slots are earned by coverage.

The player stacks **all** configs onto a single pipeline. It starts at **3 slots** and can grow to **5**. Slots are the scarcity that makes every config a real cut.

*Rationale:* difficulty and variety come from *which configs you stack*, not from routing configs across parallel containers. One pipeline removes a meaningless decision layer and matches the original "stack to make your run richer/harder" fantasy.

### 2. The gate is a composed checklist ("checks-as-configs")

A gate evaluates one **window of 5 polls**. The gate always carries a **baseline "N correct answers" check**. Every check-config and every Focus config **adds another condition** to that same window. **The gate passes iff every check passes.** Miss one and the whole gate fails.

The player's build literally *composes* the gate. The UI shows this as a live checklist (`✓ Correct 3/3`, `○ Coverage 2%/4%`, …). Before answering, the same set renders as a plain-language bullet summary of what the build will demand.

### 3. Baseline starts at 1 and self-imposed difficulty is the point

> ⚠ **Amended by ADR-016**: escalation raises the baseline Correct check ONLY. Config check thresholds no longer escalate — Unit Tests is the only config whose check escalates (wiki §4.1).

`CLIMB_BASE_REQUIREMENT = 1`. Escalation adds `+1` to the baseline every 2 gates cleared (`floor(gatesCleared / 2)`), also applied to check-config thresholds. So gate 1 is trivially easy (one correct answer) and the baseline reaches ~3 by the summit.

*Philosophy:* the game is not hard by default — **your build is as hard as you make it.** All difficulty above the floor is either escalation or player-chosen via configs.

### 4. Harder conditions pay more (Check + Risk unify)

> ⚠ **Superseded by ADR-016**: under the Config Rule the check IS the price of the effect — check-configs no longer pay a storage reward multiplier (Coverage's effect is coverage ×2, Cold Start's is an opener ×2, etc.). `rewardMultiplier` stays in the engine for future Risk-configs. `GATE_REWARD_KB` is 80 (ADR-008 retune), and Unit Tests adds a flat +32KB on clear.

Two config families are "voluntary difficulty for a bigger payout," and they are the *same concept*:

- **Check-configs** add a gate condition **and** a storage reward multiplier: Coverage (`+4%` this window, ×1.5), Cold Start (first 2 answers correct, ×1.5), Speed (2 fast answers, ×2). Mirrored (2 *wrong* answers — inverted, ×2) is designed but **parked** for the initial rebuild (DVTD-5o4d).
- **Risk-configs** raise the baseline correct requirement for a multiplier: push --force (`+1`, ×2), Deploy on Friday (`+2`, ×3).

On a pass, storage reward = `GATE_REWARD_KB (120) × product(reward multipliers)`. This fixes the earlier "why would anyone take a harder condition?" hole: harder = richer, always.

### 5. Config families and effects

> ⚠ **Amended by ADR-016**: the family taxonomy below is presentation-era grouping only. Mechanically every config is now Effect + Check (Copilot excepted); e.g. "Defense" linters carry a lint-correct check and "Economy" IndexedDB carries a 3-correct check. See the wiki roster (§4.3) for the authoritative Effect/Check per config.

| Family | Effect | Notes |
|---|---|---|
| **Focus** (`.js`, `.ts`, …) | In-category coverage `1 + 0.5·level` (L1 = 1.5×); imposes a **mastery commitment**: if the category appears you must get `level` of them right | Upgradable. Coverage and demand both scale with level — a double-edged upgrade. |
| **Defense** (ESLint/Stylelint/Intellisense) | Passively disable one wrong option in their categories; also **unlock the on-demand lint** (Decision 8) | yarn.lock is Defense too: makes the gate immune to Risk raises. |
| **Amplify** (Copilot, Code Coverage) | Coverage multiplier / flat coverage add | Computed across the whole build. |
| **Economy** (IndexedDB) | Storage faucet (`+8KB` per correct answer) | |
| **Check** | Decision 4 | |
| **Risk** | Decision 4 | |

Coverage on a correct answer is driven by the **whole build** (all equipped configs stack), via a single shared `focusCoverageMultiplier(level)` so UI and engine never drift.

### 6. Failure model: strip-on-fail, drop N (N climbs)

> ⚠ **Death rule superseded by [ADR-021](021-death-at-the-gate-that-empties-the-build.md)**: a fail whose peel quota meets or exceeds the installed configs ends the run on the spot. The peel itself (N of the player's choice) is unchanged.

Miss a gate → the player **peels N configs of their choice** off the pipeline, where `N = 1 + floor(gatesCleared / 2)`. Then the run resumes on a fresh window. **Death happens only when a bare build (0 configs) misses a gate.** A drop quota larger than the build strips it bare rather than instantly killing.

*Rationale:* deeper gates bleed you faster (bigger drop), pushing you toward the bare-and-fragile state where death lives — without cheap one-shot deaths early.

### 7. Rewards on a pass: pick exactly one

> ⚠ **Superseded by ADR-008**: the reward screen is a multi-buy shop bounded by storage — there is no "pick exactly one".

Clearing a non-final gate grants **one** reward:

- **Draft a config** — 3 offered, slot one (a Focus dupe becomes an upgrade instead).
- **Add a slot** — widen the pipeline (cap 5).
- **Upgrade a Focus config** — level up one you already run (no draft needed).
- plus **Rebuild draft** (re-roll the 3 offers, see Decision 9) and **Skip**.

`VICTORY_GATE = 5` gates clears the run.

### 8. Lint is sourced, not free

The on-demand "cross out a wrong answer" action is only available when a **linter config is equipped**. Owning ESLint/Stylelint grants both the passive cross-out and the paid on-demand button (`LINT_COST = 40KB`). No config → no button. Everything a player can *do* is earned by drafting it.

### 9. Rarity is a loot tier shown as glow, never fill

Configs carry a rarity — **common / uncommon / rare / legendary**. It rides the **border + glow** (loot ramp: gray → green → blue → gold + spark), never the fill. Fill color means *category* on Focus configs (`.js` = JS-yellow) and is a neutral slate on everything else. Two visual channels, two jobs: fill = "what/where", glow = "how scarce".

Rarity is **cosmetic only for now** — it does not yet affect draw odds or power.

### 10. Economy: storage as the run currency

> ⚠ **Amended by ADR-008**: drafting a config costs storage on a rarity ramp (additional sink); slot width gates on coverage, not storage.

- **Faucet**: gate-clear rewards (×multipliers) and IndexedDB (`+8KB`/correct).
- **Sinks**: draft rebuild — cost is the literal **Fibonacci sequence in KB** (1, 2, 3, 5, 8, 13, 21, 34, …); on-demand lint (40KB).
- **Cap**: storage is hard-capped at `STORAGE_CAP_KB` (1024KB, `rules.model.ts`) — faucets never push past it, so hoarding has a ceiling.

  > ⚠ **Amended by [ADR-015](015-storage-cap-policy-grant-and-cap-extender-configs.md)**: 1024KB is the *base* — cap-extender configs raise an effective cap, and removing one leaves storage soft-over-cap (excess persists, gains freeze). The faucet invariant itself stands.

Cheap to nudge, brutal to abuse.

### 11. Coverage scoring: losses, config positivity, and partial multi-answer credit (amended 2026-07-19)

> ⚠ **Amended by [ADR-013](013-gate-scaled-coverage.md)**: coverage now gate-scales on **both** sides — the base gain is `× gate` and the loss is too. The "deliberately not gate-scaled" clause below is superseded; the death-spiral concern is resolved by the 0-floor. See ADR-013 for the reasoning.

- **A miss bleeds coverage**: `WRONG_COVERAGE_LOSS` (see `rules.model.ts`) × the pipeline's reward multiplier. The loss drains the **poll's category**, floored at 0; the total moves by what the category actually lost, so the total always equals the sum of the categories and you can't lose coverage you don't have (wrong in an untouched category costs nothing). Risk cuts both ways — greedy builds lose more per mistake. The loss is deliberately **not** gate-scaled: escalating requirements already punish late mistakes, and stacking a second growing penalty on the same event is a death spiral.
- **Config effects amplify gains, never losses.** Coverage multipliers/adds and storage faucets (IndexedDB) apply only to earnings; a wrong answer means *no payout*, never a config-driven penalty. A config may only be negative if its own definition says so explicitly.
- **Multi-answer polls earn proportional coverage**: share = `(correct picks − wrong picks) / total correct`, clamped to [0, 1] — every wrong pick cancels a right one, so shotgunning earns nothing and trips the miss penalty. **Only coverage reads the share**; gate math, streak, and storage stay binary on the exact-set rule (see `coverageShare` in `run.model.ts`).
- The gate's `coverageGained` tally stays **gains-only** — the coverage-gain check judges what you earned; losses hit the run totals, not the window.

## Consequences

- **Positive**: a small, coherent rule set (one pipeline, one composed gate, one failure rule) that reuses ADR-005's poll-count-based engine. The proven logic ports into `src/modules/run`: pure engine in each aggregate's `domain/`, visuals as `.ui.tsx` in the same aggregate's `presentation/` (ADR-002/ADR-010), respecting the split the prototype broke.
- **Negative**: "every check must pass" can feel swingy — one missed condition sinks a whole gate. The strip-N model is the pressure valve, but it needs live tuning.
- The composed-gate model means the UI **must** always surface the full live checklist; a hidden condition reads as an unfair loss.

## Deferred / not yet proven (tune in production, not the throwaway)

- **Balance**: all thresholds, escalation rates, drop counts, reward multipliers, and the storage economy scale (early Fibonacci rebuilds are near-free vs 120KB gate rewards). Tune live against real polls where the numbers mean something.
- **Rarity → draw odds**: making legendaries genuinely rare to pull.
- **Packs / consumables / shop**, **daily-poll ↔ run fuel coupling**, and **the practice-bank poll supply** — downstream of ADR-005's open questions.
