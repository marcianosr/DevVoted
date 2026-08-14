---
# DVTD-72d9
title: Expand config roster
status: in-progress
type: milestone
priority: normal
created_at: 2026-07-24T15:25:42Z
updated_at: 2026-08-14T13:44:29Z
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

## Phase 3 (designed in chat 2026-08-13, documented in wiki §4.3 as 🟡)

Keepers, roughly by ship order:

- [ ] Hotfix (rare): failed gate still opens the shop. Check: gate after an emergency shop must clear. **Corrected 2026-08-14**: the peel refund does NOT belong here — the agreed roster below gives it to **Garbage Collection** (a peeled config pays its sell value), which is strictly better since it scales with what you lost. My skip-based "Garbage Collector" died (no skip mechanic exists, which also makes Cold cache's check vacuous today); the name survives on Marciano's version.
- [ ] git stash (uncommon): stash the current poll to the window's end. Check: stashed poll must be correct. Converges on Rebase (stash makes a poll last and binds it) — likely ships as the affordable version, Rebase becomes its upgrade or dies.
- [x] **Telemetry** — BUILT 2026-08-14 (DVTD-fpf9). Fee ladder 32/64/128, resets per gate. Check: each peeked poll must be correct. Two changes from this line: the pool is **all-time, both loops** (not today's session answers, which leave early climbers with nothing), and there is **no quorum gate** — L1 sells percentages with no sample size, so a 2-answer 100% and a 127-answer 100% draw the same bar. That blindness is the L1 product; L2 (64KB, maxLevel 2) adds the sample size. Phase 2's ghost-duel version renamed **Benchmark**.
- Dual-focus family: split out to its own bean, **DVTD-9hm8** (it needs a plural `focusCategory`, so it does not belong in this one).
- [ ] Watch (uncommon): pick a category at draft, double draw weight from the daily pool. Check: every appearance must be correct. Sim first — this is the aim lever measured at 5×.
- [ ] `--save-exact` (uncommon): drafts 20% cheaper, configs can never be sold (peel unaffected). Dial collision: Dependabot's "may not sell" — only one ships as-is.
- [ ] Weekend Project (common): weekend gates pay +50% storage, demand +1. Fair by construction: gates are shared calendar days, so it's a global event.
- [ ] Continuous Deployment (rare): +64 KB per clear, never enter the shop again. Self-locking (selling happens in the shop). Decide: does prep (ADR-032) stay reachable?
- [ ] Replication (rare): all storage gains ×2. Check: locked to the free 512 KB plan (ADR-023 ladder). Economy sim first.
- [x] **Moore's Law** — BUILT 2026-08-13 (common, upgradable). L1: +2% of held storage on clear, floor 32KB. L5: +10%, floor 160KB. Name briefly went to Redis and was reverted 2026-08-14; see the section below.
- [ ] WTFPL (legendary): draft anything from the full roster; no warranty — sell refund 0 on everything. Open: still owes an authored check (ADR-022); the no-warranty clause is a cost, not a check.

Principle established this round: **fees price actions, checks price passives** (wiki §4.1). Lint and Telemetry meter chosen actions; passives are priced by checks only.

Rejected/parked this round: disable-another-player's-shop (softened to shop degradation, parked to wiki §7.6 Interference / DVTD-8f3i); Math.random stays parked (must inherit the random config's check); hidden synergy table (§4.7) superseded by dual-focus configs.

## Moore's Law — built 2026-08-13

First Phase 3 config shipped. Picked as the simplest by *engine* cost, not by design cost: every other keeper needs a subsystem that does not exist yet (blocked list below).

### What was added

- `storageInterestPct` benefit field (`config.model.ts`, threaded through `Effect`), plus `storageInterestFor(configs, heldKb)` in `pipeline.model.ts` — floored, so no unspendable fractions of a KB. Deliberately NOT part of `pipelineModifiersFor`: that fn prices a *loadout*, and a previewed loadout has no balance, so interest is applied beside `gateClearPayout` by the reducer, the only place that knows the post-bill balance.
- New `CheckKind: "storage-floor"` with `storageFloorCheck` in `effect.model.ts`. Sticky in **neither** direction, unlike every other check: the balance moves mid-window (lint fees drain it, the faucet feeds it) and the gate reads it once, so a rich mid-window build reports `running`, never `success`.
- `EffectContext.storageKb` — the first check that keys off the balance rather than the window. Wiki §4.1 always claimed a check could ("a check can key off storage level"); nothing had until now. `checkStatuses`/`gatePassed` take it as an optional 4th arg defaulting to 0, which **fails a floor closed** rather than passing it vacuously (ADR-022's direction). If a 5th arg ever arrives, convert both to a param object.
- New `CheckProgress` variant `{ kind: "storage", current, target }`, rendered in KB and treated as value-column material (`96KB/128KB`).
- `interestThisGateKb` on run state plus gate-report attribution, following the `faucetThisGateKb` precedent, so the storage config shows storage in the storage report.

### Two engine facts found while building (both now in wiki §4.3)

1. **The floor is read after the storage bill.** `chargeStorageBill` runs before `gatePassed` in `closeWindow`, so a plan you can barely afford can be what drops you under your own floor. Kept deliberately: it is the truthful reading of "at gate resolution" and it interlocks three mechanics.
2. **The plan cap burns the surplus on shop exit** (`finishReward` clamps to `capKb`), so interest on a full free-tier balance is *shop budget*, not principal. Compounding requires buying cap room, which bills you every gate, which pressures the floor. A probe caught this: a two-gate compounding test failed because gate 2 paid the same 51KB as gate 1. The specs now assert both the capped case and the compounding case on tier 2.

### Verified

1497 tests pass (118 files), oxlint + dependency-cruiser clean, `tsc --noEmit` clean. Uncommitted per house rule.

### Blocked, with the specific blocker (read in code, not guessed)

- **Weekend Project**: `RunState` has no date field at all. Blocked on the daily-gate scheduler, not on design.
- **Replication, `--save-exact`, Continuous Deployment, WTFPL**: each needs a *restriction* enforced in the shop (no plan upgrades / no selling / no shop entry / full-roster offers). None of those is a window check, so each needs new run-state tracking or a routing change, and per ADR-022 each still owes an authored check on top of the restriction.
- **git stash, Telemetry, Hotfix, Watch**: answering-state reordering, community data + fee ladder, failure-path rework, poll draw weighting. All real subsystems.

Next cheapest is **`--save-exact`** (draft pricing is one pure fn) if "did you sell since the last gate" tracking is acceptable, or **Hotfix** if impact matters more than cost.

## Moore's Law — revision 2026-08-13 (supersedes the numbers in the section above)

Three changes after Marciano's review of the first build.

### 1. Upgradable, starting cheap (his call, and it fixed a real flaw)

The original 128KB floor was in the wrong place, and the numbers showed why: at
the floor, 10% pays 12KB while freezing 128KB of shop budget. The config only
earns its 128KB draft price when the balance is 400+, so the payout is gated by
the **plan cap**, not by the floor. The floor was pricing an obstacle that was
never where the difficulty lived.

Now a **common (32KB), upgradable to L5**, both halves per level:

| Level | Interest | Floor |
| --- | --- | --- |
| 1 | 2% | 32KB |
| 2 | 4% | 64KB |
| 3 | 6% | 96KB |
| 4 | 8% | 128KB |
| 5 | 10% | 160KB |

`interestPctOf` / `interestFloorKbOf` in `config.model.ts` are the single source;
`benefitOf` scales the payout, `storageFloorCheck` scales the demand, and the
row copy (`describeConfig`/`givesOf`/`needsOf`) derives from level so an upgraded
config reads its real numbers everywhere (wiki §4.4 requires this).

**No reducer work was needed**: `upgrade` already routes anything non-focus to the
storage-cost path (`upgradeStorageCost` = 32 × level bought), so adding
`storageInterestPct` to `isUpgradable` was the whole change. The tension this
creates is deliberate and legible: buying a level spends the principal the next
gate's floor demands.

Balance risk to watch in playtest: L1→L5 costs 64+96+128+160 = 448KB of storage,
which is most of a free-tier cap. If it never gets upgraded in practice, the fix
is a per-config cost multiplier, not a change to the shared curve.

### 2. Naming — settled as Moore's Law

Went Moore's Law → node_modules (rejected) → Redis → **reverted to Moore's Law**
by Marciano on 2026-08-14. Do not re-propose `.cache`: **Cache** is already an
agreed config in this bean (repeat category success pays more), so the name is
taken. Ship it as Moore's Law.

### 3. The failure question — accepted, with one rule owed

Answer: accept today. Checked in code, not assumed:

- The **free tier bills 0KB**, so a failed gate costs no storage and there is no
  shop to drain it. The balance freezes, so a met floor stays met. There is no
  death spiral.
- A **paid plan** bleeds 8–112KB per gate while failing, but an unpaid bill
  auto-downgrades to free, which stops the bleed. Bounded and self-terminating.
- The **peel is the escape**: failure makes you peel configs and you choose, so
  shedding it takes its check with it, at the cost of the sunk draft price.
- The new low floor (32KB at L1) makes the whole scenario hard to even reach.

It stops being acceptable when **debt cards** ship, because a card disables the
effect and keeps the check live: a floor you can never earn toward, with no payout.
And that is a class problem, not this config's problem —

> A balance check is the only kind whose difficulty does not reset each window.
> Every other check gets a fresh 5 polls; this one carries your economic position
> forward, and the only way to improve it is to succeed.

**Rule owed before debt cards ship: a balance check is skipped on any gate you
could not shop for.** Precedented (the draw excuses focus/lint checks), cheap (a
last-gate-failed bit plus the existing `skipped` state, which already counts as
passing), and it covers Replication and every future balance check. **Hotfix**
dissolves the problem instead, so if Hotfix ships this rule is redundant. Recorded
in wiki §4.3 under "Balance checks and failure".

### Verified

1502 tests pass (118 files), oxlint + dependency-cruiser clean, `tsc --noEmit`
clean. Uncommitted per house rule.

## Agreed configs

### Implemented with final names
- **Cache**: Repeated appearances of a successfully answered category become more valuable.
- **Garbage Collection**: When a config is peeled, you gain its sell value.
- **Vite**: Fast answers earn bonus rewards.
- **&&**: Consecutive correct answers create a combo / bonus payout.
- **Nullish Coalescing ??**: A zero/otherwise worthless reward gets replaced with something useful, likely storage.
- **A/B Test**: Choose between two reward paths, such as coverage vs storage.
- **Memory Leak**: Incorrect answers cause storage to become occupied/leaked.
- **Math.random()**: Metronome-style mechanic; polls temporarily use a random config/effect.

### In progress / undecided
- **Race Condition**: Still being shaped; mechanic should genuinely involve two things competing/racing rather than just random bonus RNG.
- **Check (Volkswagen)**: Still undecided. See DVTD-ud69 for balance/risk testing.

### Named effects, check undecided
- **Mistake recovery** (check: After an incorrect answer, next correct pays more)
- **Partial reward on gate failure** (check: Undecided; benefit is 50% reward if gate fails)
- **Near-capacity storage build** (check: Finish gate with only X KB free / at least X% occupied; gain stronger rewards while nearly full)

## Phase 3 variants — hidden information mechanics

### text-transform: uppercase (rare)
Benefit: Huge reward.
Cost: Question starts hidden (???????????????).
Reveal: 4 KB to show the question.
Answers: Remain visible throughout.
Check: Something fairly demanding (e.g., clear gate / X correct / no reveals).
Flavor: Questions become answerable without seeing the question on some polls:
  - Answers: margin / padding / gap / border → Player recognizes display property without reading the question.
  - Answers: DISPLAY: FLEX / DISPLAY: GRID / POSITION: GRID / GRID: TRUE → Player gambles on knowing it's GRID.
  - Text variants: UPPERCASE / MiXeD cAsE / MINIFIED code forces players to mentally decode or reveal.
Name rationale: CSS property that transforms text casing; the config transforms how questions are presented.

### ??? (rare) — variant: reveal answers individually
Benefit: Big payout multiplier (×2 storage or ×1.5 coverage).
Cost: All answers hidden as ????? on every poll.
Action: Reveal individual answers for 4 KB each (not bulk reveal).
Check: Clear the gate / X correct / limited reveals per window.
Decision loop: "I know this is display: grid… do I spend 4 KB revealing more answers to confirm, or gamble?"
Granularity advantage: Player might reveal two options, recognize the answer, and save 8 KB vs. revealing all four.

## Audit of the agreed-configs sections (2026-08-14)

Read the whole bean rather than greps of it, and found conflicts the earlier
sections of this file do not know about. Recorded here so the next pass does not
re-derive them.

### Collisions to resolve before building

- **Garbage Collection vs Hotfix**: fixed above — GC owns the peel refund (sell
  value, which scales with what you lost), Hotfix is only "a failed gate opens the
  shop". Both wiki rows updated.
- **Memory Leak** and **Race Condition** are also **debt-card names** (wiki §2.6
  table). One of each pair must be renamed or the gate report shows the same words
  meaning two different things. Flagged in the wiki next to the card table.
- **Cache vs `.every()`**: both pay for repeated success in a category (Cache on
  repeat appearances, `.every()` on a 5-streak). Same dial — the bean's own
  diagnostic says one of them has a boring effect. Cache also permanently rules
  out `.cache` as a name for anything else.
- **&& vs the built-in streak bonus**: coverage scoring already pays a streak
  multiplier (`streakBonus` in `coverageBreakdownForAnswer`). && must pay in a
  different currency (storage, not coverage) or it is just a second streak dial.
- **Math.random()** is listed as agreed with a final name, and as parked in
  "Rejected or parked this round" for a reason that still stands (a random config
  must inherit that config's check too). Pick one.

### Correction: Vite is not blocked

Both this bean and wiki §4.3 call Vite blocked on answer timing. It is not:
`elapsedMs` already exists on the `answer` action and on `AnsweredPoll`, and the
reducer threads it (`run.model.ts`). Vite is buildable today, which makes it a
cheaper next build than `--save-exact`.

### Note on the hidden-information variants

`text-transform: uppercase` and `???` both charge a **flat 4KB per reveal**, while
every other paid action in the game uses a doubling ladder (lint 8→16→32…,
Telemetry 32→64→128). Decide whether reveals escalate; a flat fee on a 5-poll
window is the one place a player can spend without limit. Both also still need
their checks chosen ("clear the gate" is the placeholder).

### Not read yet

**DVTD-ud69** (Volkswagen CI balance/risk testing), referenced from the agreed
section under "Check (Volkswagen)".

## Additional agreed configs

### rm -rf (rare)
Benefit: Strip/reset the build for a huge refund / payout.
Check: Big deliberate reset mechanic.
Notes: Clears the entire pipeline, returns storage as if configs were peeled (or better).

### Hidden Answers (rare)
Benefit: Every answer starts as ?????.
Cost: Pay around 4KB per answer to reveal it.
Check: Deliberately taking it gives a huge upside (undecided).

### Hidden Question (rare)
Benefit: Question starts as ?????.
Cost: Pay around 4KB per question reveal.
Answers: Still visible.
Check: Large upside in exchange for playing partially blind (undecided).

## Thwarts (social attack configs)

These are configs that *weaken the opponent* rather than strengthen the user. Applied by other players or as penalty mechanics.

### RTL / Reversed direction
Effect: Change the text direction of question and answers.

### text-transform (thwart variant)
Effect: Mess with casing, especially UPPERCASE.
Flavor: Mostly psychological warfare 😄

### Hidden answers as a thwart
Effect: ?????.
Impact: Victim has to spend storage to reveal answers.

### Hidden question as a thwart
Effect: Hide the question.
Impact: Victim pays storage if they want to reveal it.

### See next gate category mix
Benefit: See upcoming gate category distribution (next gate poll mix revealed).
Check: Correct in biggest category AND draft at least one config targeting a revealed category.
