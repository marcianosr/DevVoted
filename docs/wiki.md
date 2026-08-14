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
  - [2.10 What Unlocks When](#210-what-unlocks-when)
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
fresh 5-poll **segment** is appended. Where a locked run parks depends on the
phase (ADR-032): mid-gate, any run screen redirects to the
[community board](#72-the-community-board) until tomorrow's segment drops;
after a cleared gate the run parks on the **prep page** instead — the shop a
click away for more customizing, the community board a nudge, and the
start-gate button wearing the countdown until midnight. Runs persist across days and never expire;
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

**The demand is what you bought** (ADR-033): Unit Tests' "N correct answers"
check is `checkAmount + level - 1`, clamped to the window. Gate depth does not
raise it, so an L1 Unit Tests demands 1 correct answer at gate 0 and at gate 12
alike; only bought levels move it (see [4.4 Upgrades](#44-upgrades)).

**Gates count from 0**, and **passing the checks is the whole price of depth**
(ADR-019). A run opens on gate 0 and every clear advances one gate, up to the summit
at gate 12. Width is bought separately with coverage and gates nothing, so a run can
sit at gate 5 on its starting three slots. What makes depth expensive is *risk*: the
strip quota grows as you climb, so a pipeline too narrow to absorb it fails and
dies rather than stalling. Clearing a gate also awards that gate's **swatch**
([6.4 Swatches](#64-swatches)).

> ⚠ ADR-018 briefly made gate N require slot N, with a "cleared, still gate 3"
> replay when coverage lagged. ADR-019 reversed it the next day: the gate number was
> redundant with the slot count, and the enforced replay *was* the farming ADR-017
> already prices out. The "a narrow build coasts deep" risk it opened (DVTD-ziss)
> was closed by ADR-027's width demand, which stops a build staying narrow at all.
> ADR-033 later removed depth escalation from the correct-answer check; the width
> demand is what prices depth now.

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
gate you failed. Width is therefore the run's hit-point pool: a narrow build owes
fewer checks but has no margin, a wide one owes more and survives mistakes. The
answering screen names the stake inline ("a fail peels 3", red once it would take
everything).

**A gate only admits a build that can survive its stake** (ADR-027). Because
checks come only from configs, a stripped-thin build owed a one-line checklist —
failure made the retry easier, and a one-config build could cruise to the summit.
Each gate now carries a width demand, graded at its door:
`minConfigs = min(gate, dropCount + 1)` — nothing at Pallet, 1 at Boulder, 2 at
Cascade, 3 at Thunder, then one over the strip quota up to **8 at the summit**.
The early ramp keeps the opening gates farmable and lets a broke post-strip run
recover. The shop and prep screen refuse to sell or drop below the coming gate's
demand (the last config never sells, whatever the demand), so only a strip can
sink a build under it — the replay of the failed gate is exempt, but the *next*
gate turns an unrepaired build away. Turning away is a **blocked shop exit**,
not a death (ADR-031): while the shop can still repair the width (a free slot
plus an affordable offer, or a rebuild worth hoping for) the exit stays
disabled with the shortfall named. Only a provably stuck build — broke or
slot-capped — gets a door: an explicit cinnabar **End run** click. The Build
Summary names the demand (muted while met, cinnabar with the install count
once under it), and mid-window drops are gone — the gate grades the build it
admitted.

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

Two card names are also config names in the agreed roster (DVTD-72d9): **Memory
Leak** and **Race Condition**. One of each pair has to be renamed before either
ships, or the gate report will show the same words meaning two different things.

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

Tomorrow you face the same gate at the same demand — the demand is set by your build
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

### 2.10 What Unlocks When

One sheet for everything the climb stages in, because the rules arrive on three
different axes and it is easy to lose track of which is which:

- **Gate number** stages the *stakes* and the *shop's controls*. Gate depth is
  bought with clears alone (ADR-019).
- **Total coverage** stages *width* — the slot ladder, and nothing else
  ([3.1](#31-slots--expansion)). It never gates depth.
- **Category coverage** stages *Focus upgrades* ([4.4](#44-upgrades)).

| Gate | Swatch | Configs demanded | Strips on fail | Unlocks at this gate |
| --- | --- | --- | --- | --- |
| 0 | Pallet | 0 | 1 | Shop, **Rebuild offers**, the 512KB free plan and the 640KB rung |
| 1 | Boulder | 1 | 1 | — |
| 2 | Cascade | 2 | 2 | **Lock an offer**, 768KB rung |
| 3 | Thunder | 3 | 2 | **Extend offers** |
| 4 | Lavender | 4 | 3 | 1MB rung |
| 5 | Rainbow | 4 | 3 | — |
| 6 | Soul | 5 | 4 | 1.5MB rung |
| 7 | Marsh | 5 | 4 | — |
| 8 | Seafoam | 6 | 5 | 2MB rung |
| 9 | Volcano | 6 | 5 | — |
| 10 | Earth | 7 | 6 | 3MB rung (top of the ladder) |
| 11 | Elite | 7 | 6 | — |
| 12 | Champion | 8 | 7 | Summit — clearing it wins the run |

Sources, all authoritative over this table: `minConfigsForGate`, `dropCount`,
`STORAGE_PLANS` (`rules.model.ts`),
`LOCK_FROM_GATE`/`EXTEND_FROM_GATE` (`draft.model.ts`), `GATE_SWATCHES`
(`swatch.model.ts`).

**Not on this axis** (so they are deliberately absent above):

| Track | Staged by | Where |
| --- | --- | --- |
| Pipeline slots 4–14 | total coverage % | [3.1](#31-slots--expansion) |
| Focus config levels | that category's coverage % | [4.4](#44-upgrades) |
| Unit Tests levels | storage (32KB × level bought) | [4.4](#44-upgrades) |
| Lint fee | uses within the current poll | [4.5](#45-the-lint-action) |
| Rebuild price | rebuilds within the current shop | [5.2](#52-the-shop) |
| Swatches, Dex, borders | account-level, across runs | [6. Meta-progression](#6-meta-progression) |

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
(ADR-021). At run start, the **Configuring** screen offers **starter stacks**
(ADR-026): curated three-config pipelines picked with one click — the stack's
one-liner carries the choice, and the picked row expands into a trimmed
preview (each config's demand and payoff, always visible; a linter's fee sits
behind its own "more details" tap). Picking a stack is atomic (`pick-stack`);
**all 3 starting slots must be filled before the climb begins**. A "Build your
own" row opens the classic bench-drafting screen (no `stacks` prop) for
self-assembly, which returns as the default once account-level intro flags
land. The starting hand is currently a curated set; a random rarity-weighted
draw is planned (DVTD-30k6).

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

**No baseline** (ADR-017). The gate demands no *answers* of its own — install Unit
Tests and you owe correct answers; skip it and no
check asks for them, but the correctness-scaled payout means wrong answers earn
nothing. The gate's one structural demand is width (ADR-027, §2.2): it only admits
a build wide enough to survive its strip quota. Nothing in the pipeline is locked:
every config, Unit Tests included, can be sold or stripped — down to that demand.

Checks are not only about answering correctly. A check can key off storage level,
answer speed, build composition, duration, streaks, coverage breadth, or other
players.

**Why take on a check?** Because the check *is* the price of the effect. There is no
separate fee: a config's power and its risk are the same transaction. Coverage
doubles your gains and asks you to gain something; Cold Start doubles your opener
and asks you to land it. Add a condition you trust yourself to hit, and get paid for
the confidence. Your build is as hard as you make it, and exactly as rich.

**Fees price actions, checks price passives** (2026-08-13). A passive effect
(a multiplier, a payout) is priced only by its check — never a fee. An on-demand
*action* (the lint cross-out, Telemetry's peek) may meter each use with an
escalating fee, because the player chooses every activation. This is the line
that makes the lint ladder and a fee-charging Telemetry consistent with the
no-separate-fee rule above.

**Every config owes the gate something** (ADR-022), by one of three routes: an
authored check, a Focus category, or the categories it lints. The roster type
refuses anything else, so a config that owes nothing is a compile error rather than
a bug to find later. It was a bug once: a build of AGENTS.md (then Copilot) plus two
linters carried an entirely skippable checklist, so it summited on zero correct
answers and collected all 13 swatches.

**A linter owes competence, never proof it was used.** ESLint asks you to get one
JS/TS poll right if either appears; Stylelint asks the same of CSS. It is the same
mechanic as a Focus config, excused by an unlucky draw and by nothing you choose.
Using the effect is always optional: an earlier design failed the gate when you
declined to lint, which turned a window you could not afford into a death you never
chose. A lint you get wrong now costs the fee and nothing more.

**The legendary exception.** Legendaries no longer skip the check. What legendary
buys instead is a check that barely asks for anything, because the 256 KB draft price
is most of what the config costs. AGENTS.md doubles all coverage and asks for one
correct answer, unconditionally: light is not free.

**Volkswagen CI is the real exception** (ADR-028). It is the only config that reads
the checklist rather than adding to it: when exactly one check has failed, and at
least 3 others *ran and passed*, it reports the failing one as passing. It therefore
never fails a gate on its own, which is the one place the Config Rule is genuinely
waived. Its price is its 384 KB and the slot, plus a hidden width demand — covering
takes 3 passing rows plus the row it hides, so the fraud does not work below slot 5.
Checks that were skipped rather than passed count for nothing: a test that never ran
proves nothing.

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
| Unit Tests | common | +32 KB × level storage on gate clear | `level` correct answers (see §4.4) | 🟢 |
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
| ESLint | common | Cross out one wrong answer on JS/TS polls, for an escalating price (from 8 KB) | If a JS or TS poll appears, answer at least one correctly | 🟢 |
| Stylelint | common | Cross out one wrong answer on CSS polls, for an escalating price (from 8 KB) | If a CSS poll appears, answer at least one correctly | 🟢 |
| Cold Start | uncommon | First answer rewards ×2 | First answer must be correct | 🟢 |
| Coverage | uncommon | Coverage gains ×2 | Gain at least 1% coverage this gate | 🟢 |
| IndexedDB | uncommon | +8 KB storage per correct answer; caps at 320 KB | Answer at least 3 polls correctly | 🟢 |
| Code Coverage | uncommon | +0.5% flat coverage per correct answer | Don't miss two polls in a row | 🟢 |
| Intellisense | rare | All coverage ×1.5 | Gain coverage in at least 2 categories this gate | 🟢 |
| AGENTS.md | legendary | All coverage ×2 | Answer at least one poll correctly | 🟢 |
| Volkswagen CI | legendary | Reports one failing check as passing; costs 384 KB to draft | 3 other checks must run and pass (see [4.1](#41-the-config-rule)) | 🟢 |
| Vite config | common | +3% coverage on JS/TS polls answered under 35 s | At least one poll answered under 35 s | 🟡 |
| `.every()` | common | +1% when a category you've 5-streaked appears | Don't break your streak this gate | 🟡 |
| Semver | common | Coverage ×1.2 for each Focus config at L2 or higher | No Focus config may sit at L1 | 🟡 |
| Rate limiter | common | Wrong answers don't bleed coverage | No single poll may earn more than 3% coverage | 🟡 |
| Telemetry | uncommon | Pay per use (32 → 64 → 128 KB, doubling, resets each gate) to see the community split on the current poll; quorum-gated | Each peeked poll must be answered correctly | 🟡 |
| Benchmark | uncommon | See your paired ghost's answer before you commit (formerly named Telemetry) | Your gate coverage must beat that ghost's | 🟡 |
| Cold cache | uncommon | The gate's first poll pays nothing; every poll after pays ×1.5 | You must answer all 5 polls — skipping breaks the warm-up | 🟡 |
| Dependabot | uncommon | Each gate, one random config of yours upgrades a level for free | You may not sell configs | 🟡 |
| Overclock | rare | 4× coverage on one poll, then −128 KB across the next two | Storage must not hit 0 before the gate closes | 🟡 |
| Snapshot Testing | rare | Polls you've already seen reward ×2 | If a seen poll appears, you must answer it correctly | 🟡 |
| Bundle Analyzer | rare | In the shop, see the category mix of the next gate's 5 polls before you draft | You must answer correctly in the most-represented category | 🟡 |
| Rebase | rare | See the gate's remaining polls and reorder them however you like | Your last poll must be correct — and you chose what it was | 🟡 |
| `.tsx` | uncommon | TypeScript and React polls reward ×1.25 | If TS shows, answer one right; if React shows, answer one right — both live | 🟡 |
| git stash | uncommon | Once per window, stash the current poll; it returns as the window's last, after you've seen the rest | The stashed poll must be answered correctly | 🟡 |
| Hotfix | rare | A failed gate still opens the shop — failure becomes a playable turn | The gate after an emergency shop must clear | 🟡 |
| Garbage Collection | uncommon | A peeled config pays you its sell value | Check undecided | 🟡 |
| Watch | uncommon | Pick a category at draft: its polls get double draw weight in your windows | Every poll of that category in your window must be answered correctly | 🟡 |
| Replication | rare | All storage gains ×2 (payouts, faucets, everything) | Locked to the free 512 KB plan while installed | 🟡 |
| Continuous Deployment | rare | +64 KB every gate clear | You never enter the shop again — self-locking, since selling happens in the shop | 🟡 |
| `--save-exact` | uncommon | Every future draft costs 20% less | Configs can never be sold; peel on failure still works | 🟡 |
| WTFPL | legendary | The shop offers the entire roster: draft whatever you want | No warranty: sell refund is 0 on everything you own (authored check still open) | 🟡 |
| Weekend Project | common | Saturday and Sunday gates pay +50% storage | Those gates demand +1 correct answer | 🟡 |
| Moore's Law | common | On each gate clear, +2% × level of held storage | Hold 32 KB × level when the gate resolves (see [4.4](#44-upgrades)) | 🟢 |

**Bundle Analyzer and Rebase are a deliberate pair.** Analyzer reveals categories in
the *shop*, so it informs what you draft; Rebase reveals and reorders inside the
*gate*, so it informs how you answer. Neither replaces the other, and holding both
is the full-information build. Rebase is local to your own run: reordering a shared
seed would silently break other players' position-based configs (Cold Start, Cold
cache), so the social version belongs in
[7.6 Interference](#76-interference) instead.

**Dual focus** (2026-08-13): one slot focusing two categories, both appearance
checks live — slot economy paid for with double risk. Chosen **over** a hidden
synergy table (§4.7): a dual is the synergy turned into a visible, draftable item.
Only recognizably real intersections qualify. The pool: `.tsx` (TS+React), `.jsx`
reworked (JS+React — solo React would relabel, `useState` is the leading
candidate), `styled-components` (CSS+React), `JSDoc` (JS+TS), `<script>` (HTML+JS),
`<style>` (HTML+CSS), `Tailwind` (CSS+HTML), `.erb` (Ruby+HTML), `.jsp`
(Java+HTML), `Jinja` (Python+HTML), and the runtime family — `Node.js` (JS),
`Deno` (TS), `Rails` (Ruby), `Django` (Python), `Spring` (Java), `Next.js`
(React), `Nuxt` (Vue) — each pairing a language with General Backend, which
finally gives that category coverage. Git has no natural intersection and stays
solo; `.vue` is secretly the quad (SFC = template + script + style) and an
upgrade candidate. Ship `.tsx` and `Node.js` first, pool the rest: nine configs
for one mechanic is waste.

**Moore's Law and the cap** (built 2026-08-13). Interest is the only benefit that reads
your balance instead of the window, which gives it three properties nothing else
on the roster has.

It **ramps instead of gating**: a 32 KB common paying 2% against a 32 KB floor is
nearly free at L1 and deliberately near-worthless (2% of 128 KB is 2 KB), because
interest is only worth anything once the balance is large, and the balance is only
large late. Both halves rise per level, reaching 10% against 160 KB at L5, so the
config grows with the economy rather than waiting on it. It upgrades for **storage**
like Unit Tests, which is its own tension: the upgrade spends the principal the
next gate demands.

The floor is read **after** the gate's storage bill, so a subscription you can
barely cover can be the thing that drops you under it. And because the plan cap
burns the surplus when the shop closes ([5.2](#52-the-shop)), interest at the free
512 KB tier is *shop budget*, not principal: compounding requires buying cap room,
which bills you every gate, which pressures the floor again.

**Balance checks and failure.** A balance check is the only kind whose difficulty
does not reset each window: every other check gets a fresh 5 polls, while this one
carries your economic position forward, and the only way to improve it is to
succeed. Today that is survivable, because the free tier bills 0 (a failed gate
costs no storage and there is no shop to drain it, so a met floor stays met), a
paid plan's bleed auto-downgrades and stops itself, and the peel is always an
escape: shed the config and its check leaves with it. It stops being survivable
the moment [debt cards](#debt-cards) ship, since a card disables the effect and
keeps the check live, leaving a floor you can never earn toward. Rule to write
before then: **a balance check is skipped on any gate you could not shop for.**
Precedented (the draw excuses focus and lint checks) and it covers every future
balance check, not just this one. Hotfix, if it ships, dissolves the problem
instead.

Known dial collisions among the 🟡 rows: Hotfix and Try/Catch share
"next gate must clear" (Hotfix preferred — Try/Catch cancels a loss, Hotfix makes
a loss playable); `--save-exact` and Dependabot share "you may not sell" (only one
ships as-is). Garbage Collector (+32 KB per peeled config, check: leave one poll
unanswered) died for lack of a skip mechanic; its payout lives on inside Hotfix.
Cold cache's check is vacuous for the same reason until a skip mechanic exists.

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

**Moore's Law upgrades for storage** on the same curve as Unit Tests, and each level
buys both halves: +2% interest and +32 KB of floor. Buying a level therefore
spends the very principal the next gate's floor demands, which is the decision the
config is built around.

**Unit Tests upgrades for storage** (32 KB × the level bought: L2 costs 64,
L5 costs 160 — no coverage gate). Each level buys both halves: +32 KB payout per
level on clear, and +1 to the correct-answer demand. Nothing else moves it
(ADR-033): gate depth does not raise the demand, so an un-upgraded Unit Tests
owes 1 correct answer at every gate. The total clamps to the window, so only
bought levels can demand a perfect 5/5.

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

The planned **social-hint config** and **poll-bias config** are now designed:
see Telemetry, Benchmark, and Watch in the roster table ([4.3](#43-config-roster)).

### 4.7 Synergies

Brainstormed: configs held together could combo. Stacking HTML + CSS (or TS + JS)
pays double coverage on both categories, rewarding themed builds over a pile of
unrelated stat-sticks.

Superseded by **dual-focus configs** (2026-08-13, see [4.3](#43-config-roster)):
a hidden pair-bonus table is invisible to new players and scales combinatorially,
while a dual puts the themed-build bonus on a visible, draftable item priced by
its own double check.

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

| Tier | Cap | Bill / gate | Opens after |
| --- | --- | --- | --- |
| 1 (free, the start) | 512KB | Free | — |
| 2 | 640KB | 8KB / gate | — |
| 3 | 768KB | 16KB / gate | gate 2 |
| 4 | 1MB | 32KB / gate | gate 4 |
| 5 | 1.5MB | 48KB / gate | gate 6 |
| 6 | 2MB | 72KB / gate | gate 8 |
| 7 | 3MB | 112KB / gate | gate 10 |

**The ladder is gate-staged** 🟢 (ADR-030). A clear pays roughly `32KB × gate`, so a
cap is only worth its bill once income can fill it — sold at gate 0, a 3MB cap is a
bill against storage the run cannot yet earn. Each rung's bill runs about a fifth to
a third of a perfect clear at the gate that opens it, which keeps the top of the
ladder a late-run flex rather than an opening trap. The shop draws the rungs you have
plus the next one, greyed, so the ladder reads as going somewhere; the reducer refuses
a rung the run has not reached, because the wire only carries a tier number. Note the
cliff scales with the rung: an unpayable bill at 3MB drops you to the free tier, and
everything above 512KB burns at *Climb on*.

The split behind it: anything that *earns* storage is a pipeline config under
the Config Rule (IndexedDB); a slot-free purchase may only change the
container's rules — cap size today — never multiply power. Numbers live in
`rules.model.ts` (`STORAGE_PLANS`).

**Overflow is spend-it-or-lose-it, not discarded on arrival** 🟢. A gate reward can
push storage past the cap; that overflow rides uncapped into the shop that follows,
so a rich gate buys a genuine shopping spree above the usual ceiling. The cap only
clamps at *Climb on* (`finishReward`) — since ADR-032 that click is prep's
**Start gate** button, so the overflow survives shop ↔ prep ↔ community detours
and is forfeit only when the climb actually resumes. Waste becomes urgency
instead of a silent tax on the reward you just earned.

### 5.2 The Shop

Clearing a non-final gate opens a Balatro-style **multi-buy shop** bounded only by
storage. Take as many actions as you can afford, in any order. The exit leads to
the **prep page** (ADR-032), and the shop stays open behind it until the next
gate actually starts — so shop → prep → community → back to the shop is a legal
loop while waiting on tomorrow's polls. The exit is graded against the coming
gate's width demand (ADR-031): blocked, with the shortfall named, while the
build is under it and repairable; an explicit cinnabar **End run** click once
no repair exists.

- **Draft** one of 5 offered configs (new configs only; owned ones upgrade instead).
  Buying is two taps 🟢 (ADR-029), and the offer's corner badge is the second one:
  it reads the price, turns green and reads **install** once the card is tapped,
  then settles into **owned** — the bought offer stays on the table until the next
  roll. The padlock joins the selected offer's corner the same way. An offer you
  cannot afford stays selectable; pressing its greyed-out **install** explains what
  is in the way.
- **Rebuild** the offer for a cost that doubles each time: 4, 8, 16, 32, 64, 128,
  256, 512 KB per rebuild within the same shop (capped at 512).
- **Lock** one offer 🟢 (ADR-029): a flat fee pins it, so rebuilds skip it and it is
  still offered at the next gate's shop. One at a time, spent by installing the
  config. Staged in from gate 2.
- **Extend** the offer 🟢 (ADR-029): one more config on the table, in this shop and
  every shop after it. A small fixed supply per run, escalating price. Staged in
  from gate 3.
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

They surface in four places: the run log's clear line, which names the badge that
clear just earned (the gate-clear screen itself is a bare payoff since ADR-026);
the Configuring stat row (what you hold this run); the end-of-run summary; and
the **Swatches** tab of [the Dex](#63-the-dex), where unearned entries redact
to `???`.

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
| **Demand** | What a check requires ("Requires 3 correct answers"). Set by the build, not by gate depth. |
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
| `STORAGE_PLANS` | 512/0 · 640/8 · 768/16 · 1MB/32 · 1.5MB/48 · 2MB/72 · 3MB/112 | Cap / bill-per-gate by tier (ADR-023). Billed on every closed window, pass or fail; unpaid → auto-downgrade to free. Gate-staged from 0/0/2/4/6/8/10 (ADR-030) — see [2.10](#210-what-unlocks-when). |
| Archived-storage credit rate | 1 / `gates ÷ GATE_COUNT` / 0 | Victory / death / abandon share of leftovers. Divisor is 13. |
| `BASE_SLOTS` → `MAX_SLOTS` | 3 → 14 | Pipeline width, bought with coverage. Independent of the gate count (ADR-019). |
| Slot coverage ladder | 8 / 16 / 28 / 45 / 70 / 100 / 140 / 190 / 250 / 325 / 415 | Total-coverage % to reach slots 4–14. Live-tuned in `pipeline.model.ts` (ADR-008); the last two rungs are untuned. |
| Gate swatches | Pallet … Champion | Thirteen — one per gate, earned by clearing it. Permanent and account-wide (`users.owned_swatch_ids`). |
| `DRAFT_SIZE` | 5 | Configs offered per shop draft, before any Extend. |
| Draft cost | 32 / 64 / 128 / 256 KB | By rarity: common → legendary. |
| Sell refund | `floor(draftCost ÷ 2)` | Storage back on sell. |
| Rebuild cost | 4, 8, 16, 32, 64, 128, 256, 512 KB | Powers of 2, per rebuild in the same shop (capped at 512). |
| `LOCK_COST_KB` | 16 | Flat, one lock at a time, survives into the next shop (ADR-029). |
| Extend cost | 48, 96 KB | Two per run, each adds one offer for the rest of the run (ADR-029). |
| Control staging | gate 2 / gate 3 | Gates that stage Lock and Extend into the shop (`draft.model.ts`). |
| Lint cost | 8 / 16 / 32 / 64 / 128 / 256 KB | Doubles per use within a poll (capped at 256); resets each poll. |
| Focus payout | `1 + 0.25 × level` | Category coverage multiplier (L1 = 1.25×). |
| Focus upgrade gate | `5% × level` | Category coverage needed to level up. |
| IndexedDB faucet | +8 KB / correct | Economy config income. |
| `FAUCET_CAP_KB` | 320 | Per-run ceiling on per-correct faucet income. |

---

*Sources: the `.beans/` story corpus, ADR-005…017, `docs/brainstorm/`, the Notion
Concept doc, and the `src/modules/run/` model files (canonical for all numbers).*
