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
  - [2.7 Failing a Gate](#27-failing-a-gate)
  - [2.8 Victory & Run End](#28-victory--run-end)
  - [2.9 A Typical Run](#29-a-typical-run)
  - [2.10 What Unlocks When](#210-what-unlocks-when)
- [3. The Pipeline](#3-the-pipeline)
  - [3.1 Slots & Expansion](#31-slots--expansion)
  - [3.2 Managing Configs](#32-managing-configs)
- [4. Configs](#4-configs)
  - [4.1 Configs Are Pure Enhancements](#41-configs-are-pure-enhancements)
  - [4.2 Rarity](#42-rarity)
  - [4.3 Config Roster](#43-config-roster)
  - [4.4 Upgrades](#44-upgrades)
  - [4.5 Paid Actions: Lint and Peek](#45-paid-actions-lint-and-peek)
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
escalating stakes, gates with teeth, and meta-progression that outlives a single
run. What it leaves behind: procedural generation (polls are hand-written and the
daily seed is shared by every player, so no two runs differ by dice),
session-length play (a run spans real calendar days, one gate per day, and can
sit half-finished overnight), and permadeath as the default state (an ordinary
missed gate costs you a config and hands the run back, so only a build that
runs out of configs dies, ADR-037). Think of the roguelite parts as the skeleton, not the
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
failed gate adds a day — the retry waits on tomorrow's polls
([2.2 Gates](#22-gates)).

You can **abandon** a run and start fresh the same day. The new run only serves
polls you haven't answered yet, and abandoning banks nothing (see
[6.1 Archived Storage](#61-archived-storage)).

Spending storage to keep climbing past the daily lock ("pay to continue") is a
designed monetization lever; the cost curve is undefined.

### 2.2 Gates

A gate deals a window of 5 polls and audits the score you earn inside it
(ADR-035). The gate's one demand is its **coverage meter**: the window's
coverage, net of wrong-answer losses and floored at 0, must meet the gate's own
threshold ([2.10](#210-what-unlocks-when)). Every gate is a fresh score — the
run's career total never counts, and the meter resets with every attempt.
Configs demand nothing: they are pure enhancements ([4.1](#41-configs-are-pure-enhancements)),
so the friction lives on the gate, not on the build. A bare pipeline never
clears (nothing installed, nothing ships), which is why sell and drop refuse
the last config.

**Farming is priced out, not forbidden**: the gate payout scales with window
correctness (`32 KB × gate number × correct ÷ 5`), so a low-effort clear banks
little — and a low-effort attempt rarely meets the meter at all.

**Gates count from 0.** A run opens on gate 0 and every clear advances one
gate, up to the summit at gate 12. Each clear from gate 1 **grants a slot**
(ADR-034) — width comes with depth, never the other way around — and awards
that gate's **swatch** ([6.4 Swatches](#64-swatches)).

**Exactly one of two things happens when the window's 5th poll is answered** —
nothing is decided before that:

| | condition | outcome |
| --- | --- | --- |
| **Advance** | the window meter meets the gate's demand | paid, gate's swatch earned, `gatesCleared + 1` (slot granted from gate 1), shop opens |
| **Miss** | the meter fell short | the gate **peels configs** (you pick which), then the loop runs again at the same gate: strip → review → shop → prep → 5 fresh polls |

A miss pays nothing, and its peel is the whole death clock: keep missing and the
pipeline keeps shrinking, until a miss holding your last config ends the run
(ADR-037). The other costs ride along — the storage bill collects on every closed
window (ADR-023), pass or fail, and every attempt drains the day's finite polls.
Routing the retry through the shop is the point: the KB you earned inside the
failed window is what buys a *different* attempt instead of a repeat of the one
that just failed.

**Audits are the gate's personality** (ADR-035, roster in ADR-038). An audit is
a fixed rule a gate carries, stated on the stake receipt before you walk in.
**The count escalates**: gates 0–2 are clean, one audit runs from gate 3, two
from gate 8, three from gate 11 — the same shape the peel curve has, so depth
reads as one escalation rather than two. The seven rules:

| Audit | What it does |
| --- | --- |
| **Cost Overrun** | Every paid action costs ×2 — linting and peeking both. |
| **Dependency Outage** | One config in your pipeline is offline for the whole attempt. Which one is fixed for the attempt and re-rolls on the next. |
| **Flaky Build** | One config fails to trigger on every poll — a fresh roll each time, so it can flake the same one twice. |
| **Rolling Outage** | The outage rolls: a different config is down for each poll of the window. |
| **Deprecated** | Your highest-level config is switched off for the whole attempt — the one you invested in most, or a random one among those tied for it. |
| **Read-only** | The shop *before* this gate is shut: nothing bought, sold or switched. You climb it with what you already built. |
| **Feature Freeze** | No paid actions at all — the linter and the peek are gone. |
| **Mirror** | Every poll asks for the **incorrect** options instead, and wants all of them — a single-answer poll with four options becomes a three-option select-all. Graded normally after that, so streaks and partials work and the gate charges full price. Naming every wrong option proves the same knowledge as naming the right one, and the community board counts it that way ([7.2](#72-the-community-board)). |
| **Timeout** | The window's first polls are on a clock; an answer over the limit scores as a miss whatever you picked. |
| **Memory Leak** | Storage leaks every poll: −16KB, −32KB on a miss. |

The four offline audits differ only in which config they take and for how long. Three roll at random (seeded, so a reload never re-rolls one); Deprecated is the one that aims, taking whatever you levelled furthest. Every pick is stable for as long as it should last. Whatever is down is marked on the pipeline rail while you answer — dimmed, badged `offline`, its effect struck through, and its paid action gone — but only there: the shop and prep sit before the gate, so naming a casualty you have not reached yet would be a spoiler.

Where they sit: **Marsh (7)** is the mirror; **Volcano (9)** leaks storage;
**Elite (11)** and **Champion (12)** carry **strip audits**, which deepen the
base peel — Elite takes 5 configs on a miss where the depth alone would take 4,
Champion 6 — and both stack two more rules on top. Every audit is named on the
stake receipt beside the peel it costs, so nothing about a death arrives
unannounced. Full schedule in [2.10](#210-what-unlocks-when).

One rule about where audits may sit, learned by building them: **Read-only only
lands on odd gates**, because the storage rungs unlock on even ones and a rung
you can see but not buy reads as a bug.

**Boss gates** (every 5th gate, two requirements AND-ed, no reroll) are parked;
a second pass over the roster collects in DVTD-6moy.

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

**Coverage** is the score, kept on two ledgers (ADR-035): the **gate meter** —
the window's net coverage, reset with every attempt, the only number a gate
judges — and the **career totals** (a percentage per category plus a run
total), which keep accumulating for the leaderboard and Focus upgrades and
never gate anything.

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
0..1. Shotgunning every option earns nothing. Only coverage reads this share;
streak and storage stay binary on the exact-set rule.

**A wrong answer bleeds** `0.25 × build multiplier × gate multiplier` from the
poll's category, the gate meter, and the run total alike, each floored at 0
(ADR-013, retuned by ADR-034/035).

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

Category coverage past 100% rolls over into **levels**: 110% in JavaScript reads
as "L2", then "L3". Mastery keeps counting instead of capping. (The run-total
"laps" display died with the cumulative demand, ADR-035.)

### 2.6 Technical Debt

Scrapped (DVTD-eguq, 2026-08-17). Debt cards were designed as an alternative to
strip-on-fail, and strip-on-fail is what ADR-037 kept: a missed gate peels a
config. The debt idea (a failed gate disables an effect until a condition is
worked off) could return as a gate audit if a gate wants that personality.

### 2.7 Failing a Gate

Missing a gate's coverage demand **peels a config** and hands the run back to
the same gate (ADR-037). You choose which config goes on the strip screen, then
the normal post-gate loop runs: the answers to review, the shop, the prep hub,
and the gate again on 5 fresh polls. The meter starts over; coverage and storage
survive.

| Cost | Detail |
| --- | --- |
| **Configs** | 1 at the first gates, rising to 4 by the summit ([2.10](#210-what-unlocks-when)), +1 at Elite and +2 at Champion. Your pick, so a miss is also a chance to shed the config that was not earning its slot. |
| **The payout** | A failed attempt pays no gate reward, no interest, no extra-pick KB. The faucet KB earned inside the window is the retry's budget. |
| **The storage bill** | A paid plan bills on every closed window, pass or fail (ADR-023). |
| **The day's polls** | Every attempt burns 5 of the day's finite sequence — a retry is real time. |
| **Audit damage** | The gate's audits charge again on the retry: Volcano leaks storage every attempt, a Timeout re-clocks its polls, an outage re-rolls which config goes down. |

The peel **escalates with depth** because width does: a clear grants a slot, so
one config is a third of an opening build and a fourteenth of a summit build.
The rows sit at roughly a quarter of the pipeline the gate expects you to have
built, which keeps a run three or four misses from death the whole way up
instead of thirteen at the top.

**Death is the peel running out of configs**: a miss whose peel is as big as
your build ends the run there. Both facts are on the stake receipt before you
answer, the fatal one in red.

### 2.8 Victory & Run End

Clear all **13** gates — numbered **0 through 12** — to win; `VICTORY_GATE` is the
summit's number (12) and `GATE_COUNT` is how many there are (13). How long the climb
runs is a content decision, one gate per badge in the roster — a narrow pipeline
that keeps meeting the meters can summit. A run ends three ways (ADR-037): **the
summit** (victory), **a missed gate whose peel takes the whole build**
([2.7](#27-failing-a-gate)), or **abandoning**. A continue-past-victory option is confirmed but unbuilt (DVTD-g1p0);
the victory *reward* is still undecided, with one constraint: it must not be
claimable by a zero-effort farm run.

When a run ends, leftover storage is credited to your persistent archived storage
proportionally to how far you climbed: **victory banks 100%**, **death banks
gatesCleared ÷ GATE_COUNT** (die having cleared 6 of 13, keep 46%), **abandoning
banks nothing**; walking away can never be a cash-out. A tag-rescued run
(ADR-036, [5.2](#52-the-shop)) banks only the gates it actually climbed — the
checkpoint is a head start, never a cash-out either.

### 2.9 A Typical Run

An illustrative baseline for balance sanity-checks, computed from the shipped
constants. Assume a solid player: 4 of 5 polls correct each gate with one
mid-window miss, plain 3-option single-answer polls (difficulty ×1), a lean
build with no coverage configs. That player's gate meter lands around
`4.4 × gate multiplier` per window.

| Gate | Meter (lean 4-of-5) | Demand | Verdict |
| --- | --- | --- | --- |
| 0 | ~4.4% | 3% | clears — the teaching gate forgives a lean build |
| 1 | ~8.7% | 10% | just misses — the first gate that demands *something* extra |
| 2 | ~13% | 25% | misses — coverage configs are homework from here |
| 4 | ~22% | 60% | needs roughly a ×2.5 build or a hot streak |

This deliberately reverses ADR-034's 80%-of-base-pace pricing (ADR-035), which
was priced when a miss was free. A miss now costs a config (ADR-037), so these
rows are the first thing to loosen if the early gates read as punishing. They
live in `rules.model.ts`; the reward schema is `32 × gate × correct ÷ 5`
per clear, unchanged.

### 2.10 What Unlocks When

One sheet for everything the climb stages in, because the rules arrive on two
different axes and it is easy to lose track of which is which:

- **Gate number** stages the *coverage demanded* to pass, the *audits*, the
  *shop's controls*, and **width**: each clear from gate 1 grants a slot
  (ADR-034; [3.1](#31-slots--expansion)).
- **Category coverage** stages *Focus upgrades* ([4.4](#44-upgrades)).

| Gate | Swatch | Coverage in its window | A miss peels | Audit | Unlocks at this gate |
| --- | --- | --- | --- | --- | --- |
| 0 | Pallet | 3% | 1 | — | Shop, **Rebuild offers**, the 512KB free plan and the 640KB rung |
| 1 | Boulder | 10% | 1 | — | Slot 4 |
| 2 | Cascade | 25% | 1 | — | **Lock an offer**, 768KB rung, slot 5 |
| 3 | Thunder | 40% | 2 | **Cost Overrun** | **Extend offers**, slot 6 |
| 4 | Lavender | 60% | 2 | **Dependency Outage** | 1MB rung, slot 7 |
| 5 | Rainbow | 85% | 2 | **Read-only** | Slot 8 |
| 6 | Soul | 110% | 2 | **Feature Freeze** | 1.5MB rung, slot 9 |
| 7 | Marsh | 140% | 3 | **Mirror** | Slot 10 |
| 8 | Seafoam | 175% | 3 | **Timeout** (3 polls, 30s) + **Flaky Build** | 2MB rung, slot 11 |
| 9 | Volcano | 210% | 3 | **Memory Leak** + **Rolling Outage** | Slot 12 |
| 10 | Earth | 250% | 3 | **Deprecated** + **Timeout** (4 polls, 25s) | 3MB rung (top of the ladder), slot 13 |
| 11 | Elite | 290% | **5** | **Strip** + **Mirror** + **Flaky Build** | Slot 14 (the width cap) |
| 12 | Champion | 340% | **6** | **Memory Leak** + **Strip** + **Timeout** (5 polls, 20s) | Summit — clearing it wins the run |

The coverage column is per-gate and fresh (ADR-035): the meter resets every
attempt, so each row is a score to hit inside 5 polls, not a running total. The
peel column is what a miss takes (ADR-037), audits included — it tracks the slot
column, since a peel is only a threat in proportion to the build it hits.
Every row is the full price now: the Mirror stopped discounting Marsh when it
started flipping the poll instead of the score. Gates 0–2 carry no audit by
design, and the count is the escalation: one from gate 3, two from 8, three
from 11 (ADR-038).

Sources, all authoritative over this table: `coverageDemandFor`,
`STORAGE_PLANS` (`rules.model.ts`), `slotsForGatesCleared`
(`pipeline.model.ts`), `LOCK_FROM_GATE`/`EXTEND_FROM_GATE` (`draft.model.ts`),
`GATE_SWATCHES` (`swatch.model.ts`), `GATE_AUDITS` (`audit.model.ts`).

**Not on this axis** (so they are deliberately absent above):

| Track | Staged by | Where |
| --- | --- | --- |
| Focus config levels | that category's coverage % | [4.4](#44-upgrades) |
| Unit Tests levels | storage (32KB × level bought) | [4.4](#44-upgrades) |
| Lint fee | uses within the current poll | [4.5](#45-paid-actions-lint-and-peek) |
| Peek fee | peeks within the current gate | [4.5](#45-paid-actions-lint-and-peek) |
| Rebuild price | rebuilds within the current shop | [5.2](#52-the-shop) |
| Swatches, Dex, borders | account-level, across runs | [6. Meta-progression](#6-meta-progression) |

---

## 3. The Pipeline

### 3.1 Slots & Expansion

Your pipeline holds every installed config, one per **slot**. You start with **3
slots** and can grow to **14**. Slots are granted by gates (ADR-034): clearing
gate 1 opens slot 4, and every clear after it opens the next, up to slot 14 at
gate 11 — the one table in [2.10](#210-what-unlocks-when) has every row. Width
still opens no gates; it only ever arrives with them. Width claims itself
automatically on the clear (ADR-025): there is no purchase step, and no coverage
rung to reach — the coverage you earn is the gate's own demand now, never
width's price.

The shop shows the next slot as a full-width dashed row in the pipeline list,
numbered like every other slot — "Opens when Gate 2 clears". A slot granted
since your last visit shows as a green "Unlocked Nth slot" row in the same spot
instead. It carries no swatch: badges come from clearing gates
([6.4 Swatches](#64-swatches)).

> ⚠ Until ADR-034 (2026-08-15) slots were bought with total coverage on their
> own ladder (8%…415%, ADR-008/019/025). The gate's coverage demand replaced
> that ladder: one axis, one ladder, priced once.

### 3.2 Managing Configs

Click any config chip for its action popover: **Install**, **Sell** (refunds half
the draft cost), or **Upgrade**. Any config can be sold except your last one: a
bare pipeline never clears a gate, so the shop refuses the final uninstall
(ADR-035). At run start, the **Configuring** screen offers **starter stacks**
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

### 4.1 Configs Are Pure Enhancements

Every config represents a real CI configuration, and every config is one thing
(ADR-035): an **effect with a price**. The price is the draft cost and the
slot; the effect is coverage multipliers, flat adds, storage payouts, or an
on-demand action. Nothing a config does demands anything of the player — the
demands belong to the gate ([2.2](#22-gates)): its coverage meter and its
audits.

This retires the Config Rule (ADR-016/017/022/033): every check, the mastery
demands, the escalating correct-answer count, and the roster's type-level
"every config owes the gate something" enforcement are gone. The friction they
carried moved onto the gates, where it reads as personality instead of
homework.

**Fees still price actions** (2026-08-13). An on-demand *action* (the lint
cross-out, Telemetry's peek) meters each use with an escalating fee, because
the player chooses every activation. Passives carry no fee — the draft price
is the whole cost.

**Volkswagen CI reads the audits** (ADR-028, repurposed). The defeat device is
the one config aimed at the gate's own rules: installed, it reports the gate's
**first** audit as passing, struck through on the stake receipt — visible fraud,
never silent. Which one that is grows into a real decision as gates stack three:
at Elite it cancels the deepened peel and leaves the mirror standing, at the
Champion it stops the leak and leaves the strip.

### 4.2 Rarity

Four tiers, **common / uncommon / rare / legendary**, shown as border + glow
(gray → green → blue → gold), never as fill. Rarity bites through the **draft cost**:
32 / 64 / 128 / 256 KB. Rarity-weighted draw odds (proposed 60/25/12/3) and drop
rates on hover are planned; today the draft cycles deterministically through the pool.

### 4.3 Config Roster

One table, every config. Shipped (🟢) entries are pure effects (ADR-035).
Parked/planned (🟡) rows still carry the check ideas they were designed with —
each needs a redesign pass (bounded condition, fee, or gate audit) before it
can ship, since checks no longer exist.

| Config | Rarity | Effect | Check (🟡 legacy design only) | Status |
| --- | --- | --- | --- | --- |
| Unit Tests | common | +32 KB × level storage on gate clear | — | 🟢 |
| `.js` | common | JavaScript polls reward ×1.25 | — | 🟢 |
| `.ts` | common | TypeScript polls reward ×1.25 | — | 🟢 |
| `.css` | common | CSS polls reward ×1.25 | — | 🟢 |
| `.jsx` | common | React polls reward ×1.25 | — | 🟢 |
| `.html` | common | HTML polls reward ×1.25 | — | 🟢 |
| `.git` | common | Git polls reward ×1.25 | — | 🟢 |
| `.java` | common | Java polls reward ×1.25 | — | 🟢 |
| `.py` | common | Python polls reward ×1.25 | — | 🟢 |
| `.rb` | common | Ruby polls reward ×1.25 | — | 🟢 |
| `package.json` | common | General Frontend polls reward ×1.25 | — | 🟢 |
| ESLint | common | Cross out one wrong answer on JS/TS polls, for an escalating price (from 8 KB) | — | 🟢 |
| Stylelint | common | Cross out one wrong answer on CSS polls, for an escalating price (from 8 KB) | — | 🟢 |
| Cold Start | uncommon | First answer rewards ×2 | — | 🟢 |
| Coverage | uncommon | Coverage gains ×2 | — | 🟢 |
| IndexedDB | uncommon | +8 KB storage per correct answer; caps at 320 KB | — | 🟢 |
| Code Coverage | uncommon | +0.5% flat coverage per correct answer | — | 🟢 |
| Intellisense | rare | All coverage ×1.5 | — | 🟢 |
| AGENTS.md | legendary | All coverage ×2 | — | 🟢 |
| Volkswagen CI | legendary | Reports the gate's first audit as passing; costs 384 KB to draft | — | 🟢 |
| Vite config | common | +3% coverage on JS/TS polls answered under 35 s | At least one poll answered under 35 s | 🟡 |
| `.every()` | common | +1% when a category you've 5-streaked appears | Don't break your streak this gate | 🟡 |
| Semver | common | Coverage ×1.2 for each Focus config at L2 or higher | No Focus config may sit at L1 | 🟡 |
| Rate limiter | common | Wrong answers don't bleed coverage | No single poll may earn more than 3% coverage | 🟡 |
| Telemetry | uncommon | Pay per use (32 → 64 → 128 KB, doubling, resets each gate) to see how everyone who ever answered this poll voted. L1 shows percentages only; L2 adds the sample size (see [4.4](#44-upgrades)) | — | 🟢 |
| `.length` | uncommon | Shows how many correct answers the gate's 5 polls hold between them, and pays +16 KB per answer beyond one per poll | — | 🟢 |
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
| Moore's Law | common | On each gate clear, +2% × level of held storage | — | 🟢 |

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

**Moore's Law and the cap** (built 2026-08-13; floor removed by ADR-035).
Interest is the only benefit that reads your balance instead of the window. It
**ramps instead of gating**: 2% of a small balance is near-worthless, because
interest is only worth anything once the balance is large, and the balance is
only large late. It rises per level to 10% at L5, upgrading for **storage**
like Unit Tests — the upgrade spends the principal it then earns against.
Because the plan cap burns the surplus when the shop closes
([5.2](#52-the-shop)), interest at the free 512 KB tier is *shop budget*, not
principal: compounding requires buying cap room, which bills you every gate.

Known dial collisions among the 🟡 rows: Hotfix and Try/Catch share
"next gate must clear" (Hotfix preferred — Try/Catch cancels a loss, Hotfix makes
a loss playable); `--save-exact` and Dependabot share "you may not sell" (only one
ships as-is). Garbage Collector (+32 KB per peeled config, check: leave one poll
unanswered) died for lack of a skip mechanic; its payout lives on inside Hotfix.
Cold cache's check is vacuous for the same reason until a skip mechanic exists.

Each Focus level raises the payout (`1 + 0.25 × level`) — nothing else, since
checks are gone (ADR-035). General Backend has no Focus config yet.

Coverage is still slated for a rename (collides with coverage-the-score);
"SonarQube" is the leading candidate.

Diagnostic: if two configs share a check dial, one of them probably has a boring
effect.

**`.length` sells information and pays on shape** (DVTD-cz6c, exact-spend rule
removed by ADR-035). It names how many correct answers the gate's five polls
hold between them — the poll card carries the count — and pays 16 KB per
correct answer the window held beyond one per poll. The payout is deliberately
**not** a coverage multiplier (four configs already sell coverage magnitude):
it pays most in multi-answer-heavy windows and nothing at all in a window of
five single-answer polls, a dead spot stated on the row rather than hidden in
the rules.

A window that spans a day boundary re-reads its count (DVTD-6nkn). Gates ignore
day boundaries (ADR-011 §3), but the rollover drops the unplayed tail and
appends today's segment, so the number is recomputed on every load and always
describes the polls actually in front of the player.

### 4.4 Upgrades

Every upgrade caps at **level 5** (`maxLevel` on the config, default 5 — the
5-poll window is the natural demand ceiling). Telemetry is the exception at
`maxLevel: 2`, below.

The **stake receipt states what rides on top of the base**: a Focus config's
multiplier when the poll matches its category, and the streak step, which every
correct answer takes — including the first, since one correct answer is already
a streak of one. The base on its own is a figure no answer ever pays, so quoting
it alone made a correct answer look like a scoring bug.

**Focus configs** answer to two gates (ADR-039): level N → N+1 requires 5% × N
career coverage in that category **and** the storage every upgrade costs.
Coverage is permission, KB is the price, and neither stands in for the other — an
earned level can be unaffordable and a funded one unearned. Each level raises the
payout (`1 + 0.25 × level`: L1 = 1.25×, L2 = 1.5×…) — the mastery check it used
to raise is gone (ADR-035). The shop's Upgrade button carries the price and
previews the next level's effect on hover; while gated, the tooltip names
whichever requirement is in the way. Row copy (demand/payoff) derives from the
config's current level, so an upgraded config reads its real numbers everywhere.

**Moore's Law upgrades for storage** on the same curve as Unit Tests: +2%
interest per level. Buying a level spends the very principal the interest then
earns against, which is the decision the config is built around (the 32 KB
floor per level died with the checks, ADR-035).

**Unit Tests upgrades for storage** (32 KB × the level bought: L2 costs 64,
L5 costs 160 — no coverage gate). Each level buys +32 KB payout per level on
clear; the correct-answer demand it used to raise is gone (ADR-035 retired
ADR-033 with it).

**Telemetry upgrades once, and buys honesty rather than power** (64 KB, storage,
`maxLevel: 2`). L1 hands over the percentages with no denominator attached, so
100% of two players and 100% of a hundred are the same picture: the config can
talk you into a wrong answer, and that risk is what its draft price buys. L2 adds
one line — "based on 127 answers" — which is the only thing that separates those
two readings. The number is withheld server-side, never merely hidden in the UI,
so the L1 blindness survives a devtools tab. There is no L3 because there is no
third thing left to reveal that is not just the answer.

In flux: the stories also propose archived-storage-funded, 10-level cross-run
upgrades (DVTD-z94q); the upgrade currency question (run storage vs archived
storage vs coverage) is explicitly unreconciled.

### 4.5 Paid Actions: Lint and Peek

Two configs sell an action rather than a passive, and both meter it with a
doubling fee (§4.1: fees price actions). Both actions hang off the selling
config's own pipeline row, so a build's powers are all read in one place.

**Lint.** If a linter covering the poll's category is equipped, a lint button
appears: pay to gray out one wrong option. Linted polls never reveal their correct
answer in community views; they may reappear in a later seed. The cost doubles with
each use within a poll (8 → 16 → 32 → 64 → 128 → 256 KB, capped) and resets each
poll, to stop lint-spam. Using it is always a choice — the fee is the whole price
(ADR-035).

**Peek** (Telemetry, DVTD-fpf9). Pay to see how the community voted on the poll in
front of you, drawn as a gray bar per option. The pool is every answer that poll
has ever taken, both loops — not today's climbers, who on a quiet morning are
nobody — **minus anyone who answered it at a Mirror gate**, since they were asked
for the incorrect options and their picks would invert the very signal you are
buying (ADR-038). The fee doubles per use and resets **each gate** rather than each poll
(32 → 64 → 128 → 256 → 512 KB, capped): a peek buys the whole poll where a lint
buys one option, so the second peek of a window has to hurt. One peek per poll —
the split arrives complete.

The peek demand ("you must peek at least once each gate") shipped 2026-08-14 and
died with every other check three days later (ADR-035): peeking is now as
optional as linting, and the fee ladder is the whole price.

Correctness never travels with a peek. The server hands over option ids and
percentages for polls the run has already paid on, and nothing else — a peek is a
hint, not an answer.

### 4.6 Parked & Planned Configs

Spec'd and shelved (post-2.0 backlog): **yarn.lock** (immunity to requirement
raises), **rm -rf** (strip-all with 2× refund), **localStorage** (storage burst).
Two left this list by becoming gate audits instead of configs: **Mirrored Check**
is the Marsh gate's mirror (ADR-035, was DVTD-5o4d), and **Speed Check** is the
Timeout audit (ADR-038) — a clock is something a gate does to you, not something
you buy.

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

The split behind it: anything that *earns* storage is a pipeline config
(IndexedDB); a slot-free purchase may only change the container's rules — cap
size today — never multiply power. Numbers live in
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
storage — and so does missing one, once its peel is paid (ADR-037): the retry
shops with what it has, which is the only thing that makes the second attempt
different from the first. Take as many actions as you can afford, in any order. The exit leads to
the **prep page** (ADR-032), and the shop stays open behind it until the next
gate actually starts — so shop → prep → community → back to the shop is a legal
loop while waiting on tomorrow's polls. The exit is always open (ADR-035):
nothing grades it, and the End-run click is gone.

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
- **git tag** 🟢 (ADR-036): plant a cross-run checkpoint at the current gate —
  after a death, your next run checks out there instead of gate 1. The price is
  the gate it marks: 128 KB at gate 4, +64 KB per gate, 512 KB at gate 10, which
  is the last gate that sells one (deeper, a rescue resumes a starter build into
  stacked audits and a 4-config peel). One per run, and the rescued run consumes
  it (burn on use) — after that you buy another.
  A rescued run starts at the pinned gate with the width its clears would have
  granted, a 32 KB-per-gate stipend, and everything else fresh; its death
  credit counts only the gates it actually climbed.
- **Sell** a config for half its draft cost.
- **Upgrade** any upgradable config for 32 KB × the level bought; a Focus config
  also has to have earned it on coverage (ADR-039).
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
extra core check alongside Unit Tests) is retired — twice over, now that checks
themselves are gone (ADR-035).

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

After every shop visit the climb detours through `/run/community`; a run locked
for the day also lands here (the
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

Below it, **today's polls**. A mirrored answer counts as right here when it named
every wrong option: it proves the same knowledge, so the board mixes it freely
with plain answers (ADR-038) — the board counts knowledge, where the paid split
reports opinion and cannot mix the two. The option rows still mark the poll's own
truth, since the mirror changes what was asked of one player, never what is true.
Each row is a native `<details>` whose summary is the
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
  it". It deliberately carries no coverage: the total is the gate's own stake,
  shown on the Build Summary's "To pass" line (ADR-034).
- **Slot unlock row**: the next slot closes both the configure and shop pipelines
  as a dashed row, numbered in the list's gutter like every other slot — "Opens
  when Gate 2 clears". Gates grant slots on the clear (ADR-034) and width claims
  itself automatically (ADR-025) — there is no unlock button anywhere. The shop
  replaces this row with a green "Unlocked Nth slot" acknowledgment for whichever
  slot(s) arrived since the last visit. It carries no swatch, and retires at the
  slot cap.
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
| **Gate** | A checkpoint auditing a 5-poll window: its coverage demand plus its audits (ADR-035). |
| **Audit** | A gate's fixed rule (the mirror, a leak, a clock, a shut shop, a config knocked offline). Stated on the stake receipt beside the peel it costs; the count grows with depth. |
| **Gate meter** | The window's net coverage — the only score a gate judges. Resets every attempt. |
| **Pipeline** | Your build: the stack of config slots. |
| **Slot** | One pipeline position (3 → 14, granted by gate clears). Buys room for a config; opens no gates. |
| **Gate number** | Counts from 0: a run opens on gate 0 and summits on gate 12. |
| **Config** | An installable dev-tool item: an effect with a price, demanding nothing (ADR-035). |
| **Effect** | The benefit a config provides. |
| **Demand** | What a gate requires: its coverage row in [2.10](#210-what-unlocks-when). |
| **Coverage** | The score: a percentage per category plus a run total (career), and the gate meter (per attempt). Full in-fiction name: **knowledge coverage**. |
| **Storage** | The in-run currency, in KB, capped by the storage plan (512 free / 640 / 768). Overflow above the cap forfeits only at *Climb on*, not when it's earned 🟡 (DVTD-0h4n). |
| **Storage plan** | The subscription setting the storage cap (ADR-023): free 512 KB, or a bigger cap for a per-gate bill collected pass or fail. Unpaid bills auto-downgrade to free. |
| **Archived storage** | Persistent cross-run storage (bytes): the meta-progression currency, spendable on cosmetics, run injections, and more. |
| **Faucet** | Any per-correct-answer storage income (e.g. IndexedDB). |
| **Draft / Rebuild** | Buying a shop config / re-rolling the offer (doubling cost). |
| **Peel** | What a missed gate takes: a config of your choosing, before the loop runs again at the same gate (ADR-037). |
| **git tag** | A shop-bought cross-run checkpoint (ADR-036): priced by the gate it marks (128 KB at gate 4 → 512 KB at gate 10, the last one sold), one per run, burnt by the run it rescues. |
| **Strip audit** | An audit that deepens the peel: Elite takes 5 configs on a miss, Champion 6. |
| **Seed** | The shared per-day poll sequence every player climbs. |
| **Segment** | One day's 5-poll chunk appended to a persistent run. |
| **Lint** | Paying an escalating fee (from 8 KB) to disable one wrong option (needs a linter config). |
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
| Upgrade cost | 32 KB × (level + 1) | Every upgrade, Focus included (ADR-039). A Focus config also needs 5% × level career coverage in its category. |
| Gate multiplier | `gatesCleared + 1` | Scales coverage **gains** and the gate reward base (×1 … ×12). Frozen while a gate is redone. |
| `WRONG_COVERAGE_LOSS` | 0.25 | Coverage bleed per miss (× reward and gate multipliers), hits the gate meter and the career totals alike, each floored at 0. |
| Coverage demand | 3 / 10 / 25 / 40 / 60 / 85 / 110 / 140 / 175 / 210 / 250 / 290 / 340 | Per-gate % the window meter must reach (ADR-035) — fresh every attempt, never cumulative. Live-tuned in `rules.model.ts` (`coverageDemandFor`). |
| Gate audits | 1 from gate 3 · 2 from gate 8 · 3 from gate 11 | Nine rules, fixed per gate, gates 0–2 clean; full schedule in [2.10](#210-what-unlocks-when) (ADR-035/038; `audit.model.ts`). |
| Audit numbers | Cost Overrun ×2 · Memory Leak 16/32KB · Timeout 30s/25s/20s | The live-tuned half of the roster (`audit.model.ts`). |
| Peel on a miss | 1 / 1 / 1 / 2 / 2 / 2 / 2 / 3 / 3 / 3 / 3 / 4 / 4 | Configs a missed gate takes, per gate; strip audits add to the row (ADR-037; `failStripsFor` in `rules.model.ts`). |
| git tag | 128 KB at gate 4, +64 KB per gate, 512 KB at gate 10 (last sold) · stipend 32 KB × gate | Cross-run checkpoint, burn on use (ADR-036; `pinCostFor`/`PIN_*` in `rules.model.ts`). |
| `STREAK_COVERAGE_BONUS` | 0.1 | Streak multiplier step (`1 + 0.1 × streak`). |
| Difficulty bonus | +0.1 / option > 3, +0.5 multi | Gains-only multiplier, never below ×1. |
| `GATE_REWARD_KB` | 32 | Gate-1 base storage per clear (× gate multiplier × reward multipliers × correct ÷ 5). |
| `GATE_REWARD_MULTIPLIER_CAP` | 12 | Reward depth multiplier stops growing past gate 12 (endless runs). |
| `STORAGE_CAP_KB` | 512 | The free tier's storage cap; the clamp waits for *Climb on* (DVTD-0h4n). |
| `STORAGE_PLANS` | 512/0 · 640/8 · 768/16 · 1MB/32 · 1.5MB/48 · 2MB/72 · 3MB/112 | Cap / bill-per-gate by tier (ADR-023). Billed on every closed window, pass or fail; unpaid → auto-downgrade to free. Gate-staged from 0/0/2/4/6/8/10 (ADR-030) — see [2.10](#210-what-unlocks-when). |
| Archived-storage credit rate | 1 / `gates ÷ GATE_COUNT` / 0 | Victory / death / abandon share of leftovers. Divisor is 13. |
| `BASE_SLOTS` → `MAX_SLOTS` | 3 → 14 | Pipeline width. Granted by gate clears (ADR-034), never bought. |
| Slot grants | gates 1–11 → slots 4–14 | One slot per clear from gate 1 (`slotsForGatesCleared`, `pipeline.model.ts`); gate 0 teaches on the starting three. |
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

*Sources: the `.beans/` story corpus, ADR-005…035, `docs/brainstorm/`, the Notion
Concept doc, and the `src/modules/run/` model files (canonical for all numbers).*
