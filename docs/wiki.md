# DevVoted Wiki

The player-facing reference for **DevVoted**, the daily trivia game for developers.
Answer coding polls, assemble a build of configs, and clear gates without breaking
your build.

The game is in active development, so articles carry a status tag: **🟢 shipped**,
**🟡 planned** (designed, not built), **⚪ parked** (spec'd, shelved post-2.0).
Untagged text is shipped.

Division of labour: this wiki states the current rules. Numbers are authoritative in
the model files under `src/modules/run/` (mainly `rules.model.ts`); every reason,
trade-off, and reversal lives in `docs/adr/`. Where this wiki and the code disagree,
the code wins and the wiki is wrong.

## Contents

1. [The game](#1-the-game)
2. [The run](#2-the-run)
3. [Your Build](#3-your-build)
4. [Configs](#4-configs)
5. [Economy](#5-economy)
6. [Meta-progression](#6-meta-progression)
7. [Community](#7-community)
8. [Interface](#8-interface)
9. [Glossary](#9-glossary)
10. [Numbers reference](#10-numbers-reference)

---

## 1. The game

### 1.1 What it is

DevVoted is a developer quiz game wrapped in a CI/CD-pipeline metaphor. You answer
real programming polls; your **build** of installed **configs** (dev tools like
`.js`, ESLint, Copilot) decides how richly each correct answer pays, while your
**gates** decide what the run demands of you.

It borrows from roguelites without being one. It takes: run-based structure, builds
assembled from collectible items, escalating stakes, and meta-progression that
outlives a run. It leaves behind procedural generation (polls are hand-written and
the daily seed is shared by every player), session-length play (a run spans calendar
days, one gate per day), and permadeath as the default (an ordinary miss costs a
config and hands the run back; only a build that runs out of configs dies).

The point is a daily learning ritual that happens to keep score: short polls spark
curiosity and hand you a topic to dig into afterwards.

### 1.2 The two loops

- **The daily poll**: one shared poll per calendar day, a few-minutes social ritual
  built for comparing answers with colleagues.
- **The run**: the opt-in campaign that draws polls from the bank. This is the heart
  of the game.

### 1.3 Inspirations

*Balatro* (configs as Jokers, the equation reveal), *Banjo-Kazooie*'s Furnace Fun
(rhyming trivia), *Pokémon* Gen 1 to 3 (the Kanto palette, the Dex), *Stardew Valley*
(bundle-style unlocks), *De Slimste Mens*, Wordle's daily ritual, and Advent of Code.

---

## 2. The run

### 2.1 Shape of a run

A run is a multi-day climb through numbered gates. Each calendar day one shared
**daily seed** hands every player the same 5 polls: **1 gate = 1 day = 5 polls**.
Answer them and the run locks until tomorrow, when a fresh 5-poll **segment** is
appended.

Runs persist across days and never expire; a partly answered gate fills up across
the day boundary, and yesterday's unplayed polls are dropped rather than failed. A
flawless summit takes 12 calendar days, and every missed gate adds one, because the
retry waits on tomorrow's polls.

Where a locked run parks depends on the phase (ADR-032): mid-gate it redirects to the
[community board](#7-community); after a cleared gate it parks on the **prep page**,
with the shop a click away and the start-gate button wearing the countdown to
midnight.

You can **abandon** a run and start fresh the same day. The new run serves only polls
you have not answered yet, and abandoning banks nothing.

### 2.2 Gates

A gate deals a window of 5 polls and audits the score earned inside it (ADR-035). Its
one demand is the **coverage meter**: the window's coverage, net of wrong-answer
losses and floored at 0, must reach the gate's threshold
([2.8](#28-what-unlocks-when)). Every gate is a fresh score, the meter resets on every
attempt, and the run's career total never counts.

Configs demand nothing ([4.1](#41-what-a-config-is)): all friction lives on the gate.
A bare build never clears, which is why sell and drop refuse your last config.

**Gates count from 0.** A run opens on gate 0 and summits at gate 12. Four of the
every clear awards
that gate's **swatch** ([6.3](#63-swatches)).

Exactly one of two things happens when the window's 5th poll is answered; nothing is
decided before that:

| | Condition | Outcome |
| --- | --- | --- |
| **Advance** | the meter meets the demand | paid, swatch earned, `gatesCleared + 1`, shop opens |
| **Miss** | the meter fell short | the gate **peels configs** (you pick), then the same gate runs again: strip, review, shop, prep, 5 fresh polls |

**Farming is priced out, not forbidden.** The payout scales with window correctness
(`32 KB × gate number × correct ÷ 5`), so a low-effort clear banks little, and a
low-effort attempt rarely meets the meter at all.

⚪ **Boss gates** (every 5th gate, two requirements AND-ed, no reroll) are parked.

### 2.3 Audits

An audit is a rule a gate carries, stated on the stake receipt before you walk in.
**The count is the escalation**: gates 0 to 2 are clean, one audit runs from gate 3,
two from gate 8, three from gate 11, the same shape the peel curve has. A clean
gate's receipt says so instead of going silent: it names the first audit waiting
ahead, so the system introduces itself before it ever charges.

**Which audits fill those slots is drawn, not fixed.** Gate 3 always opens on 402 and
gate 12 always closes on its handcrafted three; gates 4 to 11 draw from staged pools,
seeded on the date, so every player climbing today meets the same gauntlet and
tomorrow's is different. Nothing is hidden inside a run: the receipt names every audit
before the gate, and the Dex publishes the pools. A missed gate keeps its audits on
the retry, though whatever an audit picks (which config goes offline) rolls again.

Every audit is named for the HTTP status it behaves like, and the class carries the
signal: **4xx means the rules changed on you**, **5xx means your build is down**.

| Audit | What it does |
| --- | --- |
| **300 Multiple Choices** | Every poll asks for the **incorrect** options and wants all of them, so a single-answer poll with four options becomes a three-option select-all. Graded normally after that, so streaks and partials work and the gate charges full price. |
| **402 Payment Required** | Every paid action costs ×2, linting and peeking both. |
| **403 Forbidden** | No paid actions at all: the linter and the peek are gone. |
| **404 Not Found** | No poll names its category, so which of your configs is about to pay is yours to work out. |
| **405 Method Not Allowed** | The shop *before* this gate is read-only: nothing bought, sold, upgraded or switched. |
| **408 Request Timeout** | The window's first polls are on a clock; an answer over the limit scores as a miss whatever you picked. |
| **409 Conflict** | Your highest-level config takes a breaking change and is switched off for the attempt. |
| **410 Gone** | Deepens the peel: Elite takes 5 configs on a miss, Champion 6. |
| **413 Payload Too Large** | Every slot past the 12th leaks 8 KB a poll, so a wide build pays to carry itself. |
| **424 Failed Dependency** | One config is offline for the whole attempt. |
| **426 Upgrade Required** | Your lowest-level config goes out of date and sits the attempt out. |
| **429 Too Many Requests** | One paid action for the whole window: the linter or the peek, not both. |
| **451 Unavailable For Legal Reasons** | The window's first 3 polls arrive with 2 answers redacted as `?????`. A redacted answer is still pickable; 4 KB buys one back. |
| **502 Bad Gateway** | One config flakes on every poll, rolled fresh each time. |
| **503 Service Unavailable** | A different config is down for each poll of the window. |
| **507 Insufficient Storage** | Storage leaks every poll: −16 KB, −32 KB on a miss. |

The five offline audits differ only in which config they take and for how long. Three
roll at random (seeded, so a reload never re-rolls one); 409 aims at whatever
you levelled furthest and 426 at whatever you levelled least. Whatever is down reads `offline` on the build track while you
answer, struck through and blamed on the audit by name, and nowhere else, since shop
and prep sit before the gate and naming a casualty early would be a spoiler.

Two audits tighten with depth rather than repeating: **408** clocks 3 polls at 30s
below gate 10, 3 at 25s at gates 10 and 11, and 5 at 20s at the Champion; **410** adds
10 points to the peel at Elite and 15 at the Champion.

A gate never draws two audits that do the same job, so 402/403/429 never stack, and no
two of the five offline rules share a gate. Nor do any two of **300, 404 and 451**, which
all attack the same reading step. **300 never draws with 408**, since a timed-out answer
voids the mirror rather than beating it. 451 *can* share a gate with 403: the freeze takes
the linter and the peek, never the buy-back, because a seal you are forbidden to read is a
trap rather than a rule.

**451's redaction is blind to correctness**, so `?????` is never a tell: which answers are
sealed is drawn from the poll's identity, never from which one is right. The linter will
not touch a sealed answer either — crossing it out would say it is wrong for half the price
of reading it — so a sealed answer becomes lintable only once it is bought back.

Pools in [2.8](#28-what-unlocks-when), roster in `audit.model.ts`, pools and families
in `auditSchedule.model.ts`, reasoning in ADR-035/038/056.

### 2.4 Polls and categories

A poll has a question, an optional code block, 3 to 20 options, and an explanation
shown after answering. Answer types are **single** (pick exactly one) and **multiple**
("select all that apply"). Harder polls pay more coverage
([2.5](#25-coverage-scoring)). The bank holds ~475 published polls, so a poll you have
seen can reappear in a later seed.

Polls **rhyme**. Questions are short verses in the spirit of Furnace Fun: *"Don't ask
me why these polls all rhyme, getting the last 2 items of this array, how do you
adjust the following line?"* Nearly all are hand-crafted by the developer, with ~10%
contributed by colleagues.

Every poll belongs to one of **12 categories**: JavaScript, TypeScript, CSS, HTML,
React, Vue, Git, Java, Python, Ruby, General Frontend, General Backend. Categories carry
**no colour of their own** (ADR-020); they appear as plain text labels. The Kanto
palette belongs to the gates ([6.3](#63-swatches)).

🟡 Planned: more poll types (**Rapid fire**, three quick yes/no questions;
**Guessers**, "Name 10 HTML tags" at ±0.1% coverage per guess; **Puzzle grids**, nine
clues pointing at one word, +2% per solved set, −1% per wrong guess), more categories
(SQL, AI, UI/UX, Architecture, Frontend frameworks absorbing React and Vue alongside
Angular and Next.js, Backend frameworks), and category draw weights that configs can skew.

### 2.5 Coverage (scoring)

**Coverage** is the score, kept on two ledgers: the **gate meter** (the window's net
coverage, reset every attempt, the only number a gate judges) and the **career
totals** (a percentage per category plus a run total). The career totals feed the
leaderboard and Focus upgrades
([3](#3-your-build)) — they gate no gate.

A correct answer earns `share × (1 + adds) × mults × streak × gate × difficulty`:

| Term | Value |
| --- | --- |
| `share` | The poll's coverage weight. 1 for a single-answer poll answered correctly. |
| `adds` | Flat additions (Code Coverage: +0.5% per correct). |
| `mults` | Product of config multipliers (AGENTS.md ×2, Intellisense ×1.5, Focus ×1.25 at L1). |
| `streak` | `1 + 0.1 × streak` of consecutive correct answers, capped at ×2 (10 steps, `streakCapStepsFor`, and a config's `streakCapSteps` adds to it; the run-start gate panel states the ceiling). The streak survives a gate clear, so uncapped it reached ×7.5 on a flawless run and both starting stacks won all 13 gates without buying a config. Capped, never reset: perfect play keeps the bonus, it just stops compounding. |
| `gate` | `gatesCleared + 1`. Gate 1 pays ×1, gate 5 pays ×5. |
| `difficulty` | `1 + 0.1 × (options − 3)`, plus `0.5` if multiple-choice. Never below ×1. |

**Multi-answer share** is `(correct picks − wrong picks) ÷ total correct`, clamped to
0..1, so shotgunning every option earns nothing. Only coverage reads this share;
streak and storage stay binary on the exact-set rule.

**A wrong answer bleeds** a share of what a correct one pays on the same build
(`share × per-correct coverage`), from the poll's category, the gate meter and the run
total alike, each floored at 0. The share **starts at 0.5 and climbs 0.03 a gate**, so a
miss costs 1.5 answers at Pallet and 1.86 at the Champion: risk is priced off your own
earn (a stacked build loses more), and the climb makes accuracy, not just volume, the
deep-gate requirement. Break-even accuracy runs 33% at gate 0 to 46% at gate 12.

Example, gate 2, a 5-option single-answer CSS poll with `.css` installed and one
correct answer already banked: `1.0 × 1.25 mults × 1.1 streak × 2 gate × 1.2
difficulty` = **+3.3% CSS coverage**. The post-answer **equation reveal** states that
as the arithmetic it is — `(correct + flat adds) × streak × <each multiplying config>`,
each term a large figure over the muted name it belongs to, every flat add quoting the
coverage it contributed rather than the factor it works out to, and the total closing
the row: the earn in large type over "coverage earned", or "coverage lost" on a miss.
A **box** marks the terms the player chose — the configs — apart from the ones the gate
sets. Anything the answer changed beyond its coverage follows underneath, one line
("streak lost · your next correct answer starts at ×1.0"). Meanwhile the build track
states the same thing on each config's second line: before the answer what it *would*
pay (`×1.25`), after it what it *did* (`paid +0.5`, red for losses, KB for faucet
payouts). A miss keeps the track silent: configs never touch losses, so the loss reads
once, on the paid line.

Category coverage past 100% rolls over into **levels**: 110% in JavaScript reads as
"L2". Mastery keeps counting instead of capping.

### 2.6 Missing a gate

A miss **peels configs** and hands the run back to the same gate (ADR-037). You choose
which go, on the strip screen; then the normal post-gate loop runs (review, shop, prep,
5 fresh polls). The meter starts over. Coverage and storage survive.

| Cost | Detail |
| --- | --- |
| **Slots** | 20% of the occupied slots at the early gates rising to 35% at the summit, +10% at Elite, +15% at Champion. Paid by dropping configs or minifying them, your pick — so a miss sheds whatever was not earning its room. Before gate 3 the quota never exceeds half the build, which minifying alone can always cover. The forecast on the poll, prep and start screens quotes the quota as a **config count** (a range when the build's sizes make it one, since one 8-slot config settles a 2-slot debt alone); the slot figure and the minify option sit in its hover. |
| **The payout** | Nothing: no gate reward, no interest, no extra-pick KB. The faucet KB earned inside the failed window is the retry's whole budget, unless **Garbage Collection** ([4.3](#43-roster)) is installed, in which case every config you **drop** here refunds its sell value. Minifying still pays nothing. |
| **The recurring bills** | Nothing: the storage plan and subscribed configs bill on clear only, so a redo is free of them. |
| **The day's polls** | Every attempt burns 5 of the day's finite sequence, so a retry costs real time. |
| **Audit damage** | Audits charge again: Volcano leaks every attempt, a 408 re-clocks, an outage re-rolls. |

The peel escalates with depth because width does: one config is a third of an opening
build and a fourteenth of a summit build. Each row sits at roughly a quarter of the
build the gate expects, which keeps a run three or four misses from death the whole
way up.

**Death is the peel running out of configs**: a miss whose peel is as big as your
build ends the run there. Both facts are on the stake receipt before you answer, the
fatal one in red.

### 2.7 Victory and run end

Clear all **13** gates (0 through 12) to win. A run ends three ways (ADR-037): the
summit, a miss whose peel takes the whole build, or abandoning.

Leftover storage is credited to **archived storage** in proportion to the climb:
victory banks **100%**, death banks **gatesCleared ÷ 13** (die having cleared 6, keep
46%), abandoning banks **nothing**, so walking away is never a cash-out. A
tag-rescued run ([5.2](#52-the-shop)) banks only the gates it actually climbed.

🟡 Continue-past-victory is confirmed but unbuilt. The victory *reward* is undecided,
under one constraint: it must not be claimable by a zero-effort farm run.

**Balance baseline.** A solid player (4 of 5 correct, plain 3-option polls, a lean
build with no coverage configs) lands around `4.4 × gate multiplier` per window: that
clears gate 0's 3%, just misses gate 1's 10%, and misses from gate 2 on. Coverage
configs are homework from gate 2 upward. These demands were priced when a miss was
free, so they are the first dial to loosen if early gates read as punishing.

### 2.8 What unlocks when

The climb stages rules on two axes: **gate number** stages the coverage demanded, the
audits and the shop's controls; **category coverage** stages Focus
upgrades ([4.4](#44-upgrades)). Width is on neither: it is bought
([5.1](#51-storage-kb)).

Every row states what you hold **while facing that gate** — which is also what the
shop before it sells, since a shop runs on the clear that precedes its gate.

| Gate | Swatch | Coverage in its window | A clear pays | A miss peels | Audit | Also unlocks |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Pallet | 3% | 32 KB | **nothing** | (clean) | Shop, **Rebuild** |
| 1 | Boulder | 10% | 64 KB | 20% | (clean) | — |
| 2 | Cascade | 25% | 96 KB | 20% | (clean) | **Extend** |
| 3 | Thunder | 40% | 128 KB | 25% | 402 Payment Required | — |
| 4 | Lavender | 60% | 160 KB | 25% | 1 of pool A | — |
| 5 | Rainbow | 85% | 192 KB | 25% | 1 of pool A | — |
| 6 | Soul | 110% | 224 KB | 25% | 1 of pool A | — |
| 7 | Marsh | 140% | 256 KB | 30% | 1 of pool A | — |
| 8 | Seafoam | 175% | 288 KB | 30% | 2 of pool B | — |
| 9 | Volcano | 210% | 320 KB | 30% | 2 of pool B | — |
| 10 | Earth | 250% | 352 KB | 30% | 2 of pool B | — |
| 11 | Elite | 300% | 384 KB | **45%** | 410 Gone + 2 of pool C | — |
| 12 | Champion | 375% | 416 KB | **50%** | 408 Request Timeout (5 polls, 20 s) + 410 Gone + 413 Payload Too Large | Clearing it wins the run |

The audit column names what a gate is **certain** to carry; the rest is drawn on the
day, one audit per family per gate, and never the same audit twice within a band:

| Pool | Drawn at | Holds |
| --- | --- | --- |
| **A** | gates 4 to 7, one each | 404, 405, 424, 429, 502, 507 |
| **B** | gates 8 to 10, two each | pool A + 402, 409, 426, 503, 300, 408, 413 |
| **C** | gate 11, two beside 410 | 403, 300, 408, 409, 426, 503, 507, 413, 502 |

409 and 426 read a config's level, so they wait for pool B where upgrades exist; 413
needs a build past 12 slots to bite; 403 is Elite-tier only; 402 is absent from pool A
so the first five audited gates always teach five distinct rules.

The coverage column is per-gate and fresh: each row is a score to hit inside 5 polls,
never a running total. The unlock column names no width at all: slots are bought, not
handed over ([5.1](#51-storage-kb)). The peel column is a share, so it already scales
with the build it hits.

**Pallet is the calibration gate** (ADR-057). It still asks for its 3%, but a miss there
peels nothing and cannot end a run, so the first failure teaches the loop for free:
you read your answers back, shop, and run the same gate again on 5 fresh polls. The only
death at gate 0 is a build with nothing in it, which could never pass. From **Boulder**
on, the peel column applies as written.

The payout column is `GATE_REWARD_KB × (gate + 1)` for a **bare build on a perfect
window**. It scales with correctness, so a 3-of-5 clear pays 60% of the row and a
0-of-5 clear pays nothing at all — an all-skip build can climb without banking a kilobyte.
Reward multipliers and flat clear payouts (Unit Tests' +32) apply on top.

Deliberately **not** on this axis: Focus levels (staged by category coverage), Unit
Tests and Moore's Law levels (storage), lint and peek fees (uses), rebuild price
(rebuilds this shop), and everything account-level (swatches, Dex, borders).

Authoritative over this table: `coverageDemandFor`, `SLOT_PRICES_KB`, `STORAGE_PLANS`,
`failPeelShareFor` (`rules.model.ts`), `gateClearPayout` (`build.model.ts`),
`EXTEND_FROM_GATE` (`draft.model.ts`), `GATE_SWATCHES`
(`swatch.model.ts`), the audit roster (`audit.model.ts`) and its pools (`auditSchedule.model.ts`).

---

## 3. Your Build

Your build holds **slots**, and a config takes as many as its size says: 1, 2, 4, 8,
12 or 16 (ADR-047). Slots are drawn as a track and written as a plain count, never with
a KB figure beside them.

**Where the room comes from.** Every run opens on **4 slots** and buys the rest
([5.1](#51-storage-kb)). Gates hand over nothing: the ladder runs from the fifth slot
to the **24th**, and the whole of it costs more than a perfect climb earns, so 24 is
somewhere an endless run gets and a twelve-gate run does not. A normal run lands
between 8 and 13 and spends the difference on configs.

**A bought slot is yours for the run.** Nothing narrows a build any more — there is no
rent to fall behind on. An empty slot can be **cashed back** for exactly what that slot
cost, which is how a run that will never fill its width turns it into a draft or an
upgrade. The purchase ladder never rolls back, so the slot you buy after cashing one
costs the rung above the last one you bought: cashing is a way out, never a way to
farm.

**Minify.** Halves a config's slots and halves what it gives, one way only. It is how a
16 fits a build that has never been sixteen wide, and how a peel gets paid without
losing anything. A 1-slot config cannot be minified: one slot is the floor.

Every build surface draws the same track: a bar per config as wide as its slots, one
**dashed** box per slot still open, and a **hatched** stub one slot wide at the end for
room the run has not bought. The two treatments are not interchangeable: a dash is a
slot standing open that a config can go into now, hatching is room still for sale.
Outside the shop the stub only says where room comes from ("Buy a slot in the shop for
more room"); in the shop it carries the next slot's price, and the empty box beside it
carries the refund. Both take **two presses**: the first arms the box and spells the
deal out on the line under the track, the second spends. That line otherwise counts the
room — "10 slots free · fits up to 8" — and is the only label a phone gets, there being
no hover to read a price by. Width carries no swatch: badges come from clearing gates.

**Managing configs.** Click any config chip for its popover: **Install**, **Sell**
(refunds half the draft cost in KB), **Minify**, or **Upgrade**. Anything can be
sold except your last config, since a bare build never clears.

**Starting a run.** The run deals a **hand of five** configs from the starter
pool — seeded per player per day, always holding at least one focus config —
and picks **nothing** for you. **Two** are marked as a suggested opening
(ADR-057), which is advice and not a selection. The hand itself never changes
while configuring, so the deal reads as one checkable list. **One config is the
only floor**: pick one and you can play, spare slots are a legal opening, and
only an over-capacity build blocks the start. Nothing in a build is ever locked
or mandatory. Buying slots from the archive (ADR-049) sits below the deal.

---

## 4. Configs

### 4.1 What a config is

Every config represents a real CI configuration, and every config is one thing
(ADR-035): **an effect with a price**. The price is the draft cost in KB plus the
slots it occupies (ADR-047); the
effect is coverage multipliers, flat adds, storage payouts, or an on-demand action.
Nothing a config does demands anything of the player, because the demands belong to
the gate.

This retires the old Config Rule: per-config checks, mastery demands and escalating
correct-answer counts are gone, and the friction they carried moved onto the gates,
where it reads as personality rather than homework.

**Fees still price actions.** An on-demand action (the lint cross-out, Telemetry's
peek) meters each use with an escalating fee, because the player chooses every
activation. Passives carry no fee: the draft price is the whole cost.

**Volkswagen CI reads the audits** (ADR-028). The defeat device is the one config
aimed at a gate's own rules: installed, it reports the gate's **first** audit as
passing, struck through on the stake receipt, so the fraud is visible and never
silent. Which audit that is becomes a real decision once gates stack three: at Elite
it cancels the deepened peel and leaves the mirror standing, at Champion it stops the
leak and leaves the strip.

### 4.2 Size

A config carries one number: the **slots** it fills, one of **1, 2, 4, 8, 12 or 16**
(ADR-047). There are no grades, no grade colours and no glyph. A chip or build row states
its size as a figure in a **weight block** — a fixed-width block whose edge carries the
size hue, so the number cannot be mistaken for the KB figures beside it (ADR-060); lists
and legends still say it in words ("4 slots").

Its **draft price is 32 KB a slot**, so size names both prices at once:

| Slots | Price |
| --- | --- |
| 1 | 32 KB |
| 2 | 64 KB |
| 4 | 128 KB |
| 8 | 256 KB |
| 12 | 384 KB |
| 16 | 512 KB |

A config can carry its own price where the rate is wrong for it: WTFPL is tagged at
512 KB, Freemium at nothing (its whole cost is the bill).

12 and 16 are on the ladder but no config uses them yet — they are there for a config
worth half a maxed build. The Dex's Configs tab groups the roster by size and prints
what each size costs.

### 4.3 Roster

**🟢 Shipped.** Thirty-four configs, all pure effects.

| Config | Slots | Effect |
| --- | --- | --- |
| `.js` `.ts` `.css` `.jsx` `.html` `.git` `.java` `.py` `.rb` `.vue` | 1 | That category's polls reward ×1.25 (Focus, upgradable) |
| `package.json` | 1 | General Frontend polls reward ×1.25 (Focus, upgradable) |
| Unit Tests | 1 | +32 KB × level storage on gate clear |
| Moore's Law | 1 | On each gate clear, +2% × level of held storage |
| ESLint | 1 | Cross out one wrong answer on JS/TS polls, fee doubling from 8 KB per gate |
| Stylelint | 1 | Cross out one wrong answer on CSS polls, fee doubling from 8 KB per gate |
| yarn.lock | 1 | Lock shop offers for 16 KB each ([5.2](#52-the-shop)); a locked offer leads every shop until installed or released, and every lock releases if yarn.lock leaves the build |
| Cold Start | 2 | First answer of the gate rewards ×2 |
| Code Coverage | 2 | +0.5% flat coverage per correct answer |
| IndexedDB | 2 | +8 KB storage per correct answer, capped at 320 KB |
| Telemetry | 2 | Paid peek at how everyone ever answered this poll ([4.5](#45-paid-actions-lint-peek-and-buy-back)) |
| A/B Test | 2 | Ships one of two arms, switched free at any time — in the shop or mid-poll, where the switch scores the answer you are about to give (ADR-053): A pays ×1.25 on all coverage, B pays +8 KB per correct answer (sharing the faucet's run cap) |
| `.length` | 2 | Names how many correct answers the gate's 5 polls hold, and pays +16 KB per correct answer beyond one per poll |
| Garbage Collection | 2 | Every config you **drop** to pay a peel refunds its sell value. WTFPL zeroes it, Freemium halves it, and minifying to free the same slots pays nothing, since the config is still installed |
| Intellisense | 4 | All coverage ×1.5 |
| Deprecated | 4 | All coverage ×3, fading ×0.5 each gate clear; deleted from the build at ×1 |
| Cache | 4 | Correct answers warm their category for the rest of the run: each cached hit pays +25% coverage there, capped at ×2 (4 hits). A wrong answer in the category flushes it cold; a partial neither warms nor flushes |
| Prefetch | 4 | Shows, for every poll left this gate, its category, how many options it offers (in play order), and how many of the polls take more than one answer, plus all of the next gate's categories. Asking for polls not yet dealt rolls tomorrow's shared seed a day early — the questions stay sealed |
| git rebase -i | 4 | Before a gate starts, names its 5 polls by **category only** and moves any of them up or down the queue. The order locks the moment the first answer lands. Prefetch stays the richer read (option counts, answer types, next gate); rebase owns the order instead, and it is the only config that touches poll sequence — which is what Cold Start, Overclock, Cache and Dependabot all quietly depend on |
| Overclock | 4 | The gate's first answer earns ×4 coverage; every answer after it runs hot at ×0.5, cooling off at the clear. Miss the opener and the gate is nearly dead — the buy is variance, not magnitude (×1.2 average, honestly under Intellisense) |
| AGENTS.md | 8 | All coverage ×2 |
| Volkswagen CI | 8 | Reports the gate's first audit as passing; costs 384 KB to draft |
| Dependabot | 8 | Counts correct answers: **5 in a row** (4 at L2) upgrades a random installed config, free, then the count restarts. A wrong answer or a failed gate starts it over, so it pays for a clean streak rather than for time. Its row on the poll screen shows the countdown ("in 3"). The pick ignores the Focus coverage gate the shop enforces, so a merge lands without review |
| WTFPL | 8 | Every shop offers the entire roster; costs 512 KB, every sell refunds 0 KB while it is installed (its own included), and Rebuild/Lock/Extend retire |
| Freemium | 8 | **Free to draft.** Every config drafts at half price while it is installed, and refunds drop to half of that discounted price. Each gate cleared bills 8 KB × 2^gate (8, 16, 32, 64, 128, 256…), charged after the clear pays; a bill the balance cannot cover lapses the config and frees its eight slots |

`.length` deliberately pays on *shape* rather than magnitude, since four configs
already sell coverage magnitude: it pays most in multi-answer-heavy windows and nothing
at all in a window of five single-answer polls, a dead slot stated on the row rather
than hidden in the rules. **Moore's Law** ramps instead of gating, because 2% of a small
balance is worthless and the balance is only large late; on the free tier its interest is
shop budget rather than principal — which since ADR-045 it simply is, because nothing
clamps a balance.

**Freemium is the roster's one recurring price** — everything else is bought once and
then free — and it is metered on the run's *depth* rather than on how long it has been
held, so dropping it and re-drafting later pays the deep rate instead of restarting the
ladder. It bills on clears only, like Deprecated's fade: a failed attempt already costs
a peel. Practically it is an opening-game plan you cancel around gate 4, when the bill
starts eating a whole gate's reward.

🟡 **Designed, not built.** These were written when configs still carried checks, so
each needs a redesign pass (a bounded condition, a fee, or a gate audit) before it can
ship; the original check designs stay in the beans.

| Config | Slots | Effect |
| --- | --- | --- |
| Vite config | 1 | +3% coverage on JS/TS polls answered under 35 s |
| `.every()` | 1 | +1% when a category you have 5-streaked appears |
| Semver | 1 | Coverage ×1.2 for each Focus config at L2 or higher |
| Rate limiter | 1 | Wrong answers do not bleed coverage |
| Weekend Project | 1 | Saturday and Sunday gates pay +50% storage |
| Benchmark | 2 | See your paired ghost's answer before you commit |
| Cold cache | 2 | The gate's first poll pays nothing; every poll after pays ×1.5 |
| `.tsx` | 2 | TypeScript and React polls reward ×1.25 |
| git stash | 2 | Once per window, stash the current poll; it returns last |
| Watch | 2 | Pick a category at draft: its polls get double draw weight |
| `--save-exact` | 2 | Every future draft costs 20% less |
| Overclock | 4 | 4× coverage on one poll, then −128 KB across the next two |
| Snapshot Testing | 4 | Polls you have already seen reward ×2 |
| Hotfix | 4 | A failed gate still opens the shop |
| Replication | 4 | All storage gains ×2, locked to the free plan while installed |
| Continuous Deployment | 4 | +64 KB every gate clear, but you never enter the shop again |

Bundle Analyzer (see the next gate's category mix in the shop) is gone from this list:
the shipped **Prefetch** covers it and more. Rebase has shipped as **git rebase -i**
(4.3); it stays local to your own run, since reordering a shared seed would break other
players' position-based configs, and the social version belongs in
[7.4 Interference](#74-interference).

🟡 **Dual-focus configs** replace the old hidden synergy table: one config focusing two
categories is the themed-build bonus turned into a visible, draftable item, and only
recognizably real intersections qualify. The pool: `.tsx`, `.jsx` reworked,
`styled-components`, `JSDoc`, `<script>`, `<style>`, `Tailwind`, `.erb`, `.jsp`, `Jinja`,
plus the runtime family (`Node.js`, `Deno`, `Rails`, `Django`, `Spring`, `Next.js`,
`Nuxt`), each pairing a language with General Backend, which finally gives that category
coverage. Ship `.tsx` and `Node.js` first and pool the rest.

⚪ **Parked**: **rm -rf** (strip-all with
2× refund), **localStorage** (storage burst). Two former configs became gate audits
instead, since a clock or a mirror is something a gate does to you rather than something
you buy: **Mirrored Check** is now Marsh's Mirror, **Speed Check** is now Timeout.

Open: General Backend has no Focus config yet.

### 4.4 Upgrades

Upgrades cap at **level 5** (the 5-poll window is the natural ceiling); Telemetry is
the exception at level 2. Every upgrade costs `32 KB × the level bought`.

- **Focus configs** answer to two gates (ADR-039): level N to N+1 needs `5% × N` career
  coverage in that category **and** the storage. Coverage is permission, KB is the
  price, and neither substitutes for the other, so an earned level can be unaffordable
  and a funded one unearned. Each level raises the payout (`1 + 0.25 × level`).
- **Unit Tests** buys +32 KB payout per level on clear. Storage only, no coverage gate.
- **Moore's Law** buys +2% interest per level, up to 10% at L5, spending the very
  principal the interest then earns against.
- **Telemetry** upgrades once, for 64 KB, and buys honesty rather than power: L1 hands
  over percentages with no denominator, so 100% of two players and 100% of a hundred
  look identical and the config can talk you into a wrong answer; L2 adds the line that
  separates them ("based on 127 answers"). The number is withheld server-side, so L1
  blindness survives a devtools tab.

The shop's Upgrade button carries the price and, while gated, names whichever
requirement is in the way on hover. Arming an upgrade states the sentence the config
will read at the next level and shows one `from → to` chip per number that moves
(ADR-053). A rolled offer is the other way to buy a level: roughly one shop in eight
puts a version of something you already own on the shelf, at the shelf price, with
**no coverage requirement** — the bypass is what makes it worth taking. It swaps the
installed config rather than taking a second slot, and cannot be kept for the next
shop. The stake receipt
states what rides on top of the base: the Focus multiplier when the poll matches, and
the streak step, which every correct answer takes (one correct answer is already a
streak of one).

⚠ Unreconciled: the stories also propose archived-storage-funded, 10-level cross-run
upgrades (DVTD-z94q), so the upgrade currency question is open.

### 4.5 Paid actions: lint, peek and buy-back

Two configs sell an action rather than a passive, and both meter it with a doubling
fee. Both hang off the selling config's own build row, so a build's powers read in
one place. The third is sold by a **gate** rather than a config, and sits on the answer
it unseals.

**Lint.** With a linter covering the poll's category equipped, pay to gray out one
wrong option: 8, 16, 32, 64, 128, 256 KB. Run it as often as the poll's options allow;
the ladder is the only thing metering it, and it climbs across the whole gate,
resetting at the clear. Linted polls never reveal their correct answer in community
views and may reappear in a later seed.

**Peek** (Telemetry). Pay to see how the community voted on the poll in front of you,
drawn as a gray bar per option: 32, 64, 128, 256, 512 KB, doubling per use and
resetting **each gate** rather than each poll, because a peek buys the whole poll where
a lint buys one option. One peek per poll. The pool is every answer that poll has ever
taken across both loops, minus anyone who answered it at a Mirror gate, since they were
asked for the incorrect options and would invert the signal you are buying.

Correctness never travels with a peek: the server hands over option ids and
percentages for polls the run has already paid on, and nothing else.

**Buy-back** (451 Unavailable For Legal Reasons). Pay **4 KB flat** to unseal one redacted
answer, as often as the poll has sealed answers. It is the one paid action **no config
sells** — the gate hands out the problem, so the gate hands out the answer, which is why it
is the only one that costs the same every time: the fee is charged per answer rather than
per gate, so a ladder would price the audit's own escape hatch out of reach. 402 still
doubles it. **429 does not meter it**, because rationing the way out of a redaction to one
press a window would strand you in it, and **403 does not freeze it** either, for the same
reason: 451 always hands out the answer to the problem it set. What you buy stays bought for
the rest of the run.

A sealed answer is still pickable. Gambling on `?????` is a legitimate play, and the
reveal names every answer afterwards whether you paid or not, so a gamble still teaches.

---

## 5. Economy

### 5.1 Storage (KB)

**Storage** is the in-run currency, measured in kilobytes, and **what you can hold is
capped** (ADR-046). The header reads the balance against that cap, and anything a clear
pays above it is burnt.

- **Faucets**: clearing a gate pays `32 KB × gate number × correct ÷ 5` (capped at gate
  12's ×12, so endless runs stop scaling); IndexedDB adds +8 KB per correct answer,
  capped at 320 KB per run; cashing an empty slot pays back what that slot cost.
- **Sinks**: buying slots, drafting configs (32 to 512 KB by size), upgrades, lint and
  peek fees, draft rebuilds, lock, extend, the git tag, subscribed configs' bills, and
  the storage plan's per-gate charge.

**The slot ladder** (ADR-046). Every run opens on **4 slots** and buys the rest, one
press at a time, up to **24**. Nothing is handed over by a gate and nothing is rented.

| Slot | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Price | 16 | 32 | 64 | 128 | 192 | 256 | 384 | 512 | 768 | 1024 |

The first four rungs double every rung, so the fifth to eighth slot come quickly. After
128 KB the pace halves to a doubling every *second* rung, and it keeps going: 1536,
2048, 3072, 4096 and on to the 24th. The whole ladder costs far more than a perfect
twelve-gate climb earns (~2.8 MB), so a normal run reaches **8 to 13 slots** and 24 is
endless-run territory. That price curve is the brake on width buying score buying
width.

**Opening wider** (ADR-049). The start screen sells the same ladder from **archived
storage** at **double the rung** — 32 KB for the fifth slot, 64 for the sixth, 1024 for
the twelfth — pressed on the same hatched stub, and a start purchase counts on the
ladder, so the shop's next slot picks up where the archive left off. Nothing caps it
but the price: eight slots costs 480 KB of archive, twelve costs 3.1 MB, more than a
perfect climb banks. Until you press Start an empty slot hands back for exactly what it
cost and the ladder rolls back with it; once the run begins the archive is shut out
both ways.

**Cashing a slot back.** An empty slot refunds **the price of the most expensive slot
you still hold** — cash your ninth and you get 768 KB. The purchase ladder never rolls
back, so the next slot you buy costs the rung above the last one you bought. Buying the
fifth slot for 16 and cashing it returns exactly 16, which is what stops the loop; late
in a run, cashing width you will never fill is a real pivot into a draft or an upgrade.
Only empty slots can be cashed, and never below the free four.

**The storage plan** (ADR-046). The cap is a subscription, seven rungs deep.

| Cap | Per gate |
| --- | --- |
| 256 KB | free |
| 512 KB | 32 KB |
| 1 MB | 96 KB |
| 2 MB | 224 KB |
| 3 MB | 448 KB |
| 5 MB | 768 KB |
| 10 MB | 1280 KB |

The free cap holds less than one perfect gate-12 clear, which makes the plan a
**prerequisite for the slot ladder**: you cannot save 768 KB for a mid-ladder slot
without renting a wider cap first. That coupling is the point of having a cap at all.

The shop shows the ladder as a rack of cards, one per rung, and **a rung opens once a
run has filled the cap below it**. The free cap and the 512 KB rung are always on the
shelf; every rung above reads ???? until some run of yours has actually held its
predecessor's cap, and the masked card names that requirement ("opens at 512 KB held")
alongside the best you have held. The mark is the account's, not the run's, so a rung
opened once stays open. Reveal is all it governs: what sells is still the bill.

**A rung you cannot pay for is not for sale.** A rung's select press refuses while
its bill is more than you hold, and says which figure is in the way. Dropping
to a cheaper rung is always allowed. If a plan you already hold outruns your balance,
the shop's Continue stays shut until you drop to one you can pay for.

The bill lands **on clear only**, off the balance the clear just paid, and settles
before the config subscriptions — so a redo is free of every recurring cost. A clear
that cannot cover the bill pays what it has and **drops to the free plan**, burning
whatever will not fit under 256 KB. Downgrading by hand burns the same way, and the card
says how much before you pick it.

**The Subscriptions section** lists every recurring KB cost in one place on the gate
receipt, so the whole bill is readable before you commit to a gate rather than only
after it settles: subscribed configs (Freemium) and the storage plan. Both bill **on
clear** only. When the balance cannot cover the bill the section names the shortfall and
warns that what you cannot pay lapses.

### 5.2 The Shop

Clearing a non-final gate opens a Balatro-style **multi-buy shop** bounded by two
things — the KB you hold and the slots you have free — and so does missing one, once
the peel is paid: the retry shops with what it
has, which is the only thing making the second attempt different from the first. Take
as many actions as you can afford, in any order. The exit leads to the **prep page**
and the shop stays open behind it until the next gate starts, so shop, prep, community,
shop is a legal loop while waiting on tomorrow's polls. Nothing grades the exit: it is
shut only while the build sits over capacity ([3](#3-your-build)), which is a state
rather than a verdict.

| Action | Cost | Notes |
| --- | --- | --- |
| **Draft** | 32 to 512 KB by size | One of 5 offered configs, new ones only. Two taps: the corner badge reads the price, turns green and reads **install**, then settles into **owned**. |
| **Rebuild** | 4, 8, 16, … 512 KB | Re-rolls the offer, doubling per rebuild within the same shop. |
| **Lock** | 16 KB a lock | Requires **yarn.lock** in the build (ADR-054); without it the shelf shows no padlock at all. Pins any number of offers: rebuilds skip them and every later shop leads with them, until each is installed or released. Releasing is free and refunds nothing, and every lock releases if yarn.lock leaves the build. A pinned offer occupies one of the shelf's slots, so locking the whole shelf freezes it. |
| **Minify** | free | Halves a config's slots and halves what it gives, one way only. The only way to fit a 16 into a build narrower than sixteen. A 1-slot config cannot be minified. |
| **Extend** | 48, then 96 KB | One more config on the table, in this shop and every shop after. Two per run. From gate 3. |
| **git tag** | 128 KB at gate 4, +64 KB per gate, 512 KB at gate 10 | A cross-run checkpoint: after a death, your next run checks out there instead of gate 1. One per run, burnt by the run it rescues. |
| **Sell** | refunds half the draft cost | Never your last config. |
| **Upgrade** | `32 KB × the level bought` | Focus configs also need the coverage ([4.4](#44-upgrades)). |
| **Buy a slot** | 16 KB, doubling up the ladder | One more slot on the build, yours for the run. Up to 24 ([5.1](#51-storage-kb)). Pressed twice on the build track's hatched stub: the first press arms and quotes the deal, the second buys. |
| **Cash a slot** | refunds that slot's own price | Only an empty one, never below the free four. The ladder does not roll back. Pressed twice on the empty box nearest the hatching, same as buying. |
| **Open a slot** (start screen) | double the rung, from archived storage | Same ladder, twice the price, paid from the archive rather than the run ([6.1](#61-archived-storage)). Refundable at cost until Start; shut once the run begins. |
| **Storage plan** | free to 1280 KB a gate | Raises the KB cap. Refused while its bill is more than you hold; billed at every clear, and falling behind drops you to the free 256 KB ([5.1](#51-storage-kb)). |

A tag-rescued run starts at the pinned gate with a 32 KB-per-gate stipend, everything
else fresh, and its death credit counts only the gates it actually climbed. It opens on
the free four slots like any other run and buys width out of the stipend. Gate 10 is
the last that sells a tag:
deeper, a rescue would resume a starter build into stacked audits and a half-build
peel.

An offer is refused for **room** before it is refused for **price**, and the badge
says which: `Needs 4 slots, 1 free` is a different problem from `Costs 128 KB, you
have 90`. A 1-slot config can fit where a 4 cannot, so the refusal belongs to the
offer rather than to the shelf.

The shop always shows *why* a locked action is locked: not enough storage against
unmet coverage are different problems and read differently.

---

## 6. Meta-progression

### 6.1 Archived storage

Leftover run storage converts into persistent **archived storage** at the outcome rate
(100% victory, proportional on death, 0% on abandon). It is the meta-progression
currency: buy cosmetics, open your next run wider ([5.1](#51-storage-kb)), or inject
it into that run. It never buys a config unlock (ADR-050: unlocks are achievement
only). 🟡 More spending options are planned, including mid-run coverage, config, cap
and streak injections (DVTD-xbri).

### 6.2 Unlocks

🟡 Designed, not yet built (ADR-051, DVTD-2try): configs are exposed on the
**Reveal / Grant / Stage** model. Grant gates the starting hand only — the shop
shelf always offers the whole roster, which is also what fills the Configdex in
(**Reveal**: a config seen on a shelf is "met"). Nine configs are granted at
signup; the other 21 each unlock **individually**: a thematic objective that
teaches the config's own mechanic ("Peek the community split 5 times") OR a
lifetime polls-answered fallback, whichever is met first. Every objective tracks
automatically (nothing is activated), and the Configdex shows each locked config
as a checklist card with both paths and live progress; ADR-051 carries the table.
The starting hand deals from the granted pool once this lands (ADR-052 dropped
the depth ladder's stacks entirely). Unlocks are
achievement-only — no currency buys one (the archived-storage pull, DVTD-9d7o,
is rejected). Today every shipped config is simply available. Also planned:
bonus awards for re-answering mastered polls correctly.

### 6.3 Swatches

**Gate swatches** are thirteen badges, one per gate, earned by **clearing** it: you beat
the leader, you get the badge. The ladder reads Pallet, Boulder, Cascade, Thunder,
Lavender, Rainbow, Soul, Marsh, Seafoam, Volcano, Earth, Elite, Champion: gate 0 is
**Pallet** where every journey starts, the eight gen-1 gym badges run in strict
trainer-card order, the two Kanto landmarks that never had a gym sit where the games
actually walk you through them (**Lavender** out of Rock Tunnel, **Seafoam** on Route
20), and the summit pair close it at Indigo Plateau.

Clearing a gate in any run earns its swatch **permanently and account-wide**; a
re-clear is a no-op, so the collection only grows. Colours come from each name's home
location in the Kanto palette and live in `app.css` under `[data-swatch-theme]`, never
duplicated in TypeScript. The palette runs out at 13 gates against 12 colours, one of
them the app background, so the summit pair are drawn apart: **Elite** keeps indigo
(it *is* Indigo Plateau) with a rim so it reads, and the **Champion** alone wears the
Kanto gradient.

**The gate themes the run** (ADR-020): the swatch of the gate being played sets the
whole app's accent colour, so climbing feels like travelling Kanto. Elite's ambient
theme is a lightened indigo and the Champion wears fuchsia, both for readability, and
the celadon/cinnabar pass-fail moods still override the gate theme on reward and strip
screens.

Swatches surface in the run log's clear line, the Configuring stat row, the end-of-run
summary, and the Dex's Gates tab.

🟡 **Collect Swatches** (DVTD-g8ty): a *per-category* cosmetic chip earned through
mastery, a separate collection that reuses the name deliberately.

### 6.4 The Dex

The Pokédex of DevVoted, at `/dex`, with four tabs. **Polls** tracks every poll you
have seen with lifetime accuracy (unseen polls redact to `???`); **Configs** catalogs
the roster grouped by size and prints what each size costs (ADR-047); **Audits**
lists every audit as faced, unlocked or unseen (`???` until met); **Gates** shows
every gate with its swatch, audits and unlocks, locked gates redacting names to
`???` counts. 🟡 Planned: upgrade levels, collection stats, per-poll community
success rates, and the Configs tab's three collection states (`???` / met /
granted) where every locked row carries its two unlock paths as visible captions
with live progress: "Answer 10 Java polls correctly · 6/10 / OR / Answer 225
polls · 43/225" (ADR-051).

### 6.5 Borders and seasons

Avatar borders are decorative unlockables bought in the border shop and equipped on
your profile; 🟡 rarity-based border unlocks via meta-progression are planned. Runs and
leaderboards live inside **seasons** (upcoming, active, finished, archived), the
temporal container for competitive resets.

---

## 7. Community

The social layer works because of the shared daily seed: everyone climbs the same
polls on the same day.

### 7.1 The community board

After every shop visit the climb detours through `/run/community`, and a run locked for
the day lands here too, with "Back to your run" disabled until local midnight and the
countdown beside it. The page is one screen: the climb map on top, a hairline rule,
then the polls, both borrowing the gate review's vocabulary.

**Standouts today** heads the page ([7.3](#73-awards)).

**The climb today** is a horizontal gate track carrying every live run as an avatar,
positioned by gate and by how deep into that gate's five polls it stands. Your marker
is ringed and labelled "you"; shared positions stack behind a `+N` badge. A dashed,
faded avatar marks the deepest point any of your *finished* runs reached, and
everything past it sits behind a dashed edge labelled **uncharted**, so a player beyond
it is visibly ahead of anywhere you have been. Each gate's swatch sits on the track
itself with its number and name beneath (`6 Soul`): the ladder and the route are one
thing. Below the line, each run a gate killed today is that player's avatar, dimmed
where it fell, keyed by run rather than player so two losses in one day both show
(abandoning is not falling and draws nothing). Desktop shows all 13 gates, no paging;
below `sm` it narrows to a 3-gate window centred on you, because 13 gates at 28 px each
survives a swatch but not a gate name. Geometry lives in `climbMap.model.ts`, which
reduces every marker to one unit: polls, counted `gate * 5 + pollsIntoGate`. 🟡 Builds,
configs and storage are still not shown.

**Today's polls** are one native `<details>` each. The summary is the question, a faint
"multi" sub-line on multiple-answer polls, and the share of players who got it right,
coloured in the test-runner tones (celadon ≥60%, saffron ≥40%, vermillion below).
Opening a row draws the gate review's split, Expected over Received: the right answer
and whatever you picked, each one line with mark, option, the avatar chips of who
picked it (you first) and the count, everything else folded behind `N other options, M
votes`. A mirrored answer counts as right here when it named every wrong option, since
it proves the same knowledge. The header counts the day's players and the footer keeps
the "top X% today" percentile. **Redaction keeps it fair**: polls you have not reached
never appear, and linted or missed polls stay sealed.

### 7.2 Leaderboards

Two views: **progress today** (everyone on the same seed, comparable per segment) and
**run completion** (won/dead, gates cleared, duration in days). Rows carry
per-category coverage, total coverage, and best streak.

### 7.3 Awards

Community awards in the vein of "top committers", shipped as **standouts today**. Nine
of them, in two kinds, and the difference is the point.

**Poll-scoped**, read off today's answers: **fastest answer** (timed client-side from
reveal to submit), **first to answer** (right or wrong), **first good** (the first
actually correct answer), **most *{category}* polls** (needs a lead of ≥2), and **only
one right** (the poll exactly one player cracked).

**Run-scoped**, read off live `run_states` across **active runs only**, so these rank a
standing rather than an activity and a player who has not answered today still holds
the deepest gate: **deepest gate**, **longest streak** (recomputed from answer history
rather than the live streak, which a wrong answer resets; needs ≥2), **most coverage**,
and **widest build**.

A row is avatar, title, value, with your haul summarised beside the heading ("you took
3 of 9"). Two columns from `sm` up, filled top to bottom. Unearned awards are dropped
rather than shown empty, and ties break on player id so a redraw never reshuffles.
Logic lives in `standouts.model.ts`, which is pure: correctness arrives as a callback
and run state as plain numbers.

🟡 Brainstormed: perfect gate, no linter used, biggest bank, comeback clear.

### 7.4 Interference

🟡 Social "thwart" mechanics: send a Breaking change, Dependency conflict or Regression
at a leaderboard rival. A **Force push** config (reorder a rival's gate) belongs here
too, since reordering is only safe as a targeted attack, never as a shared-seed effect.
Needs multiplayer targeting infrastructure.

### 7.5 Other social plans

🟡 **Custom poll creation**: trusted players author their own polls and are rewarded
for it, because writing a good rhyming poll is genuinely hard work.

🟡 **Loot and fallen runs**: when another player's run ends, their abandoned loot
becomes lootable by players who encounter it. Mechanics undefined.

---

## 8. Interface

The game leans hard into its CI metaphor.

- **Run HUD**: storage as a **balance** — "320 KB" over the word `balance`, and no
  bar, because ADR-045 left no ceiling to fill and a bar against nothing read as fuel
  being burned. Then the gate, polls answered, streak, and total coverage. The gate reads
  **"gate 0 / 12"** over a **pip bar** that doubles as the badge collection: one pip per
  gate in that gate's swatch colour, gates behind you solid, the gate underway filling
  with polls answered, the rest dimmed. A pewter rim marks the gate you stand on and
  nothing else. Every pip is a control: hover or tap it to name that gate's badge and
  standing ("clear gate 7 to earn it"). It carries no coverage; the total is the gate's
  own stake, on the Build Summary's "To pass" line.
- **Size**: the slots a config fills, written in words ("4 slots") ahead of the
  config's name on every surface that lists configs, and in the row's last figures
  column where there is room. Fixed-width, so the name column stays flush. There is no
  grade, no colour ramp and no glyph: the bar's width on the build track is the visual,
  and the words are the label. Hovering it says what it costs against the width you
  hold ("takes 8 of your 12 slots"), which is why no row spells the shortfall out a
  second time: a config you have no room for greys its price and names the gap on the
  press. The ladder is taught in the Dex ([4.2](#42-size)).
- **Config level**: a segmented track after the name, beside the upgrade press. It
  *does* draw its empty segments, unlike the grade cluster, because a level is a
  distance along a known ladder and the room left is what you are buying.
- **An opened config**: the description, then one facts line — level, rate, and what it
  sells for in this build. Shared by every surface that lists configs, ruled and
  indented under the row it belongs to. The grade is not among them: the row's own
  cluster states it. A config with no upgrade path states no level; the deal states no
  refund, since nothing has been bought yet.
- **Build rail**: on shop and prep, configs hang off a rail, carrying each config's
  paid actions. They list with no status, since a status needs a poll to be true of.
  Free room and the room still for sale are the track's job, not the list's: neither
  ever costs a row. There is no unlock button anywhere.
- **Build track**: in a gate the build turns sideways instead, one band across
  the width under the gate header, a box per config as wide as the slots it takes:
  green for `online`, grey for `skipped` (installed, doing nothing here), red and
  struck through for `offline`. Free slots stay dashed, unbought room stays hatched.
  A box holds two lines and no more, the name over what the config is doing here: its
  rate before the answer, what it paid after ("paid +0.5", or "unused" for an online
  config that paid nothing), the reason it is sitting out, or its paid action, which
  makes the box itself the button. Whatever will not fit is on the hover. The band's
  header counts only what is broken ("1 offline · 424 Failed Dependency") and stays bare
  when nothing is. Narrow screens stack the same boxes into rows behind a caret,
  folded on arrival, since the question is what the screen is for.
- **A gate's three standing facts**: a poll screen has no sidebar. What the run is
  scored on lives in the header under the gate ladder, on its own full-width line
  ("coverage · 1.2 / 3%" then the bar); what is being done to this gate lives in
  saffron alert boxes under the build, one per audit; and what the poll pays and
  costs lives on the poll's own facts line, beside the category — "JavaScript · scores
  ×1 · wrong costs 0.5 · Gate retry cost: Remove 1 config". None of the
  three folds: a screen you answer on should not be able to hide the terms.
- **The poll is one column**: header, build, audits, trail, question, options and
  the button that sends them all share one width and one left edge, the button as wide
  as the options it commits to. Nothing on the screen is wider than the question. The
  trail states no count of its own: the crumbs are the count.
- **A facts line's figures**: the words stay muted and the number wears a chip, green
  for what the poll pays, red for what it costs, so a price can never be read as a
  prize. A fatal gate states the whole run as the cost ("The run ends here") instead
  of counting configs.
- **Reward report**: gate results as a CI build log. One passed/failed/skipped row per
  config, a steps summary, and a winnings footer ("you won +KB · +%") over the new
  balance, plus coverage badges per answered
  category and the gate's questions as foldable PASS/FAIL rows. Under the headline it
  names the badge the clear awarded, in that swatch's colour.
- **Poll review**: a test-runner reporter. One row per poll (PASS / PART / FAIL badge,
  the question, the coverage earned), fumbles open on arrival and passes folded and
  dimmed. An open row is an assertion diff, **Expected** over **Received**, every option
  carrying its letter on round chips for single-answer polls and square ones for
  multi-answer (the shapes you answered with). Expected always reads celadon and
  Received wears the outcome, so the two sides share a colour only when you were right.
  Multi-answer polls close with a tally of catches and misses; untouched options fold
  behind "7 other options"; the snippet and explanation sit with the diff.
- **Game over**: a gate ladder (one row per gate, pass/fail/skip), your final build, the
  whole-run poll review, and the archived-storage credit bar.
- 🟡 **Learn Home**: a Duolingo-style path/hub planned as both the start point and the
  "no polls left today" destination (DVTD-jhgg).

---

## 9. Glossary

| Term | Meaning |
| --- | --- |
| **Run / Climb** | One playthrough, spanning multiple real days. |
| **Gate** | A checkpoint auditing a 5-poll window: its coverage demand plus its audits. |
| **Gate number** | Counts from 0: a run opens on gate 0 and summits on gate 12. |
| **Gate meter** | The window's net coverage, the only score a gate judges. Resets every attempt. |
| **Audit** | A rule a gate carries (a mirror, a leak, a clock, a shut shop, a config knocked offline). Drawn from a staged pool on the day, then stated on the stake receipt; the count grows with depth. |
| **410 Gone** | An audit that deepens the peel: Elite takes 5 configs on a miss, Champion 6. |
| **Peel** | What a missed gate takes: configs of your choosing, before the same gate runs again. |
| **Build** | Your active setup: the track of config slots. Shown as **Your Build**. |
| **Slot** | One unit of room in the build. A config takes as many as its size says: 1, 2, 4, 8, 12 or 16. Four are free; the rest are bought from the shop on a rising ladder, up to 24. Opens no gates. |
| **Minify** | Halving a config's slots and its bonus, one way. |
| **Config** | An installable dev-tool item: an effect with a price, demanding nothing. |
| **Coverage** | The score: a percentage per category plus a run total (career), and the gate meter (per attempt). In fiction: **knowledge coverage**. |
| **Storage** | The in-run currency, in KB. The storage plan caps what you can hold. |
| **Slot ladder** | The rising price of the next slot: 16, 32, 64, 128, 192, 256 KB and on, doubling every second rung to the 24th. |
| **Storage plan** | The KB cap, rented by the gate: 256 KB free up to 10 MB. Billed at every clear; fall behind and it drops to the free cap, burning the overflow. |
| **Archived storage** | Persistent cross-run storage: the meta-progression currency. |
| **Faucet** | Any per-correct-answer storage income (for example IndexedDB). |
| **Draft / Rebuild** | Buying a shop config / re-rolling the offer at a doubling cost. |
| **Lint** | Paying a fee that doubles across the gate to disable one wrong option (needs a linter config). |
| **Peek** | Paying an escalating fee to see how the community voted (needs Telemetry). |
| **git tag** | A shop-bought cross-run checkpoint, priced by the gate it marks, burnt by the run it rescues. |
| **Seed** | The shared per-day poll sequence every player climbs. |
| **Segment** | One day's 5-poll chunk appended to a persistent run. |
| **Swatch** | A gate's collectible badge (Pallet to Champion), earned by clearing it and kept across runs. Its colour themes the app while that gate is played. |
| **Kanto colours** | The palette, keyed to gates via their swatches, never to categories. |
| **The Dex** | The collection screen (Polls, Configs, Swatches). |
| **Water-cooler moment** | The design north star: same polls, same day, compare answers. |

---

## 10. Numbers reference

Every number above lives in code; this is the constant sheet, grouped by where it
applies. `rules.model.ts` holds most of it.

**The run**

| Constant | Value |
| --- | --- |
| `SLICE_WINDOW` | 5 polls per gate window, so per day |
| `VICTORY_GATE` / `GATE_COUNT` | 12 / 13 (gates 0 to 12) |
| `coverageDemandFor` | 3 / 10 / 25 / 40 / 60 / 85 / 110 / 140 / 175 / 210 / 250 / 300 / 375 |
| `failPeelShareFor` | 20% / 20% / 20% / 25% × 4 / 30% × 4 / 35% × 2 of the occupied slots, plus strip audits; capped at half the build before gate 3 |
| Audit roster | Fifteen rules: 1 audit from gate 3, 2 from gate 8, 3 from gate 11 |
| Audit pools | A 6 (gates 4-7, draw 1) · B 13 (gates 8-10, draw 2) · C 9 (gate 11, draw 2 beside 410) |
| Audit dials | 402 ×2 · 507 16/32 KB · 408 3×30 s / 3×25 s / 5×20 s · 410 +10/+15 · 429 1 action · 413 8 KB a slot past 12 |

**Scoring**

| Constant | Value |
| --- | --- |
| Gate multiplier | `gatesCleared + 1` (×1 to ×12), frozen while a gate is redone |
| `wrongLossShareFor` | `0.5 + 0.03 × gate` (0.5 at Pallet, 0.86 at the Champion) × the build's per-correct coverage, floored at 0 on every ledger |
| `STREAK_COVERAGE_BONUS` | 0.1 per consecutive correct answer, capped at 10 steps (×2) |
| Difficulty bonus | +0.1 per option beyond 3, +0.5 multi, never below ×1 |
| Focus payout / upgrade gate | `1 + 0.25 × level` / `5% × level` career coverage |

**Storage**

| Constant | Value |
| --- | --- |
| `GATE_REWARD_KB` / `GATE_REWARD_MULTIPLIER_CAP` | 32 KB base / stops scaling past ×12 |
| `gateClearPayout` | `32 × (gate + 1) × reward mults × (correct ÷ 5)`, plus flat clear payouts |
| `SLOT_PRICES_KB` | 16 · 32 · 64 · 128 · 192 · 256 · 384 · 512 · 768 · 1024 … doubling every second rung, 20 rungs for slots 5 to 24 |
| `STORAGE_PLANS` | 256 KB free · 512/32 · 1MB/96 · 2MB/224 · 3MB/448 · 5MB/768 · 10MB/1280, billed a gate on clear; a rung is refused while its bill is more than the balance |
| `FAUCET_CAP_KB` | 320 per run |
| Archived-storage credit | 1 / `gates ÷ 13` / 0 for victory / death / abandon |

**Build and shop**

| Constant | Value |
| --- | --- |
| `BASE_SLOTS` / `MAX_SLOTS` | 4 · 24 — the free width every run opens on, and the last slot the shop sells |
| `HAND_SIZE` / `RECOMMENDED_SIZE` | 5 dealt at run start (seeded, ≥1 focus config) · 2 marked as advice, none preselected (ADR-052, amended by ADR-057) |
| `slotCashOutKb` | refunds the price of the most expensive slot still held; the purchase index never rolls back |
| `CONFIG_SIZES` | 1 · 2 · 4 · 8 · 12 · 16 slots, halved by minify (a 1-slot config cannot minify) |
| `DRAFT_SIZE` / draft cost / sell refund | 5 offers / `32 KB × slots` / `floor(cost ÷ 2)` |
| Rebuild / `LOCK_COST_KB` / Extend | 4…512 KB doubling / 16 flat / 48 then 96 |
| Control staging | Lock requires yarn.lock in the build (ADR-054); Extend from gate 3 (`draft.model.ts`) |
| `pinCostFor` | 128 KB at gate 4, +64 per gate, 512 at gate 10; stipend 32 KB × gate |
| Lint / peek fees | 8…256 KB per poll / 32…512 KB per gate |
| Max config level / upgrade cost | 5 (Telemetry 2) / `32 KB × (level + 1)` |
| `UPGRADE_OFFER_ONE_IN` | ~1 shop in 8 rolls an owned config's next version onto the shelf, at shelf price, no coverage gate (ADR-053) |

---

*Sources: the `.beans/` story corpus, `docs/adr/`, `docs/brainstorm/`, and the
`src/modules/run/` model files, canonical for all numbers.*
