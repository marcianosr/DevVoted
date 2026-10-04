---
# DVTD-88si
title: 'Vertical-slice prototype: playable session-run + tags (proof of fun)'
status: completed
type: feature
priority: high
created_at: 2026-07-11T17:55:41Z
updated_at: 2026-07-12T08:00:00Z
parent: DVTD-7dqm
---

Throwaway/flagged prototype whose ONLY job: prove the core loop is fun before investing in the production two-loop foundation. Hacky is fine. Tests FEEL, not production quality.

Question it must answer: is sitting down, building a pipeline with tags, and surviving gates at session speed actually fun?

## Approved scope (5 gap decisions)
1. **~20 polls per session** — fixed finite pool (testable). Player-choose-to-end comes later.
2. **Fully self-contained per run** — coverage/economy reset each run. NO meta-progression in the slice.
3. **Practice bank = any existing polls** from the bank. Skip daily->bank retirement plumbing.
4. **Tags handed to player (3-5 to slot)** — NO packs, shop, storage, dust. Test build+strip loop, not economy.
5. **Death rule:** bare pipeline + fails again = dead; PLAYER chooses which sticker peels.

## Deferred out of the slice (proven-fun-later noise)
Packs/Pokedex, fuel economy, daily->bank retirement, meta/archive, bounty, consumables.

## Tag set for the slice (from DVTD-g5lp Phase 1)
Focus [react]/[python]/[git] etc, Defense (Linter/Cache/Read-only), Risk (push --force/Deploy on Friday/O(n^2)). 3 base slots.

## Blocked on
- Architecture blueprint (in flight) — surfaces the 1-poll-a-day couplings + how to run polls at session speed in isolation.

## Todos
- [x] Scope slice implementation against the blueprint (sidesteps schema gaps 3+6; gate engine already count-based)
- [x] Session-run route serving 20 polls (/proto-session-slice)
- [x] Slot 5 handed tags into 3 slots (forces the cut)
- [x] Gate eval + strip-on-fail (player-choice peel) + bare-fail death — 29 tests green
- [x] Playtest: VALIDATED — user: "feels genuinely good". Loop proven fun.

## Playtest verdict (2026-07-11)
- **5-poll single-gate beat is RIGHT; 20 is too long** (overstays). Slice default set to 5.
- Confirms the daily-challenge cadence: one gate per session/day.
- Loop + tag/gate/strip tension proven coherent AND the beat proven — BUT only ONE gate has been tested. The roguelike ARC (multiple escalating gates, build growing/refining across a climb) is the NEXT unproven thing.

## Next increment: the climb
Evolve slice from 'N polls in one sitting' -> 'a climb of escalating gates, one gate per day, build persists'. Proves: does build-vs-escalation over a multi-day run feel good?

## Climb increment built (2026-07-11)
Slice evolved from single-gate -> full climb: escalating gate requirement (+1 per 2 gates), between-gate draft (pick 1 of 3, earns a slot up to 5), summit at gate 5, death on bare-fail. 30 tests green, typecheck clean. Playtest pending: does the build-vs-escalation arc feel good?

## Tag roster grounded in real configs + elimination mechanic (2026-07-11)
34 tests green, typecheck clean.
- ESLint/Stylelint = eliminate one wrong option on matching-category polls (js/ts, css), always keeping >=1 wrong. New pure helper visibleOptions() (tested).
- Roster now: Focus (.js/.ts/.css/.jsx/.git/.rb, 1.5x in-cat), Defense (ESLint/Stylelint elim + yarn.lock immune-to-raise), Amplify (Copilot x2, Code Coverage +0.5 flat), Risk (push --force, Deploy on Friday).
- TagFamily gained 'amplify'; Tag gained eliminatesWrongOptionsFor/coverageMultiplier/coverageAdd.

## NEXT: Focus 2.0 (pending Marciano's decision)
- Conditional: soft (gate the bonus) vs HARD (category-mastery: if category appears in window, must get >=1 correct or gate fails). Recommending HARD — pairs with Category Bounty (Focus = bet your category shows; bounty pays the drought). Needs per-category window tracking (reducer change).
- Upgradable: drafting a Focus you own levels it up (L1 1.5x/1-correct -> L2 2x/2-correct -> L3 2.5x). Config-leveling from original Pipeline Tags spec.

## Focus 2.0 built (2026-07-11) — 39 tests green
- HARD category-mastery commitment: if a Focus tag's category appears in the window, you must get >= level correct in it or the gate FAILS (even if the overall count is met). Category that never appears imposes no demand. New pure helper brokenFocusCommitments() + per-category window tracking (windowByCategory).
- Upgradable: drafting a Focus tag you already own levels it up (no new slot). Level scales coverage (1+0.5*level) and the correct-answers demanded (focusDemand = level).
- UI: chips show Ln, live per-commitment tracker while answering, draft shows 'upgrade -> L{n+1}'.
- Interlocks with Category Bounty (DVTD-jjyw): Focus is a bet the category shows; bounty pays the drought.

## VALIDATED + reroll added (2026-07-11)
Draft reroll (MAX_REROLLS=2/gate) added. 40 tests green. Core loop confirmed FUN on real hands.

Graduation: pure logic (sessionSlice.ts/sessionRun.ts, 40 tests) ports into the production runs domain intact; only the throwaway route UI gets rebuilt to the two-tier src/ui standard. Prototype job complete.

## Storage economy fix (2026-07-11)
Storage was gain-only + invisible (its sinks — packs deferred, rerolls were free). Fix: rerolls now COST storage on a Fibonacci climb (rerollCost = 60 * [1,2,3,5,8,13][n]); reroll gated on affordability; storage shown live in answering header + on the reroll button. 40 tests green. (Packs remain the bigger sink, deferred.)

## Finetune batch + storage role clarified (2026-07-11) — 42 tests
- Category colors on Focus tags (Kanto palette per category).
- New tags: .html/.java (focus), Intellisense (defense-elim react/ts), IndexedDB (economy, +8KB/correct storage faucet). Added 'economy' family.
- ESLint/Stylelint DISABLE (cross out, keep visible + unclickable) rather than remove the wrong option — new helper disabledOptionIds() replaces visibleOptions().
- Gate requirement shown on draft + config screens; equipped-tag descriptions + tooltips while answering.
- Reroll cost is Fibonacci (60*[1,2,3,5,8,13]).

## Storage role (design clarity)
Storage shifted from CAPACITY (container: configs occupied KB) to CURRENCY (money you spend). Slots took over capacity. Two orthogonal resources: Slots = how many tags (earned, unbuyable); Storage = how well you shape/grow them (earned by performance, spent). Sinks: rerolls (live), packs (deferred — the big one, why storage feels thin now), meta fuel (deferred). Keeping storage as capacity too would duplicate slots (rejected).
OPEN: add a minimal storage sink in the slice now (buy extra draft pick/pack) vs leave rerolls-only until real pack economy.

## Gate track + storage lint sink (2026-07-11) — 44 tests
- Gate track: ladder of all VICTORY_GATE gates with live per-gate requirement (requirementAtGate helper), cleared/current/upcoming states. Shown across run screens.
- Storage lint sink: 'Run linter' button (LINT_COST=40) crosses out a wrong option on the current poll on demand (manualDisabled state, keeps >=1 wrong). Storage now spendable every poll, not just at drafts. (Packs still the big deferred sink.)

## OPEN — gate model fork (Marciano's call)
Prototype uses Model P: one escalating 'X correct' check per gate; tags LAYER on (Focus=category-mastery add-on, Risk=+count, Defense=help). Gate track hid the Focus checks -> gates looked identical.
Marciano expected Model O (original DevVoted): pipeline BUILT FROM check-tags, each a distinct requirement type (correct-answers, coverage-gain, category-mastery, cold-start, streak); gate = pass ALL equipped checks. Build IS the gate.
RECOMMENDED: move to Model O. Tag taxonomy: CHECK tags (impose a gate condition) vs MODIFIER tags (Risk/Defense/Amplify/Economy tune/help). Reducer redesign: gate evaluates a set of check-predicates over the window. Pending decision before rebuild.

## Model O — checks-as-tags (2026-07-11) — 49 tests
Gate is now COMPOSED of the build's checks (not one 'X correct'). Baseline correct-answers (escalating) is always present; check-tags add conditions; Focus = category-mastery. Gate passes iff ALL checks met.
- New CheckKind ('coverage-gain','cold-start') + check tags Coverage/Cold Start (family 'check', saffron). Tag.check/checkAmount fields.
- New pure checkStatuses(state) = single source for the gate's checks + live progress; closeWindow now passes iff every check met.
- Window tracking added: windowCoverageGained, windowLeadingCorrect, windowOpeningOpen (cold-start).
- UI: 'This gate needs (all must pass)' panel replaces the single Correct/needed stat + focus-commitments block. Gate track still previews baseline correct-answers as escalation hint.
- Modifiers (Risk/Defense/Amplify/Economy) tune/help; check-tags define. This matches original DevVoted pipeline model + Marciano's mental model.
Also live this session: storage lint sink ('Run linter' 40KB on-demand 50/50), gate track.

## Multi-pipeline pivot (2026-07-11)

Gate model chosen: **every pipeline must pass** (not points). Each pipeline is a different lens on the shared 5-poll window.

- Pipelines: correct / coverage / speed / mirrored (etc). Each imposes its own intrinsic check.
- Start: 1 pipeline (correct), 3 slots each.
- On gate PASS: pick ONE reward — add pipeline / add slot / draft config / upgrade config.
- On gate FAIL: drop N configs (N climbs with gate). Fail while all-bare = dead.
- Tension: correct wants right, mirrored wants wrong, over only 5 shared answers.

## Multi-pipeline BUILT (2026-07-11)
- sessionSlice: added PipelineKind (correct/coverage/speed/mirrored) + PIPELINE_KINDS meta; Pipeline now has kind + per-pipeline slots; effectiveRequirement(pipeline, base); coverageForAnswer(tags,...) drives off whole build; dropped legacy evaluateGate/resolveGateOutcome.
- sessionRun: state.pipelines[]; gateChecks() groups checks per pipeline; gate passes iff every check on every pipeline met; answer() tracks windowFast (elapsedMs<=SPEED_MS); rewards = add-pipeline / add-slot / draft / upgrade / reroll / skip; failure drops N configs (dropCount climbs), bare build + fail = dead.
- route: PipelinePanel per pipeline (readable bar per check), Rewarding choice screen w/ per-pipeline draft targeting, Speed timing via Date.now() ref, GateTrack simplified.
- Fixed Phase-A fallout: added inert 'mode' to Run DTO/toDTO/fromDTO + both mocks so build typechecks.
- 50 tests pass, tsc + oxlint clean.

## Rarity added (2026-07-11)
- Tag gains optional 'rarity' (common/uncommon/rare/legendary), defaults common via rarityOf().
- Decision: glow=rarity (loot ramp gray/green/blue/gold border+glow), fill neutral slate EXCEPT Focus (keeps category color). Family-as-color dropped — it was arbitrary + collided (check yellow vs .js yellow).
- route: RARITY_STYLE border/glow/spark; NEUTRAL_FILL; RarityLegend teaches the glow language on config screen.
- deployFriday=legendary (spark), copilot/yarnLock=rare, several uncommon, focus+basic linters common.

## Collapsed to one board + lint sourced (2026-07-12)
Q1: lint button now gated behind owning a linter config (hasLinter) — no more out-of-the-blue action. Passive Defense configs still cross out; button only shows if ESLint/Stylelint equipped.
Q2: reverted multi-pipeline → ONE board. Lenses (coverage/speed/mirrored) are now stackable CHECK-CONFIGS that add a gate condition AND pay a reward multiplier (harder = richer, fixes the 'adding a pipeline was all-downside' hole). CheckKind gained speed+mirrored. Pipeline = {id,slots,tags} (no kind). Removed PipelineKind/PIPELINE_KINDS/add-pipeline/per-pipeline draft targeting.
- checkStatuses flat again; gate passes iff all met. Reward = draft/add-slot/upgrade/reroll/skip/drop.
- Kept: rarity glow, Pixter font, category-colored poll card, speed timing (elapsedMs).
- 52 tests pass, tsc + oxlint clean.

## Summary of Changes (2026-07-12)
PROOF OF FUN: ACHIEVED. Validated across multiple playtests — 'tested the loop multiple times, still fun.'

Design captured in **docs/adr/006-session-run-mechanics.md** (the deliverable — the prototype code is throwaway, the decisions port). Covers: one board (not multi-pipeline), composed-checklist gate, base-1 escalation, check+risk configs = harder-for-richer, config families, strip-N failure model, pick-one rewards, sourced lint, rarity-as-glow, Fibonacci-KB rebuild economy.

Final prototype state: 53 tests, tsc + oxlint clean. Route at /proto-session-slice.

Next: build the real foundation per ADR-005 (container) + ADR-006 (mechanics). Sequence: two-loop container (DVTD-kg2e, settle gaps #3/#6) → port config engine into src/domains/runs + src/ui/runs → Category Bounty (DVTD-jjyw) → Pipeline Tags (DVTD-g5lp).
