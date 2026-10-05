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
`.js`, Linter, Copilot) decides how richly each correct answer pays, while your
**gates** decide what the run demands of you.

It borrows from roguelites without being one. It takes: run-based structure, builds
assembled from collectible items, escalating stakes, and meta-progression that
outlives a run. It leaves behind procedural generation (polls are hand-written and
the daily seed is shared by every player), session-length play (a run spans calendar
days, one gate per day), and permadeath as the default (an ordinary miss costs a
peel and hands the run back; only a DANGER close ends it).

The point is a daily learning ritual that happens to keep score: short polls spark
curiosity and hand you a topic to dig into afterwards.

### 1.2 The two loops

- **The daily poll**: one shared poll per calendar day, a few-minutes social ritual
  built for comparing answers with colleagues.
- **The run**: the opt-in campaign that draws polls from the bank. This is the heart
  of the game.

### 1.3 Inspirations

_Balatro_ (configs as Jokers, the equation reveal), _Banjo-Kazooie_'s Furnace Fun
(rhyming trivia), _Pokémon_ Gen 1 to 3 (the Kanto palette, the Dex), _Stardew Valley_
(bundle-style unlocks), _De Slimste Mens_, Wordle's daily ritual, and Advent of Code.

---

## 2. The run

### 2.1 Shape of a run

A run is a multi-day climb through numbered gates. Each calendar day one shared
**daily seed** hands every player the same 5 polls: **1 gate = 1 day = 5 polls**.
Answer them and the run locks until tomorrow, when a fresh 5-poll **segment** is
appended. A segment never repeats a poll the run has already answered: such a poll is
replaced by the next one in that day's own shuffle of the poll pool, so everyone who
needs a replacement that day gets the same one, and every day still deals five.

Runs persist across days and never expire; a partly answered gate fills up across
the day boundary, and yesterday's unplayed polls are dropped rather than failed. The
hub's press says so once a day is part-answered — "3 of today's 5 left · they do not
carry to tomorrow" — because stopping early is a choice, not an accident, and the
forfeit used to be silent. The hub (ADR-147) leads with a strip (run number, gate, balance);
the other run screens leave the run number and gate to the hub and carry the swatch track and balance in the nav (ADR-183). The nav names that balance **run** beside its figure (`💾 run 462 KB`), because the profile menu and the border shop state the other wallet, **archived** storage, on the same pages. Under the hub strip sits the press: **Continue to <gate>** while polls are ready, **<gate> opens in Xh Ym**
once the day is spent, when the shop becomes the live press. With no run open, a spent day reads **New polls in Xh Ym**
instead of a start press: whether the day is spent is counted from every poll the player answered today, across all runs, never from one run's list. Under it, **Run so far**
lists each closed gate's grade and earned KB and projects the next gate (**not started** until its first poll is answered), and **Build**
lists the installed configs with the weight still free. A flawless summit takes 13 calendar days, and every gate held in SHAKY
adds one, because the retry waits on tomorrow's polls.

Where a locked run parks depends on the phase (ADR-032): mid-gate it redirects to the
[community board](#7-community); after a cleared gate it parks on the **prep page**,
with the shop a click away and the start-gate button wearing the countdown to
midnight. A new run reaches prep too, between the build it was dealt and its first
five polls, so no gate is entered without its stakes stated (ADR-078).

You can **abandon** a run and start fresh the same day, once the shop's **kill -9**
service is yours (earned by clearing gate 5, ADR-115 D11; two presses). The new run
serves only polls you have not answered yet, and abandoning banks nothing.

### 2.2 Gates

A gate deals a window of 5 polls. Its one demand is the **coverage meter**, and the
meter reads **this gate only** (ADR-161): the window's output over the gate's own
**codebase**: 5 scoring slots at Pallet up to 10 at the Champion
([2.8](#28-what-unlocks-when)). The codebase is a balance divisor and the player never
sees it: every screen states coverage in percent and gains in points, a right single
+20% at Pallet down to +10 at the Champion (ADR-171).

The window's output is its polls' units **times an accuracy multiplier**,
`1 + accuracy bonus`, and **the run carries the bonus** (ADR-181). Each poll offers its
credit (a single 1, a multiple 2, every poll 1 under 207) and earns its share of it;
a window moves the bonus by `0.08 × share − 0.04 × (1 − share)`, never below 0. Over five
singles that is +0.016 a right answer and −0.008 a miss, so the bonus grows slowly and
is hard to lose: a perfect Pallet multiplies ×1.08, and a flawless run reaches ×2.04 at
the Champion. There is no top. A skip moves nothing. The bonus is only kept when the gate
clears: a held gate's window, and its delta, are thrown away. Each gate's codebase is
sized to the output a flawless bare player brings to it, `floor(5 × (1 + 0.08 × (gate +
1)))`, so knowing every answer always fills the bar. No config touches the bonus, so a
build amplifies what you know and never replaces it. The mix stays hidden: the
multiplier is only stated once it is known (all five answered, or Prefetch v2 / `git
rebase -i` v2), and the live bar reads the guaranteed floor: the multiplier as if every
poll still ahead were a missed multiple, so it only rises and reads what the close pays
on the fifth answer. The poll screen draws it as one **accuracy bar** from ×1 to the next
whole multiplier above the best case: solid to the multiplier the window is sure of, faint
to the best case still open ("×1.3 · up to ×1.34", ADR-170).

The bar caps at a full codebase. Overshoot pays `KB_PER_EXTRA_BAR` for every full bar
past the demand, and a tenth of it (`HEAD_START_SHARE`) opens the next gate as a head
start, never more than that gate's floor, so a head start alone can only read SHAKY and
never clears; nothing else carries. The poll screen's bar reads the percent like every other
bar, and its lead line counts the units against the slots (ADR-156); the debrief
names the slots ahead, and prep's Scoring says what a right
answer adds there. A failed attempt keeps the head start it opened
with, so a retry replays the window against the same demand.

Configs demand nothing ([4.1](#41-what-a-config-is)): all friction lives on the gate.
A bare build never clears, which is why sell and drop refuse your last config.

**Gates count from 0.** A run opens on gate 0 and summits at gate 12. Clearing a
gate moves the run on; a close at 100% coverage (a full
bar, PERFECT) awards that gate's **swatch** ([6.3](#63-swatches), ADR-170).

Nothing is decided until the window's 5th poll is answered. What happens then is
the **band** the meter closes in: PERFECT, HEALTHY and OK all clear the gate
(at the Champion only HEALTHY or PERFECT do, ADR-159), SHAKY holds it and owes a peel, and DANGER ends the run.
Coverage alone decides: no count of right answers is asked (ADR-161 §6).
[2.6](#26-how-a-gate-closes) owns that rule and prices every exit.

**Farming is priced out, not forbidden.** The payout scales with window correctness
(`32 KB × (gate + 1) × correct ÷ 5`), so a low-effort clear banks little, and a
low-effort attempt rarely meets the meter at all.

⚪ **Boss gates** (every 5th gate, two requirements AND-ed, no reroll) are parked.

### 2.3 Audits

An audit is a rule a gate carries, stated on the stake receipt before you walk in.
**The count is the curve**: gates 0 to 2 carry none, gates 3 to 7 carry one, 8 to 10
carry two, Indigo Elite and the Champion three. A gate draws
that many from its tier's pool, **seeded on the date**, so everyone climbing today at
gate 6 meets the same gauntlet (ADR-138).

**What a rival changes.** A rival's incident **replaces** one of the audits your gate
drew — it never adds to them. Gate 8 normally draws two; if someone files an incident,
one of those two becomes the audit they sent. It takes the seat of the drawn audit it clashes with, or else the last one drawn, and the rest of the day's draw stays put; an incident the gate already drew changes nothing. The gate's readable limit never moves:
rivalry changes _which_ problem you face, not how many rules are piled on you.

**How one reaches you.** From gate 3, one shop in three deals a single **revealed**
incident at the Incident desk — which gates deal one changes daily, and is the same
for everyone climbing that day. It costs **32 KB**; **Refresh** deals another and
doubles its own price for the rest of that shop, starting at 8 KB. You hold one at a
time, and buying while holding replaces it. Every incident sent is storage you did not
spend on your own build — that trade is the whole decision, and nothing is handed out
for clearing a gate well.

You file it from a climber's card on the community map, against anyone who stands at
your gate or ahead, last **cleared** HEALTHY or better, still has room at the gate in
front, was not your last target, and whose next gate's pool **contains the audit you
bought** — a cheap audit has a shorter reach. **You may only file from a gate that
could be filed at in return** (ADR-105), so nothing is sent from gates 0 to 2.

It sits queued until that rival clears the gate they are in, then locks into the gate
in front, up to its capacity and never two of one family, and their receipt names the
audit and who sent it before they walk in. Surviving a rival's incident pays **32 KB**
on the clear; the gate's own drawn audits pay nothing extra, and nobody earns anything
from a death. Every incident filed today is public on the community board, your own
rows ringed. A missed gate keeps its audits on the retry, though whatever an audit
picks (which config goes offline) rolls again.

Every audit is named for the HTTP status it behaves like, and the class carries the
signal: **4xx means the rules changed on you**, **5xx means something on your side
broke**.

| Audit                                 | What it does                                                                                                                                                                                                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **207 Multi-Status**                  | Every poll arrives as a select-all and never says whether it really takes one answer or several. Grading is unchanged — a true single still wants exactly its one answer, and a second pick cancels it — but nothing pays the select-all premium: every answer is credited as a single. |
| **300 Multiple Choices**              | Every poll asks for the **incorrect** options and wants all of them, so a single-answer poll with four options becomes a three-option select-all. Graded normally after that, so streaks and partials work and the gate charges full price.                                             |
| **402 Payment Required**              | Every paid action costs ×2, linting and peeking both.                                                                                                                                                                                                                                   |
| **403 Forbidden**                     | No paid actions at all: the linter and the peek are gone.                                                                                                                                                                                                                               |
| **404 Not Found**                     | No poll names its category, so which of your configs is about to pay is yours to work out.                                                                                                                                                                                              |
| **405 Method Not Allowed**            | The shop _before_ this gate is read-only: nothing bought, sold, upgraded or switched.                                                                                                                                                                                                   |
| **408 Request Timeout**               | The window's first polls are on a clock; an answer over the limit scores as a miss whatever you picked.                                                                                                                                                                                 |
| **409 Conflict**                      | Your highest-version config takes a breaking change and is switched off for the attempt.                                                                                                                                                                                                |
| **410 Gone**                          | Deepens the peel: 10 points at Indigo Elite, 15 at the Champion.                                                                                                                                                                                                                        |
| **413 Payload Too Large**             | Every slot past the 12th leaks 8 KB a poll, so a wide build pays to carry itself.                                                                                                                                                                                                       |
| **424 Failed Dependency**             | One config is offline for the whole attempt.                                                                                                                                                                                                                                            |
| **425 Too Early**                     | Your configs do not contribute to the window's opening poll. That poll's ordinary base credit still scores, so an opener build such as Overclock loses its one big answer and still pays the throttle that bought it.                                                                   |
| **426 Upgrade Required**              | Your lowest-version config goes out of date and sits the attempt out.                                                                                                                                                                                                                   |
| **429 Too Many Requests**             | One paid action for the whole window: the linter or the peek, not both.                                                                                                                                                                                                                 |
| **451 Unavailable For Legal Reasons** | The window's first 3 polls arrive with 2 answers redacted as `?????`. A redacted answer is still pickable; 4 KB buys one back.                                                                                                                                                          |
| **500 Internal Server Error**         | The coverage meter, the band beside it and the gate's units row go dark for the window's first 4 polls and come back for the fifth. Scoring is unchanged; you simply answer without knowing where you stand.                                                                            |
| **502 Bad Gateway**                   | One config flakes on every poll, rolled fresh each time.                                                                                                                                                                                                                                |
| **503 Service Unavailable**           | A different config is down for each poll of the window.                                                                                                                                                                                                                                 |
| **507 Insufficient Storage**          | Storage leaks every poll: −16 KB, −32 KB on a miss.                                                                                                                                                                                                                                     |
| **510 Not Extended**                  | Every upgraded config runs at v1 for the attempt. Nothing goes offline; the versions you bought simply do nothing, and a build you never upgraded shrugs it off.                                                                                                                        |

Three audits take a config without taking it offline. **425** takes the whole build for
one poll, **510** takes every version the build bought for the whole attempt, and **500**
takes nothing at all — only the reading. A build with no upgrades shrugs 510 off the way a
narrow build shrugs off 413, and an attacker can tell in advance, since builds are open.

The five offline audits differ only in which config they take and for how long. Three
roll at random (seeded, so a reload never re-rolls one); 409 aims at whatever
you levelled furthest and 426 at whatever you levelled least. Whatever is down reads `offline` on the build track while you
answer, struck through and blamed on the audit by name, and nowhere else, since shop
and prep sit before the gate and naming a casualty early would be a spoiler. The one
exception is paid for: with **npm audit** installed, prep names the config each outage
will take offline (ADR-158).

Two audits tighten with depth rather than repeating: **408** clocks 3 polls at 30s
below gate 10, 3 at 25s at gates 10 and 11, and 5 at 20s at the Champion; **410** adds
10 points to the peel at Indigo Elite and 15 at the Champion.

A gate never draws two audits that do the same job, so 402/403/429 never stack, and no
two of the five offline rules share a gate. Nor do any two of **207, 300, 404 and 451**, which
all attack the same reading step. **300 never draws with 408**, since a timed-out answer
voids the mirror rather than beating it. 451 _can_ share a gate with 403: the freeze takes
the linter and the peek, never the buy-back, because a seal you are forbidden to read is a
trap rather than a rule.

**207 hides the answer type without changing the answer.** The disguise is presentation
only: the poll is graded against its own key, so a true single is still right on exactly
one pick and wrong on two. What it costs you is the premium — a select-all normally pays
double, and under 207 it pays the same as a pick-one, because a difficulty you were never
shown is not one you can be rewarded for aiming at. Prefetch v2 and `git rebase -i` v2 keep
naming the types outright, and **.length** will join them once its reveal reaches the poll
screen: the gate's total correct count tells you how many of the five polls are really
singles.

**451's redaction is blind to correctness**, so `?????` is never a tell: which answers are
sealed is drawn from the poll's identity, never from which one is right. The linter will
not touch a sealed answer either — crossing it out would say it is wrong for half the price
of reading it — so a sealed answer becomes lintable only once it is bought back.

Pools in [2.8](#28-what-unlocks-when), roster in `audit.model.ts`, pools and families
in `auditSchedule.model.ts`, reasoning in ADR-035/038/056.

### 2.4 Polls and categories

A poll has a question, 3 to 20 options, and an explanation shown after answering.
Code lives in the question: backticks render inline code and a fenced ```js block
renders a highlighted panel; the older separate code block is a legacy column that
still renders where a poll carries one (ADR-137). Answer types are **single** (pick exactly one) and **multiple**
("select all that apply"). Harder polls pay more coverage
([2.5](#25-coverage-scoring)). The bank holds ~475 published polls, so a poll you have
seen can reappear in a later seed.

Polls **rhyme**. Questions are short verses in the spirit of Furnace Fun: _"Don't ask
me why these polls all rhyme, getting the last 2 items of this array, how do you
adjust the following line?"_ Nearly all are hand-crafted by the developer, with ~10%
contributed by colleagues.

Every poll belongs to one of **12 categories**: JavaScript, TypeScript, CSS, HTML,
React, Vue, Git, Java, Python, Ruby, General Frontend, General Backend. Categories carry
**no colour of their own** (ADR-020); they wear the neutral badge, which follows
whatever screen it sits on. The Kanto palette belongs to the gates ([6.3](#63-swatches)).

Every category carries two **living records**, both bounded to a single run: the
longest streak of correct answers in it, and the most correct answers in it
(ADR-131). Whoever holds one is that category's **leader**. The rules live in
[7.3](#73-category-leaders); the poll screen states the streak one
([8](#8-interface)).

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
([4.4](#44-upgrades)) — they gate no gate.

A correct answer earns `base × share × credit × mults × pool + adds`:

| Term     | Value                                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `base`   | **One unit**. Flat: the gate number and the option count do not touch it (ADR-073). What a unit is worth as a percentage depends on the gate; the arithmetic is in `coverageRatio.model.ts`.                                         |
| `share`  | The fraction of the answer key that landed. 1 for a single-answer poll answered correctly, and one of three rungs for a partial (ADR-079).                                                                                           |
| `credit` | **×2 on a multiple-choice poll**, ×1 on a single (ADR-081). The one term the poll type sets.                                                                                                                                         |
| `adds`   | **Flat units**, added after the build's multipliers and never amplified by them (ADR-083); the gate's accuracy multiplier still scales them (ADR-172 §4). Code Coverage +0.1 a correct answer per version; Cache +0.25 a cached hit. |
| `mults`  | Product of the multipliers that compound: Focus ×1.25 at v1, the opener and throttle terms, Regression Test, Vite (ADR-172).                                                                                                         |
| `pool`   | **The all-coverage bonuses add, then multiply once**: 1 + Σ(N − 1). AGENTS.md ×2 with Intellisense ×1.5 pays ×2.5, not ×3 (ADR-172). Never below 0.                                                                                  |

**The streak pays nothing by itself.** ADR-169 removed its +0.1 unit step and ADR-169's
2026-10-02 amendment removed its KB multiplier: the accuracy multiplier already pays
for right answers. The run still counts it, because configs read it (`&&`, Dependabot,
Cache) and the records board ranks it. A gate clear resets it; a held gate does not
([2.6](#26-how-a-gate-closes)).

**A poll can be skipped** (ADR-169), but **the poll screen offers no Skip press for
now** (2026-10-03): a player could not tell when a skip beats an answer. The rule
below stays in the reducer so the press can return. A skip covers nothing and is left out of the
accuracy multiplier: it adds to neither what the window earned nor what it offered,
so four right and a skip move the carried bonus like a perfect window (ADR-181). It breaks the streak, the `&&` chain,
Cache's run and Dependabot's count, writes no poll response,
and still spends one of the day's five polls. A poll approved for LGTM cannot be
skipped.

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
`Math.ceil()` is the one config that acts on those two half-units, topping a
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
timeout takes half a unit off the gate's own tally. The wager sits in the gate's output, so the accuracy multiplier scales it either way. It disarms after every answer, so
every poll is wagered on separately, and the gate can never fall below zero units. It
is the only thing in the game that moves the meter down (ADR-089).

Example, gate 2, a single-answer CSS poll with `.css` installed:
`1 unit base × 1.0 share × ×1 credit × 1.25 mults` = **1.25 units of CSS coverage**.
The same poll as a select-all, fully answered, pays 2.5. The **receipt**
(ADR-084, ADR-095) states that as the rows it is: the base the answer itself paid, one
row per config that contributed (and, on answers saved before ADR-169, the streak step), and a `paid`
total. Every row states the units it added, so the column sums to the total it closes
on; a multiplier keeps the factor it was sold at (`×1.25`) as a tag beside its name and
states the units that factor produced (`+0.25`) as its figure. It is read on the chip
that paid it on the gate result, so any poll in the gate explains itself, not only the last one answered. Anything the answer changed beyond its coverage
follows underneath, one line ("streak lost · your next correct answer starts at ×1.0").
Meanwhile every config in the build says what it is worth on the poll in hand: `×1.25
here` while it is paying, `idle this poll` or `JavaScript or TypeScript only` while it is not. When the
answer lands, the configs that paid **flash**; if the build is folded away, the folded
bar flashes instead, so the cause arrives with the figure either way. A miss keeps the
track silent: configs never touch losses, so the loss reads once, on the paid line.

**How an answer is given** (ADR-175). A single-answer poll answers on the tap: press an
option, or its letter, and it is sent. There is no Lock in to confirm it, so a misclick
costs the answer. A multi-answer poll collects picks and asks for **Lock in** (or Enter),
because only the player knows when the set is complete. The poll's number rides on a
swatch at the front of the card's top line, and a keyboard tip (`press a letter to
answer`, `press letters, then Enter`) sits at its right end for a mouse or trackpad
only.

**How an answer lands** (ADR-170). A right answer lights its option green, pulses the
**accuracy bar** under the coverage bar, and flies its gain (`+20%` at Pallet) into the
bar, which moves when it lands. A wrong answer turns its option cinnabar, marks the right
one, and shakes the card. Each answered option rings and glows once in its verdict colour and
its ✓ or ✗ pops in. The poll screen then moves on by itself: 650ms after a right
answer, 900ms after a wrong one, but a right answer whose gain chip is flying waits
for the chip to ride into the bar first (at most 3s): the card slides away left for
the last 180ms of that hold, the next poll slides in from the right and deals its options in one by one, and
two or more right answers in a row in the gate pop **2 in a row!** over the card
(DVTD-yp24). With reduced motion none of it moves. The bar is a dim band ladder with a lit copy clipped to
the reading. The accuracy bar states the multiplier as a range, sure to best, both read
with every unseen poll a multiple, so the sealed mix never shows.

Scores carry **two decimals** wherever they are shown. `.js` pays 1.25×, and rounding
that to a single decimal is what used to make a correct JavaScript answer read as an
unexplainable "1.3".

Category coverage past 100% rolls over into **levels**: 110% in JavaScript reads as
"L2". Mastery keeps counting instead of capping.

### 2.6 How a gate closes

A gate resolves on the **band** its coverage meter closes in, not on a single
threshold (ADR-076). The lines are a share of the gate's codebase, one row per gate
(ADR-161, retuned by ADR-181): forgiving early, hard late. Pallet has no DANGER and
SHAKY runs to 52%; at Indigo Elite DANGER runs to 76% and SHAKY and OK are six points each; the
Champion asks 90% for HEALTHY. `PERFECT` is a full bar at 100%. Pallet has no floor to fall under
and draws four bands; every gate from Pewter draws all five.

**Coverage alone decides the gate.** The window minimum of ADR-157 is gone (ADR-161
§6): a rule counted in right answers is one no config can touch, and it stopped binding
by the middle of the run. A carried head start is capped at the gate's floor, so it can
never clear a gate by itself. A close recorded under the old rule still reads "the
window came up short". Live numbers are `GATE_RUNGS` in `coverageRatio.model.ts`.

| Band                                                                                     | The gate                                             | The swatch | The streak | The payout                  |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------- | ---------- | --------------------------- |
| **PERFECT** — a full bar                                                                 | Cleared                                              | Won        | Reset      | Full, times `PERFECT_BONUS` |
| **HEALTHY** — at or over the line                                                        | Cleared                                              | Not won    | Reset      | Full                        |
| **OK** — under the line, down to the gate's OK line (20% at Pallet, 74% at the Champion) | Cleared, thin; **held** at the Champion (ADR-159)    | Not won    | Reset      | Full                        |
| **SHAKY** — down to the floor (none at Pallet, 65% at the Champion)                      | **Held**: pay the peel and retry, or refuse the gate | Not won    | Carried    | Nothing                     |
| **DANGER** — under the floor (Pallet has none)                                           | **The run ends**                                     | Not won    | —          | Nothing                     |

**The swatch is the full bar** (ADR-170, superseding ADR-080's flawless window).
Reaching 100% coverage mints it, the head start and config coverage
included; five right that leave the bar short do not, and four right that a
head start carries to a full bar do. A flawless window keeps one job: it is
**clamped** to SHAKY at worst (`closingBandFor`), so five right answers can hold a
gate but can never end a run, whatever the meter reads.

**The streak column is the engine's, not the band's.** Every clear resets the
streak after its payout is read; a held gate leaves it alone, so an unbroken
streak carries into the retry. **OK costs nothing today.** ADR-076 designed a thin
clear to be paid `coverage ÷ the gate's line`, but that cut is **designed and not
built** (DVTD-tjc7), and every clearing band pays the same KB. The one thing that makes a better band worth more is **SLA**
([4.3](#43-roster)), which pays a percentage on a band you promised in advance.

**A shaky gate is a choice, and both exits are priced on the debrief.**

- **Pay the peel and retry.** The peel is a quota of your occupied slots: 20% at
  the early gates rising to 35% from Indigo Elite, never more than half the build before
  gate 3, and +10 or +15 points on top wherever the gate carries **410 Gone**.
  **Every retry at the same gate peels half again as much** (`escalatedPeelShare`),
  so a 20% share bills 30% on the second attempt and 40% on the third: a gate you
  keep failing gets more expensive, not less. It is billed in KB at half a slot's
  draft price, and the two ways to pay compose: drop configs, then let storage
  settle whatever those drops left owed (ADR-126). The archive never pays a peel
  (ADR-112). Sizes are whole numbers, so a build that cannot match the bill
  exactly overpays and the remainder is gone — storage is how you buy exact
  change, while the balance lasts. Dropping refunds nothing beyond what it
  settles, unless **Garbage Collection** ([4.3](#43-roster)) is installed, in
  which case every dropped config also refunds its sell value. Then the normal
  post-gate loop runs (review, shop, prep, 5 fresh polls) and the meter starts
  over. Coverage and storage survive.
- **Refuse the gate and end the run.** The climb banks as if you had died there:
  `gatesCleared ÷ 13` of the leftover storage goes to the archive. The run is over
  and nothing is owed. This is not abandoning, which banks nothing, because the
  gate has already been answered and failed, so there is no attempt left to duck.

**A held gate pays no gate reward**, no interest and no extra-pick KB. The
faucet KB earned inside the window is the retry's whole budget — _unless the
build holds **Database**, whose KB is escrowed rather than earned and is rolled
back by the same close (ADR-091), leaving the retry to pay its peel in configs_. **Planning
Poker** is the one config that pays regardless, since it settles a prediction
rather than rewarding a clear: a bet the window met pays its coverage units
whether the gate cleared or held. The recurring bills collect on a clear only, so a retry is free of
them.

**Every attempt burns 5 of the day's finite sequence**, so a retry costs real
time, and audits charge again: 507 leaks every attempt, a 408 re-clocks, an
outage re-rolls.

**Death is a DANGER close.** The peel no longer runs a build to nothing, because
refusing the gate is always available to a player who cannot pay. Both the
survival floor and the healthy line are on the stake receipt before you answer,
the fatal one in red.

The bands above read `coverageRatio.model.ts`, the one live engine (ADR-073).

**The close plays before the result.** A short reveal plays over the result screen,
one of five: cleared (HEALTHY or OK), PERFECT, SHAKY (any hold but the catch),
caught (a catcher held a run-ending gate) and run over. The close decides which one:
`fatal` plays run over, a hold by the catch plays caught, any other hold plays SHAKY,
and a clear plays PERFECT or cleared by its band (`outcomeReveal.model.ts`). It plays
once per close in a session, a tap or Escape skips it to its last frame, and reduced
motion shows only that frame. It states nothing the result screen does not.

### 2.7 Victory and run end

Clear all **13** gates (0 through 12) to win. A run ends four ways (ADR-076): the
summit, a gate closed in DANGER, refusing a gate held in SHAKY, or abandoning.

Leftover storage is credited to **archived storage** in proportion to the climb:
victory banks **100%**, death banks **gatesCleared ÷ 13** (die having cleared 6, keep
46%), refusing a shaky gate banks the same as death, and abandoning banks
**nothing**, so walking away mid-gate is never a cash-out. A tag-rescued run
([5.2](#52-the-shop)) banks only the gates it actually climbed.

**The victory reward** (ADR-184): a win from Pallet enters the **Hall of Fame** on the
community board ([7.1](#71-the-community-board)) and grants the **Champion border**
([6.5](#65-borders-and-seasons)). A run a git tag checked out higher still banks its
credit but is not entered, so the reward cannot be had by climbing two gates. The
Champion gate wears prismatic accents: its lit coverage, its start press and its panel
glyphs carry the Kanto gradient over the usual dark ground.

🟡 Continue-past-victory is confirmed but unbuilt: the gates past the summit are named
**Champion+1, Champion+2, …** (DVTD-yzyg).

**Balance baseline.** A bare build earns one unit a right answer, times the accuracy
the run has carried (ADR-181). The guard is `runAction.model.spec.ts`, which plays whole runs
through the real reducer on polls spread over five categories, so decay, rent and the
peel all count: a lean build summits about 69% of runs at 90% accuracy and 13% at 80%,
a ×2 build 75% at 80% and 29% at 70%, AGENTS.md with Intellisense (×2.5 since ADR-172 pooled
their bonuses) 21% at 60% and 65% at 70%, and stacking Deprecated on top buys
nothing because it decays and rents. The codebase and the lines in
`GATE_RUNGS` are the difficulty dial (ADR-161).

### 2.8 What unlocks when

The climb stages rules on two axes: **gate number** stages the coverage demanded, the
audits and the shop's services; **category coverage** stages Focus
upgrades ([4.4](#44-upgrades)). Width is on neither: it follows the build itself,
which rents the smallest rung it fits in ([5.1](#51-storage-kb)).

Every row states what you hold **while facing that gate** — which is also what the
shop before it sells, since a shop runs on the clear that precedes its gate.

<!-- BEGIN GENERATED:GATE_LADDER -->

| Gate | Swatch       | Coverage in its window | A clear pays | A miss peels | Audits it carries | Also unlocks                                  |
| ---- | ------------ | ---------------------- | ------------ | ------------ | ----------------- | --------------------------------------------- |
| 0    | Pallet       | 64% (3.2)              | 32 KB        | **nothing**  | none              | Shop, **Rebuild**                             |
| 1    | Pewter       | 66% (3.3)              | 64 KB        | 20%          | none              | —                                             |
| 2    | Cerulean     | 68% (4.1)              | 96 KB        | 20%          | none              | —                                             |
| 3    | Vermilion    | 71% (4.3)              | 128 KB       | 25%          | 1 from pool A     | **Extend**                                    |
| 4    | Lavender     | 73% (5.1)              | 160 KB       | 25%          | 1 from pool A     | —                                             |
| 5    | Celadon      | 75% (5.3)              | 192 KB       | 25%          | 1 from pool A     | —                                             |
| 6    | Fuchsia      | 77% (5.4)              | 224 KB       | 25%          | 1 from pool A     | —                                             |
| 7    | Saffron      | 79% (6.3)              | 256 KB       | 30%          | 1 from pool A     | —                                             |
| 8    | Seafoam      | 81% (6.5)              | 288 KB       | 30%          | 2 from pool B     | —                                             |
| 9    | Cinnabar     | 84% (7.6)              | 320 KB       | 30%          | 2 from pool B     | —                                             |
| 10   | Viridian     | 86% (7.7)              | 352 KB       | 30%          | 2 from pool B     | —                                             |
| 11   | Indigo Elite | 88% (7.9)              | 384 KB       | 35%          | 3 from pool C     | —                                             |
| 12   | Champion     | 90% (9)                | 416 KB       | 35%          | 3 from pool C     | Clearing it on HEALTHY or better wins the run |

<!-- END GENERATED:GATE_LADDER -->

The clear column is what a flawless window pays before build multipliers.

The coverage column is the gate's HEALTHY line and, in brackets, the output it asks
for: the line times that gate's codebase in `GATE_RUNGS`. A bare build answering all
five at every gate fills every bar, PERFECT included, because each codebase is sized to
the accuracy a flawless run has carried there ([2.7](#27-victory-and-run-end), ADR-181).

The audits column is both the count a gate **draws**, date-seeded, and the ceiling it
will carry — never two of one family (ADR-138). A rival's incident replaces one of the
draws rather than adding to them, and can only be filed at a gate whose pool holds it:

<!-- BEGIN GENERATED:AUDIT_POOLS -->

| Pool  | Lands at                   | Holds                                                                               |
| ----- | -------------------------- | ----------------------------------------------------------------------------------- |
| **A** | gates 3 to 7, room for 1   | 207, 404, 405, 424, 429, 451, 500, 502, 507                                         |
| **B** | gates 8 to 10, room for 2  | 207, 300, 402, 404, 405, 408, 409, 413, 424, 425, 426, 429, 451, 500, 502, 503, 507 |
| **C** | gates 11 to 12, room for 3 | 207, 300, 403, 408, 409, 410, 413, 425, 426, 451, 500, 502, 503, 507, 510           |

<!-- END GENERATED:AUDIT_POOLS -->

425 and 510 answer to how hard they hit: 425 costs about a fifth of a window's config
value and waits for pool B, 510 has the highest ceiling of the three and is Indigo Elite-tier
only. 500 takes nothing away, so it is drawn from gate 3 on.

409 and 426 read a config's level, so they wait for pool B where upgrades exist; 413
needs a build past 12 slots to bite; 403 and 410 are Indigo Elite-tier only; 402 is absent
from pool A so the early gates teach the other rules first.

The coverage column is **per gate**: that gate's window against that gate's
codebase, with only the head start carried in ([2.2](#22-gates)). The unlock column names no
width at all: build space is derived from the build, never bought
([5.1](#51-storage-kb)). The peel column is a share, so it already scales with the
build it hits — and **410 Gone** adds 10 points at Indigo Elite and 15 at the
Champion on top of it.

**Pallet is the calibration gate** (ADR-057, amended by ADR-094). It asks the same
64% of a 5-change codebase for HEALTHY: a bare build needs four right to clear it and five to fill the bar, so the last polls still matter. What makes
it calibration is that it is the one gate with **no floor beneath it and no peel**: a
miss costs nothing and cannot end a run, so the first failure teaches the loop for
free. You read your answers back, shop, and run the same gate again on 5 fresh polls.
Nothing ends a run at gate 0 — even a bare build only holds the gate. From **Pewter**
on, the peel column applies as written.

The payout column is `GATE_REWARD_KB × (gate + 1)` for a **bare build on a perfect
window**. It scales with correctness, so a 3-of-5 clear pays 60% of the row. A window
carried by partials alone clears on coverage and pays nothing, because the payout
counts exact answers.
Reward multipliers and flat clear payouts (Build Artifacts' +32) apply on top.

Deliberately **not** on this axis: Focus levels (staged by category coverage), Build
Artifacts and Moore's Law levels (storage), lint and peek fees (uses), rebuild price
(rebuilds this shop), and everything account-level (swatches, Dex, borders).

Authoritative over this table: `GATE_RUNGS` (`coverageRatio.model.ts`),
`BUILD_SPACE_RUNGS`, `failPeelShareFor` (`rules.model.ts`), `gateClearPayout` (`build.model.ts`),
`EXTEND_FROM_GATE` (`draft.model.ts`), `GATE_SWATCHES`
(`swatch.model.ts`), the audit roster (`audit.model.ts`) and its pools (`auditSchedule.model.ts`).

---

## 3. Your Build

Your build holds **slots**, and a config takes as many as its size says: 1, 2, 4, 8,
12 or 16 (ADR-047). Slots are drawn as a track and written as a plain count, never with
a KB figure beside them.

**Where the room comes from.** Every run opens on **4 weight of free build space**,
and the build rents the rest by growing into it (ADR-098): it occupies the smallest
rung it fits in and pays that rung at every gate close. The ladder, what crossing a
rung costs, YAGNI's discount and what an unpaid bill does are all in
[5.1](#51-storage-kb).

Every build surface draws the same track: a bar per config as wide as its slots, one
**dashed** box per slot still open, and a **hatched** stub one slot wide at the end for
room the run has not bought. The two treatments are not interchangeable: a dash is a
slot standing open that a config can go into now, hatching is room still for sale.
The **Build** panel carries the bill: its header reads the recurring figure
(`↻ 32 KB a gate`), and pressing it opens the whole rung ladder — every weight the
build can rent and what each one bills — with the rung the build stands on marked.

The line under the header reads the totals with no pointer at all
(`5 configs · 7 of 8 weight · 1 free`), and while a config is under the pointer it
reads the room that config takes instead (".ts takes 1 of 8 weight"). It reads
"over by 2" only where an unpaid bill has capped the run under its own build, which
is the one way a build can sit over its space. On a phone, where there is no hover, a
config's own chip stands in for it: opening a chip's panel lights its box on the track
and prices it on the line. Width carries no swatch: badges come from full bars.

**Managing configs.** A config card buys and sells through a full-width press at its foot,
in the screen's colour and shimmering while it can be pressed: **Install · 64 KB** on an
offer (grey and still, the whole card dimmed, when you cannot afford it) and **Uninstall**
on your build, red, its refund on the press, with **↑ v2 · 64 KB** beside it in a drifting
rainbow when an upgrade is offered. Folded, a card is one compact row: its weight, its name with
the effect on one line under it, and on the right its version and its price or refund.
Unfolding shows the description, the badges and the presses. Offers start unfolded,
your build's configs folded. The fold
opens and shuts smoothly, offers flip in as they are dealt, and the storage bar slides to
its new shares as a config arrives, drawn still when the screen opens (DVTD-bjb4, DVTD-p806). A sell refunds half the draft cost in KB, halved again
while Freemium discounts the draft and zeroed entirely while WTFPL is installed;
the press quotes whichever of those the run would actually pay, and states no
figure at all where that is nothing. Anything can be sold except your last config,
since a bare build never clears.

**Starting a run.** The run deals a **hand of five** configs from the starter
pool — seeded per player per day — and picks **nothing** for you. **Two** are
marked as a suggested opening (ADR-057), which is advice and not a selection.
The hand itself never changes while configuring, so the deal reads as one
checkable list. **One config is the only floor**: pick one and you can play, and
spare room is a legal opening. The opening build is hard-capped at the free four — a
card that does not fit is refused rather than rented — so nothing can start
over-capacity, and picking nothing at all is the only thing that holds the button.
Nothing in a build is ever locked or mandatory. The run opens on the free
four and rents nothing before it starts; the ladder opens at the Pewter gate.
Nothing in the opening build is paid for, so taking one back out refunds
nothing, and the screen quotes no refund: the shop is the only place an
uninstall pays ([5.2](#52-the-shop)).

The deal is shaped, not just shuffled (ADR-062). Three rules hold on every seed:
nothing larger than your opening slots is dealt (so every card is installable,
including one that exactly fills the budget), the **smallest three** dealt
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
silent. Gates draw their audits date-seeded ([2.3](#23-audits)), so which one it lifts
changes with the day: at Indigo Elite and the Champion, where a gate carries three, it may
cancel **410**'s deeper peel and leave **300**'s mirror standing, or stop **507**'s leak
and leave the rest.

### 4.2 Size

A config carries one number: the **slots** it fills, one of **1, 2, 4, 8, 12 or 16**
(ADR-047). There are no grades, no grade colours and no glyph. A chip or build row states
its size as a figure in a **weight block** — a fixed-width block whose edge carries the
size hue, so the number cannot be mistaken for the KB figures beside it (ADR-060); lists
and legends still say it in words ("4 slots").

Its **draft price is 32 KB a slot**, so size names both prices at once:

<!-- BEGIN GENERATED:CONFIG_SIZES -->

| Slots | Price  |
| ----- | ------ |
| 1     | 32 KB  |
| 2     | 64 KB  |
| 4     | 128 KB |
| 8     | 256 KB |
| 12    | 384 KB |
| 16    | 512 KB |

<!-- END GENERATED:CONFIG_SIZES -->

A config can carry its own price where the rate is wrong for it: WTFPL is tagged at
512 KB, Volkswagen CI at 384 KB, Freemium at nothing (its whole cost is the bill).

12 and 16 are on the ladder but no config uses them yet — they are there for a config
worth half a maxed build. The Dex's Configs tab orders the roster by size.

### 4.3 Roster

**🟢 Shipped.** All pure effects.

<!-- BEGIN GENERATED:CONFIG_COUNTS -->

**46 configs** ship. **8** are granted at signup and the other **38** unlock individually.

<!-- END GENERATED:CONFIG_COUNTS -->

The registry on a new run reads the hand in five groups, derived from the effect
fields a config declares rather than from anything stored on it (ADR-127). A
config groups by what it pays, so one that moves coverage reads under Coverage
even where it carries a cost; the cost is stated on its own card. Risk is tested
last and holds only the configs whose whole effect is a commitment.

<!-- BEGIN GENERATED:CONFIG_GROUPS -->

| Group       | Configs |
| ----------- | ------- |
| Coverage    | 22      |
| Storage     | 8       |
| Answer help | 7       |
| Risk        | 5       |
| Misc        | 4       |

<!-- END GENERATED:CONFIG_GROUPS -->

| Config                                                              | Slots | Effect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.js` `.ts` `.css` `.jsx` `.html` `.git` `.java` `.py` `.rb` `.vue` | 1     | That category's polls reward ×1.25 (Focus, upgradable)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `package.json`                                                      | 1     | General Frontend polls reward ×1.25 (Focus, upgradable)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Build Artifacts                                                     | 1     | +32 KB × level storage on gate clear                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Moore's Law                                                         | 1     | On each gate clear, +2% × level of held storage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| YAGNI                                                               | 1     | Every slot the build leaves **empty** takes **8 KB a gate** off the build space rent, so a 9-weight build on the 12 rung pays 40 rather than 64. The one config that touches the bill. It fills a slot itself, so installing it into a build already flush with its rung tips the build into the next rung and the bill goes **up** — it is worth most to a build sitting low in a wide rung, and nothing at all on the free four. Eight is less than a rung is worth on purpose: crossing up stays a loss and stepping back down stays a saving (ADR-122)                                                                                                                                                                                                                                                                                                                                                                                                     |
| Linter                                                              | 2     | Cross out one wrong answer on any poll, fee doubling from 8 KB. v1's ladder climbs for the whole run, redo included; v2 resets it at every clear; v3 halves every rung. One wrong answer always stands (ADR-158)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `.lock`                                                             | 1     | Lock shop offers for 16 KB each ([5.2](#52-the-shop)); a locked offer leads every shop until installed or released, and every lock releases if `.lock` leaves the build                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Planning Poker                                                      | 1     | On the prep screen before every gate, bet how many of its 5 polls you will answer correctly — **the gate will not open until you have**, and no bet can cost you anything. The number is a **floor**: answer at least that many and it pays `k x (gates cleared + 1) x 0.25` coverage units, a constant 5% of the codebase per point bet; fall short and it pays nothing. The units land inside the window, so a won bet can lift a gate over its own line. Locks the moment you answer, and settles on a missed gate as readily as a cleared one                                                                                                                                                                                                                                                                                                                                                                                                              |
| `strict: true`                                                      | 1     | Armed before you answer: an exact answer pays **+0.5 units**, and a partial, a miss or a timeout takes 0.5 units off the gate window (clamped at 0). It disarms after every answer. The one config that can make an answer cost coverage (ADR-089)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Regression Test                                                     | 2     | A poll this account has answered before without getting it fully right pays ×2. A partial counts as a miss: a regression test covers a case that did not pass. The set is read fresh every time the sequence is loaded and never stored, so it shrinks as you learn — getting a poll right retires its test. It reads on any category, since a miss is not a subject                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Cold Start                                                          | 2     | The gate's first answer pays nothing; every answer after it rewards ×1.5. The cold one is the slow one, so the config front-loads the cost rather than the payout — it is Overclock read backwards, and averages the same ×1.2 across a full window Its first-answer effect multiplies with any other one (Cold Start ×0 × Overclock ×4 pays nothing), so the shop badges the pair **clashes with …** in saffron, on the offer and on both cards.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Code Coverage                                                       | 2     | +0.1 units of coverage per correct answer per version, so +0.5 at v5, flat: no other config multiplies it, only the gate's accuracy (ADR-083, ADR-158, ADR-172)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| IndexedDB                                                           | 2     | +8 KB storage per correct answer, capped at 320 KB                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Database                                                            | 2     | Each exact answer opens an **8 KB transaction** instead of paying it. Clearing the gate — on any band, OK included — commits it at **×2**; SHAKY or DANGER rolls the whole thing back. Shares IndexedDB's 320 KB run cap, metered on what it **commits** rather than what it holds, so a rollback costs no cap room. The only earner a gate can take back, which also means a held gate leaves no faucet KB to pay its peel with (ADR-091)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Telemetry                                                           | 2     | Paid peek at how everyone ever answered this poll ([4.5](#45-paid-actions-lint-peek-and-buy-back))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| A/B Test                                                            | 2     | Ships one of two arms, switched free at any time — in the shop or mid-poll, where the switch scores the answer you are about to give (ADR-053): A pays ×1.25 on all coverage, B pays +8 KB per correct answer (sharing the faucet's run cap)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `.length`                                                           | 2     | Names how many correct answers the gate's 5 polls hold. It pays no KB: the per-extra-pick payout was taken off deliberately, so that a config bought for a reveal cannot earn its keep on the ledger while the reveal itself is still unbuilt on the screens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Garbage Collection                                                  | 2     | Every config you **drop** to pay a peel refunds its sell value. WTFPL zeroes it and Freemium halves it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Math.ceil()`                                                       | 2     | A partial select-all answer earns the fraction it needs to reach a whole unit: a quarter caught pays 1 and three quarters pays 2. No other config multiplies the top-up, only the gate's accuracy — which is what keeps a near-miss behind a full answer in any build above a bare one (ADR-086)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| SLA                                                                 | 2     | On the prep screen before every gate, promise **OK**, **HEALTHY** or **PERFECT** — **the gate will not open until you have**, and no promise can cost you anything. Close in that band or better and the gate's own payout rises **+10%**, **+25%** or **+50%**. The rate is read off the band you _promised_, never the one you landed in, so promising PERFECT and closing HEALTHY pays nothing where a promise of OK would have paid. A floor, like Planning Poker's: beating your own promise still pays, and missing it costs nothing beyond the uplift you did not get. The one thing in the game that makes a better clearing band worth more KB — the base payout is the same at OK as at PERFECT (ADR-096)                                                                                                                                                                                                                                            |
| LGTM                                                                | 2     | On the prep screen before every gate, approve **one** of its five polls without reading it. When that poll comes up its options are inert and the only press is LGTM: the answer submitted is whatever the community has picked most on it, counted over every honest answer the poll has ever taken (mirror-gate answers excluded, the same pool Telemetry reads). A poll needs **2** prior answers before it can be approved, and the row says so without ever naming the count — sample size is Telemetry's own upgrade. Grading is untouched, so a wrong approval bleeds exactly like a wrong answer. Approving is optional and never holds the gate: unlike Planning Poker and SLA, declining is a real option, because the room is worse than you on a category you know. Refused outright under **300 Multiple Choices**, which inverts what a majority means; under **404** the categories read `?????` and the approval is blind twice over (ADR-127) |
| npm audit                                                           | 2     | On the prep screen, names the config each outage audit will take offline: one name when every poll agrees, the play order when the pick moves, the whole build on poll 1 for 425. Unlocks after 3 audited gates cleared (ADR-158)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Vite                                                                | 2     | A correct answer within 15 s earns ×1.5 coverage, a slower one ×0.75; an answer without a time earns ×1. Reads the time the browser reports, as 408 does. Unlocks after 25 correct answers within 15 s (ADR-169)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `&&`                                                                | 4     | Correct answers **chain**. The first link pays **1 KB** and every link after it pays **double** the last (1, 2, 4, 8, 16, 32, 64, 128, 256), so nine in a row empties the run faucet on its own. Any wrong answer short-circuits the chain back to its first link; a partial neither extends nor breaks it. The chain **survives a gate clear**, where the engine's own streak resets — which is what makes it a second number rather than a second reading of the same one. It shares IndexedDB's 320 KB run cap, so it is an opening-game plan the way Freemium is, and its row on the poll screen states what the next link pays before you answer (ADR-121)                                                                                                                                                                                                                                                                                                |
| Try/Catch                                                           | 4     | A gate that would close in **DANGER** holds instead, owing its peel — the one exception to "no retry, no peel, no choice". The catch stays in the build and is the **only config you can drop** until you drop it yourself; its own 4 weight is the first thing that peel takes, so it settles 4 slots of the debt on its way out (ADR-177). It handles the exception rather than undoing it: you still owe the peel and still have to re-run the gate. A caught gate can never then die to its own peel. Re-drafting it later buys a second catch at full price (ADR-096)                                                                                                                                                                                                                                                                                                                                                                                     |
| vendor lock-in                                                      | 4     | Names one config in the build as the run's vendor. That config keeps its weight and keeps paying its effect, but the build space you rent is measured as though it were not there, so the room it frees is a rung you no longer have to pay for. In exchange it cannot be sold or dropped for the rest of the run. It asks for its target the moment it joins the build — in the opening build or in the shop — and the screen holds until you name one, so the weight can never be spent on nobody. It cannot name itself, and it only pays on a config heavier than its own 4 — the thing worth exempting is the thing you would least like to be stuck with. A peel can still take the locked config, and selling vendor lock-in releases the lock (ADR-087)                                                                                                                                                                                                |
| Intellisense                                                        | 4     | All coverage ×1.5, added to other all-coverage bonuses                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Deprecated                                                          | 4     | All coverage ×3, fading ×0.5 each gate clear, through ×1 and on into ×0.5, where it cuts coverage rather than paying it; deleted from the build at ×0. Six gates of service, the last of them a liability you have to notice and drop                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Cache                                                               | 4     | Correct answers warm their category for the rest of the run: each cached hit pays +0.25 units of coverage there, capped at one unit (4 hits). A wrong answer in the category flushes it cold; a partial neither warms nor flushes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Prefetch                                                            | 4     | v1 shows the category of every poll left this gate plus all of the next gate's categories; v2 adds how many options each offers (in play order) and how many of them take more than one answer. Asking for polls not yet dealt rolls tomorrow's shared seed a day early — the questions stay sealed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| git rebase -i                                                       | 4     | Before a gate starts, names its 5 polls by **category** and moves any of them up or down the queue. **v2** also names which of them take more than one answer. The order locks the moment the first answer lands. Prefetch stays the richer read (the next gate at v1, option counts at v2); rebase owns the order instead, and it is the only config that touches poll sequence — which is what Cold Start, Overclock, Cache and Dependabot all quietly depend on                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Overclock                                                           | 4     | The gate's first answer earns ×4 coverage; every answer after it runs hot at ×0.5, cooling off at the clear. Miss the opener and the gate is nearly dead — the buy is variance, not magnitude (×1.2 average, honestly under Intellisense) Its first-answer effect multiplies with any other one (Cold Start ×0 × Overclock ×4 pays nothing), so the shop badges the pair **clashes with …** in saffron, on the offer and on both cards.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| AGENTS.md                                                           | 8     | All coverage ×2, added to other all-coverage bonuses                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Volkswagen CI                                                       | 8     | Reports the gate's first audit as passing; costs 384 KB to draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Dependabot                                                          | 8     | Counts correct answers: **5 in a row** (4 at v2) upgrades a random installed config, free, then the count restarts. A wrong answer or a failed gate starts it over, so it pays for a clean streak rather than for time. Its row on the poll screen shows the countdown ("bump in 3"). Once nothing in the build can still be upgraded it stops counting and its chip reads "nothing left to upgrade" in the poll and the shop, so the 8 weight shows as idle. The pick ignores the Focus coverage gate the shop enforces, so a merge lands without review                                                                                                                                                                                                                                                                                                                                                                                                      |
| WTFPL                                                               | 8     | Every shop offers the entire roster; costs 512 KB, every sell refunds 0 KB while it is installed (its own included), and Rebuild/Lock/Extend retire                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Freemium                                                            | 8     | **Free to draft.** Every config drafts at half price while it is installed, and refunds drop to half of that discounted price. Each gate cleared bills 8 KB × 2^gate (8, 16, 32, 64, 128, 256…), charged after the clear pays; a bill the balance cannot cover lapses the config and frees its eight slots                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

**Regression Test** is the one config that pays for your own history rather than for
the build around it, and the only one whose value _falls_ as you improve: the pool it
reads is the polls you have got wrong, so a player who learns them prices it out of
their own build. That decay is the balance, and it is the shape the name already
describes: a regression test covers a case that did not pass. A "previously seen"
trigger would have paid a flat ×2 for showing up and never spent itself down — the
miss set is what gives it something to lose.

`.length` sells knowledge rather than magnitude, and sells nothing else: its
per-extra-pick payout is built in the engine but attached to no config, because paying
KB let a config bought for its reveal earn its keep on the ledger while the reveal went
unbuilt. The payout comes back when the count reaches the poll screen. **Moore's Law** ramps instead of gating, because 2% of a small
balance is worthless and the balance is only large late. Nothing caps storage
([5.1](#51-storage-kb)), so its interest is principal from the first shop and
compounds for the rest of the run; what holds it back early is the size of the
balance, never a ceiling.

**Freemium is the roster's one recurring price** — everything else is bought once and
then free — and it is metered on the run's _depth_ rather than on how long it has been
held, so dropping it and re-drafting later pays the deep rate instead of restarting the
ladder. It bills on clears only, like Deprecated's fade: a failed attempt already costs
a peel. Practically it is an opening-game plan you cancel around gate 4, when the bill
starts eating a whole gate's reward.

🟡 **Designed, not built.** These were written when configs still carried checks, so
each needs a redesign pass (a bounded condition, a fee, or a gate audit) before it can
ship; the original check designs stay in the beans.

| Config                | Slots | Effect                                                                                                                                                                                                       |
| --------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.every()`            | 1     | Not built. +0.1 units of coverage when a category you have 5-streaked appears                                                                                                                                |
| Semver                | 1     | Coverage ×1.2 for each Focus config at v2 or higher                                                                                                                                                          |
| Weekend Project       | 1     | Saturday and Sunday gates pay +50% storage                                                                                                                                                                   |
| Benchmark             | 2     | See your paired ghost's answer before you commit                                                                                                                                                             |
| `.tsx`                | 2     | TypeScript and React polls reward ×1.25                                                                                                                                                                      |
| git stash             | 2     | Once per window, stash the current poll; it returns last                                                                                                                                                     |
| Watch                 | 2     | Pick a category at draft: its polls get double draw weight                                                                                                                                                   |
| `--save-exact`        | 2     | Every future draft costs 20% less                                                                                                                                                                            |
| Snapshot Testing      | 4     | Polls you have already seen reward ×2                                                                                                                                                                        |
| Replication           | 4     | All storage gains ×2. Its cost clause named the free storage plan, which ADR-082 deleted; the natural replacement is holding the build to the free 4-weight rung, but that is a redesign and not yet decided |
| Continuous Deployment | 4     | +64 KB every gate clear, but you never enter the shop again                                                                                                                                                  |

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
you buy: **Mirrored Check** is now **300 Multiple Choices**, **Speed Check** is now **408 Request Timeout**.

Open: General Backend has no Focus config yet, and it should not get a solo one.
`Node.js` (JavaScript + General Backend) in the dual-focus pool above is the
literal fix — the category is server-side _concepts_ (its polls are databases,
HTTP and auth), not a file, so every file-shaped name invented for it has been
wrong twice over: `.be` is not a real extension, and `.env` is read by Vite and
Next as readily as by any server.

### 4.4 Upgrades

**Most configs have no version ladder at all.** Nineteen of the roster carry one —
the eleven Focus configs, Build Artifacts, Moore's Law, Telemetry, git rebase -i,
Dependabot, Code Coverage, Prefetch and Linter (`isUpgradable`); everything else is a flat effect, and its chip
offers no upgrade press. A build usually holds exactly one config you can version
up, which is why the shop so often shows a single ladder.

Versions cap at **v5** (the 5-poll window is the natural ceiling); Telemetry,
git rebase -i, Dependabot and Prefetch are the exceptions and stop at v2, and Linter
stops at v3. Every upgrade
costs `32 KB × the version bought`, and there is **no cap on how many you may buy
in one shop** — only what you can pay for and what the coverage gate allows.

- **Focus configs** answer to two gates (ADR-039): vN to vN+1 needs `5% × N` career
  coverage in that category **and** the storage. Coverage is permission, KB is the
  price, and neither substitutes for the other, so an earned level can be unaffordable
  and a funded one unearned. Each version raises the payout (`1 + 0.25 × version`).
- **Build Artifacts** buys +32 KB payout per version on clear. Storage only, no coverage gate.
- **Moore's Law** buys +2% interest per version, up to 10% at v5, spending the very
  principal the interest then earns against.
- **Telemetry** upgrades once, for 64 KB, and buys honesty rather than power: v1 hands
  over percentages with no denominator, so 100% of two players and 100% of a hundred
  look identical and the config can talk you into a wrong answer; v2 adds the line that
  separates them ("based on 127 answers"). The number is withheld server-side, so v1
  blindness survives a devtools tab.
- **git rebase -i** upgrades once and buys information, not power: v1 lists the gate's
  polls by category, v2 also names which of them take more than one answer. Answer
  types are Prefetch v2's headline reveal and multiple choice pays double, so the version is
  what buys the overlap.

The shop's Upgrade button sits on the config's chip in the Build panel and carries the
next version and its price. Pressing it opens the version ladder, where the offered rung
is the Buy press; while gated, that rung is greyed and the panel states whichever
requirement is in the way — the coverage line first, the shortfall otherwise. A rolled
offer is the other way to buy a level: roughly one shop in eight
puts a newer version of something you already own in the registry, at the registry price
whatever the version, with **no coverage requirement** — the bypass is what makes it
worth taking. The offer starts one rung up and climbs on a coin flip per further rung
until the flip fails or the ladder ends, so from v1 it is v2 half the time, v3 a
quarter, v4 an eighth and v5 an eighth (ADR-097); the row states the odds its rung
landed on ("1 in 4 rolls"). It swaps the installed config rather than taking a second
slot, and cannot be kept for the next shop. Dependabot's free bump is not a roll: it
always lands exactly one rung up. The stake receipt
states what rides on top of the base: the Focus multiplier when the poll matches.

### 4.5 Paid actions: lint, peek and buy-back

Two configs sell an action rather than a passive, and both meter it with a doubling
fee. Both hang off the selling config's own build row, so a build's powers read in
one place. The third is sold by a **gate** rather than a config, and sits on the answer
it unseals.

**Lint.** With Linter equipped, pay to gray out one wrong option on any poll: 8, 16,
32, 64, 128, 256 KB. Run it as often as the poll's options allow; the ladder is the only
thing metering it. At v1 it climbs for the whole run, redo included; v2 resets it at
the clear; v3 halves every rung (ADR-158). Linted polls never reveal their correct
answer in community views and may reappear in a later seed.

**Peek** (Telemetry). Pay to see how the community voted on the poll in front of you,
drawn as a gray bar per option: 32, 64, 128, 256, 512 KB, doubling per use and
resetting **each gate** rather than each poll, because a peek buys the whole poll where
a lint buys one option. One peek per poll. The pool is every answer that poll has ever
taken across both loops, minus anyone who answered it under **300 Multiple Choices**, since they were
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

- **Faucets**: clearing a gate pays `32 KB × (gate + 1) × correct ÷ 5` (the multiplier
  caps at ×13, which the thirteen-gate ladder reaches but never passes); IndexedDB adds +8 KB per correct answer,
  capped at 320 KB per run; **Database** holds 8 KB per exact answer and pays it at ×2
  only if the gate clears, drawing on the same 320 KB cap; **`&&`** pays a doubling
  chain off the same cap, which nine correct answers in a row empty on their own.
- **Sinks**: the build space bill, drafting configs (32 to 512 KB by size), upgrades,
  lint and peek fees, draft rebuilds, lock, extend, the git tag, and subscribed
  configs' bills.

**The build space ladder** (ADR-098). Every run opens on 4 weight of free room. The
build occupies the smallest rung it fits in and bills that rung at every gate close —
nobody picks it, and the shop does not sell it.

<!-- BEGIN GENERATED:BUILD_SPACE -->

| Build space | 4    | 6   | 8   | 12  | 16  | 24  | 32  |
| ----------- | ---- | --- | --- | --- | --- | --- | --- |
| KB a gate   | free | 16  | 32  | 64  | 128 | 256 | 512 |

<!-- END GENERATED:BUILD_SPACE -->

Every billed rung doubles the one below it, so room is never cheap twice. The rungs are
coarse, so a 9-weight build pays the 12 rung's 64 KB: that gap is the pressure. Crossing
from 4 to 5 weight costs 16 KB at every gate for the rest of the run, which makes the
threshold — not the draft price — the real cost of a config.

**Crossing a rung arms the install press.** Before any press, an offer that would
raise the bill wears what it adds to it (`↻ +16 KB a gate`, saffron), so the bill is
read while browsing, not only once a press is armed. The first press rings the card in
saffron and swaps its foot for a ledger: **Doesn't fit.** Installing grows your build,
then `weight 4 → 6`, `pay now −64 KB` and `upkeep −16 KB every gate`, above a saffron
`Install · 64 KB` and a `cancel`. The build's storage bar draws the config hatched in
saffron after the rest (`preview · Linter takes 2 weight, the build grows to 6`). The
second press installs; cancel stands it down. An install that fits the rung already rented is one press,
unless **YAGNI** is held: its discount is paid per empty slot ([4.3](#43-roster)), so
every install then arms and states the new bill before it commits. Selling narrows the rung again immediately, and refunds what the build is owed —
half the draft cost, or less where a config discounts or zeroes it.

Weight both earns and bills. A heavier build scores more coverage per answer and so
earns more per gate, while costing more per gate to run; the whole question of a run is
whether the first outruns the second. The rung prices and what a proven slot pays are
tuned against each other and neither moves alone.

**Nothing is refused for room below 32**, the top of the ladder: a build that does not
fit its rung rents the one above rather than being held out of it.

**A bill you cannot pay caps the build.** The run pays for the widest rung its balance
covers and is held to that space: no offer drafts past it, and the shop's exit stays
shut until the build fits it — sell or drop the difference. It is the only lock on the door, and it clears when the run
leaves the shop. Never fatal: the free rung costs nothing.

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
holds ([3](#3-your-build)), which is a state rather than a verdict — and one an unpaid
bill put you in, since there is no ladder to step down.

**Every price previews the balance it leaves** (ADR-152). Pointing at a price —
by hover or by keyboard focus — names the figure that press would land on above
the balance: `after install 378 KB` in vermillion for a spend, `after uninstall
442 KB` in viridian for a refund. The preview belongs to the press, not the card,
so a card carrying both an upgrade and an uninstall answers for the one pointed
at, and an offer the balance cannot cover previews nothing.

| Action            | Cost                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Draft**         | 32 to 512 KB by size                                 | One of 5 offered configs, new ones only. The offer's **Install** press carries the spend on it (`Install · 64 KB`), the same press the opening hand deals with; it greys and refuses while the room or the balance is short, price still showing.                                                                                                                                                                 |
| **Rebuild**       | 4, 8, 16, … 512 KB                                   | Re-rolls the offer, doubling per rebuild within the same shop.                                                                                                                                                                                                                                                                                                                                                    |
| **Skip the shop** | pays 16 KB                                           | Leave the shop without a single registry action and get paid. Any draft, rebuild, lock, sell, upgrade or other registry press this visit shuts it (`registry touched`), and pressing it shuts the registry until the next shop. Always below the cheapest draft (DVTD-2l5k, ADR-115 D4). A starter, in every shop.                                                                                                |
| **Lock**          | 16 KB a lock                                         | Requires **`.lock`** in the build (ADR-054); without it the registry shows no padlock at all. Pins any number of offers: rebuilds skip them and every later shop leads with them, until each is installed or released. Releasing is free and refunds nothing, and every lock releases if `.lock` leaves the build. A pinned offer occupies one of the registry's slots, so locking the whole registry freezes it. |
| **Minify**        | free                                                 | Halves a config's slots and halves what it gives, one way only. The only way to fit a 16 into a build narrower than sixteen. A 1-slot config cannot be minified.                                                                                                                                                                                                                                                  |
| **Extend**        | 48, then 96 KB                                       | One more config on the table, in this shop and every shop after. Two per run. From gate 3. Sold only to a run that carried it in at new run for 64 KB of archive (ADR-153); a run that did not sees the row named with `new run · 64 KB` and no press.                                                                                                                                                            |
| **Incident**      | 32 KB to buy, 8/16/32/64 … KB to refresh             | One shop in three from gate 3 deals a single revealed audit at the **Incident desk**. Buying takes it into hand, replacing whatever you already hold; **Refresh** deals another and doubles its own price for the rest of that shop. The buy refuses when no rival is in reach of that audit ([7.4](#74-interference)).                                                                                           |
| **git tag**       | 128 KB at gate 4, +64 KB per gate, 512 KB at gate 10 | A cross-run checkpoint: after a death, your next run checks out there instead of gate 0. One per run, burnt by the run it rescues. Sold only to a run that carried one in at new run for 128 KB of archive (ADR-153); otherwise the row reads `new run · 128 KB` and takes no press.                                                                                                                              |
| **kill -9**       | free                                                 | Ends the run on a second press, the first arming it; banks nothing. A service earned by clearing gate 5 (ADR-115 D11), then in every shop.                                                                                                                                                                                                                                                                        |
| **Sell**          | refunds half the draft cost                          | Never your last config.                                                                                                                                                                                                                                                                                                                                                                                           |
| **Upgrade**       | `32 KB × the version bought`                         | Focus configs also need the coverage ([4.4](#44-upgrades)).                                                                                                                                                                                                                                                                                                                                                       |

A tag-rescued run starts at the pinned gate with a 32 KB-per-gate stipend, everything
else fresh, and its death credit counts only the gates it actually climbed. It opens on
the free four like any other run and rents its space out of the stipend. Gate 10 is
the last that sells a tag:
deeper, a rescue would resume a starter build into stacked audits and a half-build
peel.

An offer is refused for **price**, and for **room** only at the top of the ladder
([5.1](#51-storage-kb)). The badge says which: `Needs 4 slots, 1 free` is a
different problem from `Costs 128 KB, you have 90`.

The shop always shows _why_ a locked action is locked: not enough storage against
unmet coverage are different problems and read differently.

---

## 6. Meta-progression

### 6.1 Archived storage

Leftover run storage converts into persistent **archived storage** at the outcome rate
(100% victory, proportional on death, 0% on abandon). A suggested poll pays into it too:
the first time an admin publishes it, its author banks a flat **16 KB**, once per poll,
unless the author is an admin (ADR-185 D5). The author's next visit announces it once
with a dialog that counts the archive up by the reward (ADR-185 D6). It is the account's one persistent wallet, and it buys two things
(ADR-112, ADR-153):

- **Appearance** — profile borders, 256 KB to 48 MB, bought on the profile (and the
  Champion border at a joke 10 TB, ADR-184).
- **A warm boot** — on the new run screen, while the run is still being configured
  ([8](#8-interface)). **Boot Cache** banks run storage at two archived KB per KB, in
  three rungs (128 → 64, 256 → 128, 512 → 256 KB); pick one. **Extend** and the
  **git tag** are carried in for a flat archive price (64 KB and 128 KB) and only
  then sold by the shop, for run storage at their usual ladders ([5.2](#52-the-shop)).
  Hot Reload, Return Policy and Docker Image take a carry price when their presses
  ship. Picked as a draft, paid once by the start press, consumed with the run.

Nothing past the start action spends it (ADR-112 D4). It **cannot** open a run wider —
ADR-082 deleted the start-slot ladder and ADR-153 refused a slot a third time, so every
run opens on the same free four and grows by renting ([5.1](#51-storage-kb)); the
storage Boot Cache banks pays that rent, which is the brake — and it never buys a config
unlock (ADR-050: unlocks are achievement only). The balance reads on the profile, in the
Dex header, on the warm boot panel, and as a before → after step on the gate and run-over
screens. Banked Boot Cache storage is run storage: whatever is left banks back at the
outcome rate, so a round trip returns half at best.

The archive **carries across the 2.0 cutover at face value**: it was banked by real
play under a rule that already said it persists, so ADR-051's no-backfill line does
not reach it. Accounts that played the calendar game are credited once on top of
what they hold — 256 KB for having played, 1 MB instead for a climb the cutover
ended (ADR-112). The figure is stated once, in the return notice beside the granted
titles ([6.6](#66-titles)).

### 6.2 Unlocks

Configs are exposed on the **Reveal / Grant / Stage** model (ADR-050/051). Grant
will gate the starting hand only (DVTD-p9ah, below); today every hand still deals
from the starter eight, and the shop's registry always offers the whole roster. The set granted at signup ([4.3](#43-roster) counts the roster against it):

<!-- BEGIN GENERATED:STARTER_POOL -->

`.js`, `.ts`, `.css`, Linter, Build Artifacts, Code Coverage, IndexedDB, Cold Start

<!-- END GENERATED:STARTER_POOL -->

Every config outside that set unlocks
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

**Services unlock the same way, once per account** (ADR-116): one objective
each on the same ledger, granted in the same transaction, recorded as a row in
`user_service_unlocks`. Rebuild is a starter; Extend unlocks the first time you
reach Cerulean and the git tag the first time you reach gate 4, both off a
`reached-gate:N` metric that ticks for every gate a clear reaches. A locked
service reads named in the shop, the Dex and the warm boot panel, a `?` for its
glyph and the line that earns it where its price would go. An unlocked one is
then **carried into a run** at new run for an archive price, or free for Rebuild,
Skip the shop and kill -9 ([6.1](#61-archived-storage), ADR-153), and is still sold only from
its gate ([5.2](#52-the-shop)). Nothing is backfilled: a depth reached before
the ledger existed has to be reached again. Hot Reload (rebuild 5 times), Return
Policy (sell 5 configs), kill -9 (clear gate 5), Boot Cache (bank 256 KB from
one run, a one-shot at run end off the archive credit) and Docker Image (finish
a run still holding a config from the dealt hand, likewise) count already. 🟡
Hot Reload, Return Policy and Docker Image have no press yet (DVTD-r2fg,
DVTD-rte1, DVTD-oc69); until then an earned one reads _not for sale yet_ in the
Dex.

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

**Gate swatches** are thirteen, one per gate, earned by **reaching 100%
coverage** at the gate, a full bar (ADR-170): you beat the leader clean, you get the
swatch. Clearing the gate moves the run on and pays it; only a full bar takes the
swatch home. Every gate and its swatch carry one name, the Kanto city the gate stands
for (ADR-182): Pallet, Pewter, Cerulean, Vermilion, Lavender, Celadon, Fuchsia,
Saffron, Seafoam, Cinnabar, Viridian, Indigo Elite, Champion. Gate 0 is **Pallet**
where every journey starts, the eight gym cities run in strict gym order, the two
towns that never had a gym sit where the games actually walk you through them
(**Lavender** out of Rock Tunnel, **Seafoam** on Route 20), and the summit pair close
it at Indigo Plateau. Gym badges survive only as flavour ("win the Boulder Badge at
Pewter"), never as a gate's name.

A full bar in any run earns that gate's swatch **permanently and
account-wide**; earning it again is a no-op, so the collection only grows. Colours come from each city
in the Kanto palette and live in `app.css` under `[data-swatch-theme]`, never
duplicated in TypeScript. The palette runs out at 13 gates against 12 colours, one of
them the app background, so the summit pair are drawn apart: **Indigo Elite** keeps indigo
(it _is_ Indigo Plateau) with a rim so it reads, and the **Champion** alone wears the
Kanto gradient.

**The gate themes the run** (ADR-020): the swatch of the gate being played sets the
whole app's accent colour, so climbing feels like travelling Kanto. Indigo Elite's ambient
theme is a lightened indigo and the Champion wears fuchsia, both for readability, and
the celadon/cinnabar pass-fail moods still override the gate theme on reward and strip
screens.

Swatches surface on the swatch track in the nav (ADR-183), as a row in the gate
debrief's Earned panel (ADR-154), on the run-over screen, in the profile's Appearance
tab, where each is named by its gate alone (Pallet, Pewter, …) and wearing one themes
your profile and dev card, and in the Dex's Swatches and Runs tabs.

🟡 **Collect Swatches** (DVTD-g8ty): a _per-category_ cosmetic chip earned through
mastery, a separate collection that reuses the name deliberately.

### 6.4 The Dex

The Pokédex of DevVoted, titled **Dex** — the word the navigation already uses.
**Registry** is reserved for the shop's in-run offer list and never names this
screen. Nine tabs, each colouring the whole screen after the collection you
opened.

The Dex is not a page of its own: it is the lower half of **your profile**, at
`/profile/$userId`, under the card that names you ([6.7](#67-your-profile)).
`/dex` redirects there. Six of the nine tabs are the collection — polls,
configs, services, audits, swatches, runs. Behind them sit three owner tabs:
**appearance**, where you settle your look, **borders**, the border shop, and
**titles**, the title shelf. They are drawn on your own page only (ADR-125,
ADR-144).

Every tab reads the same way: the collection on the left, complete and never
truncated, and a panel on the right drawing whatever row you picked (ADR-151).
Above the list sits one row of chips narrowing it along that tab's own axis —
weight, category, scope, gate — with **all** checked when you arrive, so the
whole collection is what you meet and hiding part of it is a choice you make.
Each chip counts its own held against its own total. The panel is headed by the
thing's own name, or by the identity it already carries: a poll by its dex
number, an audit by its HTTP code, a run by the day it ended. On a phone the two
stack, the list first. An entry you do not hold yet spends that panel saying how
it is earned.

**Polls** is one panel (ADR-187). Across the top runs a strip of categories,
**all** first, each with its seen against its total ("5 of 8") and a meter; a
category you have seen nothing of reads dimmed. On the left, the polls you have
seen: dex number (`#001`), question and score — green (`1/1`) once **caught**,
answered right at least once, saffron (`0/1`) while only **seen**. A later miss
does not un-catch a poll. Under the list sits the box: every poll in the filter
as a numbered tile, green caught, saffron seen, dim unseen, headed "all 96 polls"
with the seen count. A poll you have never been dealt appears only there, and
picking it shows its number and category with the question withheld. On the
right, the entry: "#001 · CSS", the question, then dealt, answered and right.

**Configs** is the unlock checklist. A row is the weight block, the name, the
effect's headline figure as a badge ("×1.25", "+8 KB") and the ceiling of its
version ladder as a pennant ("v5"). The chips are the weights present, lightest
first, each counting its own held ("5 of 19"); the list reads lightest first too,
and inside a weight what you hold reads before what you owe.

The panel draws the same config card the run screens draw (ADR-119, ADR-120),
open, with no chevron. The effect reads as a sentence in the card's body, and
under it how the config came to you and the rung an install gives you: "Starter config · v1 of 5", or "Earned: peeked the community split 5
times · v1 of 2" (off `via_metric`). The footer carries the ceiling of the
version ladder as a pennant ("v5") beside the badge. The pennant names how far
the config can climb, never a version you hold: versions are bought with storage
inside a run and lost with it ([5.2](#52-the-shop)), and most of the roster has
no ladder and wears no pennant. A config whose effect has no figure (Telemetry's
peek) wears no badge. What a further version costs and how often the registry
rolls one is stated in the shop, where it is bought, not here (ADR-108).

A locked config is a dashed card showing only its weight and a `???` where the
name goes; the dashed edge reads as an empty socket in the checklist that play
already underway fills. The panel states both unlock paths with live progress:
the requirement with its count ("Peek the community split 5 times", 3/5) and the
alternative as a bar with its own count ("or", 43/100), naming itself to a
screen reader, which the bar cannot (ADR-051; one-shot objectives carry no
count). The redaction is per-attribute and type-enforced: the weight and the
paths are stated, the name and the effect withheld. ADR-050's middle state, met
but not earned, has a card and no data yet (below).

**Services** lists every service the roster knows in one section (ADR-115
D10), in roster order: Rebuild, Skip the shop, Extend, Hot Reload, Return Policy, kill -9, the
git tag, Boot Cache and Docker Image. Each row names where it is pressed and
how long the purchase lasts (`Every shop · this visit`, `Shop from Cerulean ·
rest of the run`, `New run · banked at the start`) and ends in what it costs —
the shop's ladder for a service pressed straight away, `new run · 64 KB` for one
carried in at new run (ADR-153), whose panel then states the shop ladder its
press charges — or, for a service the account has not earned, `???` for its name
and line, `unlock · …` where its price would go and a `?` for its glyph; its panel
says only what unlocks it (ADR-173 D4). There is no scope filter: nine rows need none. A service is **unlocked once per account** (ADR-116). The
shop lists only the services you have unlocked, and one unlocked during this run
wears a **new** badge (ADR-173): Rebuild and Skip the shop are starters, Extend
unlocks the first time you reach Cerulean, the git tag the first time you reach
gate 4, kill -9 when you clear gate 5. The unlock says whether; the gate still
says when (Extend from gate 3, the tag in gates 4 to 10), and the Dex no longer
lists the gates. An earned service nobody sells yet reads _not for sale yet_.
Offer locks are not here: locking arrives with the .lock config, so the Configs
tab already reveals it (ADR-054). 🟡 The git tag is still bought in the shop
today; buying run services from the archive before the run is ADR-115,
DVTD-0now, and the Hot Reload and Return Policy presses are DVTD-r2fg and
DVTD-rte1.

**Audits** lists every audit as met or unmet (`???` until met), each with the
gates it can land on. The chips are the gates, and an audit that fires across a
span appears under each of them, which is what a filter can do and a grouping
cannot. An audit you have not met spends its panel naming where it can still
catch you. It carries no counts yet, though it now could on one side:
every rival attack is a durable `audit_incidents` row (ADR-099), so audits
**received** are countable per run and per day. Audits **sent** are not — the row
records who fired it but not which of their runs did, so "attacks this climb" has
nothing to read. 🟡 Wiring the received counts to the tab is DVTD-gvc9.

**Swatches** is the gate ladder — one row per gate, earned ones filled and marked
"swept", the rest by their gate number. The panel draws the swatch large and
states the rule: reaching 100% coverage at that gate is what mints it, and
clearing the gate alone does not.

**Runs** is the archive of finished climbs, newest first: the date, the ladder
showing the gates that run swept, the gate that held it, and its final coverage
with the band that coverage falls in. The row is a press now, so the permalink
into that run's archive moved to the panel. Coverage is read as a share of the slots
the run opened, never as the raw units `run_states.coverage` stores.

🟡 Planned: collection stats, per-poll community success rates,
the Configs tab's registry-Reveal "met" state (ADR-050, DVTD-s5vo), storage-plan
rows on the Services tab (blocked: no plan ladder exists yet), and real
audit-firing counts (DVTD-gvc9).

### 6.5 Borders and seasons

Avatar borders are decorative unlockables bought on your profile's borders tab
([6.7](#67-your-profile)) and worn on your card. Pressing a locked border tries it
on your card first and turns its price into a buy press; a bought border joins
your draft look, and **Save look** on the appearance tab wears it (ADR-144). An equipped border is worn wherever the game draws you, including the
byline crediting a poll you wrote ([8](#8-interface)), which is where other players
meet it. The **Champion border** is the one border a run can earn: a win from Pallet
puts it in your collection, and the shop also sells it for 10 TB, a price no account
will reach (ADR-184); its card reads "win a run, or" above the price. 🟡 rarity-based
border unlocks via meta-progression are planned. Runs and
leaderboards live inside **seasons** (upcoming, active, finished, archived), the
temporal container for competitive resets.

**Advertisements** point at the two ways to grow outside a run (ADR-189). The run
hub, the new run screen, the community screen and every profile carry one card, and
the poll screen carries a one-line strip. A card is either **Looking for poll
editors** (approved polls earn 16 KB archived storage, never shown to an admin, whose
polls pay nothing) or one border you do not own and can buy, titled with its name and
price, drawn on your own face, opening the borders tab. Which one shows is rolled
fresh each time a screen opens, half and half. A card's × hides that screen's card
for the rest of the session; the poll strip has no ×. A player who owns every border
only sees the poll editors card. Every other signed-in page (home, the
poll list, admin) carries the same advertisement as a banner along the bottom of the
screen, closable the same way.

### 6.6 Titles

A **title** is earned identity. Where a border is bought and a role is assigned, a
title is the one label that says what you have done (ADR-109).

Titles are **permanent**. Each is a threshold on your own record — `50 distinct Git
polls answered correctly`, `576 polls answered` — never a
comparison against other players, which is what the category seat
([7.3](#73-category-leaders)) is for and why the two stay separate. Crossing the bar
writes the title to your account and the check is never run again, so a record that
later stops being true never costs you the title.

Every category carries **two**, and both are named rather than derived from the
category (ADR-134), and both count distinct polls (ADR-145). One is for breadth: fifty distinct polls in that subject
answered at least once, right or wrong. The other is for knowing them: fifty
distinct polls answered correctly at least once. Answering the same poll again
counts nothing towards either, so a title states how much of a subject you have
met, not how often you replayed it. So Git earns **Git Contributor** and then
**Git GOAT**, and HTML earns **HTML Hobbyist** and then **Markup Master**.

🟡 The bar is fifty for every subject, whatever the bank holds. A subject with
fewer than fifty polls cannot award its titles until the bank grows past fifty. Most of the names are older than the run
game: they were the awards of the calendar-era app, where each went to whoever had
the _most_ of something. The names carried over, the comparison did not.

You may hold many and **wear up to three at once**, in the order you put them on
(ADR-125). Your card shows every title you wear ([6.7](#67-your-profile)),
and so do the climber and hover card ([7.1](#71-the-community-board)) and the
navigation menu. The byline of a poll you wrote shows only the **first**
([8](#8-interface)). Compact climb chips stay avatar-only. Titles are settled at every
gate close and again when a run ends (ADR-154); the gate debrief's Earned panel lists
the ones that close granted, and that panel is the only place an earned title is announced.
A **granted** title you have not been shown yet is announced in a notice the next time you
open the game — once, and never again — along with the archive credit that came with it
([6.1](#61-archived-storage)).

Two titles are not thresholds. They are **granted**: they belong to the accounts that played the calendar game before the rebuild and
cannot be earned at all (ADR-111). **Legacy Tester** goes to anyone who started a run
back then; **Legacy Climber** goes to the narrower set whose run was still open when
the rebuild landed and closed it. A granted title is invisible to everybody outside
that cohort — it is not listed, locked, or hinted at on their shelf, because there is
no bar they could work towards.

The shelf, on your profile's titles tab, is for progress: it splits every title into
three groups, **poll count**, **category** and **special** (ADR-143). You put titles
on from the appearance tab ([6.7](#67-your-profile), ADR-144). A filter narrows it to what
you have **earned**, or to the five titles **closest** to done.

**Poll count** is the rank ladder held as titles: **Poll Newbie** for your first poll,
then up through **'Long Polling'** and **Poll Elitist** to **Polls Galore!** at 786,
fourteen rungs set purely by how many polls you have ever answered. Each rung stays
yours once reached, like any title. The shelf draws them as one track, log-scaled so
the early rungs have room, and states the next rung's threshold and how many polls
it still wants. A rung you have not reached shows its bar but not its name.

**Category** is a table: each subject's answered title beside its correct title,
each with its bar counting distinct polls towards fifty.

**Special** names a moment of a run rather than what you know. Each is earned the
first time it happens:

| Title                | Earned by                                                        |
| -------------------- | ---------------------------------------------------------------- |
| Hello, World!        | a run's first answer, exactly right                              |
| And now it's green!  | winning a run with every answer exactly right                    |
| It Compiles          | winning a run                                                    |
| Ship It              | clearing an audited gate at exactly OK                           |
| 10x Engineer         | one answer earning 10 coverage units                             |
| Stack Overflow       | clearing a gate past full coverage, paid as overflow             |
| Tested in Production | clearing a gate after missing its first two polls                |
| Dependency Hell      | holding eight configs at once                                    |
| Clean Install        | rebuilding the registry three times in one shop, then installing |
| I'm a Teapot         | holding exactly 418 KB                                           |
| WONTFIX              | refusing a SHAKY gate instead of paying its peel                 |

A few are not compliments. They are earned, held and worn exactly like the rest:
nothing is ever worn without being chosen, so an unkind title is a joke you get to
tell about yourself. Until you earn one, its name reads `???`, but its condition is
always stated. The two granted titles sit here too (ADR-146).

🟡 The roster is fifty-one titles. Five more special titles are planned (DVTD-vdxt).

Your card also carries your current **rank**, one line worked out fresh from the same
count every time the card is drawn.

### 6.7 Your profile

Every player has one page, at `/profile/$userId`, and it opens with a **hero**
(ADR-180): the border you wear, your avatar drawn large, your name as the page's
heading, your handle, rank and the titles you wear. Under them stand three
**trophies**: the **deepest gate** you have reached and the **swatches** you have
minted, each out of 13, and the **runs won** (Champion clears). Depth and
swatches are two different readings: a swatch needs a full bar
([6.3](#63-swatches)), so a player who reached gate 9 sloppily owns none. An open
run counts towards depth, because it is still the furthest they have been.
Everywhere else (bylines, hover cards, the board) a player is the smaller **card**,
the same component each time, so you recognise somebody from their page before
you have read the name (ADR-125).

**The page is the hero** (ADR-180, amended 2026-10-03): the look leads, and nothing
is stacked under it. Best run, climbing now, category seats, run history and the
collection counts are gone from the page. The record a visitor wants travels on the
hover card instead: the swatch track, the poll counts and the open run.

**Your own page** draws the same hero a visitor sees, then the tabs: **appearance**
(the one it opens on), **borders**, **titles** and the six Dex collections
([6.4](#64-the-dex)). The archive balance rides the collection heading,
because that is what the borders cost. "Edit profile" in the hero opens the
appearance tab. Your name and photo come from the account you signed in with, so
what you wear is the whole of what you can change. The tab is one panel:
every swatch, the titles you have earned and the borders you own (ADR-186).
Picking one changes only a draft, which the hero wears: it rings saffron and
reads **preview · not saved**, and a picked swatch recolours your whole page, Dex
tabs included. While the draft is unsaved, a bar floats at the bottom of every
tab — **Unsaved look · discard · Save look** — and Save look writes border,
titles and swatch together (ADR-144, ADR-174). Your own hero carries no
trophies; a visitor's view of it does. The saved swatch is what
visitors and your hover card wear. An unearned swatch is drawn blank and cannot be
picked; pallet is worn when nothing else is.

**Somebody else's page** is the hero alone, with no tabs: their face and name
over a glow in their swatch colour, then their record as tiles, the same tiles
the climb map's card draws: deepest gate, runs played, runs won, best streak (the
longest run streak in any category), best category, archived storage, and a row
of tiles. Your own figures are not
stated beside theirs (ADR-186). Their collection stays private, as before: a
visitor reading your unanswered polls would be reading ahead.

You reach another player's page by pressing their **face** or the **name** beside
it: on a poll byline, on a category seat, among a poll's voters, in the turnout, on
the climb map card. Hover or focus a face and the player's **card** shows first, as
a read-only tooltip (ADR-141). Nothing beside a face goes to GitHub any more; the
GitHub handle is stated once, on the player's own page.

The hero and every card share one **player header** (`PlayerHeader.ui.tsx`): face and
name, the role beneath it (**● Admin**) when they hold one, their titles, then a
two-cell strip — **polls published** beside **polls answered** — and their
**swatch track**, all 13 gates with the ones they have minted filled. A player who has
published nothing shows the answered cell alone; a role alone does not earn the
published cell. The hero labels the track with its count (**swatches 5 / 13**) on
your own page and on a visitor's alike. The card the climb map opens is drawn from
the ladder, so on open it fetches the same player card the hover reads and borrows
its strip and swatches.

---

## 7. Community

The social layer works because of the shared daily seed: everyone climbs the same
polls on the same day.

### 7.1 The community board

The board sits at `/run/community`, one press from the shop or the gate result; a run locked mid-gate for
the day lands here, with "Back to your run" disabled until local midnight. The
header is titled **Community** and carries one clock badge: **New polls in …** while
the day's polls are spent, **polls are open** otherwise. The page wears the Kanto kit (`CommunityScreen.ui.tsx`), one
panel per section. The map spans the page under the header; below it, on a wide
screen, the day's polls take the left column and the Hall of Fame, today's records,
incidents and the leaders stack on the right. On a phone they stack in that order. What
the board has to say about the day (still loading, could not be loaded, nothing to
compare yet) reads as the subtitle under the board's title. Every avatar chip on the
page — leaders, climbers, fallen — wears the player's equipped border over a GitHub
photo or a two-letter-initials fallback.

**Today's records** is the turnout panel. It opens on **answered today**: every player who
answered a poll today, with their face, whatever their gate did (ADR-176, amended). Each live run that closed a gate today sits in
one row: **PERFECT** (finished at 100%), **HEALTHY** (comfortably cleared), **OK**
(narrowly cleared) or **SHAKY** (the gate held them). **DANGER** (the run ended today)
lists every player whose run fell today, even one who started again, so a player can
sit in DANGER and in their live run's row. Pressing a face in DANGER opens that run's
card, the same one the climb map opens, so the corpse can be looted from here
(ADR-176, amended). The row comes from the run's latest close: a clear on any band below healthy is OK, a
hold is SHAKY whatever its band. The same list then names the day's record holders: biggest and lightest build, comeback (cleared a gate the same run was held
at), most audits, most installed config, most expensive build, KB generated and KB
spent. KB figures are derived from each run's closes and balance, not a ledger
(ADR-176). A row draws three faces; its `+N` is a press that opens the rest in a
popover, each face linking to its player, and so does a poll option's voter stack.

**Hall of Fame** (ADR-184) heads the right column. It draws the reigning champion, the
last player to win a run from Pallet, as the full player card, with a badge naming
the date and time of the win (`Champion since 13 May 2026, 14:05`). Under it, **Every
champion** lists each win newest first, one row per win, so a repeat champion appears
once per summit, each with their face and the moment they won. Before anyone wins it
reads "so far nobody yet". It does not change with the day, so it refetches only
after a run action or every five minutes.

**Category leaders** ([7.3](#73-category-leaders)) is the board's own section: two
boards of twelve rows, one row per category, one board showing at a time, picked with a
`streak | correct` filter in the panel's head. Every row shows; nothing folds.

**The climb today** is a horizontal track of the 13 numbered gate swatches with each
live run's avatar chip stacked _beneath_ its gate. Your chip is ringed and titled
"you", and your current gate draws the swatch's ring; crowded gates fold behind a `+N`
badge (four chips show). A dashed `pb` marker sits at the gate of the deepest point any
of your _finished_ runs reached, and everything past your reach sits behind a dashed
edge captioned **uncharted**. Beneath a gate's stack, each run the gate killed today is
that player's chip, dimmed and greyed, keyed by run rather than player so two losses in
one day both show (abandoning is not falling and draws nothing). The track scrolls
horizontally on narrow screens and centres itself on your column. Gate/poll arithmetic
lives in `climbMap.model.ts`, one unit: polls, counted `gate * 5 + pollsIntoGate`.
Press any chip — climber or fallen — and their **card** opens: a foldout on a phone, a
panel under the track on a wider screen. The map is the one place a press opens the
card rather than the profile, because the card is where **Loot** and **File** live and a
phone has no hover (ADR-141). The card is the same one a hover shows anywhere else: a
head that fades from the swatch the player wears on their profile (pallet when none),
with the face and name, both linking to their page, and every title they wear as a
badge, the first in the swatch colour (ADR-150); then the gate row (the gate's swatch
and name, `gate N`, and a badge of the coverage held and its band) over the coverage
bar against that gate's unaudited ladder, a pointer marking the reading; then
**Build**, `used / space` weight, the compact config chips with the vendor-locked one
badged and the weight still free as a dashed free slot; then three tiles: run storage,
streak, and the category they have been right in most often, each badged. What a run knows that you
do not stays private (ADR-101 §2, narrowed 2026-09-26). 🟡 Climbers folded behind `+N`
have no chip to press.

**The day's polls** is one panel of five rows, one per slot in the day's seed. Its
head counts how many of the revealed polls you got right (`you 2 of 4`). A revealed
row states your verdict, the question, the category and the share who got it right
(`CSS · 22% right`), and the share again as a toned badge; the latest revealed poll
stands open, and any row opens to one line per option: letter, label, a distribution
bar, an **answer** badge on the right option, a **You** badge on your pick, the faces
who picked it and the vote count. A mirrored answer counts as right when it named
every wrong option, since it proves the same knowledge. **Redaction keeps it fair**:
a poll you have reached but not answered shows only its question, and a slot not yet
dealt reads `Poll 5 · not dealt yet`; neither names its category.

### 7.2 Leaderboards

Two views: **progress today** (everyone on the same seed, comparable per segment) and
**run completion** (won/dead, gates cleared, duration in days). Rows carry
per-category coverage, total coverage, and the run's own best streak — which is a
different figure from the category records in [7.3](#73-category-leaders), because it
is one run's number rather than the best any run ever reached.

### 7.3 Category leaders

🟢 **Shipped.** Two boards, twelve rows each, one row per category. **Streak leaders**
states the longest run of correct answers anyone has strung together inside a single
run; **Correct leaders** states the most correct answers anyone has given in one
category inside a single run. Both are the best such run, all time, over finished and
open runs alike. One board shows at a time, chosen with a `streak | correct` filter in
the Leaders panel's head.

A row states the category on the left and, on the right, the holder's avatar, handle
and figure ("21 in a row", "58 correct"); the seat you hold rings the avatar, greens
the figure and themes the row. The panel head carries the picked board's scope
("longest run of correct answers in one run · all-time").

The two boards are ranked independently, so the same category can have a different
holder on each. Answers given outside a run do not count towards either.

Each board has its own floor: **3 in a row** and **4 correct**, because a seat earned
by two right answers devalues every one earned honestly. Below it the seat is
**unranked** and says what claims it in that board's own figure ("unranked · 3 in a
row claims it"). A seat changes hands only when somebody beats it; it cannot be lost
by missing, because the figure is a best and not a live streak.

A record's streak breaks on a wrong answer and on nothing else: a **partial neither
breaks nor extends** it, the same rule the run's own streak follows, and mirrored answers
([2.3](#23-audits)) are excluded because they graded a different question. Clearing a
gate resets the run's own streak ([2.5](#25-coverage-scoring)) but not this one: the engine counts no
per-category streak, so there is no figure on screen for the board to mirror, and a
record may therefore span a gate boundary
([ADR-131](adr/131-a-record-belongs-to-one-run.md)).

The poll screen states one leader on one line, and it is the streak one
([8](#8-interface)). Two figures in two registers, held by two people,
would make that line need reading rather than glancing.

No title comes with a seat. The category and the word "leader" already name it, and a
derived badge would be the same fact a third time on every one of twelve rows
([ADR-103](adr/103-the-board-seats-twelve-category-leaders.md)).

Retired with ADR-103: **standouts today** in both its rosters — ADR-065's six
climb-shaped awards (deepest, against the room, clean sweep, widest build, travelling
light, comeback), which were built, and ADR-067's four plain standings (most active,
most knowledgeable, fastest, biggest bank), which were accepted and never were. The six
each needed the climb's vocabulary on the screen a player meets before their first
poll; the four were four things to learn where a seat per category is one thing
repeated twelve times. `RunState.configsLost` is still counted, and answer timings are
still captured.

🟡 Brainstormed: the per-category award registry sketched in `docs/old-beans/DVTD-vje6`
(**Prototype Pioneer**, **Selector Sorcerer**) and its other three metrics — coverage,
participation, correct answers. Those are earned and kept; a seat is held until
somebody takes it.

### 7.4 Interference

Interference is bought, not earned (ADR-138, [2.3](#23-audits)). From gate 3 the shop's
**Incident desk** occasionally deals one revealed audit for 32 KB, and **Refresh** deals
another at a doubling price. You hold one at a time.

You file it from the **climber card** on the community map: tap anyone on the climb and
their card shows the gate they stand at, what their build costs to run and the build
itself (ADR-101). When they are in reach of the audit you hold, the card offers
`File 409 Conflict`; when they are not, it says the audit cannot reach them. One press
files it against their next gate, where it **replaces** one of that gate's drawn audits
rather than adding to it. It locks when they clear the gate they are in, so their
receipt names it and you before they walk in; surviving it pays them 32 KB, and you earn
nothing from their death.

Prep's **Audits** panel is the receiving half: every audit the gate in front of you
carries, with the sender named on the ones a rival filed. Before gate 3 there is no
panel at all. An audit you meet for the first time (no gate that can hold it cleared
yet) wears a **new** badge on its row and the panel's head (ADR-173). The community board carries an
**Incidents** panel listing everyone's incidents filed today, queued / locked /
survived / failed, with your own rows ringed. Each row shows both players' faces,
each linking to their profile.

🟡 A board row for the most wanted and the survivor, and a run-over tally of incidents
faced, are not built. A **Force push** (reorder a rival's gate) would ride the same
queue if it is ever wanted.

### 7.5 Other social plans

✅ **Custom poll creation**: any player suggests a poll, an admin publishes it, and the
first publish banks its author 16 KB of archived storage (ADR-185). Pay per answer
(DVTD-ofah) is still open.

**Loot and fallen runs** (ADR-135): a run that died today carries whatever storage
the archive credit left behind — `held − round(held × gates / 13)`, the same figure
the debrief prints as `run balance, lost`. Its card on the climb map offers that
take to anyone still climbing, and the first press wins it: the storage lands in the
looter's run balance, spendable that gate, and the card then names who got there
first. You cannot loot your own run, a run that banked everything has nothing to
take, and a player whose own run is over has nowhere to put it. There is no cap on
how many corpses one run may take — the race against the other climbers is the only
limit. The pool is the day's dead, identical for everyone.

---

## 8. Interface

The game leans hard into its CI metaphor.

- **Run header** (ADR-183): every run screen but the hub opens on a headline
  title (the gate, "Pallet Gate", or the page's name: Registry, New run) over one
  line of subtext. The run itself rides the **top nav** on every signed-in page: a
  **swatch track** of all thirteen gates (the ones you have swept filled, the one
  underway marked, the rest undiscovered) and the balance. A run screen hands the
  nav its own reading, so the shop's "after install" preview shows there. The hub
  leads with its own strip ([2.1](#21-shape-of-a-run)). Storage reads
  as a **balance**, "320 KB" over the word `balance`, and no bar. Nothing caps
  storage ([5.1](#51-storage-kb)), so there is no ceiling to draw against: a bar
  would need a full mark it does not have, and read as a tank emptying besides.
  **The balance names every change it makes** (ADR-124): the figure counts to its
  new reading, tints green on a gain and red on a spend, and a signed pill above it
  says what moved. Several changes landing close together queue and play in order,
  one at a time, so none is overwritten before it can be read.
- **Shop page** (ADR-155): from `md`, the build, the incident desk and the
  services stand on the left and the registry alone on the right. On a phone a
  row of tabs (Registry, Build, Services, Desk) shows one panel at a time and
  opens on the registry; the balance moves into the footer beside the press,
  because the header pins only from `md`. Services count what is ready; a locked
  service has no row there (ADR-173), only in the Dex. A config offer or service
  unlocked during this run wears a **new** badge. A collapsed config card peeks its effect on one
  truncated line.
- **New run page**: where a run is opened. Two columns in the shop's order: the
  build on the left — its readout, the slot track, the configs installed, the room
  for sale and the rung after it, quoted but not yet on offer — with the **Warm
  boot** panel under it, and the **registry** on the right, listing the hand you
  were dealt. The registry prices the deal _free_: a starting config costs room,
  never storage. It prices no band: the footer says prep states what the gate asks
  (ADR-078). The warm boot panel (ADR-153) heads with the archive balance and lists
  Boot Cache's three rungs, each stating the archive it costs and the storage it
  banks, then every service that can be carried in with its archive price, each
  with a checkbox; a locked one is named with the line that earns it. Ticking
  turns the start press saffron and appends what it spends — `Pallet gate prep ·
384 KB archive` — and the panel's heading states the balance after. Nothing is
  paid until the press; once paid, the panel reads back what the run carries with
  no checkboxes, and the header balance shows the storage banked.
- **Prep page**: the last screen before a gate opens, and the first screen of a new
  run after the build is dealt. Two columns. On the left, **At stake**, headed by the
  gate's name and number. It opens on two objectives, each stating a demand and then the reward it
  pays — **finish at the lowest clearing band or better**, stated with its line
  ("Finish at OK (25%) or better"), which earns the advance to the next gate by
  name and the KB that band pays _or more_, and **reach 100% coverage**, which earns the
  gate's swatch and the KB PERFECT pays. Neither is ticked (ADR-136). Then the coverage
  drawn as a **ladder** (ADR-149): the coverage bar at
  true scale with the pin and each line numbered, so the room each band has at this gate
  shows, then one row per band, worst first, naming the band, its range and what
  finishing there pays — a negative for SHAKY's peel (`no peel` at Pallet, which takes
  none), `the run ends` for DANGER —
  with PERFECT last at 100 and the row the run stands in ringed. The footnote
  says the pay is received at the end of the gate and what a peel is settled in. On the
  right, **Scoring** is three rows (DVTD-a99y): **Single choice** with what a right single
  adds (+20% at Pallet) and its credit steps under it (0, 1), **Multiple choice up to**
  with the best multiple (+40%) and its steps (0 to 2 by share), and **Accuracy Bonus**
  with the multiplier a flawless window reaches from the bonus the run carries (up to
  ×1.08 on a fresh run). Tapping a row's steps swaps them for what each earns with
  your build (the configs that lift every poll alike, read after the gate's opener),
  captioned "with your build"; a build that lifts nothing keeps the tap on coverage %,
  and hover still reads coverage %. Then **the five polls** as five dashed tiles in the gate's
  colour that rattle left to right every five seconds: a `?` each, badged **sealed**,
  until a prefetcher is installed; then each tile names its poll's category (v2 adds
  its answer type and option count), the badge credits the config, and a **next gate**
  row tallies the next gate's categories. Then the gate's **audits** with the bill a
  clear will settle, naming the rival who filed any incident among them; an
  incident is filed from the community board ([7.4](#74-interference)). The audits
  panel draws shut until gate 3, naming the gate that opens it (ADR-105). The build is
  not on it (ADR-078). The right column closes on the start press, which glints on a
  loop while it can be pressed, with the way back (to the build or the shop) under it.
- **Size**: the slots a config fills, stated as a figure in its **weight block**
  ahead of the name on every chip and build row ([4.2](#42-size)); lists and legends
  say it in words ("4 slots"). Fixed-width, so the name column stays flush. The
  bar's width on the build track is the visual. Hovering it says what it costs
  against the width you hold ("takes 8 of your 12 slots"), which is why no row spells
  the shortfall out a second time: a config you have no room for greys its price and
  names the gap on the press.
- **Config version**: a segmented track after the name, beside the upgrade press.
  It draws its empty segments, because a version is a distance along a known ladder
  and the room left is what you are buying.
- **Upgrading** (ADR-123 amended): the upgrade press arms an inset in the card that
  states what the next version changes, what it costs now and, for a registry
  upgrade that grows the build, the weight and upkeep; confirm or cancel there. A
  folded card glows its version tag while an affordable upgrade waits.
- **An opened config**: the description, then one facts line — version, rate, and
  what it sells for in this build. Shared by every surface that lists configs, ruled
  and indented under the row it belongs to. A config with no upgrade path states no
  version; the deal states no refund, since nothing has been bought yet.
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
- **A gate's three standing facts**: the question leads the poll screen, and what the
  run is scored on stands beside it — a banded bar in a coverage panel of its own
  (ADR-070), in a column to the right of the poll on a wide screen and under it on a
  phone, following the answers down the page rather than scrolling away above them.
  The panel is headed by the reading it draws — "70% SHAKY", the percent held and its band
  (ADR-156) — beside
  a hover panel titled **what a poll pays**,
  a two-row table of the rungs an answer can land on: 0 or 1 for a single answer,
  0 / 0.5 / 1 / 1.5 / 2 for a multiple, stated as the figures before the build
  multiplies them. Under the bar the panel says the same thing in words — "You have
  scored 35 units across 50 slots, which is 70.0% coverage" — then **what each poll
  paid**: the gate in hand and no earlier one, led by how many of its five polls are
  answered ("4 out of 5") rather than by the gate's name, which the header above already
  states, its five polls boxed at what they earned, closing on that gate's units. The
  run's whole payout history is the gate debrief's, inside its Coverage fold; while you
  are answering, an earlier gate is a row you cannot act on. Each of those boxed figures
  is a press that opens **its own receipt** (ADR-095): one row per contributor, each
  stating the units it added so the column sums, closing on a `paid` total under a
  single rule. A multiplier carries the factor it was sold at as a tag beside its name.
  There is no standalone breakdown region — the chip that states a figure is where that
  figure is explained. Coverage is
  stated once per screen, so the header stays quiet here; what is being done to
  this gate lives in its own audits panel, one alert per audit; and what the poll costs
  lives in the poll panel's own head, beside the category badge — "wrong costs 0.5", shown only while `strict: true` is
  armed, since nothing else makes a miss cost units ([2.5](#25-coverage-scoring)).
  None of the three folds: a screen you answer on should not be able to hide the terms.
  The send sits inside the poll panel, between the question and the byline, and is the
  top of a stack of two pinned bars (ADR-114): the build sheet rides the bottom of the
  viewport, the send rides directly on top of it, and each settles into the page as its
  own place in the page scrolls into view — the send above the byline, the sheet at the
  end. The send is seated off the sheet's measured height, so opening the build fold
  lifts it rather than burying it.
- **A poll states its own record** (ADR-093): between the poll panel's head and the
  question sit two ruled fact rows, read before the question is. The first is how the
  room fares on it — a band word and the figure behind it, "brutal 31% got it right
  first time" — counting each player once, on the deal they took before the reveal
  had ever taught them the answer. Any other denominator climbs as a poll ages, so
  the same percentage would mean something different every month. The bands are
  `brutal` under 35%, `hard` to 59%, `fair` to 79%, `easy` at 80% and up; under five
  first attempts the poll says `untested` and states no figure, because four people
  getting a question wrong is not evidence that it is brutal. The second row appears
  only if you have answered this poll before: "answered twice · you missed it both
  times, last on 4 Aug", counting answers rather than deals, since an answer is the
  only thing with an outcome to report. Mirror answers count toward neither — they
  answered a different question. The option count and answer type ride the first row's
  right edge, still reading whatever the poll _presents_ rather than what it is, so
  207 Multi-Status keeps what it sells. The whole band is optional: withholding it
  puts the option count back in the panel head, which is the seam a config or an
  audit would later use.
- **The answers are one framed box** (ADR-093): the choices rule against each other
  inside a single bordered list rather than floating as separate rows, rounding only
  at the ends so a picked fill stays inside the frame. The keycap still carries the
  answer type in its shape — round for a single, square for a select-all.
- **The poll screen stacks its panels**: the gate header, the audits, the poll panel
  and the build share one width and one left edge, the button as wide as the options
  it commits to. On a wide screen the coverage panel takes its own column to the right
  of the poll; narrower, it stacks under it. The poll panel's head names the step out loud — "Poll 4 out of 5" —
  rather than drawing a row of crumbs for it.
- **A link is white and underlined**: not blue, not the gate's colour. Every hue in
  the kit already means something — a gate's swatch, a figure's sign, an audit's alarm
  — so a coloured link would be saying something it does not mean. White is the one
  tone left that reads as emphasis and nothing else, and it has to out-read prose that
  is almost always muted. The poll's byline is the case that set the rule: the handle
  links to the author's page in the same tab, while "Created by" and the editor's title
  stay quiet around it.
- **Every figure wears a badge** (ADR-066): a KB amount, a coverage percentage, a
  price or a multiplier is always boxed, never drawn as bare text, so a price can never
  be read as a prize. The words around it stay muted; a sign earns the colour (green
  for what is paid, red for what it costs, saffron for a sub-1 multiplier) and an
  unsigned figure takes the screen's own. One hero readout per screen — the headline
  gain, the balance closing a ledger — is the single exemption, because if every number
  is boxed then none of them is the answer to "what did I just earn". A slot count is
  not a figure: the weight block already owns that (ADR-047, ADR-060). A count the screen states — a gate number, polls left, a rung — is badged too (ADR-148); only the hero readout and the build's slot counts stay bare. A fatal gate states the whole run as the cost ("The run ends here") instead
  of counting configs. Two vocabularies badge alongside the figures: a band word
  (DANGER…PERFECT) in the ladder's own colour, and a poll category in no colour at
  all. Both are matched case-sensitively, which is what keeps an ordinary word out.
- **Reward report**: a debrief you unfold. It wears the same header as every
  run screen (ADR-183): the title, with a badge each for answers right, streak and
  any audit that fired, while the nav's balance reads in the band's colour. The title reports the close and only the close ("Pallet cleared", "cleared, thin",
  "holds", "perfect"); the swatch is a separate prize (ADR-170), so it
  arrives as a row in the Earned panel, stating the coverage held against
  the 100% it needs. The Coverage panel stands in three sections, the bar, then
  Accuracy, then Score; the bar's pin reads how far the close reached, past 100% on
  a surplus ("112% · PERFECT"), while the fill stops at the full bar, and the Surplus
  row says by how much ("12% past the full bar"). The nav's track fills the gates the run closed full, never the gates it
  merely walked past, and draws the gate in hand open. Under it sit the panels:
  coverage, **Earned**, by category, payout, build changes and the five answers
  (ADR-154). Earned lists the configs unlocked and titles earned on this gate, then the
  swatch, earned or missed with its count. Build changes gives each config a row with its
  reason: expiring (the next clear deletes it), upgraded (`v1 → v2`) or removed. Both
  open when they have rows and otherwise fold to one line ("nothing new · swatch 66.7%",
  "nothing moved"). The ledgers stay shut and state their tally on the strip:
  "4 categories · +62.4%", "3 payouts, 1 bill · +208 KB" (no bills clause when none was
  sent), "4 passed · 1 failed". So the screen is readable without opening them, and
  opening one is a choice to see the
  arithmetic. Answers read as a test runner: **PASS / PART / FAIL** as words, never
  a tick. The footer leaves for the shop and says how long it stays open.
  A held gate turns this around (ADR-126, ADR-179): the **Pay 48 KB to retry** panel
  leads, the recap folds shut under "What happened", and there is no footer. The
  panel's one press names the move that pays the peel and is the retry: **Pay from
  storage**, **Drop Cache**, or **Pick a config** while storage is short. When storage
  or a single config pays alone the moves are radio rows, storage picked first; only
  when nothing pays alone does it fall back to config checkboxes plus a storage top-up.
  **End the run** is the panel's footer, stating what banks into the archive if you
  take it ("no retry, bank 20 KB"), and Review answers sits under the recap. On a
  caught gate (ADR-177) the panel's first section is **Drop the catch first**, holding
  Try/Catch alone; the moves below it stay locked and unpicked until it is picked.
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
  handle, and their account role when they hold one ("@matthijsgroen · Poll editor").
  Roles are **Poll editor** and **Admin**: authority, assigned, never earned; an
  ordinary player has none. Beneath that line sits the **title** they wear, if any
  ([6.6](#66-titles)) — earned through play, so it is a different claim and gets its
  own line. With no photo on file the handle's first letter stands in.
- **The category leader**: under the byline, one line states who leads the poll's
  category on **streak** ([7.3](#73-category-leaders) says why streak only) — the
  category badge, the word "leader", the leader's avatar and handle, and the record in
  the row's own trailing cell ("17 in a row"), so it stays on the line however narrow
  the screen. Holding it yourself rings the avatar and greens the figure. A seat nobody holds reads
  "unranked · 3 in a row claims it". It is drawn on the question, not on the reveal,
  and a gate that hides the category ([2.3](#23-audits)) withholds the whole line
  rather than naming the category in it.
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
  **Start new run**, with the community board beside it. On a spent day that press is
  refused and states **New polls in Xh Ym** beside it.
- 🟡 **Learn Home**: a Duolingo-style path/hub planned as both the start point and the
  "no polls left today" destination (DVTD-jhgg).

---

## 9. Glossary

| Term                    | Meaning                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Run / Climb**         | One playthrough, spanning multiple real days.                                                                                                                                                                                                                                                                                                      |
| **Gate**                | A checkpoint auditing a 5-poll window: its coverage demand plus its audits.                                                                                                                                                                                                                                                                        |
| **Gate number**         | Counts from 0: a run opens on gate 0 and summits on gate 12.                                                                                                                                                                                                                                                                                       |
| **Codebase**            | Every slot the run has opened, `5 × (gate + 1)`: 5 at Pallet, 65 at the Champion. A unit covers one slot; coverage is units over the codebase. A clear opens five more, which is why the same units read a lower percent the next day. Prep's Scoring states what a right answer adds against it.                                                  |
| **Gate meter**          | The run's coverage, the only score a gate judges. Cumulative: units banked over every slot the run has opened.                                                                                                                                                                                                                                     |
| **Audit**               | A rule a gate carries (a mirror, a leak, a clock, a shut shop, a config knocked offline). A gate draws its audits date-seeded from its tier's pool, so everyone at that gate today meets the same ones; a rival's incident replaces one draw, and the stake receipt names it and its sender. Gates 3–7 carry one, 8–10 two, 11–12 three (ADR-138). |
| **Incident**            | An audit bought at the shop's Incident desk and filed against a rival: queued at their next gate, locked when they clear the one before it, survived when they clear under it. Listed on the community board's Incidents panel.                                                                                                                    |
| **410 Gone**            | An audit that deepens the peel by 10 points at Indigo Elite and 15 at the Champion.                                                                                                                                                                                                                                                                |
| **Peel**                | What a held gate owes before it runs again: a share of the occupied slots, paid by dropping configs and then in storage for whatever the drops left owed (ADR-126).                                                                                                                                                                                |
| **Build**               | Your active setup: the track of config slots. Shown as **Your Build**. Public: any other player can read yours (ADR-101).                                                                                                                                                                                                                          |
| **Slot**                | One unit of room in the build, also called weight. A config takes as many as its size says: 1, 2, 4, 8, 12 or 16. Four are free; the build rents the rest by growing into them.                                                                                                                                                                    |
| **Minify**              | Halving a config's slots and its bonus, one way.                                                                                                                                                                                                                                                                                                   |
| **Config**              | An installable dev-tool item: an effect with a price, demanding nothing.                                                                                                                                                                                                                                                                           |
| **Coverage**            | The score: a percentage per category plus a run total (career), and the gate meter (cumulative across the run). In fiction: **knowledge coverage**.                                                                                                                                                                                                |
| **Storage**             | The in-run currency, in KB. Nothing caps what you can hold.                                                                                                                                                                                                                                                                                        |
| **Build space**         | The room the run rents, always a rung of the ladder: 4 free, then 6, 8, 12, 16, 24, 32. Derived from the build — the smallest rung its weight fits in — never picked (ADR-098).                                                                                                                                                                    |
| **Build space ladder**  | What each rung bills a gate: free, 16, 32, 64, 128, 256, 512 KB, charged on every clear. Crossing a rung arms the install that crosses it. Fall behind and the run is capped at the space its balance covered until the build fits.                                                                                                                |
| **Archived storage**    | Persistent cross-run storage: the meta-progression currency.                                                                                                                                                                                                                                                                                       |
| **Faucet**              | Any per-correct-answer storage income (for example IndexedDB).                                                                                                                                                                                                                                                                                     |
| **Draft / Rebuild**     | Buying a shop config / re-rolling the offer at a doubling cost.                                                                                                                                                                                                                                                                                    |
| **Lint**                | Paying a fee that doubles each use to disable one wrong option (needs Linter; v1 never resets, v2 resets each gate, v3 halves it).                                                                                                                                                                                                                 |
| **Peek**                | Paying an escalating fee to see how the community voted (needs Telemetry).                                                                                                                                                                                                                                                                         |
| **git tag**             | A cross-run checkpoint: carried in at new run for 128 KB of archive (ADR-153), planted in the shop for run storage priced by the gate it marks, burnt by the run it rescues.                                                                                                                                                                       |
| **kill -9**             | The service that abandons a run: free, two presses, banks nothing, earned by clearing gate 5 (ADR-115 D11).                                                                                                                                                                                                                                        |
| **Service**             | What the shop sells beside configs, unlocked once per account (ADR-116). A service is carried into a run at new run for an archive price or free, then pressed in the shop for run storage at its ladder, or applied at the start (ADR-153). Where each is sold is a roster fact, and the Dex lists all of them in one section (ADR-115 D10).      |
| **Seed**                | The shared per-day poll sequence every player climbs.                                                                                                                                                                                                                                                                                              |
| **Segment**             | One day's 5-poll chunk appended to a persistent run.                                                                                                                                                                                                                                                                                               |
| **Swatch**              | A gate's collectible badge (Pallet to Champion), earned by answering its 5 polls right and kept across runs. Its colour themes the app while that gate is played.                                                                                                                                                                                  |
| **Kanto colours**       | The palette, keyed to gates via their swatches, never to categories.                                                                                                                                                                                                                                                                               |
| **The Dex**             | The collection screen, titled Dex: six collection tabs (Polls, Configs, Services, Audits, Swatches, Runs) plus the owner tabs Appearance, Borders and Titles on your own page.                                                                                                                                                                     |
| **Water-cooler moment** | The design north star: same polls, same day, compare answers.                                                                                                                                                                                                                                                                                      |

---

## 10. Numbers reference

Every number above lives in code; this is the constant sheet, grouped by where it
applies. `rules.model.ts` holds most of it.

**The run**

| Constant                      | Value                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SLICE_WINDOW`                | 5 polls per gate window, so per day. A **window** is always these five; the changes a gate ships are its own codebase (`scoringSlotsAt`)                         |
| `VICTORY_GATE` / `GATE_COUNT` | 12 / 13 (gates 0 to 12)                                                                                                                                          |
| `GATE_RUNGS`                  | Per gate: changes shipped and the floor / OK / HEALTHY lines in percent, from 9 · 0/20/40 at Pallet to 11 · 65/74/84 at the Champion (`coverageRatio.model.ts`)  |
| `HEAD_START_SHARE`            | 10% of a gate's overshoot opens the next gate, capped at that gate's floor                                                                                       |
| `failPeelShareFor`            | 0% / 20% × 2 / 25% × 4 / 30% × 4 / 35% × 2 of the occupied slots, plus strip audits; capped at half the build before gate 3                                      |
| `escalatedPeelShare`          | `share × (1 + 0.5 × attempts)`: each retry at the same gate peels half again as much                                                                             |
| Incident desk                 | `INCIDENT_OFFER_ONE_IN` 3 shops from gate 3 · `INCIDENT_KB` 32 to buy · `INCIDENT_REFRESH_COST_KB` 8/16/32/64/128/256, per shop · hold 1                         |
| Audit roster                  | Twenty rules: a gate draws 1 from gate 3, 2 from gate 8, 3 from gate 11, seeded on the date. A rival's incident replaces one of them                             |
| Audit pools                   | A 9 (gates 3-7) · B 17 (gates 8-10) · C 15 (gates 11-12); what a gate draws from, and what a bought incident can reach · surviving a rival's incident pays 32 KB |
| Audit dials                   | 402 ×2 · 507 16/32 KB · 408 3×30 s / 3×25 s / 5×20 s · 410 +10/+15 · 429 1 action · 413 8 KB a slot past 12                                                      |

**Scoring**

| Constant                            | Value                                                                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BASE_UNIT`                         | 1 unit a correct answer, flat at every gate (ADR-073)                                                                                                          |
| `SINGLE_CREDIT` / `MULTIPLE_CREDIT` | ×1 / ×2 by poll type, on coverage only (ADR-081)                                                                                                               |
| `scoringSlotsAt`                    | `5 × (gate + 1)`, the denominator: every slot the run has opened, 5 at Pallet to 65 at the Champion                                                            |
| `coverageAdd` / `cacheHitStep`      | Code Coverage +0.1 units a correct answer × version · Cache +0.25 units a cached hit, capped at 4 hits (one unit). Flat, added after the multipliers (ADR-083) |
| `minifiedUnits`                     | Halves a coverage add when a config is minified. `minifiedAmount` floors and is for whole KB only                                                              |
| `gateRewardMultiplier`              | `gatesCleared + 1` (×1 at Pallet to ×13 at the Champion) on the KB reward only, frozen while a gate is redone                                                  |
| Focus payout / upgrade gate         | `1 + 0.25 × version` / `5% × version` career coverage                                                                                                          |

**Storage**

| Constant                                        | Value                                                                                                                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `GATE_REWARD_KB` / `GATE_REWARD_MULTIPLIER_CAP` | 32 KB base / ×`GATE_COUNT` = ×13, which the ladder reaches but never passes                                                              |
| `gateClearPayout`                               | `32 × (gate + 1) × reward mults × (correct ÷ 5)`, plus flat clear payouts                                                                |
| `BUILD_SPACE_RUNGS`                             | 4/free · 6/16 · 8/32 · 12/64 · 16/128 · 24/256 · 32/512 KB a gate, billed on clear against the smallest rung the build fits in (ADR-098) |
| `buildSpaceOf`                                  | the rung a build occupies, what it bills, the cap and the room under it; vendor lock-in lowers the rung it is billed at (ADR-167)        |
| `FAUCET_CAP_KB`                                 | 320 per run                                                                                                                              |
| `chainKbFor` / `chainStartKb`                   | `1 KB × 2^(link − 1)`, the link being the run's correct answers since its last wrong one; drawn from `FAUCET_CAP_KB` (ADR-121)           |
| `upkeepKb` / `emptySlotDiscountKb`              | the rung's KB less `8 × free weight`, floored at 0; 8 is the largest flat step at which crossing a rung is still a loss (ADR-122)        |
| Archived-storage credit                         | 1 / `gates ÷ 13` / 0 for victory / death / abandon                                                                                       |
| `APPROVED_POLL_ARCHIVE_KB`                      | 16, paid once on a poll's first publish (ADR-185)                                                                                        |

**Build and shop**

| Constant                                | Value                                                                                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BASE_SLOTS`                            | 4 — the free width every run opens on, and the budget the opening hand is dealt against                                                                                     |
| `HAND_SIZE` / `RECOMMENDED_SIZE`        | 5 dealt at run start (seeded) · 2 marked as advice, none preselected (ADR-052, amended by ADR-057)                                                                          |
| `FOCUS_BAND` / `PAIRABLE_PICKS`         | 1–2 focus configs per hand, count varying by seed · the smallest 3 dealt configs must fit `BASE_SLOTS` together; nothing above the budget is dealt (ADR-062)                |
| `STARTER_POOL`                          | the 8 configs granted at signup, stand-in for the account's pool until DVTD-p9ah                                                                                            |
| `settleUpkeep`                          | pays the bill, or the widest rung a balance covers; an unpayable bill caps the build there, and `fitsBuildSpace` refuses a draft past it                                    |
| `CONFIG_SIZES`                          | 1 · 2 · 4 · 8 · 12 · 16 slots, halved by minify (a 1-slot config cannot minify)                                                                                             |
| `DRAFT_SIZE` / draft cost / sell refund | 5 offers / `32 KB × slots` / `floor(cost ÷ 2)`                                                                                                                              |
| Rebuild / `LOCK_COST_KB` / Extend       | 4…512 KB doubling / 16 flat / 48 then 96                                                                                                                                    |
| Service staging                         | Lock requires `.lock` in the build (ADR-054); Extend from gate 3 (`draft.model.ts`); Hot Reload, Return Policy and kill -9 from the first shop (`registryControl.model.ts`) |
| `pinCostFor`                            | 128 KB at gate 4, +64 per gate, 512 at gate 10; stipend 32 KB × gate                                                                                                        |
| `BOOT_CACHE_RUNGS` / `BOOT_CACHE_RATE`  | 64, 128, 256 KB banked for 128, 256, 512 KB of archive — two archived KB per KB (ADR-153), one rung a run                                                                   |
| `*_CARRY_BYTES`                         | `EXTEND_CARRY_BYTES` 64 KB, `PIN_CARRY_BYTES` 128 KB of archive to carry Extend or the git tag into a run; Rebuild and kill -9 carry free                                   |
| Lint / peek fees                        | 8…256 KB (per run at v1, per gate at v2, halved at v3) / 32…512 KB per gate                                                                                                 |
| Max config version / upgrade cost       | v5 (Telemetry, git rebase -i, Dependabot and Prefetch v2; Linter v3) / `32 KB × (version + 1)`                                                                              |
| `UPGRADE_OFFER_ONE_IN`                  | ~1 shop in 8 rolls a newer version of an owned config into the registry, at registry price whatever the version, no coverage gate (ADR-053)                                 |
| `CLIMB_ONE_IN`                          | a rolled upgrade starts one rung up and climbs on a 1-in-2 flip per further rung until the ladder ends; from v1: v2 ½ · v3 ¼ · v4 ⅛ · v5 ⅛ (ADR-097)                        |

---

_Sources: the `.beans/` story corpus, `docs/adr/`, `docs/brainstorm/`, and the
`src/modules/run/` model files, canonical for all numbers._
