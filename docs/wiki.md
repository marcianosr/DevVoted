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
flawless summit takes 12 calendar days, and every gate held in SHAKY adds one,
because the retry waits on tomorrow's polls.

Where a locked run parks depends on the phase (ADR-032): mid-gate it redirects to the
[community board](#7-community); after a cleared gate it parks on the **prep page**,
with the shop a click away and the start-gate button wearing the countdown to
midnight. A new run reaches prep too, between the build it was dealt and its first
five polls, so no gate is entered without its stakes stated (ADR-078).

You can **abandon** a run and start fresh the same day. The new run serves only polls
you have not answered yet, and abandoning banks nothing.

### 2.2 Gates

A gate deals a window of 5 polls and audits the **whole run** against its own line
(ADR-073). Its one demand is the **coverage meter**, and the meter is cumulative: the
units every gate banked, over every slot the run has opened, `5 x (gate + 1)`. Five
slots at Pallet, ten at Boulder, sixty-five at the Champion
([2.8](#28-what-unlocks-when)).

So clearing a gate opens the next gate's five slots and the same score is divided by a
bigger number: Pallet at 42% reads 21% at Boulder having lost nothing. The units did
not move, the ruler did. The debrief names the slots ahead and the shop's **Next gate**
panel prices the line in answers for exactly this reason. A failed attempt banks
nothing, so a retry replays the window against the same denominator.

Configs demand nothing ([4.1](#41-what-a-config-is)): all friction lives on the gate.
A bare build never clears, which is why sell and drop refuse your last config.

**Gates count from 0.** A run opens on gate 0 and summits at gate 12. Clearing a
gate moves the run on; a window answered 5 of 5 awards that gate's **swatch**
([6.3](#63-swatches)), whether or not the gate cleared.

Exactly one of two things happens when the window's 5th poll is answered; nothing is
decided before that:

| | Condition | Outcome |
| --- | --- | --- |
| **Advance** | the meter meets the demand | paid, `gatesCleared + 1`, shop opens |
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

**Coverage** is the score, kept on two ledgers: the **run meter** (banked units over
every slot the run has opened, the only number a gate judges, see
[2.2](#22-gates)) and the **career totals** (a percentage per category plus a run
total). The career totals feed the leaderboard and Focus upgrades
([3](#3-your-build)) — they gate no gate.

A correct answer earns `base × share × credit × mults + adds`:

| Term | Value |
| --- | --- |
| `base` | **One unit**. Flat: the gate number and the option count do not touch it (ADR-073). What a unit is worth as a percentage depends on the gate; the arithmetic is in `coverageRatio.model.ts`. |
| `share` | The fraction of the answer key that landed. 1 for a single-answer poll answered correctly, and one of three rungs for a partial (ADR-079). |
| `credit` | **×2 on a multiple-choice poll**, ×1 on a single (ADR-081). The one term the poll type sets. |
| `adds` | **Flat units**, added after the multipliers and never amplified by them, alongside the streak step (ADR-083). Code Coverage +0.1 a correct answer; Cache +0.25 a cached hit. |
| `mults` | Product of config multipliers (AGENTS.md ×2, Intellisense ×1.5, Focus ×1.25 at L1), plus the opener and throttle terms a config carries. |

**The streak pays into both meters.** Every correct answer after the first adds a
flat `STREAK_UNIT_STEP` of +0.1 units to the earn, outside the multipliers and
never multiplied by them. `.reduce()` is the one config that buys a *growing*
step instead (ADR-090): while it is installed the step climbs with the streak,
+0.25 then +0.50 then +0.75 then +1.00, clamped at four steps so a streak
carried in from a failed gate cannot open above what a clean window earns. It
stays outside the multipliers either way. Separately it multiplies the gate's KB payout:
`1 + 0.1 × streak` consecutive correct answers, capped at ×2 (10 steps,
`streakCapStepsFor`, and a config's `streakCapSteps` adds to it; the run-start
gate panel states the ceiling). One streak drives both, and a gate clear resets
it to zero after the payout is read, so a window starts cold however well the
last one went.

**Multi-answer share** lands on one of three rungs: **1/4, 1/2 or 3/4** (ADR-079).
It starts as `(correct picks − wrong picks) ÷ total correct`, then rounds to the
nearest quarter and clamps into that range, so "most of it" reads the same on
every poll whatever its key size. Only an exact set pays a full unit, which is
what keeps 7 of 8 caught from rounding into a clean pass.

Every wrong pick cancels a right one, so shotgunning every option earns nothing.
An answer whose wrong picks cancel its right ones is a **miss**, not a partial:
it pays nothing, resets the streak and flushes Cache. `PART` always means the
answer was paid something, and the badge carries the rung it earned (`PART ¾`).

**A multiple-choice answer pays double** (ADR-081), and the doubling runs down
the ladder with it, so the five outcomes are **0, 0.5, 1, 1.5 and 2 units**.
`.prettierrc` is the one config that acts on those two half-units, topping a
partial up to the whole unit above it (ADR-086); as a flat add it leaves the
ordering intact wherever a multiplier is also installed.
Catching half a key is worth a whole clean single: the poll was harder, and half
of it is real work. The `PART` badge still names the fraction caught, not what it
paid, so `PART ¾` on a multiple earns 1.5 units.

Only coverage reads the share and the credit. The streak, storage, the gate's
correct-answer tally and the clear payout all stay binary on the exact-set rule,
so a full select-all proves one slot like anything else.

**A wrong answer subtracts nothing on its own.** The meter has no loss term: a miss
earns zero and the number never runs backwards by itself, so what is on screen is the
best the run has done rather than the worst thing that just happened. The cost is the
slot. The denominator counts every slot the gate opened whether you answered it well
or not, so a miss at gate 9 quietly costs a fiftieth of the bar, and the deeper the
climb the more a wasted slot is worth. That is the risk, and it is priced by the
demand ladder rather than by a penalty.

**One config can make an answer cost units.** `strict: true` is a wager you arm
before you answer: an exact answer earns half a unit more, and a partial, a miss or a
timeout takes half a unit off the gate's own tally. It disarms after every answer, so
every poll is wagered on separately, and the gate can never fall below zero units. It
is the only thing in the game that moves the meter down (ADR-089).

Example, gate 2, a single-answer CSS poll with `.css` installed:
`1 unit base × 1.0 share × ×1 credit × 1.25 mults` = **1.25 units of CSS coverage**.
The same poll as a select-all, fully answered, pays 2.5. The post-answer **receipt**
(ADR-084) states that as the rows it is: the base the answer itself paid, one row per
config that contributed, the streak step when one is running, and a `paid` total. Each
row reads in the form its config is sold in — a multiplier states its factor (`×1.25`),
an adder its units (`+0.1`) — so the rows do not visibly sum to the total. That is the
price of ADR-083's split: one presentation cannot be honest about both kinds at once,
and the form the shop quoted wins. Anything the answer changed beyond its coverage
follows underneath, one line ("streak lost · your next correct answer starts at ×1.0").
Meanwhile every config in the build says what it is worth on the poll in hand: `×1.25
here` while it is paying, `idle this poll` or `JS or TS only` while it is not. When the
answer lands, the configs that paid **flash**; if the build is folded away, the folded
bar flashes instead, so the cause arrives with the figure either way. A miss keeps the
track silent: configs never touch losses, so the loss reads once, on the paid line.

Scores carry **two decimals** wherever they are shown. `.js` pays 1.25×, and rounding
that to a single decimal is what used to make a correct JavaScript answer read as an
unexplainable "1.3".

Category coverage past 100% rolls over into **levels**: 110% in JavaScript reads as
"L2". Mastery keeps counting instead of capping.

### 2.6 How a gate closes

A gate resolves on the **band** its coverage meter closes in, not on a single
threshold (ADR-076). The bands are read off the gate's own healthy line:
`HEALTHY` is that line, `OK` sits two answers under it, the survival floor four
answers under it, and `PERFECT` is a full bar at 100%. The drops are stated in
units, so every band is the same ruler at every gate even though it covers 40
points at gate 0 and 8 at gate 4. Both drops clamp at zero, which is what
leaves gates 0-1 with no SHAKY band and gates 0-3 with no DANGER band. Live
numbers are in `coverageRatio.model.ts`.

| Band | The gate | The swatch | The streak | The payout |
| --- | --- | --- | --- | --- |
| **PERFECT** — a full bar | Cleared | Only if 5 of 5 | Kept | Full, times `PERFECT_BONUS` |
| **HEALTHY** — at or over the line | Cleared | Only if 5 of 5 | Kept | Full |
| **OK** — within 10 points | Cleared, thin | Only if 5 of 5 | **Broken** | Cut in proportion |
| **SHAKY** — within 20 points | **Held**: pay the peel and retry, or refuse the gate | Only if 5 of 5 | Broken | Nothing |
| **DANGER** — under the floor | **The run ends** | Not won | — | Nothing |

**The swatch column reads the window, not the band** (ADR-080). Clearing and
earning the badge are two prizes on one window and either can land without the
other: a flawless window can still close SHAKY on a bad history, and a
comfortable clear can carry a miss. DANGER is the one row that can never pay it,
because zero misses cannot land under the floor.

**The OK cut is not a separate penalty.** A gate pays on
`coverage ÷ the gate's line`, capped, so a run that closes under the line is
already paid less by the same arithmetic that pays every other band. What OK
costs on top of that is the streak.

**A shaky gate is a choice, and both exits are priced on the debrief.**

- **Pay the peel and retry.** The peel is a quota of your occupied slots (20% at
  the early gates rising to 35% at the summit, +10% at Elite, +15% at Champion,
  and never more than half the build before gate 3). It is billed in KB at half
  a slot's draft price, so you can settle it from the archive, or by dropping
  configs, whichever you have. Sizes are whole numbers, so a bill your build
  cannot match exactly is overpaid and the remainder is gone. Dropping refunds
  nothing beyond what it settles, unless **Garbage Collection**
  ([4.3](#43-roster)) is installed, in which case every dropped config also
  refunds its sell value. Then the normal post-gate loop runs (review, shop,
  prep, 5 fresh polls) and the meter starts over. Coverage and storage survive.
- **Refuse the gate and end the run.** The climb banks as if you had died there:
  `gatesCleared ÷ 13` of the archive. The run is over and nothing is owed. This
  is not abandoning, which banks nothing, because the gate has already been
  answered and failed, so there is no attempt left to duck.

**A held gate pays no gate reward**, no interest and no extra-pick KB. The
faucet KB earned inside the window is the retry's whole budget. **Planning
Poker** is the one config that pays regardless, since it settles a prediction
rather than rewarding a clear, so calling your own 2 of 5 pays what calling a 5
of 5 would. The recurring bills collect on a clear only, so a retry is free of
them.

**Every attempt burns 5 of the day's finite sequence**, so a retry costs real
time, and audits charge again: Volcano leaks every attempt, a 408 re-clocks, an
outage re-rolls.

**Death is a DANGER close.** The peel no longer runs a build to nothing, because
refusing the gate is always available to a player who cannot pay. Both the
survival floor and the healthy line are on the stake receipt before you answer,
the fatal one in red.

The bands above read `coverageRatio.model.ts`, the one live engine (ADR-073).

### 2.7 Victory and run end

Clear all **13** gates (0 through 12) to win. A run ends four ways (ADR-076): the
summit, a gate closed in DANGER, refusing a gate held in SHAKY, or abandoning.

Leftover storage is credited to **archived storage** in proportion to the climb:
victory banks **100%**, death banks **gatesCleared ÷ 13** (die having cleared 6, keep
46%), refusing a shaky gate banks the same as death, and abandoning banks
**nothing**, so walking away mid-gate is never a cash-out. A tag-rescued run
([5.2](#52-the-shop)) banks only the gates it actually climbed.

🟡 Continue-past-victory is confirmed but unbuilt. The victory *reward* is undecided,
under one constraint: it must not be claimable by a zero-effort farm run.

**Balance baseline.** A bare build earns at most **25%** in a five-poll gate, the
same at gate 0 as at the Champion, so the HEALTHY ladder outruns it by design: it
meets the line through gate 4 and survives through gate 6, and nothing beyond that
without multipliers. Coverage configs are homework from gate 3 upward. The
HEALTHY line is the only difficulty dial (ADR-073), so it is the one number to
move when a gate reads wrong.

### 2.8 What unlocks when

The climb stages rules on two axes: **gate number** stages the coverage demanded, the
audits and the shop's controls; **category coverage** stages Focus
upgrades ([4.4](#44-upgrades)). Width is on neither: it is bought
([5.1](#51-storage-kb)).

Every row states what you hold **while facing that gate** — which is also what the
shop before it sells, since a shop runs on the clear that precedes its gate.

| Gate | Swatch | Coverage in its window | A clear pays | A miss peels | Audit | Also unlocks |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Pallet | 20% | 32 KB | **nothing** | (clean) | Shop, **Rebuild** |
| 1 | Boulder | 30% | 64 KB | 20% | (clean) | — |
| 2 | Cascade | 40% | 96 KB | 20% | (clean) | **Extend** |
| 3 | Thunder | 45% | 128 KB | 25% | 402 Payment Required | — |
| 4 | Lavender | 50% | 160 KB | 25% | 1 of pool A | — |
| 5 | Rainbow | 55% | 192 KB | 25% | 1 of pool A | — |
| 6 | Soul | 60% | 224 KB | 25% | 1 of pool A | — |
| 7 | Marsh | 65% | 256 KB | 30% | 1 of pool A | — |
| 8 | Seafoam | 70% | 288 KB | 30% | 2 of pool B | — |
| 9 | Volcano | 75% | 320 KB | 30% | 2 of pool B | — |
| 10 | Earth | 80% | 352 KB | 30% | 2 of pool B | — |
| 11 | Elite | 85% | 384 KB | **45%** | 410 Gone + 2 of pool C | — |
| 12 | Champion | 90% | 416 KB | **50%** | 408 Request Timeout (5 polls, 20 s) + 410 Gone + 413 Payload Too Large | Clearing it wins the run |

The clear column is what a flawless window pays before build multipliers and before
the streak.

The coverage column is the gate's HEALTHY line, straight off `HEALTHY_LADDER`. A
bare build earns at most 25% in a five-poll gate at every gate alike, so the
ladder outruns it by design and multipliers stop being optional around gate 3
(ADR-073). A clear pays the KB in this column times the streak multiplier.

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

**Pallet is the calibration gate** (ADR-057). It asks 20%, which is one correct answer, but a miss there
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

Authoritative over this table: `HEALTHY_LADDER` (`coverageRatio.model.ts`),
`BUILD_SPACE_RUNGS`, `failPeelShareFor` (`rules.model.ts`), `gateClearPayout` (`build.model.ts`),
`EXTEND_FROM_GATE` (`draft.model.ts`), `GATE_SWATCHES`
(`swatch.model.ts`), the audit roster (`audit.model.ts`) and its pools (`auditSchedule.model.ts`).

---

## 3. Your Build

Your build holds **slots**, and a config takes as many as its size says: 1, 2, 4, 8,
12 or 16 (ADR-047). Slots are drawn as a track and written as a plain count, never with
a KB figure beside them.

**Where the room comes from.** Every run opens on **4 weight of free build space**
and rents the rest by the gate (ADR-082). Gates hand over nothing. From the **Cascade
gate** (gate 2) the shop offers a ladder of rungs, and the rung you hold bills KB at
every gate close for as long as you hold it:

| Build space | 4 | 6 | 8 | 12 | 16 | 24 | 32 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| KB a gate | free | 16 | 32 | 64 | 128 | 256 | 512 |

**You pay for the room, not the part of it you have filled.** A 12-weight build sitting
in a 16-weight space still bills 128 KB a gate. That is what makes the rung a decision
rather than a formality: headroom has a running price, and so does refusing to buy it.

**Stepping back down is free, but the door holds you to it.** You can pick any rung in
either direction at no counter price, and the bill changes from the next gate close.
Step below what your build weighs and the shop will not let you leave until the build
fits — drop weight, or step back up and pay for it. It is the only lock on the shop
door, and it can only ever be one you chose.

**A bill you cannot pay is not fatal.** The run falls to the widest rung its balance
covers and arrives in the shop over its space, where the door rule takes over. The free
rung costs nothing, so there is always a floor.

**Minify.** Halves a config's slots and halves what it gives, one way only. It is how a
16 fits a build that has never been sixteen wide. A 1-slot config cannot be
minified: one slot is the floor.

Every build surface draws the same track: a bar per config as wide as its slots, one
**dashed** box per slot still open, and a **hatched** stub one slot wide at the end for
room the run has not bought. The two treatments are not interchangeable: a dash is a
slot standing open that a config can go into now, hatching is room still for sale.
Outside the shop the stub only says where room comes from ("Rent more build space in
the shop"); in the shop the rung ladder in the **build space** panel carries the
prices, one chip per rung with the held one lit.

That line carries one reading at a time: the room the config under the pointer takes
(".ts takes 1 slot of 10"), otherwise the invitation to hover.
The room count itself sits in the section's own heading — "5 configs · 7 of 10 slots ·
3 free", reading "over by 2" instead when a build sits over its cap — so the totals are
readable with no pointer at all. On a phone, where there is no hover, a config's own
chip stands in for it: opening a chip's panel lights its box on the track and prices it
on the line. Width carries no swatch: badges come from flawless windows.

**Managing configs.** Click any config chip for its popover: **Install**, **Sell**
(refunds half the draft cost in KB), **Minify**, or **Upgrade**. Anything can be
sold except your last config, since a bare build never clears.

**Starting a run.** The run deals a **hand of five** configs from the starter
pool — seeded per player per day — and picks **nothing** for you. **Two** are
marked as a suggested opening (ADR-057), which is advice and not a selection.
The hand itself never changes while configuring, so the deal reads as one
checkable list. **One config is the only floor**: pick one and you can play,
spare slots are a legal opening, and only an over-capacity build blocks the
start. Nothing in a build is ever locked or mandatory. The run opens on the free
four and rents nothing before it starts; the ladder opens at the Cascade gate.

The deal is shaped, not just shuffled (ADR-062). Three rules hold on every seed:
nothing larger than your opening slots is dealt (so a card is always installable,
though one that exactly fills the budget still is), the **smallest three** dealt
configs fit those slots together (so a three-config build is always reachable),
and the hand holds **one or two focus configs** with the count varying by seed
(so it is never five category bets and never none). The starter pool is the eight
configs an account is granted at signup ([6.2](#62-unlocks)).

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

**A wager prices itself.** `strict: true` is the one on-demand action with no fee,
because what it risks is the answer rather than storage: arming it is free and losing
it costs half a unit. It still obeys the rule above, since arming is a choice and
never a demand. See §2.5.

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
worth half a maxed build. The Dex's Configs tab orders the roster by size.

### 4.3 Roster

**🟢 Shipped.** Forty configs, all pure effects.

| Config | Slots | Effect |
| --- | --- | --- |
| `.js` `.ts` `.css` `.jsx` `.html` `.git` `.java` `.py` `.rb` `.vue` | 1 | That category's polls reward ×1.25 (Focus, upgradable) |
| `package.json` | 1 | General Frontend polls reward ×1.25 (Focus, upgradable) |
| Unit Tests | 1 | +32 KB × level storage on gate clear |
| Moore's Law | 1 | On each gate clear, +2% × level of held storage |
| ESLint | 1 | Cross out one wrong answer on JS/TS polls, fee doubling from 8 KB per gate |
| Stylelint | 1 | Cross out one wrong answer on CSS polls, fee doubling from 8 KB per gate |
| yarn.lock | 1 | Lock shop offers for 16 KB each ([5.2](#52-the-shop)); a locked offer leads every shop until installed or released, and every lock releases if yarn.lock leaves the build |
| Planning Poker | 1 | Before a gate, bet how many of its 5 polls you will answer correctly. The number is a **floor**: answer at least that many and it pays `k x (gates cleared + 1) x 0.25` coverage units, a constant 5% of the gate's line per point bet; fall short and it pays nothing. The units land inside the window, so a won bet can lift a gate over its own line. Made in prep, locks the moment you answer, and settles on a missed gate as readily as a cleared one |
| `strict: true` | 1 | Armed before you answer: an exact answer pays **+0.5 units**, and a partial, a miss or a timeout takes 0.5 units off the gate window (clamped at 0). It disarms after every answer. The one config that can make an answer cost coverage (ADR-089) |
| Cold Start | 2 | First answer of the gate rewards ×2 |
| Code Coverage | 2 | +0.1 units of coverage per correct answer, flat: no multiplier amplifies it (ADR-083) |
| `.reduce()` | 2 | Replaces the flat streak step with one that climbs: +0.25 on the second correct answer in a row, +0.50 on the third, up to +1.00 on the fifth (+0.05 a step per level). A miss restarts the climb; a partial holds it. Clamped at four steps, and outside the multipliers like the step it replaces (ADR-090) |
| IndexedDB | 2 | +8 KB storage per correct answer, capped at 320 KB |
| Telemetry | 2 | Paid peek at how everyone ever answered this poll ([4.5](#45-paid-actions-lint-peek-and-buy-back)) |
| A/B Test | 2 | Ships one of two arms, switched free at any time — in the shop or mid-poll, where the switch scores the answer you are about to give (ADR-053): A pays ×1.25 on all coverage, B pays +8 KB per correct answer (sharing the faucet's run cap) |
| `.length` | 2 | Names how many correct answers the gate's 5 polls hold, and pays +16 KB per correct answer beyond one per poll |
| Garbage Collection | 2 | Every config you **drop** to pay a peel refunds its sell value. WTFPL zeroes it and Freemium halves it |
| Dry Run | 2 | While an answer is picked, the coverage meter marks where the gate lands if it scores and where it lands if it misses. It reads nothing about the answer itself: both marks come from the per-answer figures the poll already quotes |
| `.prettierrc` | 2 | A partial select-all answer earns the fraction it needs to reach a whole unit: a quarter caught pays 1 and three quarters pays 2. The top-up is flat, so no multiplier amplifies it — which is what keeps a near-miss behind a full answer in any build above a bare one (ADR-086) |
| vendor lock-in | 4 | Names one config in the build as the run's vendor. That config keeps its weight and keeps paying its effect, but the build space you rent is measured as though it were not there, so the room it frees is a rung you no longer have to pay for. In exchange it cannot be sold or dropped for the rest of the run. It cannot name itself, and it only pays on a config heavier than its own 4 — the thing worth exempting is the thing you would least like to be stuck with. A peel can still take the locked config, and selling vendor lock-in releases the lock (ADR-087) |
| Intellisense | 4 | All coverage ×1.5 |
| Deprecated | 4 | All coverage ×3, fading ×0.5 each gate clear; deleted from the build at ×1 |
| Cache | 4 | Correct answers warm their category for the rest of the run: each cached hit pays +0.25 units of coverage there, capped at one unit (4 hits). A wrong answer in the category flushes it cold; a partial neither warms nor flushes |
| Prefetch | 4 | Shows, for every poll left this gate, its category, how many options it offers (in play order), and how many of the polls take more than one answer, plus all of the next gate's categories. Asking for polls not yet dealt rolls tomorrow's shared seed a day early — the questions stay sealed |
| git rebase -i | 4 | Before a gate starts, names its 5 polls by **category** and moves any of them up or down the queue. **v2** also names which of them take more than one answer. The order locks the moment the first answer lands. Prefetch stays the richer read (option counts, next gate); rebase owns the order instead, and it is the only config that touches poll sequence — which is what Cold Start, Overclock, Cache and Dependabot all quietly depend on |
| Overclock | 4 | The gate's first answer earns ×4 coverage; every answer after it runs hot at ×0.5, cooling off at the clear. Miss the opener and the gate is nearly dead — the buy is variance, not magnitude (×1.2 average, honestly under Intellisense) |
| AGENTS.md | 8 | All coverage ×2 |
| Volkswagen CI | 8 | Reports the gate's first audit as passing; costs 384 KB to draft |
| Dependabot | 8 | Counts correct answers: **5 in a row** (4 at L2) upgrades a random installed config, free, then the count restarts. A wrong answer or a failed gate starts it over, so it pays for a clean streak rather than for time. Its row on the poll screen shows the countdown ("bump in 3"). The pick ignores the Focus coverage gate the shop enforces, so a merge lands without review |
| WTFPL | 8 | Every shop offers the entire roster; costs 512 KB, every sell refunds 0 KB while it is installed (its own included), and Rebuild/Lock/Extend retire |
| Freemium | 8 | **Free to draft.** Every config drafts at half price while it is installed, and refunds drop to half of that discounted price. Each gate cleared bills 8 KB × 2^gate (8, 16, 32, 64, 128, 256…), charged after the clear pays; a bill the balance cannot cover lapses the config and frees its eight slots |

`.length` deliberately pays on *shape* rather than magnitude, since four configs
already sell coverage magnitude: it pays most in multi-answer-heavy windows and nothing
at all in a window of five single-answer polls, a dead slot stated on the row rather
than hidden in the rules. **Moore's Law** ramps instead of gating, because 2% of a small
balance is worthless and the balance is only large late; on the free tier its interest is
shop budget rather than principal, because the 256 KB cap binds from the first shop and
a balance cannot compound past it (ADR-046). It only becomes principal on a rung whose
cap leaves room above its own bill.

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
| Vite config | 1 | Not built. +0.25 units of coverage on JS/TS polls answered under 35 s |
| `.every()` | 1 | Not built. +0.1 units of coverage when a category you have 5-streaked appears |
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

Upgrades cap at **level 5** (the 5-poll window is the natural ceiling); Telemetry and
git rebase -i are the exceptions at level 2. Every upgrade costs
`32 KB × the level bought`.

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
- **git rebase -i** upgrades once and buys information, not power: L1 lists the gate's
  polls by category, L2 also names which of them take more than one answer. Answer
  types are Prefetch's headline reveal and multiple choice pays double, so the level is
  what buys the overlap.

The shop's Upgrade button carries the price and, while gated, names whichever
requirement is in the way on hover. Arming an upgrade states the sentence the config
will read at the next level and shows one `from → to` chip per number that moves
(ADR-053). A rolled offer is the other way to buy a level: roughly one shop in eight
puts a version of something you already own in the registry, at the registry price, with
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

**Storage** is the in-run currency, measured in kilobytes, and **nothing caps it**
(ADR-082). The header reads the balance; a rich gate is yours to keep.

- **Faucets**: clearing a gate pays `32 KB × gate number × correct ÷ 5` (capped at gate
  12's ×12, so endless runs stop scaling); IndexedDB adds +8 KB per correct answer,
  capped at 320 KB per run.
- **Sinks**: the build space bill, drafting configs (32 to 512 KB by size), upgrades,
  lint and peek fees, draft rebuilds, lock, extend, the git tag, and subscribed
  configs' bills.

**The build space ladder** (ADR-082). Every run opens on 4 weight of free room. From the
**Cascade gate** (gate 2) the shop's **build space** panel sells the rest, and the rung
you hold bills every gate close for as long as you hold it.

| Build space | 4 | 6 | 8 | 12 | 16 | 24 | 32 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| KB a gate | free | 16 | 32 | 64 | 128 | 256 | 512 |

Every billed rung doubles the one below it, so room is never cheap twice. The bill is
read off the rung held, **not** the weight in use: reserved room costs the same whether
it is full or empty. Picking is free in both directions and there is no counter price,
only a standing bill that changes from the next gate close.

Weight both earns and bills. A heavier build scores more coverage per answer and so
earns more per gate, while costing more per gate to run; the whole question of a run is
whether the first outruns the second. The rung prices and what a proven slot pays are
tuned against each other and neither moves alone.

**Stepping down is held to by the shop door.** Pick a rung below what your build weighs
and the shop's exit stays shut until it fits — drop weight, or step back up. It is the
only lock on the door, and it is always self-inflicted: the game never sells you less
room than you asked for.

**A bill you cannot pay drops the rung.** The run falls to the widest rung its balance
covers, then arrives in the shop over its space where the door rule applies. It is never
fatal: the free rung costs nothing.

The bill lands **on clear only**, off the balance the clear just paid, and settles
before the config subscriptions — so a redo is free of every recurring cost.

**The Subscriptions section** lists every recurring KB cost in one place on the gate
receipt, so the whole bill is readable before you commit to a gate rather than only
after it settles: subscribed configs (Freemium) and the build space. Both bill **on
clear** only. When the balance cannot cover the bill the section names the shortfall and
warns what will not be paid.

### 5.2 The Shop

Clearing a non-final gate opens a Balatro-style **multi-buy shop** bounded by two
things — the KB you hold and the slots you have free — and so does holding one in
SHAKY, once the peel is paid: the retry shops with what it has, which is the only
thing making the second attempt different from the first. Take
as many actions as you can afford, in any order. The exit leads to the **prep page**
and the shop stays open behind it until the next gate starts, so shop, prep, community,
shop is a legal loop while waiting on tomorrow's polls; prep carries the way back. Nothing grades the exit: it is shut only while the build outweighs the build space it
holds ([3](#3-your-build)), which is a state rather than a verdict, and one you chose by
stepping down the ladder.

| Action | Cost | Notes |
| --- | --- | --- |
| **Draft** | 32 to 512 KB by size | One of 5 offered configs, new ones only. The offer's **Install** press carries the spend on it (`Install · 64 KB`), the same press the opening hand deals with; it greys and refuses while the room or the balance is short, price still showing. |
| **Rebuild** | 4, 8, 16, … 512 KB | Re-rolls the offer, doubling per rebuild within the same shop. |
| **Lock** | 16 KB a lock | Requires **yarn.lock** in the build (ADR-054); without it the registry shows no padlock at all. Pins any number of offers: rebuilds skip them and every later shop leads with them, until each is installed or released. Releasing is free and refunds nothing, and every lock releases if yarn.lock leaves the build. A pinned offer occupies one of the registry's slots, so locking the whole registry freezes it. |
| **Minify** | free | Halves a config's slots and halves what it gives, one way only. The only way to fit a 16 into a build narrower than sixteen. A 1-slot config cannot be minified. |
| **Extend** | 48, then 96 KB | One more config on the table, in this shop and every shop after. Two per run. From gate 3. |
| **git tag** | 128 KB at gate 4, +64 KB per gate, 512 KB at gate 10 | A cross-run checkpoint: after a death, your next run checks out there instead of gate 1. One per run, burnt by the run it rescues. |
| **Sell** | refunds half the draft cost | Never your last config. |
| **Upgrade** | `32 KB × the level bought` | Focus configs also need the coverage ([4.4](#44-upgrades)). |
| **Build space** | free to 512 KB a gate | From the Cascade gate on. Pick any rung of the ladder, up or down, at no counter price; the rung you hold bills at every clear ([5.1](#51-storage-kb)). Stepping below what the build weighs is allowed, but the exit stays shut until it fits. |

A tag-rescued run starts at the pinned gate with a 32 KB-per-gate stipend, everything
else fresh, and its death credit counts only the gates it actually climbed. It opens on
the free four like any other run and rents its space out of the stipend. Gate 10 is
the last that sells a tag:
deeper, a rescue would resume a starter build into stacked audits and a half-build
peel.

An offer is refused for **room** before it is refused for **price**, and the badge
says which: `Needs 4 slots, 1 free` is a different problem from `Costs 128 KB, you
have 90`. A 1-slot config can fit where a 4 cannot, so the refusal belongs to the
offer rather than to the registry.

A **build space** rung is the one exception: room is the thing being priced, so nothing
can refuse it but the bill it will land, and that figure says itself —
`12 · 64 KB`, the weight it buys beside what it bills. Naming a shortfall there would
repeat the price it sits beside.

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

Configs are exposed on the **Reveal / Grant / Stage** model (ADR-050/051). Grant
gates the starting hand only — the shop's registry always offers the whole
roster. Eight configs are granted at signup (js, ts, css, eslint, unit-tests,
code-coverage, indexed-db, cold-start); the other 30 each unlock
**individually**: a thematic objective that teaches the config's own mechanic
("Peek the community split 5 times") OR a lifetime polls-answered fallback,
whichever is met first. Every objective tracks automatically from play (nothing
is activated): counters tick in the same transaction as the run action that
moved them (`user_objective_progress`), and a crossed target writes a permanent
grant row with its provenance (`user_config_unlocks.via_metric`, ADR-064).
Answers in abandoned runs count; mirror-graded corrects count toward their real
category (ADR-038). `configUnlock.model.ts` is the objective table's source of
truth (ADR-051's status clause). Unlocks are achievement-only — no currency
buys one (the archived-storage pull, DVTD-9d7o, is rejected).

A grant announces itself where it fires — a saffron "unlocked" alert line on
the reveal, poll or shop surface — then again in the gate clear's "What
changed" rows and in an "Unlocked this run" section on the game-over screen,
each with its provenance ("Earned: peeked the community split 5 times").

Grant does nothing for a config larger than the opening slot budget: those are
never dealt, so the shop is their only route and the Dex checkmark is the reward
(ADR-062, ADR-064). 🟡 Still to land (DVTD-p9ah): the starting hand dealing
from the granted pool instead of the free eight, with a freshly granted config
dealt in first until installed once (the NEW-tag seat; the focus band counts
it). 🟡 Also planned: the registry-Reveal "met" state in the Configdex (needs a
seen-in-registry ledger nothing writes yet), and bonus awards for re-answering
mastered polls correctly.

### 6.3 Swatches

**Gate swatches** are thirteen badges, one per gate, earned by answering all **5 of
its 5 polls** right (ADR-080): you beat the leader clean, you get the badge.
Clearing the gate moves the run on and pays it; only a flawless window takes the
badge home. The ladder reads Pallet, Boulder, Cascade, Thunder,
Lavender, Rainbow, Soul, Marsh, Seafoam, Volcano, Earth, Elite, Champion: gate 0 is
**Pallet** where every journey starts, the eight gen-1 gym badges run in strict
trainer-card order, the two Kanto landmarks that never had a gym sit where the games
actually walk you through them (**Lavender** out of Rock Tunnel, **Seafoam** on Route
20), and the summit pair close it at Indigo Plateau.

A flawless window in any run earns that gate's swatch **permanently and
account-wide**; earning it again is a no-op, so the collection only grows. Colours come from each name's home
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
summary, and the Dex's Swatches tab.

🟡 **Collect Swatches** (DVTD-g8ty): a *per-category* cosmetic chip earned through
mastery, a separate collection that reuses the name deliberately.

### 6.4 The Dex

The Pokédex of DevVoted, at `/dex`, titled **Dex Registry** — two words, because
plain "Registry" is the shop's offer list. Five tabs, each colouring the whole
screen after the collection you opened.

**Polls** tracks every poll you have been dealt, with its repeats and its
fully-correct record ("answered ×4", "3/4"). A poll you have never been dealt
gives up nothing at all: its category and its question both read `???`. The row
says *answered*, not *seen*: nothing in the session engine writes
`polls_history`, so a dealt-but-unanswered count does not exist yet.

**Configs** is the unlock checklist, a card per config ordered heaviest first
across the whole roster ("by weight"), granted and locked alike. A granted card
carries its weight, its name and a short provenance tag, "starter" or "earned",
whose full sentence ("Starter config" / "Earned: …" off `via_metric`) sits
behind it. A config with a version ladder lays every rung out as a pressable
`v1 v2 v3` chip; pressing one reads that rung, swapping the card's effect line
and showing what the step costs. The ladder opens on v1, which is what
installing already gives you. Versions are not unlocked — they are bought with
storage inside a run and lost with it ([5.4](#54-the-shop)) — so a chip is a
thing to read, not a thing you own, and the tab's footer says so. Most of the
roster has no ladder at all and shows no chips: only a config that scales with
its level has rungs to read.

Every locked config is redacted to a `???` silhouette carrying both unlock
paths. The first reads as the requirement with its count beside it ("unlock ·
Hold 2 MB in the archive", 1/2); every further path reads as an alternative,
drawn as a bar with its own count ("or", 43/225) and naming itself to a screen
reader, which the bar cannot (ADR-051; one-shot objectives carry no count). The
redaction is type-enforced: a locked entry holds no config at all.

**Audits** lists every audit as met or unmet (`???` until met), each with the
gates it can land on. It does **not** count firings: the roster is drawn per run
(ADR-056) and nothing records what a draw dealt, so a count would read zero for
every drawn audit a player has actually faced.

**Swatches** is the gate ladder as a grid — one card per gate, earned ones
filled and marked "swept", the next gate dashed, the rest empty sockets.

**Runs** is the archive of finished climbs, newest first: the date, the ladder
showing the gates that run swept, the gate that held it, and its final coverage
with the band that coverage falls in. Coverage is read as a share of the slots
the run opened, never as the raw units `run_states.coverage` stores.

🟡 Planned: collection stats, per-poll community success rates,
the Configs tab's registry-Reveal "met" state (ADR-050), and real audit-firing
counts (DVTD-gvc9).


### 6.5 Borders and seasons

Avatar borders are decorative unlockables bought in the border shop and equipped on
your profile. An equipped border is worn wherever the game draws you, including the
byline crediting a poll you wrote ([8](#8-interface)), which is where other players
meet it; 🟡 rarity-based border unlocks via meta-progression are planned. Runs and
leaderboards live inside **seasons** (upcoming, active, finished, archived), the
temporal container for competitive resets.

---

## 7. Community

The social layer works because of the shared daily seed: everyone climbs the same
polls on the same day.

### 7.1 The community board

After every shop visit the climb detours through `/run/community`, and a run locked for
the day lands here too, with "Back to your run" disabled until local midnight and the
countdown beside it. The page wears the terminal-theme kit (`CommunityScreen.ui.tsx`),
one panel in three sections: standouts, the climb, then the polls. Every avatar chip
on the page — standouts, climbers, fallen — wears the player's equipped border over a
GitHub photo or a two-letter-initials fallback.

**Standouts today** heads the page as a grid of six legend-bordered boxes
([7.3](#73-awards)), each one avatar, name and a muted one-line value.

**The climb today** is a horizontal track of the 13 numbered gate swatches with each
live run's avatar chip stacked *beneath* its gate. Your chip is ringed and titled
"you", and your current gate draws the swatch's ring; crowded gates fold behind a `+N`
badge (four chips show). A dashed `pb` marker sits at the gate of the deepest point any
of your *finished* runs reached, and everything past your reach sits behind a dashed
edge captioned **uncharted**. Beneath a gate's stack, each run the gate killed today is
that player's chip, dimmed and greyed, keyed by run rather than player so two losses in
one day both show (abandoning is not falling and draws nothing). The track scrolls
horizontally on narrow screens and centres itself on your column. Gate/poll arithmetic
lives in `climbMap.model.ts`, one unit: polls, counted `gate * 5 + pollsIntoGate`.
🟡 Builds, configs and storage are still not shown.

**Today's polls** is a selector of five numbered chips — one per slot in the day's
seed — with one poll open at a time. A chip is disabled while its poll is sealed or
not yet reached. The open poll shows its category badge, the share who got it right
("22% got it"), the question, and one row per option: letter, label, a distribution
bar with its percentage, a ✓ on the right answer and a "you" badge on your pick (the
right answer's bar fills viridian; a wrong pick of yours, vermillion). A mirrored
answer counts as right when it named every wrong option, since it proves the same
knowledge. The section header counts the day's players and the screen header keeps the
"top X% of players today" percentile. **Redaction keeps it fair**: polls you have not
reached never appear, and linted or missed polls stay sealed behind a disabled chip.

### 7.2 Leaderboards

Two views: **progress today** (everyone on the same seed, comparable per segment) and
**run completion** (won/dead, gates cleared, duration in days). Rows carry
per-category coverage, total coverage, and best streak.

### 7.3 Awards

Community awards in the vein of "top committers", shipped as **standouts today**.
Exactly six (ADR-065), in the grid's own order, all shaped like the climb rather than
the clock.

> Changing: [ADR-067](adr/067-standouts-are-four-plain-standings.md) reverses this to
> four standings: most active, most knowledgeable (per category), fastest, biggest
> bank. The six below are what the code computes today; `DVTD-j6t1` rewrites them.

- **deepest** — the furthest position on the ladder, gate and polls into it
  ("gate 10 · poll 2"), wearing the gate's swatch.
- **against the room** — right on the poll the fewest got right, when at most half the
  room did ("right on poll 2 · 22% were").
- **clean sweep** — a perfect five-of-five gate window, named by its gate
  ("5 of 5 at Soul").
- **widest build** — the most slots held ("11 slots held").
- **travelling light** — deepest first, then the fewest configs
  ("gate 8 on 3 configs").
- **comeback** — the most configs lost to peels, decay or lapsed plans by a run that
  still cleared a gate ("cleared after losing 4 configs"). The engine counts losses in
  `RunState.configsLost`, so pre-existing runs start at zero.

Against-the-room reads today's answers; the other five read live `run_states` across
**active runs only**, so they rank a standing rather than an activity and a player who
has not answered today still holds deepest. A box is a legend-bordered card: title as
the legend, avatar chip, name, value line. Unearned awards are dropped rather than
shown empty, and ties break on player id so a redraw never reshuffles. Logic and every
threshold live in `standouts.model.ts`, which is pure: correctness arrives as a
callback and run state as plain numbers.

Retired with ADR-065: fastest answer, first to answer, first good (reflex, not
knowledge), most *{category}* polls (farmable), longest streak and most coverage
(signals the climb already reports). Answer timings are still captured.

🟡 Brainstormed: perfect gate, no linter used, biggest bank.

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
  bar. The cap is real (ADR-046) but it is a plan the shop prices, not fuel the run
  burns down, so the ceiling is drawn where it is a decision. A bar in the HUD read as
  a tank emptying. Then the gate, polls answered, streak, and total coverage. The gate is
  named in the title — "Gate 0 · Pallet" — over a **pip bar** that doubles as the badge
  collection: one pip per
  gate in that gate's swatch colour, gates behind you solid, the gate underway filling
  with polls answered, the rest dimmed. A pewter rim marks the gate you stand on and
  nothing else. Every pip is a control: hover or tap it to name that gate's badge and
  standing ("clear gate 7 to earn it"). It carries no coverage; the total is the gate's
  own stake, on the Build Summary's "To pass" line. There is no "gate 0 / 12" counter
  beside it any more (ADR-084): the title names the gate and the pip bar counts them,
  so a third copy of the same fact was only noise.
- **New run page**: where a run is opened. Two columns in the shop's order: the
  build on the left — its readout, the slot track, the configs installed, the room
  for sale and the rung after it, quoted but not yet on offer — and the **registry**
  on the right, listing the hand you were dealt. The registry prices the deal
  *free*: a starting config costs room, never storage. It prices no band: the
  footer says prep states what the gate asks (ADR-078).
- **Prep page**: the last screen before a gate opens, and the first screen of a new
  run after the build is dealt. Two columns. On the left, **Objectives and rewards**:
  two rows saying what today is worth — **clear the gate** (the lowest band that
  clears, badged, plus the answers it still costs from where the run stands) and
  **earn the swatch** (answer 5 of 5, kept for good). Each row ticks the moment it is
  in hand. Under them the
  coverage bar with its rungs numbered (0, the floor, the clearing line, the line the
  gate asks, 100), then a row per band reading band, coverage and what it pays — one
  figure each, a negative for SHAKY's peel, `the run ends` for DANGER. The band badged
  on the clear row is always one the table below it draws: at gate 0 that is HEALTHY,
  OK having collapsed onto it. On the right, **the five polls** (sealed unless a
  prefetcher is installed) and the gate's **audits** with the bill a clear will settle.
  The build is not on it (ADR-078). The footer leaves for the community board or back
  where you came from, and starts the gate.
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
- **Build rail**: in the shop, configs hang off a rail, carrying each config's
  paid actions. They list with no status, since a status needs a poll to be true of.
  Prep does not draw the build at all: it was reviewed a screen earlier and locks the
  moment the gate starts (ADR-078).
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
  scored on is a banded bar in a coverage panel of its own (ADR-070), headed by the
  reading it draws — "62% SHAKY" — beside a hover panel titled **what a poll pays**,
  a two-row table of the rungs an answer can land on: 0 or 1 for a single answer,
  0 / 0.5 / 1 / 1.5 / 2 for a multiple, stated as the figures before the build
  multiplies them. Under the bar the panel says the same thing in words — "You have
  scored 35 units across 50 slots, which is 70.0% coverage" — then **what each poll
  paid**: the gate in hand and no earlier one, led by how many of its five polls are
  answered ("4 out of 5") rather than by the gate's name, which the header above already
  states, its five polls boxed at what they earned, closing on that gate's units. The
  run's whole payout history is the gate debrief's, inside its Coverage fold; while you
  are answering, an earlier gate is a row you cannot act on. Once an answer lands the
  panel adds a third region, **what this answer paid** (ADR-084): one row per
  contributor, closing on a `paid` total. A row reads in the form its config is sold in,
  so a multiplier states its factor (`×1.25`) and an adder its units (`+0.1`), which
  means these rows do not visibly sum — the price of ADR-083's split. It is
  stated once per screen, so the header stays quiet here; what is being done to
  this gate lives in its own audits panel, one alert per audit; and what the poll pays
  and costs lives in the poll panel's own head, beside the category badge — "3 options
  · multiple answers · wrong costs 0.5". None of the three folds: a screen you answer
  on should not be able to hide the terms.
- **The poll is one column of panels**: the gate header, then a coverage panel, an
  audits panel, the poll panel and the build, all sharing one width and one left edge,
  the button as wide as the options it commits to. Nothing on the screen is wider than
  the question. The poll panel's head names the step out loud — "Poll 4 out of 5" —
  rather than drawing a row of crumbs for it.
- **Every figure wears a badge** (ADR-066): a KB amount, a coverage percentage, a
  price or a multiplier is always boxed, never drawn as bare text, so a price can never
  be read as a prize. The words around it stay muted; a sign earns the colour (green
  for what is paid, red for what it costs, saffron for a sub-1 multiplier) and an
  unsigned figure takes the screen's own. One hero readout per screen — the headline
  gain, the balance closing a ledger — is the single exemption, because if every number
  is boxed then none of them is the answer to "what did I just earn". A slot count is
  not a figure: the weight block already owns that (ADR-047, ADR-060). A fatal gate states the whole run as the cost ("The run ends here") instead
  of counting configs.
- **Reward report**: a debrief you unfold. The header states the whole result — the
  gate just cleared and the one ahead in the gate's own colour, the storage gained over
  the new balance, and a chip row for answers right, streak and any audit that fired.
  The title reports the close and only the close ("Pallet cleared", "cleared, thin",
  "holds", "perfect"); the swatch is the window's separate prize (ADR-080), so it
  arrives as a **swatch earned** chip and fills the hero square only where all five
  landed. The track beside it fills the gates the run played clean, never the gates it
  merely walked past, and draws the gate in hand open. Under it sit **four panels,
  all shut by default**: coverage by category, storage bonus, build changes and the
  five answers. Each states its own tally on its strip — "4 categories · +62.4%",
  "3 payouts, 1 bill · +208 KB", "1 unlocked · 1 faded", "4 passed · 1 failed" — so the
  screen is readable without opening anything, and opening one is a choice to see the
  arithmetic. Answers read as a test runner: **PASS / PART / FAIL** as words, never
  a tick. The footer leaves for the shop and says how long it stays open.
- **Poll review**: a test-runner reporter. One **fold per poll**, wearing the same panel
  chrome the reward report's panels do, its strip reading PASS / PART / FAIL badge, the
  question, the category and the coverage earned. Fumbles open on arrival and passes stay
  folded and dimmed, and the header carries an **open everything** press for reading the
  lot. An open row is an assertion diff, **Expected** over **Received**, every option
  carrying its letter on round chips for single-answer polls and square ones for
  multi-answer — the same shapes the poll screen's keycaps wear, so the review mirrors
  what you answered with. Expected always reads celadon and
  Received wears the outcome, so the two sides share a colour only when you were right.
  Multi-answer polls close with a tally of catches and misses; untouched options fold
  behind "7 other options"; the snippet and explanation sit with the diff.
- **Answering by keyboard**: each answer row carries a letter, and pressing that letter
  picks it. **Enter submits**, but only once something is picked, which is the same rule
  the submit press follows. The tip under the answers names Enter only while Enter will
  do something, so it never advertises a key that is inert.
- **The byline**: the line under a poll credits its author with their GitHub photo
  wearing the avatar border they have equipped ([6.5](#65-borders-and-seasons)), their
  handle, and their title when they hold one ("@matthijsgroen · Poll editor"). Titles
  come from the account role: **Poll editor** and **Admin**; an ordinary player has
  none. With no photo on file the handle's first letter stands in.
- **Run over**: the whole climb reported once, on the same screen whether the run died
  or summited. A death turns the screen red and titles itself **Run over**; a summit
  keeps the Champion's colour and reads **The climb is done**. Under the header (the
  gate it stopped on, the swatches it earned, how many gates of thirteen it held) sit
  **coverage** (the closed bar, the units held against the run's window, and how far
  short of its line it landed), **gate by gate** (one row per gate with what each of its
  five polls paid, the best gate flagged, totalling to the run's score), **by category**
  (right answers per category across the whole run, best and leak flagged), **the build
  at the end** (the configs held, the rung's bill, and what upkeep cost across the
  climb), **storage** (what banks, what burns), and **unlocked** (swatches kept, configs
  registered, and the build and balance that do not carry forward). It exits on
  **Start new run**, with the community board beside it.
- 🟡 **Learn Home**: a Duolingo-style path/hub planned as both the start point and the
  "no polls left today" destination (DVTD-jhgg).

---

## 9. Glossary

| Term | Meaning |
| --- | --- |
| **Run / Climb** | One playthrough, spanning multiple real days. |
| **Gate** | A checkpoint auditing a 5-poll window: its coverage demand plus its audits. |
| **Gate number** | Counts from 0: a run opens on gate 0 and summits on gate 12. |
| **Gate meter** | The run's coverage, the only score a gate judges. Cumulative: units banked over every slot the run has opened. |
| **Audit** | A rule a gate carries (a mirror, a leak, a clock, a shut shop, a config knocked offline). Drawn from a staged pool on the day, then stated on the stake receipt; the count grows with depth. |
| **410 Gone** | An audit that deepens the peel: Elite takes 5 configs on a miss, Champion 6. |
| **Peel** | What a missed gate takes: configs of your choosing, before the same gate runs again. |
| **Build** | Your active setup: the track of config slots. Shown as **Your Build**. |
| **Slot** | One unit of room in the build, also called weight. A config takes as many as its size says: 1, 2, 4, 8, 12 or 16. Four are free; the rest are rented by the gate. Opens no gates. |
| **Minify** | Halving a config's slots and its bonus, one way. |
| **Config** | An installable dev-tool item: an effect with a price, demanding nothing. |
| **Coverage** | The score: a percentage per category plus a run total (career), and the gate meter (per attempt). In fiction: **knowledge coverage**. |
| **Storage** | The in-run currency, in KB. Nothing caps what you can hold. |
| **Build space** | The room the run rents, always a rung of the ladder: 4 free, then 6, 8, 12, 16, 24, 32. The rung held is a hard cap on the build's weight. |
| **Build space ladder** | What each rung bills a gate: free, 16, 32, 64, 128, 256, 512 KB. Charged on the rung held, not the weight used. Fall behind and the run drops to the widest rung it can afford. |
| **Archived storage** | Persistent cross-run storage: the meta-progression currency. |
| **Faucet** | Any per-correct-answer storage income (for example IndexedDB). |
| **Draft / Rebuild** | Buying a shop config / re-rolling the offer at a doubling cost. |
| **Lint** | Paying a fee that doubles across the gate to disable one wrong option (needs a linter config). |
| **Peek** | Paying an escalating fee to see how the community voted (needs Telemetry). |
| **git tag** | A shop-bought cross-run checkpoint, priced by the gate it marks, burnt by the run it rescues. |
| **Seed** | The shared per-day poll sequence every player climbs. |
| **Segment** | One day's 5-poll chunk appended to a persistent run. |
| **Swatch** | A gate's collectible badge (Pallet to Champion), earned by answering its 5 polls right and kept across runs. Its colour themes the app while that gate is played. |
| **Kanto colours** | The palette, keyed to gates via their swatches, never to categories. |
| **The Dex** | The collection screen, titled Dex Registry (Polls, Configs, Audits, Swatches, Runs). |
| **Water-cooler moment** | The design north star: same polls, same day, compare answers. |

---

## 10. Numbers reference

Every number above lives in code; this is the constant sheet, grouped by where it
applies. `rules.model.ts` holds most of it.

**The run**

| Constant | Value |
| --- | --- |
| `SLICE_WINDOW` | 5 polls per gate window, so per day. A **window** is always these five; the **slots** a score is measured against are cumulative (`scoringSlotsAt`) |
| `VICTORY_GATE` / `GATE_COUNT` | 12 / 13 (gates 0 to 12) |
| `HEALTHY_LADDER` | 5 / 10 / 15 / 20 / 25 / 30 / 40 / 50 / 60 / 70 / 80 / 90 / 95 % (`coverageRatio.model.ts`) |
| `OK_DROP` / `SHAKY_DROP` | 10 / 20 points under the gate's healthy line, both clamped at 0 |
| `failPeelShareFor` | 20% / 20% / 20% / 25% × 4 / 30% × 4 / 35% × 2 of the occupied slots, plus strip audits; capped at half the build before gate 3 |
| Audit roster | Fifteen rules: 1 audit from gate 3, 2 from gate 8, 3 from gate 11 |
| Audit pools | A 6 (gates 4-7, draw 1) · B 13 (gates 8-10, draw 2) · C 9 (gate 11, draw 2 beside 410) |
| Audit dials | 402 ×2 · 507 16/32 KB · 408 3×30 s / 3×25 s / 5×20 s · 410 +10/+15 · 429 1 action · 413 8 KB a slot past 12 |

**Scoring**

| Constant | Value |
| --- | --- |
| `BASE_UNIT` | 1 unit a correct answer, flat at every gate (ADR-073) |
| `SINGLE_CREDIT` / `MULTIPLE_CREDIT` | ×1 / ×2 by poll type, on coverage only (ADR-081) |
| `scoringSlotsAt` | `5 × (gate + 1)`, the denominator: every slot the run has opened, 5 at Pallet to 65 at the Champion |
| `STREAK_UNIT_STEP` | +0.1 units flat on every correct answer after the first in a window. Added after the multipliers and never multiplied by them |
| `streakStepGrowth` / `MAX_STREAK_UNIT_STEPS` | `.reduce()` +0.25 a step, climbing with the streak and replacing the flat one / clamped at 4 steps, a clean window's worth (ADR-090) |
| `coverageAdd` / `cacheHitStep` | Code Coverage +0.1 units a correct answer · Cache +0.25 units a cached hit, capped at 4 hits (one unit). Flat, added after the multipliers (ADR-083) |
| `minifiedUnits` | Halves a coverage add when a config is minified. `minifiedAmount` floors and is for whole KB only |
| `STREAK_COVERAGE_BONUS` | 0.1 per consecutive correct answer, capped at 10 steps (×2). Multiplies the gate's KB payout, not the meter |
| `gateRewardMultiplier` | `gatesCleared + 1` (×1 to ×12) on the KB reward only, frozen while a gate is redone |
| Focus payout / upgrade gate | `1 + 0.25 × level` / `5% × level` career coverage |

**Storage**

| Constant | Value |
| --- | --- |
| `GATE_REWARD_KB` / `GATE_REWARD_MULTIPLIER_CAP` | 32 KB base / stops scaling past ×12 |
| `gateClearPayout` | `32 × (gate + 1) × reward mults × (correct ÷ 5)`, plus flat clear payouts |
| `BUILD_SPACE_RUNGS` | 4/free · 6/16 · 8/32 · 12/64 · 16/128 · 24/256 · 32/512 KB a gate, billed on clear against the rung held rather than the weight used |
| `upkeepForSpace` | resolves the highest rung at or below the space held, so a run saved under the old slot ladder still prices |
| `FAUCET_CAP_KB` | 320 per run |
| Archived-storage credit | 1 / `gates ÷ 13` / 0 for victory / death / abandon |

**Build and shop**

| Constant | Value |
| --- | --- |
| `BASE_SLOTS` / `BUILD_SPACE_FROM_GATE` | 4 — the free width every run opens on · 2, the gate the ladder opens at |
| `HAND_SIZE` / `RECOMMENDED_SIZE` | 5 dealt at run start (seeded) · 2 marked as advice, none preselected (ADR-052, amended by ADR-057) |
| `FOCUS_BAND` / `PAIRABLE_PICKS` | 1–2 focus configs per hand, count varying by seed · the smallest 3 dealt configs must fit `BASE_SLOTS` together; nothing above the budget is dealt (ADR-062) |
| `STARTER_POOL` | the 8 configs granted at signup, stand-in for the account's pool until DVTD-p9ah |
| `highestAffordableSpace` | the widest rung a balance covers; an unpayable bill drops the run to it |
| `CONFIG_SIZES` | 1 · 2 · 4 · 8 · 12 · 16 slots, halved by minify (a 1-slot config cannot minify) |
| `DRAFT_SIZE` / draft cost / sell refund | 5 offers / `32 KB × slots` / `floor(cost ÷ 2)` |
| Rebuild / `LOCK_COST_KB` / Extend | 4…512 KB doubling / 16 flat / 48 then 96 |
| Control staging | Lock requires yarn.lock in the build (ADR-054); Extend from gate 3 (`draft.model.ts`) |
| `pinCostFor` | 128 KB at gate 4, +64 per gate, 512 at gate 10; stipend 32 KB × gate |
| Lint / peek fees | 8…256 KB per poll / 32…512 KB per gate |
| Max config level / upgrade cost | 5 (Telemetry and git rebase -i 2) / `32 KB × (level + 1)` |
| `UPGRADE_OFFER_ONE_IN` | ~1 shop in 8 rolls an owned config's next version into the registry, at registry price, no coverage gate (ADR-053) |

---

*Sources: the `.beans/` story corpus, `docs/adr/`, `docs/brainstorm/`, and the
`src/modules/run/` model files, canonical for all numbers.*
