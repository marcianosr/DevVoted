# DevVoted Wiki

Welcome to the DevVoted Wiki: the reference for **DevVoted**, the daily trivia game
for developers. Answer coding polls, build a pipeline of configs, and climb through
gates without letting your build break.

This wiki documents the game the way a fan wiki would: player-facing, mechanics-first.
Because DevVoted is in active development, every article carries a status tag:

| Tag | Meaning |
| --- | --- |
| 🟢 Shipped | Live in the current game; numbers verified against the code. |
| 🟡 Planned | Designed in the stories, not built yet. |
| ⚪ Parked | Spec'd, then deliberately shelved (post-2.0 backlog). |
| ⚠ In flux | The design has open contradictions, documented but not resolved. |

---

## Table of Contents

- [1. DevVoted](#1-devvoted)
  - [1.1 What is DevVoted?](#11-what-is-devvoted)
  - [1.2 The Two Loops](#12-the-two-loops)
  - [1.3 Inspirations](#13-inspirations)
- [2. Gameplay](#2-gameplay)
  - [2.1 The Run](#21-the-run)
  - [2.2 Gates](#22-gates)
  - [2.3 Polls](#23-polls)
  - [2.4 Categories](#24-categories)
  - [2.5 Coverage (Scoring)](#25-coverage-scoring)
  - [2.6 Technical Debt](#26-technical-debt)
  - [2.7 Pipeline Build Failure](#27-pipeline-build-failure)
  - [2.8 Victory & Run End](#28-victory--run-end)
  - [2.9 A Typical Run](#29-a-typical-run)
- [3. The Pipeline](#3-the-pipeline)
  - [3.1 Slots & Expansion](#31-slots--expansion)
  - [3.2 Managing Configs](#32-managing-configs)
- [4. Configs](#4-configs)
  - [4.1 The Config Rule](#41-the-config-rule)
  - [4.2 Rarity](#42-rarity)
  - [4.3 Config Roster](#43-config-roster)
  - [4.4 Upgrades](#44-upgrades)
  - [4.5 The Lint Action](#45-the-lint-action)
  - [4.6 Parked & Planned Configs](#46-parked--planned-configs)
  - [4.7 Synergies](#47-synergies)
- [5. Economy](#5-economy)
  - [5.1 Storage (KB)](#51-storage-kb)
  - [5.2 The Shop](#52-the-shop)
- [6. Meta-progression](#6-meta-progression)
  - [6.1 Archived Storage](#61-archived-storage)
  - [6.2 Unlocks](#62-unlocks)
  - [6.3 The Dex](#63-the-dex)
  - [6.4 Swatches](#64-swatches)
  - [6.5 Borders](#65-borders)
  - [6.6 Seasons](#66-seasons)
- [7. Community & Social](#7-community--social)
  - [7.1 The Daily Poll](#71-the-daily-poll)
  - [7.2 The Community Board](#72-the-community-board)
  - [7.3 Leaderboards](#73-leaderboards)
  - [7.4 Loot & Fallen Runs](#74-loot--fallen-runs)
  - [7.5 Awards](#75-awards)
  - [7.6 Interference](#76-interference)
  - [7.7 Custom Poll Creation](#77-custom-poll-creation)
- [8. Interface](#8-interface)
- [9. Glossary](#9-glossary)
- [10. Appendix: Numbers Reference](#10-appendix-numbers-reference)

---

## 1. DevVoted

### 1.1 What is DevVoted?

DevVoted is a developer quiz game wrapped in a CI/CD-pipeline metaphor. You answer
real programming polls; your **pipeline** of installed **configs** (dev tools like
`.js`, ESLint, Copilot) decides both what your **gates** demand of you and how richly
each correct answer pays.

**Is it a roguelite?** Not literally — it borrows from the genre rather than belonging
to it. What it takes: run-based structure, builds assembled from collectible items,
escalating stakes, strip-on-fail, and meta-progression that outlives a single run.
What it leaves behind: procedural generation (polls are hand-written and the daily
seed is shared by every player, so no two runs differ by dice), session-length play
(a run spans real calendar days, one gate per day, and can sit half-finished
overnight), and permadeath as the default state (dying takes a gate whose peel
quota is bigger than your build, which is slow to arrive). Think of the roguelite parts as the skeleton, not the
point: the point is a daily learning ritual that happens to keep score.

Beneath the mechanics sits the creator's own philosophy, learned from experience
and personality: DevVoted embodies the pursuit of mastery through risk, knowledge,
and identity. Every answer reflects your devotion to growth as a developer. Learning
is done best through play: a series of short daily polls sparks curiosity and hands
you a topic to dig into afterwards. Quirky, whimsical, and competitive on purpose.

### 1.2 The Two Loops

The game deliberately splits into two loops. These daily polls are a few-minutes
social ritual: a series of shared polls per calendar day, built for the water-cooler
moment of comparing answers with colleagues. **The Run** is the opt-in campaign that
draws polls from the bank and is the heart of the game.

### 1.3 Inspirations

DevVoted wears its gaming DNA openly: the dev's imaginations, *Balatro* (configs
as Jokers, the equation reveal), *Banjo-Kazooie*'s Furnace Fun (trivia, rhyming
questions), *Pokémon* Gen 1–3 (the Kanto palette, the Dex), *Stardew Valley*
(bundle-style unlocks), *F-Zero 99*, *Mario Kart World*, and *Stickerino* (stickers),
*De Slimste Mens* (guesser and puzzle show-formats), *Roller Coaster Tycoon*,
*Inazuma Eleven*, *League of Legends*, Wordle's daily ritual, and Advent of Code's
festive coding challenges.

---

## 2. Gameplay

### 2.1 The Run

A run is a multi-day climb through numbered gates. Each calendar day, one shared
**daily seed** hands every player the same 5 polls, one gate's worth
(**1 gate = 1 day = 5 polls**). Answer them and the run locks until tomorrow, when a
fresh 5-poll **segment** is appended. A locked run parks on the
[community board](#72-the-community-board) — any run screen redirects there until
tomorrow's segment drops. Runs persist across days and never expire;
partially answered gates simply fill up across day boundaries. Unplayed polls from
yesterday are dropped, not failed. A flawless summit takes 12 calendar days; every
failed gate adds a day, and so does every gate replayed while waiting on the
coverage to widen — which can happen as early as day 2 ([2.2 Gates](#22-gates)).

You can **abandon** a run and start fresh the same day. The new run only serves
polls you haven't answered yet, and abandoning banks nothing (see
[6.1 Archived Storage](#61-archived-storage)).

Spending storage to keep climbing past the daily lock ("pay to continue") is a
designed monetization lever; the cost curve is undefined.

### 2.2 Gates

A gate evaluates a window of 5 polls as a **composed checklist**. Every config you
install contributes one check to that window, and the gate passes only if **every**
check passes. Checks come **only from configs** (ADR-017) — there is no built-in
baseline demand; a bare pipeline, however, never clears (nothing installed, nothing
ships), which keeps death reachable. The UI shows the checklist live
(`✓ Correct 3/3 · ○ Coverage 2%/4%`).

**Farming is priced out, not forbidden**: a build whose checks all skip can climb,
but the gate payout scales with window correctness (`32 KB × gate number ×
correct ÷ 5`), so a 0/5 clear banks nothing. The design motto: *your build is as hard as you make it*.
Every extra config is opt-in risk for opt-in reward.

**Only Unit Tests escalates**: its "N correct answers" check starts at its level
and rises by +1 for every 2 gates cleared, capped at +3 (`ESCALATION_CAP`) — an
L1 Unit Tests never demands more than 4 of 5, and the total clamps to the window
(see [4.4 Upgrades](#44-upgrades)).

**Gates count from 0**, and **passing the checks is the whole price of depth**
(ADR-019). A run opens on gate 0 and every clear advances one gate, up to the summit
at gate 12. Width is bought separately with coverage and gates nothing, so a run can
sit at gate 5 on its starting three slots. What makes depth expensive is *risk*: the
demands escalate as you climb, so a pipeline too narrow to meet them fails and
strips rather than stalling. Clearing a gate also awards that gate's **swatch**
([6.4 Swatches](#64-swatches)).

> ⚠ ADR-018 briefly made gate N require slot N, with a "cleared, still gate 3"
> replay when coverage lagged. ADR-019 reversed it the next day: the gate number was
> redundant with the slot count, and the enforced replay *was* the farming ADR-017
> already prices out. **Open risk:** with `ESCALATION_CAP` at +3, a narrow build owes
> fewer checks than a wide one and can currently coast deep (DVTD-ziss).

**Exactly one of three things happens when the window's 5th poll is answered** —
nothing is decided before that:

| | condition | outcome |
| --- | --- | --- |
| **Advance** | every check passed *or* skipped | paid, gate's swatch earned, `gatesCleared + 1`, shop opens |
| **Don't advance** | a check failed, and the build holds more configs than the peel quota | peel `dropCount` configs, then replay the **same** gate on a fresh 5 polls |
| **Run over** | a check failed, and the peel quota takes every config the build holds | dead (ADR-021) |

There is no other way to not advance. Since ADR-019 removed the width freeze, the
failure path is the only one, and it always costs configs.

**Failure trades difficulty for fragility.** The quota grows with depth
(`dropCount = 1 + floor(gate / 2)`), and **stripping takes configs, never slots**,
so a deep failure leaves a wide, half-empty pipeline. Measured at gate 10 with ten
configs: the quota is 6, the player chooses which 6 to peel, and the gate's demands
fall from **10 to 4** — the retried gate is genuinely easier. What it costs is the
gate's payout, six configs' worth of storage, every multiplier they carried, and a
day. Clearing the retry pays and opens the shop, and the empty slots refill from
drafts over the next two or three gates (three offers per gate), so recovery is a
slow rebuild out of storage rather than a reset.

While thin, the next failure is fatal: from **gate 4** a three-config build owes at
least as many strips as it holds, and a fail it cannot pay for ends the run on the
spot (ADR-021). Nothing else empties a pipeline: the shop will not let you deinstall
your last config, so the peel is always survivable and death always belongs to a
gate you failed. Width is therefore the run's hit-point pool, and the
tradeoff that makes the independent axes work: a narrow build owes fewer checks but
has no margin, a wide one owes more and survives mistakes. The answering screen
names the stake inline ("a fail peels 3", red once it would take everything).

**Boss gates** (every 5th gate, two requirements AND-ed, no reroll) are parked, along
with ~14 extra gate types (streak gates, economy gates, double-window gates).

### 2.3 Polls

A poll has a question, an optional code block, 3–20 options, and an explanation
shown after answering. Answer types are **single** (pick exactly one) and
**multiple** ("select all that apply"). Harder polls pay more coverage (see
[2.5 Coverage](#25-coverage-scoring)). The bank holds ~475 published polls, so a poll
you've seen can reappear in a future seed.

And polls **rhyme**. Questions are written as short verses in the spirit of
Banjo-Kazooie's Furnace Fun: *"Don't ask me why these polls all rhyme, getting the
last 2 items of this array, how do you adjust the following line?"* Nearly all are
hand-crafted by the developer, with ~10% contributed by colleagues (active players).

More poll types are planned: **Rapid fire** (three quick yes/no questions),
**Guessers** ("Name 10 HTML tags": +0.1% coverage per hit, −0.1% per wrong guess),
and **Puzzle grids** (nine clues point at one word, like useCallback + useMemo +
useState → *Hooks*: +2% per solved set, −1% per wrong guess).

### 2.4 Categories

Every poll belongs to one of **11 categories**: JavaScript, TypeScript, CSS, HTML,
React, Git, Java, Python, Ruby, General Frontend, and General Backend. Categories
carry **no color of their own** (ADR-020) — they appear as plain text labels
wherever a poll's subject matters. The Kanto palette belongs to the gates: the
gate being played themes the whole app ([6.4 Swatches](#64-swatches)).

Planned additions: SQL, AI, UI/UX, Architecture, Frontend frameworks (absorbing
React alongside Angular, Vue, and Next.js), and Backend frameworks. Category
draw weights that configs can skew are also planned.

### 2.5 Coverage (Scoring)

**Coverage** is the score: a percentage per category plus a run total.

**A correct answer earns:**

`share × (1 + adds) × mults × streak × gate × difficulty`

| Term | Value |
| --- | --- |
| `share` | The poll's coverage weight. 1 for a single-answer poll answered correctly. |
| `adds` | Flat coverage additions (Code Coverage: +0.5% per correct). |
| `mults` | Product of config multipliers (Copilot ×2, Intellisense ×1.5, Focus configs ×1.25 at L1). |
| `streak` | `1 + 0.1 × streak` of consecutive correct answers. |
| `gate` | `gatesCleared + 1`. Gate 1 pays ×1, gate 5 pays ×5. |
| `difficulty` | `1 + 0.1 × (options − 3)`, plus `0.5` if multiple-choice. Never below ×1. |

**Multi-answer share:** `(correct picks − wrong picks) ÷ total correct`, clamped to
0..1. Shotgunning every option earns nothing. Only coverage reads this share; gate
checks, streak, and storage stay binary on the exact-set rule.

**A wrong answer bleeds 0.5%** from the poll's category, floored at 0. Losses stay
flat — configs and gate depth amplify gains only.

**Example.** Gate 2, CSS poll, 5 options, single-answer, `.css` installed, one
correct answer already this gate.

| Term | Value |
| --- | --- |
| `share` | 1.0 |
| `adds` | 0 |
| `mults` | ×1.25 — `.css` |
| `streak` | ×1.1 — streak of 1 |
| `gate` | ×2 — 1 gate cleared |
| `difficulty` | ×1.2 — 2 options beyond 3 |
| **Gain** | **+3.3% CSS coverage** |

The post-answer **equation reveal** breaks the earn into Balatro-style chips: base,
one chip per contributing config, streak bonus.

Coverage past 100% rolls over into **levels**: 110% in JavaScript reads as "L2",
then "L3". Mastery keeps counting instead of capping.

### 2.6 Technical Debt

Fail a gate and you take a **debt card** for each failed check, planted on the
config that failed.

- The config **keeps its slot** and its **check stays live**. Only its **effect** is
  disabled. Debt is the obligation without the payoff.
- Each card carries a **resolve condition**, spanning several polls or gates rather
  than a single window.
- Debt can also be **paid off with storage**. The price doubles for each debt paid
  off in the same run, so buying your way clear is a short ladder by design. The
  condition is the intended route.
- **Debt does not stack.** A config already carrying a card takes no second card if
  its check fails again.
- The run ends when **every slot holds debt**: nothing in the pipeline is live, so
  no gate can be cleared.

Copilot carries no check, so it can never be debted.

#### Debt cards

Debt cards are drawn from a shared pool, not derived from the config they land on.
Every card does the same thing — **disables its host config's effect** — and cards
differ only in what it takes to resolve them.

| Name | Description | Resolves on |
| --- | --- | --- |
| Flaky suite | Tests that pass and fail without a code change. | 5 correct answers |
| Dead code | Unreachable code nobody dares delete. | 3 correct answers in a row |
| Visual regression | The UI shifted and nobody noticed. | +10% total coverage |
| Type errors | Suppressed once and forgotten since. | 5 correct answers in one category |
| Merge conflict | Resolved badly, committed anyway. | Selling 2 configs |
| Stale dependencies | Versions pinned years ago. | Clearing 2 gates |
| Untested path | A branch no test has ever reached. | 3 correct answers |
| Cache invalidation | Stale data served with confidence. | +15% total coverage |
| Race condition | Works locally, fails in CI. | 5 correct answers in a row |
| Deprecation warning | A console full of things due to break. | Coverage in 3 categories in one gate |
| Legacy module | Written by someone who left. | Clearing a gate without a miss |
| Memory leak | Slower every day, nobody profiles it. | 8 correct answers |

Resolve conditions span four shapes: **correctness** (answer N polls correctly, or N
in a row), **coverage thresholds** (reach a total or category level), **breadth**
(gain coverage across N categories), and **build actions** (sell N configs, clear N
gates).

### 2.7 Pipeline Build Failure

A failed gate costs you three ways at once.

| Cost | Detail |
| --- | --- |
| **Your effects go dark** | Every failed check plants a card. A wide build failing badly loses several effects at once, so damage scales with the risk you were carrying rather than with a formula. |
| **No shop** | The shop only opens on a cleared gate. A failed gate pays no reward and offers no draft, so storage sits idle while the pipeline sits disabled. |
| **A real day** | One gate per calendar day, so every retry costs 24 hours. A flawless summit takes 5 days; two failures at gate 4 turn the run into a week. |

Tomorrow you face the same gate at the same demand — escalation is set by gates
cleared, so it never rewinds — but with fewer live effects.

**What survives keeps recovery possible.** Coverage is untouched, storage is
untouched, and you never lose a config outright. A debted pipeline is repairable,
and the repair is knowledge. Because debt doesn't stack, the run only ends once
failure has spread across *different* configs; a single stubborn weak spot can be
worked off rather than compounding.

### 2.8 Victory & Run End

Clear all **13** gates — numbered **0 through 12** — to win; `VICTORY_GATE` is the
summit's number (12) and `GATE_COUNT` is how many there are (13). How long the climb
runs is a content decision, one gate per badge in the roster, and no longer derived
from the slot ladder (ADR-019) — a narrow pipeline that keeps passing its checks can
summit. A continue-past-victory option is
confirmed but unbuilt (DVTD-g1p0); the victory *reward* is still undecided, with
one constraint set by ADR-017: it must not be claimable by a zero-coverage farm run.

When a run ends, leftover storage is credited to your persistent archived storage
proportionally to how far you climbed: **victory banks 100%**, **death banks
gatesCleared ÷ GATE_COUNT** (die having cleared 6 of 13, keep 46%), **abandoning
banks nothing**; walking away can never be a cash-out.

### 2.9 A Typical Run

An illustrative baseline for balance sanity-checks, computed from the shipped
constants. Assume a solid player: 4 of 5 polls correct each gate with one mid-window
miss, plain 3-option single-answer polls (difficulty ×1), a lean build with no
coverage configs, one draft per shop. Per-gate coverage is then roughly
`4.2 × gate multiplier, minus 0.5` for the miss.

> Reward deltas below follow the 2026-08-05 schema (`32 × gate × correct ÷ 5`, so
> the 4-of-5 player earns 26 / 51 / 77 / 102 / 128); the draft-path milestones and
> running totals still await a rebalance pass — a common draft (32 KB) is no longer
> affordable from gate 1's payout alone. Coverage columns are unaffected.

| After gate | Coverage gained | Total coverage | Storage (after shopping) | Milestone |
| --- | --- | --- | --- | --- |
| 1 | ~3.7% | ~4% | +26 | Boulder Swatch earned; slot 4 in reach (8%) |
| 2 | ~7.9% | ~12% | +51, drafted a common | Cascade Swatch; slot 5 (16%) |
| 3 | ~12.1% | ~24% | +77, drafted an uncommon | Thunder Swatch; slot 6 (28%) |
| 4 | ~16.3% | ~40% | +102 | Rainbow Swatch; slot 7 (45%) |
| 5 | ~20.5% | ~61% | +128 | Soul Swatch; slot 8 (70%) |

Rule of thumb: **by gate 3 a solid player sits around 20–25% total coverage and
~150 KB earned gross**. Coverage configs like Copilot roughly double the coverage
column, and a miss-heavy run falls behind the ladder instead.

The run no longer ends at gate 5 — the summit is gate 12. The swatch column is the
badge each clear awards; the slot column is a *separate* track the same coverage
pays for, so falling behind the ladder costs you width and power, never depth. The
full ladder is in [3.1](#31-slots--expansion); its numbers are live-tuned in
`pipeline.model.ts`, so treat this table's thresholds as illustrative and the code as
authoritative.

---

## 3. The Pipeline

### 3.1 Slots & Expansion

Your pipeline holds every installed config, one per **slot**. You start with **3
slots** and can grow to **14**. Adding a slot costs no storage; it is gated by total
coverage instead (*breadth earns width*). Width buys room for another config and
nothing else — it opens no gates (ADR-019), so the ladder's length is free to differ
from the gate count:

| Target slot | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Total coverage required | 8% | 16% | 28% | 45% | 70% | 100% | 140% | 190% | 250% | 325% | 415% |

The first three slots come with the run. Slots 13–14 (325%/415%) are extrapolated
rather than playtested. These thresholds are live-tuned in `pipeline.model.ts`
(ADR-008); that file is the source of truth if this table drifts.

The shop shows the next rung as a full-width row in the pipeline list, numbered like
every other slot — the coverage it wants against what you have and a live progress
bar. Width claims itself automatically the instant coverage affords it (ADR-025) —
there is no purchase step. The shop marks whichever slot(s) auto-widened since your
last visit with a green "Unlocked Nth slot" row in the same spot instead. It carries
no swatch: badges come from clearing gates ([6.4 Swatches](#64-swatches)).

### 3.2 Managing Configs

Click any config chip for its action popover: **Install**, **Sell** (refunds half
the draft cost), or **Upgrade**. Any config can be sold except your last one:
selling your way out of every check just sells your income with it (payouts scale
with correctness), and a pipeline is never allowed to reach zero configs in the shop
(ADR-021). At run start, the **Configuring** screen lets you build a starting pipeline
from a handed set of configs, and **all 3 starting slots must be filled before the
climb begins**. The starting hand is currently a curated set; a random
rarity-weighted draw is planned (DVTD-30k6).

---

## 4. Configs

### 4.1 The Config Rule

Every config represents a real CI configuration, and every config has the same two
parts:

- **Effect** — the benefit it provides.
- **Check** — the requirement it adds to your build.

A gate fails if **any** active check fails.

Some configs don't touch polls at all — their effect is simply a flat payout on gate
clear. Unit Tests is the clearest case: +32 KB for carrying the game's only
correct-answer check.

**No baseline** (ADR-017). The gate demands nothing of its own — install Unit Tests
and you owe correct answers (the only demand that escalates); skip it and no check
asks for them, but the correctness-scaled payout means wrong answers earn nothing.
Nothing in the pipeline is locked: every config, Unit Tests included, can be sold or
stripped.

Checks are not only about answering correctly. A check can key off storage level,
answer speed, build composition, duration, streaks, coverage breadth, or other
players.

**Why take on a check?** Because the check *is* the price of the effect. There is no
separate fee: a config's power and its risk are the same transaction. Coverage
doubles your gains and asks you to gain something; Cold Start doubles your opener
and asks you to land it. Add a condition you trust yourself to hit, and get paid for
the confidence. Your build is as hard as you make it, and exactly as rich.

**The legendary exception.** Copilot carries no check. That is what legendary means
in DevVoted: at the top of the rarity ladder, an effect can stand alone. It is the
only config in the roster allowed to.

Resolved (DVTD-bojz): configs are **not** split into two species. Every config is
Effect + Check, so a "perks-only build" does not exist — a build carrying few checks
is simply one that took little risk and earns least. DVTD-9r8p closed.

### 4.2 Rarity

Four tiers, **common / uncommon / rare / legendary**, shown as border + glow
(gray → green → blue → gold), never as fill. Rarity bites through the **draft cost**:
32 / 64 / 128 / 256 KB. Rarity-weighted draw odds (proposed 60/25/12/3) and drop
rates on hover are planned; today the draft cycles deterministically through the pool.

### 4.3 Config Roster

One table, every config. Each entry reads **Effect / Check**.

| Config | Rarity | Effect | Check | Status |
| --- | --- | --- | --- | --- |
| Unit Tests | common | +32 KB × level storage on gate clear | `level` correct answers + escalation (capped — see §4.4) | 🟢 |
| `.js` | common | JavaScript polls reward ×1.25 | If a JavaScript poll appears, answer at least one correctly | 🟢 |
| `.ts` | common | TypeScript polls reward ×1.25 | If a TypeScript poll appears, answer at least one correctly | 🟢 |
| `.css` | common | CSS polls reward ×1.25 | If a CSS poll appears, answer at least one correctly | 🟢 |
| `.jsx` | common | React polls reward ×1.25 | If a React poll appears, answer at least one correctly | 🟢 |
| `.html` | common | HTML polls reward ×1.25 | If an HTML poll appears, answer at least one correctly | 🟢 |
| `.git` | common | Git polls reward ×1.25 | If a Git poll appears, answer at least one correctly | 🟢 |
| `.java` | common | Java polls reward ×1.25 | If a Java poll appears, answer at least one correctly | 🟢 |
| `.py` | common | Python polls reward ×1.25 | If a Python poll appears, answer at least one correctly | 🟢 |
| `.rb` | common | Ruby polls reward ×1.25 | If a Ruby poll appears, answer at least one correctly | 🟢 |
| `package.json` | common | General Frontend polls reward ×1.25 | If a General Frontend poll appears, answer at least one correctly | 🟢 |
| ESLint | common | Cross out one wrong answer on JS/TS polls, for an escalating price (from 8 KB) | If you use it on a poll, you must answer that poll correctly | 🟢 |
| Stylelint | common | Cross out one wrong answer on CSS polls, for an escalating price (from 8 KB) | If you use it on a poll, you must answer that poll correctly | 🟢 |
| Cold Start | uncommon | First answer rewards ×2 | First answer must be correct | 🟢 |
| Coverage | uncommon | Coverage gains ×2 | Gain at least 1% coverage this gate | 🟢 |
| IndexedDB | uncommon | +8 KB storage per correct answer; caps at 320 KB | Answer at least 3 polls correctly | 🟢 |
| Code Coverage | uncommon | +0.5% flat coverage per correct answer | Don't miss two polls in a row | 🟢 |
| Intellisense | rare | All coverage ×1.5 | Gain coverage in at least 2 categories this gate | 🟢 |
| Copilot | legendary | All coverage ×2 | — (see [4.1](#41-the-config-rule), the legendary exception) | 🟢 |
| Vite config | common | +3% coverage on JS/TS polls answered under 35 s | At least one poll answered under 35 s | 🟡 |
| `.every()` | common | +1% when a category you've 5-streaked appears | Don't break your streak this gate | 🟡 |
| Semver | common | Coverage ×1.2 for each Focus config at L2 or higher | No Focus config may sit at L1 | 🟡 |
| Rate limiter | common | Wrong answers don't bleed coverage | No single poll may earn more than 3% coverage | 🟡 |
| Telemetry | uncommon | See one other player's answer before you commit | Your gate coverage must beat that player's | 🟡 |
| Cold cache | uncommon | The gate's first poll pays nothing; every poll after pays ×1.5 | You must answer all 5 polls — skipping breaks the warm-up | 🟡 |
| Dependabot | uncommon | Each gate, one random config of yours upgrades a level for free | You may not sell configs | 🟡 |
| Overclock | rare | 4× coverage on one poll, then −128 KB across the next two | Storage must not hit 0 before the gate closes | 🟡 |
| Snapshot Testing | rare | Polls you've already seen reward ×2 | If a seen poll appears, you must answer it correctly | 🟡 |
| Bundle Analyzer | rare | In the shop, see the category mix of the next gate's 5 polls before you draft | You must answer correctly in the most-represented category | 🟡 |
| Rebase | rare | See the gate's remaining polls and reorder them however you like | Your last poll must be correct — and you chose what it was | 🟡 |

**Bundle Analyzer and Rebase are a deliberate pair.** Analyzer reveals categories in
the *shop*, so it informs what you draft; Rebase reveals and reorders inside the
*gate*, so it informs how you answer. Neither replaces the other, and holding both
is the full-information build. Rebase is local to your own run: reordering a shared
seed would silently break other players' position-based configs (Cold Start, Cold
cache), so the social version belongs in
[7.6 Interference](#76-interference) instead.

Each Focus level raises both halves: the payout (`1 + 0.25 × level`) and the check
(`level` correct answers owed in that category, **clamped to how many actually
appear** in the window — an L3 with one JS poll owes that one, an L5 owes every
appearance, never an impossible count). General Backend has no Focus config
yet.

Coverage is still slated for a rename (collides with coverage-the-score);
"SonarQube" is the leading candidate.

Diagnostic: if two configs share a check dial, one of them probably has a boring
effect.

### 4.4 Upgrades

Every upgrade caps at **level 5** (`maxLevel` on the config, default 5 — the
5-poll window is the natural demand ceiling).

**Focus configs** upgrade free of storage but are **coverage-gated**: level
N → N+1 requires 5% × N coverage in that category. Each level raises the payout
(`1 + 0.25 × level`: L1 = 1.25×, L2 = 1.5×…) *and* the check (you must get `level`
polls of that category right when it shows, clamped to appearances). The shop's
Upgrade button previews the next level's effect on hover; while gated, the tooltip
also names the coverage requirement. Row copy (demand/payoff) derives from the
config's current level, so an upgraded config reads its real numbers everywhere.

**Unit Tests upgrades for storage** (32 KB × the level bought: L2 costs 64,
L5 costs 160 — no coverage gate). Each level buys both halves: +32 KB payout per
level on clear, and +1 to the correct-answer demand. On top sits the automatic
escalation (+1 per 2 gates cleared, **capped at +3** — `ESCALATION_CAP`), and the
total demand clamps to the window: an un-upgraded Unit Tests never owes more than
4 of 5 at any depth; only bought levels can demand a perfect 5/5 window.

In flux: the stories also propose archived-storage-funded, 10-level cross-run
upgrades (DVTD-z94q); the upgrade currency question (run storage vs archived
storage vs coverage) is explicitly unreconciled.

### 4.5 The Lint Action

If a linter covering the poll's category is equipped, a lint button appears: pay
to gray out one wrong option. Linted polls never reveal their correct answer in
community views; they may reappear in a later seed. The cost doubles with each use
within a poll (8 → 16 → 32 → 64 → 128 → 256 KB, capped) and resets each poll, to stop
lint-spam.

### 4.6 Parked & Planned Configs

Spec'd and shelved (post-2.0 backlog): **Speed Check** (gate needs N answers under
4 s, pays 2×), **Mirrored Check** (gate needs N *wrong* answers, an inverted
brain-bender, pays 2×), **yarn.lock** (immunity to requirement raises), **rm -rf**
(strip-all with 2× refund), **localStorage** (storage burst).

**Cap extension** — raising the 512 KB storage cap — was parked here too, but it
isn't a config: see [5.2 The Shop](#52-the-shop) for its resolved shape as a
slot-free shop purchase (DVTD-0h4n).

Planned: a **social-hint config** (reveals what another player picked) and a
**poll-bias config** (skews which polls appear).

### 4.7 Synergies

Brainstormed: configs held together could combo. Stacking HTML + CSS (or TS + JS)
pays double coverage on both categories, rewarding themed builds over a pile of
unrelated stat-sticks.

---

## 5. Economy

### 5.1 Storage (KB)

**Storage** is the in-run currency, measured in kilobytes and capped by your
**storage plan** — **512 KB** on the free tier every run starts on.
Faucets: clearing a gate pays **32 KB × gate number × correct ÷ 5** (the same
`gatesCleared + 1` curve coverage rides — gate 1 tops out at 32 KB, gate 5 at 160,
capped at gate 12's ×12 so endless runs stop scaling); IndexedDB adds +8 KB per
correct answer. Sinks: drafting configs (32–256 KB by rarity), linting (8–256 KB,
escalating), draft rebuilds, and the storage plan's bill.

**Storage plans** 🟢 (ADR-023). Capacity is a subscription: a bigger cap carries
a recurring bill, collected every time a window closes — **pass or fail**, before
the payout. A failed gate pays nothing and still bills. An unpayable bill
collects nothing and **auto-downgrades the run to the free tier**; a voluntary
downgrade (shop only, like upgrading) clamps on the spot, burning anything above
the new cap. Tiers are internally unflavored for now:

| Tier | Cap | Bill / gate |
| --- | --- | --- |
| 1 (free, the start) | 512 KB | 0 |
| 2 | 640 KB | 8 KB |
| 3 | 768 KB | 16 KB |

The split behind it: anything that *earns* storage is a pipeline config under
the Config Rule (IndexedDB); a slot-free purchase may only change the
container's rules — cap size today — never multiply power. Numbers live in
`rules.model.ts` (`STORAGE_PLANS`).

**Overflow is spend-it-or-lose-it, not discarded on arrival** 🟢. A gate reward can
push storage past the cap; that overflow rides uncapped into the shop that follows,
so a rich gate buys a genuine shopping spree above the usual ceiling. The cap only
clamps when the player presses *Climb on* (`finishReward`) — whatever's still over
it at that moment is forfeit. Waste becomes urgency instead of a silent tax on the
reward you just earned.

### 5.2 The Shop

Clearing a non-final gate opens a Balatro-style **multi-buy shop** bounded only by
storage. Take as many actions as you can afford, in any order, but you must take
something before you can climb on:

- **Draft** one of 3 offered configs (new configs only; owned ones upgrade instead).
- **Rebuild** the offer for a cost that doubles each time: 4, 8, 16, 32, 64, 128,
  256, 512 KB per rebuild within the same shop (capped at 512).
- **Sell** a config for half its draft cost.
- **Upgrade** a Focus config (free, coverage-gated) or Unit Tests (32 KB × the
  level bought).
- **Add a slot**: free, coverage-gated (see [3.1 Slots & Expansion](#31-slots--expansion)).
- **Change storage plan** 🟢: switch tiers on the plan ladder
  ([5.1](#51-storage-kb)), both directions, switching itself free. The paid
  rungs price their recurring bill on the button ("8 KB / gate"); a downgrade
  names the burn it would cause before the click. Replaced the planned one-time
  cap-extension voucher (ADR-023 supersedes DVTD-0h4n's shape).

When a gate reward has carried storage over the cap, this is where that shows up:
a warning that the overflow is forfeit at *Climb on*, sitting next to the actions
that spend it down. The gate reward report can mention that overflow happened, but
it has no buttons — the warning that comes with a remedy belongs here, not there.

The shop always shows *why* a locked action is locked: not enough storage vs unmet
coverage.

---

## 6. Meta-progression

### 6.1 Archived Storage

Leftover run storage doesn't vanish: when a run ends, it converts into your
persistent **archived storage** at the outcome rate (100% on victory, proportional
on death, 0% on abandon).

Archived storage is the meta-progression currency: save it up and choose how to
spend it. Buy cosmetics, or inject it into your next run (DVTD-xbri also designs
mid-run coverage / config / cap / streak injections), or fund config unlocks (see
[6.2 Unlocks](#62-unlocks)). More spending options will come.

### 6.2 Unlocks

Two unlock systems are designed and not yet reconciled: **milestone unlocks**
(clear gate N or hit a category coverage threshold → config unlocks permanently,
account-wide; DVTD-2try) and **archived-storage pulls** (spend 50–500 KB by rarity
on a random unlock, with a pity system; DVTD-9d7o). Today all 19 shipped configs are
simply available. Also planned: unlockable starter-slot tiers and bonus awards for
re-answering previously-mastered polls correctly.

### 6.3 The Dex

The Pokédex of DevVoted, at `/dex`. The **Polls** tab tracks every poll you've
seen with lifetime accuracy (unseen polls redact to `???`); the **Configs** tab
catalogs the full roster grouped by rarity; the **Swatches** tab shows the gate
swatches you've collected across every run ([6.4](#64-swatches)), unearned ones
redacted. Planned additions: upgrade levels
("Lvl 5/10"), collection stats, per-poll community success rates, and named
collection states: **???** → **Encountered** → **Mastered**.

### 6.4 Swatches

**Shipped: gate swatches.** Thirteen swatches, one per gate, earned by **clearing**
that gate (ADR-019) — you beat the leader, you get the badge; buying width earns
nothing. Gate 0 is **Pallet**, where every journey starts, and the summit pair close
it: the **Elite** gate at Indigo Plateau, then the **Champion** above it. In between,
the eight gen-1 gym badges run in strict trainer-card order (Boulder, Cascade,
Thunder, Rainbow, Soul, Marsh, Volcano, Earth) with the two Kanto landmarks that
never had a gym dropped into the gaps where the games actually walk you through
them: **Lavender** at gate 4, out of Rock Tunnel after Vermilion and before Celadon,
and **Seafoam** at gate 8, on Route 20 heading for Cinnabar. So the full ladder reads
Pallet, Boulder, Cascade, Thunder, Lavender, Rainbow, Soul, Marsh, Seafoam, Volcano,
Earth, Elite, Champion.

Clearing a gate in any run earns its swatch **permanently and account-wide**
(`users.owned_swatch_ids`); re-clearing it on a later run is a no-op, so the
collection only grows. Colors come from each name's home location in the Kanto
palette and live in `app.css` under `[data-swatch-theme]`, never duplicated in
TypeScript. The summit pair are drawn apart because the palette runs out — 13 gates
against 12 colours, one of them the app background: **Elite** keeps indigo (it *is*
Indigo Plateau) with a rim so it reads, and only its name falls back to plain zinc;
the **Champion** alone wears the Kanto gradient.

They surface in four places: the gate-cleared reward screen, which names the badge
that clear just earned; the Configuring stat row (what you hold this run); the
end-of-run summary; and the **Swatches** tab of [the Dex](#63-the-dex), where
unearned entries redact to `???`.

**The gate themes the run** (ADR-020). The swatch of the gate being played sets
the whole app's accent color during a run — background tint, HUD, question card,
buttons — so climbing *feels* like travelling Kanto: pale Pallet at the start,
Boulder's pewter on gate 1, and so on up. Two summit exceptions keep text
readable: **Elite**'s ambient theme is a lightened indigo (its chip stays true
indigo), and the **Champion** — gradient-only as a chip — wears fuchsia as its
one ambient solid. The celadon/cinnabar pass-fail moods still override the gate
theme on the reward and strip screens. Categories carry no color at all anymore;
they appear as plain text ([2.4 Categories](#24-categories)).

**Still planned** — **Collect Swatches** (DVTD-g8ty): a *per-category* cosmetic chip
earned through mastery. That is a separate collection from the gate swatches above
and reuses the name deliberately.

Resolved: the old third meaning of "Swatch" (DVTD-1sb7, a config installing an
extra core check alongside Unit Tests) is retired. Under the Config Rule every
config already adds a check, so the concept was redundant.

### 6.5 Borders

Avatar borders are decorative unlockables bought in the border shop and equipped
on your profile. Rarity-based border unlocks via meta-progression are planned.

### 6.6 Seasons

Runs and leaderboards live inside **seasons** (upcoming → active → finished →
archived), the temporal container for competitive resets.

---

## 7. Community & Social

The social layer is possible because of the shared daily seed: everyone climbs the
same polls on the same day.

### 7.1 The Daily Poll

Loop 1: one shared poll per calendar day with its own leaderboard, the water-cooler
ritual DevVoted grew from.

### 7.2 The Community Board

After every shop visit *and* every failed-gate strip (whose "Community →" sits on
the answer review that follows it, `/run/strip` → `/run/review`), the climb detours
through `/run/community`; a run locked for the day also lands here (the
lock stops progression, and the board is its waiting room — "Back to your run →"
is disabled until local midnight, with the countdown standing beside it in the
footer as a permanent `Screen` note, since "when do new polls land" is worth
knowing on any visit).

The page is one screen rather than two cards: the climb map sits at the top with
no chrome of its own, a hairline rule separates it from the polls, and both
borrow the gate review's vocabulary (§8, DVTD-dqbc).

**Standouts today** heads the page — see [7.5 Awards](#75-awards) for the nine.
Below it, **the climb today**: a horizontal gate track carrying every live
session run as an avatar, positioned by gate and by how deep into that gate's
five polls it stands. The viewer's marker is ringed and labelled "you"; players
sharing a position stack behind a `+N` badge. A dashed, faded avatar marks the
deepest point any of the viewer's *finished* runs reached. Everything ahead of
that furthest-ever point sits behind a dashed edge labelled **uncharted**, so
another player standing beyond it is visibly ahead of anywhere you have been. The
zone takes a diagonal hatch only while it is narrow (≤35% of the window) — on a
first climb it is nearly the whole track, and a texture that large reads as the
page's background rather than a marker.

Each gate's **swatch sits on the track itself**, at the point that gate begins,
with its number and name beneath (`6 Soul`) — the ladder and the route are one
thing, not a track with a key under it. Below the line, each run a gate killed
today is that player's avatar, dimmed and desaturated where it fell
(`completion_reason = 'dead'`; abandoning is not falling, so it draws nothing),
naming them on hover. Fallen markers are keyed by run, not player, so two losses
in one day both show. Above the line you are climbing, below it you are out.

**A desktop shows all 13 gates** — no paging, and the summit visible from gate 0.
A phone splits 13 ways at roughly 28px a gate, which a swatch survives and a gate
name does not, so below `sm` it narrows to a 3-gate window centred on the viewer
with bare `←` / `→` arrows. There is no progress copy and no legend: the map is
the whole card. Geometry lives in
`src/modules/run/climb/climbMap.model.ts`, which reduces every marker to one
unit: polls, counted `gate * 5 + pollsIntoGate`. Builds, configs and storage are
still not shown (the rest of DVTD-6l80).

Below it, **today's polls**. Each row is a native `<details>` whose summary is the
question, a faint "multi" sub-line on multiple-answer polls, and the share of
players who got it right — always in view, open or shut, and coloured in the same
three tones as the test-runner badge (celadon ≥60%, saffron ≥40%, vermillion
below). Categories are not named (ADR-020: the gate owns the run's colour).
Opening a row draws the same split the gate review draws as Expected over
Received: **the right answer and whatever you picked**, each as one line — mark,
option, the avatar chips of exactly who picked it (the viewer first, as "you"),
and the pick count. Everything else folds behind `N other options, M votes` (the
shared `Disclosure`), because on a nine-option poll the pair you came to compare
is two lines, not nine; unfolded, those rows keep their chips and counts, since
unlike the review's tail they did draw a crowd. Names live in the chip tooltips
(hover, or tap on mobile). The header counts the day's players and the footer
keeps the "top X% today" percentile. **Redaction rules** keep it fair: polls you
haven't reached never appear, and linted or missed polls stay sealed (no
question, no results). Profile borders come with DVTD-wii3.

### 7.3 Leaderboards

Two views: **progress today** (everyone on the same seed, comparable per-segment)
and **run completion** (won/dead, gates cleared, duration in days). Rows carry
per-category coverage, total coverage, and best streak — the last of which
`standouts.model.ts` already computes from a run's answer history.

### 7.4 Loot & Fallen Runs

When another player's run ends, their abandoned loot becomes lootable by players
who encounter it, profiting from others' failures. Mechanics undefined.

### 7.5 Awards

Community-page awards in the vein of "top committers", shipped as **standouts
today** — the first panel on `/run/community` (§7.2). Nine of them, in two kinds,
and the difference is the point:

**Poll-scoped**, read off today's answers:

| Award | Won by |
| --- | --- |
| fastest answer | the quickest single answer (timed client-side from reveal to submit, stored as `polls_responses.answer_time_ms`) |
| first to answer | the first answer after the seed dropped, right or wrong |
| first good | the first answer that was actually *correct* |
| most *{category}* polls | the biggest single-category haul (needs a lead of ≥2 to show) |
| only one right | the poll exactly one player cracked, named by them |

**Run-scoped**, read off live `run_states` across **active runs only** — so these
rank a standing rather than an activity, and a player who has not answered today
still holds the deepest gate:

| Award | Won by |
| --- | --- |
| deepest gate | the highest `gates_cleared`, shown as that gate's badge and name |
| longest streak | the longest consecutive-correct run *this run has managed*, recomputed from its answer history rather than the live streak, which a single wrong answer resets (needs ≥2) |
| most coverage | the highest coverage |
| widest pipeline | the most configs installed |

A standout row is avatar · title · value — the winner is the chip, named on
hover — and your haul is summarised beside the heading ("you took 3 of 9"). Two
columns on `sm` and up, filled top-to-bottom, so today's awards sit left and the
climb's sit right. Any award nobody has earned is dropped rather than shown
empty; ties break on player id, so a redraw never reshuffles the winners.

Logic lives in `src/modules/run/community/standouts.model.ts`, which is pure —
correctness arrives as a callback and run state as plain numbers.

Still brainstormed: perfect gate, no linter used, biggest bank, comeback clear.

### 7.6 Interference

Brainstormed social "thwart" mechanics: send a Breaking change, Dependency conflict,
or Regression at a leaderboard rival. A **Force push** config — reorder a rival's
gate — belongs here too, since reordering is only safe as a targeted attack, never
as a shared-seed effect. Needs multiplayer targeting infrastructure; far out.

### 7.7 Custom Poll Creation

Trusted players will be able to author their own polls, and be rewarded for it,
because writing a good rhyming poll is genuinely hard work.

---

## 8. Interface

The game leans hard into its CI metaphor:

- **Run HUD**: storage as **headroom** — a big "328 KB free" over a bar of what is
  committed and a "184 of 512 used" caption, because free space is the number you
  actually spend against (income past the 512KB cap is discarded). Then the gate,
  polls answered, streak, and total coverage. The gate reads **"gate 0 / 12"** —
  one number, since gates count from 0 and the gates you have banked *are* the gate
  you are on — over a **pip bar** that is the badge collection: one pip per gate,
  each wearing the colour of the swatch that gate awards. Gates behind you read
  solid, the gate underway fills with the polls answered into its window, and the
  rest sit dimmed as a preview of what is left (the Champion's shimmers). A pewter
  rim marks the gate you are standing on, and nothing else: it used to mark the
  Elite plate's finish, which read as an active gate eleven gates early. **Every pip
  is its own control**: hover or tap one and it names that gate's badge and its
  standing — earned, running now with the window count, or "clear gate 7 to earn
  it". It deliberately carries no coverage: coverage buys width, not depth.
- **Slot unlock row**: the next coverage-gated slot closes both the configure and
  shop pipelines as a dashed row, numbered in the list's gutter like every other
  slot — "Opens at 8% coverage", "9.9% reached", a live progress bar, and a
  locked/unlocked pill. Width claims itself automatically the instant coverage
  affords it (ADR-025) — there is no unlock button anywhere. The shop replaces this
  row with a green "Unlocked Nth slot" acknowledgment for whichever slot(s)
  auto-widened since the last visit. It carries no swatch, and retires at the slot cap.
- **Reward Report**: gate results styled as a CI build log: one passed/failed/skipped
  row per config, a steps summary, and a winnings footer — "you won +KB · +%"
  over a storage bar drawn from pre-gate storage to the new total (toward the
  512KB cap), plus coverage badges per answered category and the gate's
  questions as foldable PASS/FAIL rows (choices behind a tap). Directly under the
  headline it names the badge the clear awarded, in that swatch's own colour
  ("Thunder Swatch earned") — the clear's own receipt. It also lists the swatches
  collected so far.
- **Poll Review**: a test-runner reporter. Each poll is one row (PASS / PART / FAIL
  badge, the question, the coverage it earned); the rows you fumbled are open on
  arrival, the ones you passed stay folded and dimmed. An open row is an assertion
  diff: **Expected** over **Received**, every option carrying its letter from that
  question's own option list, on round chips for single-answer polls and square ones
  for multi-answer polls (the same shapes as the radio and checkbox you answered
  with). Expected always reads celadon and Received wears the outcome, so the two
  sides share a colour only when you were right. Multi-answer polls close with a
  tally of what you caught and the letters you missed. Options that neither side
  touched fold away behind "7 other options", and the poll's snippet and explanation
  sit with the diff.
- **Game Over**: a gate ladder (one row per gate: pass/fail/skip), your final build,
  whole-run poll review, and the archived-storage credit bar.
- **Learn Home**: a Duolingo-style path/hub planned as both the start point and
  the "no polls left today" destination (DVTD-jhgg).

---

## 9. Glossary

| Term | Meaning |
| --- | --- |
| **Run / Climb** | One playthrough, spanning multiple real days. |
| **Gate** | A checkpoint judging a 5-poll window as a composed checklist. |
| **Pipeline** | Your build: the stack of config slots. |
| **Slot** | One pipeline position (3 → 14, coverage-gated). Buys room for a config; opens no gates. |
| **Gate number** | Counts from 0: a run opens on gate 0 and summits on gate 12. |
| **Config** | An installable dev-tool item. Every config has an **Effect** and a **Check**. |
| **Effect** | The benefit a config provides. |
| **Check** | The requirement a config adds to the gate window. The gate fails if any active check fails. |
| **Check dial** | What a check keys off: correctness, storage, speed, build composition, duration, streaks, breadth, or other players. |
| **Demand** | A check's escalating requirement ("Requires 3 correct answers"). |
| **Coverage** | The score: a percentage per category plus a run total. Full in-fiction name: **knowledge coverage**. |
| **Storage** | The in-run currency, in KB, capped by the storage plan (512 free / 640 / 768). Overflow above the cap forfeits only at *Climb on*, not when it's earned 🟡 (DVTD-0h4n). |
| **Storage plan** | The subscription setting the storage cap (ADR-023): free 512 KB, or a bigger cap for a per-gate bill collected pass or fail. Unpaid bills auto-downgrade to free. |
| **Archived storage** | Persistent cross-run storage (bytes): the meta-progression currency, spendable on cosmetics, run injections, and more. |
| **Faucet** | Any per-correct-answer storage income (e.g. IndexedDB). |
| **Draft / Rebuild** | Buying a shop config / re-rolling the offer (doubling cost). |
| **Technical debt** | A card planted on a failed config: effect disabled, check still live, until its resolve condition is met. |
| **Resolve condition** | The multi-poll or multi-gate objective that clears a debt card. |
| **Fully debted** | A pipeline where every slot holds debt; the only state that ends a run. |
| **Seed** | The shared per-day poll sequence every player climbs. |
| **Segment** | One day's 5-poll chunk appended to a persistent run. |
| **Lint** | Paying an escalating fee (from 8 KB) to disable one wrong option (needs a linter config). |
| **Escalation** | Unit Tests' rising demand: +1 correct answer per 2 gates cleared, capped at +3. |
| **The Dex** | The collection screen (Polls + Configs + Swatches tabs). |
| **Kanto colors** | The game's palette (saffron, cerulean, viridian, …), keyed to gates via their swatches — not to categories (ADR-020). |
| **Swatch** | A gate's collectible badge (Pallet … Champion), earned by clearing it and kept across runs. Its color also themes the whole app while that gate is played. |
| **Water-cooler moment** | The design north star: same polls, same day, compare answers. |

---

## 10. Appendix: Numbers Reference

All values verified against the code (`rules.model.ts` and friends); numbers live in
code, and this table follows it.

| Constant | Value | Meaning |
| --- | --- | --- |
| `SLICE_WINDOW` | 5 | Polls per gate window (= per day). |
| `VICTORY_GATE` | 12 | The summit's gate *number* — gates count from 0. A content decision, one gate per badge; no longer derived from the slot ladder (ADR-019). |
| `GATE_COUNT` | 13 | How many gates a run holds (gates 0…12). The divisor for archived-storage credit and the reward multiplier cap. |
| Escalation | `min(floor(gatesCleared ÷ 2), 3)` | Added to Unit Tests' correct demand; `ESCALATION_CAP` = 3. |
| Max config level | 5 | `maxLevel`, default for every upgradable config (window ceiling). |
| Unit Tests upgrade cost | 32 KB × level bought | Storage-priced, no coverage gate (focus upgrades stay free + coverage-gated). |
| Debt cards per failed gate | 1 per failed check | Planted on the failing config; does not stack. |
| Debt pay-off cost | Doubles per debt paid off | Per run. Base cost undefined. |
| Gate multiplier | `gatesCleared + 1` | Scales coverage **gains** and the gate reward base (×1 … ×12). Frozen while a gate is replayed at the width wall. |
| `WRONG_COVERAGE_LOSS` | 0.5 | Flat coverage bleed per miss, floored at 0. |
| `STREAK_COVERAGE_BONUS` | 0.1 | Streak multiplier step (`1 + 0.1 × streak`). |
| Difficulty bonus | +0.1 / option > 3, +0.5 multi | Gains-only multiplier, never below ×1. |
| `GATE_REWARD_KB` | 32 | Gate-1 base storage per clear (× gate multiplier × reward multipliers × correct ÷ 5). |
| `GATE_REWARD_MULTIPLIER_CAP` | 12 | Reward depth multiplier stops growing past gate 12 (endless runs). |
| `STORAGE_CAP_KB` | 512 | The free tier's storage cap; the clamp waits for *Climb on* (DVTD-0h4n). |
| `STORAGE_PLANS` | 512/0 · 640/8 · 768/16 | Cap / bill-per-gate by tier (ADR-023). Billed on every closed window, pass or fail; unpaid → auto-downgrade to free. |
| Archived-storage credit rate | 1 / `gates ÷ GATE_COUNT` / 0 | Victory / death / abandon share of leftovers. Divisor is 13. |
| `BASE_SLOTS` → `MAX_SLOTS` | 3 → 14 | Pipeline width, bought with coverage. Independent of the gate count (ADR-019). |
| Slot coverage ladder | 8 / 16 / 28 / 45 / 70 / 100 / 140 / 190 / 250 / 325 / 415 | Total-coverage % to reach slots 4–14. Live-tuned in `pipeline.model.ts` (ADR-008); the last two rungs are untuned. |
| Gate swatches | Pallet … Champion | Thirteen — one per gate, earned by clearing it. Permanent and account-wide (`users.owned_swatch_ids`). |
| `DRAFT_SIZE` | 3 | Configs offered per shop draft. |
| Draft cost | 32 / 64 / 128 / 256 KB | By rarity: common → legendary. |
| Sell refund | `floor(draftCost ÷ 2)` | Storage back on sell. |
| Rebuild cost | 4, 8, 16, 32, 64, 128, 256, 512 KB | Powers of 2, per rebuild in the same shop (capped at 512). |
| Lint cost | 8 / 16 / 32 / 64 / 128 / 256 KB | Doubles per use within a poll (capped at 256); resets each poll. |
| Focus payout | `1 + 0.25 × level` | Category coverage multiplier (L1 = 1.25×). |
| Focus upgrade gate | `5% × level` | Category coverage needed to level up. |
| IndexedDB faucet | +8 KB / correct | Economy config income. |
| `FAUCET_CAP_KB` | 320 | Per-run ceiling on per-correct faucet income. |

---

*Sources: the `.beans/` story corpus, ADR-005…017, `docs/brainstorm/`, the Notion
Concept doc, and the `src/modules/run/` model files (canonical for all numbers).*
