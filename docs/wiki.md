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

_Balatro_ (configs as Jokers, the equation reveal), _Banjo-Kazooie_'s Furnace Fun
(rhyming trivia), _Pokémon_ Gen 1 to 3 (the Kanto palette, the Dex), _Stardew Valley_
(bundle-style unlocks), _De Slimste Mens_, Wordle's daily ritual, and Advent of Code.

---

## 2. The run

### 2.1 Shape of a run

A run is a multi-day climb through numbered gates. Each calendar day one shared
**daily seed** hands every player the same 5 polls: **1 gate = 1 day = 5 polls**.
Answer them and the run locks until tomorrow, when a fresh 5-poll **segment** is
appended.

Runs persist across days and never expire; a partly answered gate fills up across
the day boundary, and yesterday's unplayed polls are dropped rather than failed. The
hub says so once a day is part-answered — "3 of today's 5 left · they do not carry to
tomorrow" — because stopping early is a choice, not an accident, and the forfeit used
to be silent. A flawless summit takes 13 calendar days, and every gate held in SHAKY
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

A gate deals a window of 5 polls and audits the **whole run** against its own line
(ADR-073). Its one demand is the **coverage meter**, and the meter is cumulative: the
units every gate banked, over every slot the run has opened, `5 x (gate + 1)`. Five
slots at Pallet, ten at Boulder, sixty-five at the Champion
([2.8](#28-what-unlocks-when)).

So clearing a gate opens the next gate's five slots and the same score is divided by a
bigger number: Pallet at 42% reads 21% at Boulder having lost nothing. The units did
not move, the ruler did. That is why the poll screen reads the meter in units against
the gate's line, `2.1 of 3` at Pallet and `2.1 of 6` at Boulder, so the line rises
rather than the figure falling (ADR-106); the debrief names the slots ahead and the
shop's **Next gate** panel prices the line in answers. A failed attempt banks
nothing, so a retry replays the window against the same denominator.

Configs demand nothing ([4.1](#41-what-a-config-is)): all friction lives on the gate.
A bare build never clears, which is why sell and drop refuse your last config.

**Gates count from 0.** A run opens on gate 0 and summits at gate 12. Clearing a
gate moves the run on; a window answered 5 of 5 awards that gate's **swatch**
([6.3](#63-swatches)), whether or not the gate cleared.

Nothing is decided until the window's 5th poll is answered. What happens then is
the **band** the meter closes in: PERFECT, HEALTHY and OK all clear the gate, SHAKY
holds it and owes a peel, and DANGER ends the run — and a day that lands fewer than
two of its five right holds the gate whatever the band.
[2.6](#26-how-a-gate-closes) owns that rule and prices every exit.

**Farming is priced out, not forbidden.** The payout scales with window correctness
(`32 KB × (gate + 1) × correct ÷ 5`), so a low-effort clear banks little, and a
low-effort attempt rarely meets the meter at all.

⚪ **Boss gates** (every 5th gate, two requirements AND-ed, no reroll) are parked.

### 2.3 Audits

An audit is a rule a gate carries, stated on the stake receipt before you walk in, and
**every one of them was fired at you by a rival** (ADR-099). No gate deals an audit on
its own. **The count is a capacity**: gates 0 to 2 take none, gates 3 to 7 have room
for one, 8 to 10 for two, Elite and the Champion for three, and a gate nobody attacked
is clean. The same curve the peel has, read as a ceiling.

**How one reaches you.** A gate that clears HEALTHY arms its player one attack; PERFECT
arms a choice between two rolled payloads; OK arms nothing, and a run holds one attack
at most, for as long as the run lasts. **You may only fire from a gate that could be
fired at in return** (ADR-105), so nothing is aimed from gates 0 to 2 and both prep
panels draw shut until gate 3, naming the gate that opens them. From there the attacker
is offered three rivals who stand at their gate or ahead, last **cleared** HEALTHY or
better, and were not their last target; the server draws the payload from the rival's
next gate's pool, never letting the attacker pick. It sits queued until the rival clears the gate they are in,
then locks into the gate in front, up to its capacity and never two of one family, and
that rival's receipt names the audit and who sent it before they walk in. Surviving one
pays **32 KB** per incident on the clear; nobody earns anything from a death. Every
incident filed today is public on the Incidents page, your own rows ringed. A missed
gate keeps its audits on the retry, though whatever an audit picks (which config goes
offline) rolls again.

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
| **410 Gone**                          | Deepens the peel: 10 points at Elite, 15 at the Champion, where a rival lands it.                                                                                                                                                                                                       |
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
and prep sit before the gate and naming a casualty early would be a spoiler.

Two audits tighten with depth rather than repeating: **408** clocks 3 polls at 30s
below gate 10, 3 at 25s at gates 10 and 11, and 5 at 20s at the Champion; **410** adds
10 points to the peel at Elite and 15 at the Champion.

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
shown is not one you can be rewarded for aiming at. It makes **.length** unusually strong,
since the gate's total correct count tells you how many of the five polls are really
singles, and Prefetch and `git rebase -i` v2 keep naming the types outright.

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

Polls **rhyme**. Questions are short verses in the spirit of Furnace Fun: _"Don't ask
me why these polls all rhyme, getting the last 2 items of this array, how do you
adjust the following line?"_ Nearly all are hand-crafted by the developer, with ~10%
contributed by colleagues.

Every poll belongs to one of **12 categories**: JavaScript, TypeScript, CSS, HTML,
React, Vue, Git, Java, Python, Ruby, General Frontend, General Backend. Categories carry
**no colour of their own** (ADR-020); they wear the neutral badge, which follows
whatever screen it sits on. The Kanto palette belongs to the gates ([6.3](#63-swatches)).

Every category carries a **living record**: the longest unbroken run of correct
answers any player has ever strung together in it, across every run and both loops
(ADR-100). A wrong answer breaks a run; a **partial neither breaks nor extends** one,
the same rule the streak bonus follows ([2.5](#25-coverage-scoring)). Mirrored answers
([2.3](#23-audits)) are excluded — they graded a different question. Whoever holds a
category's record is its **leader**, carrying no title beyond the seat itself
(ADR-103). Under **3 in a row** the seat is **open**, and says so: a seat earned by two
right answers devalues every one earned honestly. The record is stated twice — once on
the poll screen for the category being played ([8](#8-interface)), and once per
category on the community board ([7.3](#73-category-leaders)). Both figures are
all-time bests, never a current streak, so a seat is never lost by missing — only taken
by somebody going further.

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

| Term     | Value                                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`   | **One unit**. Flat: the gate number and the option count do not touch it (ADR-073). What a unit is worth as a percentage depends on the gate; the arithmetic is in `coverageRatio.model.ts`. |
| `share`  | The fraction of the answer key that landed. 1 for a single-answer poll answered correctly, and one of three rungs for a partial (ADR-079).                                                   |
| `credit` | **×2 on a multiple-choice poll**, ×1 on a single (ADR-081). The one term the poll type sets.                                                                                                 |
| `adds`   | **Flat units**, added after the multipliers and never amplified by them, alongside the streak step (ADR-083). Code Coverage +0.1 a correct answer; Cache +0.25 a cached hit.                 |
| `mults`  | Product of config multipliers (AGENTS.md ×2, Intellisense ×1.5, Focus ×1.25 at L1), plus the opener and throttle terms a config carries.                                                     |

**The streak pays into both meters.** Every correct answer after the first adds a
flat `STREAK_UNIT_STEP` of +0.1 units to the earn, outside the multipliers and
never multiplied by them. Separately it multiplies the gate's KB payout:
`1 + 0.1 × streak` consecutive correct answers, capped at ×2 (10 steps,
`BASE_STREAK_STEPS`; the run-start gate panel states the ceiling). One streak
drives both, and a gate clear resets
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
timeout takes half a unit off the gate's own tally. It disarms after every answer, so
every poll is wagered on separately, and the gate can never fall below zero units. It
is the only thing in the game that moves the meter down (ADR-089).

Example, gate 2, a single-answer CSS poll with `.css` installed:
`1 unit base × 1.0 share × ×1 credit × 1.25 mults` = **1.25 units of CSS coverage**.
The same poll as a select-all, fully answered, pays 2.5. The **receipt**
(ADR-084, ADR-095) states that as the rows it is: the base the answer itself paid, one
row per config that contributed, the streak step when one is running, and a `paid`
total. Every row states the units it added, so the column sums to the total it closes
on; a multiplier keeps the factor it was sold at (`×1.25`) as a tag beside its name and
states the units that factor produced (`+0.25`) as its figure. It is read on the chip
that paid it, so any poll in the gate explains itself, not only the last one answered. Anything the answer changed beyond its coverage
follows underneath, one line ("streak lost · your next correct answer starts at ×1.0").
Meanwhile every config in the build says what it is worth on the poll in hand: `×1.25
here` while it is paying, `idle this poll` or `JavaScript or TypeScript only` while it is not. When the
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
threshold (ADR-076). The bands are cut in **answers**, one row per gate
(ADR-094): `HEALTHY` is the gate's line, `OK` sits one answer under it at
Pallet and three at the Champion, the survival floor is wherever HEALTHY stood
the day before, and `PERFECT` is a full bar at 100%. Everything above the floor
is one day's HEALTHY step, and the OK band is always under five answers wide,
so a single window can carry a run across it at every gate. Pallet has no floor
to fall under and draws four bands; every gate from Boulder draws all five.

Whatever the meter says, **a day that lands fewer than two of its five right
holds the gate** (`FLOOR_CORRECT`). Yesterday's cushion cannot clear today on
its own; the debrief then reads "1 of 5 right, 2 needed" over a bar that keeps
its honest reading. The floor rule only withholds a clear: a DANGER close still
ends the run. Live numbers are `GATE_RUNGS` in `coverageRatio.model.ts`.

| Band                                                                                        | The gate                                             | The swatch                           | The streak | The payout                  |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------ | ---------- | --------------------------- |
| **PERFECT** — a full bar                                                                    | Cleared                                              | Only if 5 of 5                       | Kept       | Full, times `PERFECT_BONUS` |
| **HEALTHY** — at or over the line                                                           | Cleared                                              | Only if 5 of 5                       | Kept       | Full                        |
| **OK** — under the line by the gate's OK drop (one answer at Pallet, three at the Champion) | Cleared, thin                                        | Only if 5 of 5                       | **Broken** | Full                        |
| **SHAKY** — down to the floor, which is yesterday's HEALTHY line                            | **Held**: pay the peel and retry, or refuse the gate | Only if 5 of 5                       | Broken     | Nothing                     |
| **DANGER** — under the floor (Pallet has none)                                              | **The run ends**                                     | Not won                              | —          | Nothing                     |
| **Fewer than 2 of 5 right today**, whatever the band                                        | **Held**, as SHAKY                                   | Never (a flawless day is five right) | Broken     | Nothing                     |

**The swatch column reads the window, not the band** (ADR-080). Clearing and
earning the badge are two prizes on one window and either can land without the
other: a flawless window can still close SHAKY on a bad history, and a
comfortable clear can carry a miss. DANGER is the one row that can never pay it,
because a flawless window is **clamped** to SHAKY at worst (`closingBandFor`): five
right answers can hold a gate but can never end a run, whatever the meter reads.

**OK costs the streak, and only the streak.** ADR-076 designed it to be paid
`coverage ÷ the gate's line` as well, so that a thin clear paid thinly — but that
cut is **designed and not built** (DVTD-tjc7), and every clearing band pays the
same KB today. The one thing that makes a better band worth more is **SLA**
([4.3](#43-roster)), which pays a percentage on a band you promised in advance.

**A shaky gate is a choice, and both exits are priced on the debrief.**

- **Pay the peel and retry.** The peel is a quota of your occupied slots: 20% at
  the early gates rising to 35% from Elite, never more than half the build before
  gate 3, and +10 or +15 points on top wherever a rival landed **410 Gone**.
  **Every retry at the same gate peels half again as much** (`escalatedPeelShare`),
  so a 20% share bills 30% on the second attempt and 40% on the third: a gate you
  keep failing gets more expensive, not less. It is billed in KB at half a slot's
  draft price, so you can settle it from the storage the run is holding, or by
  dropping configs, whichever you have. The archive never pays a peel (ADR-112).
  Sizes are whole numbers, so a bill your build cannot match exactly is overpaid
  and the remainder is gone. Dropping refunds
  nothing beyond what it settles, unless **Garbage Collection**
  ([4.3](#43-roster)) is installed, in which case every dropped config also
  refunds its sell value. Then the normal post-gate loop runs (review, shop,
  prep, 5 fresh polls) and the meter starts over. Coverage and storage survive.
- **Refuse the gate and end the run.** The climb banks as if you had died there:
  `gatesCleared ÷ 13` of the leftover storage goes to the archive. The run is over
  and nothing is owed. This is not abandoning, which banks nothing, because the
  gate has already been answered and failed, so there is no attempt left to duck.

**A held gate pays no gate reward**, no interest and no extra-pick KB. The
faucet KB earned inside the window is the retry's whole budget — _unless the
build holds **Database**, whose KB is escrowed rather than earned and is rolled
back by the same close (ADR-091), leaving the retry to pay its peel in configs_. **Planning
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

🟡 Continue-past-victory is confirmed but unbuilt. The victory _reward_ is undecided,
under one constraint: it must not be claimable by a zero-effort farm run.

**Balance baseline.** A bare build earns one unit a right answer, and the HEALTHY
step it must earn each day climbs from 3 units at Pallet to 6.5 at the Champion,
so the ladder outruns a bare build by design from Marsh on. The balance
simulation in `coverageRatio.model.spec.ts` pins the shape: a bare build at 70%
accuracy summits about 4% of all-singles runs, better than a third once a quarter
of the polls ask for a set, and nearly always at 90%. The HEALTHY step is the
difficulty dial (ADR-073, ADR-094): one row of `GATE_RUNGS` per gate, in answers.

### 2.8 What unlocks when

The climb stages rules on two axes: **gate number** stages the coverage demanded, the
audits and the shop's services; **category coverage** stages Focus
upgrades ([4.4](#44-upgrades)). Width is on neither: it follows the build itself,
which rents the smallest rung it fits in ([5.1](#51-storage-kb)).

Every row states what you hold **while facing that gate** — which is also what the
shop before it sells, since a shop runs on the clear that precedes its gate.

<!-- BEGIN GENERATED:GATE_LADDER -->

| Gate | Swatch   | Coverage in its window | A clear pays | A miss peels | Rivals may land | Also unlocks             |
| ---- | -------- | ---------------------- | ------------ | ------------ | --------------- | ------------------------ |
| 0    | Pallet   | 60% (3)                | 32 KB        | **nothing**  | none            | Shop, **Rebuild**        |
| 1    | Boulder  | 60% (6)                | 64 KB        | 20%          | none            | —                        |
| 2    | Cascade  | 60% (9)                | 96 KB        | 20%          | none            | —                        |
| 3    | Thunder  | 60% (12)               | 128 KB       | 25%          | 1 from pool A   | **Extend**               |
| 4    | Lavender | 62% (15.5)             | 160 KB       | 25%          | 1 from pool A   | —                        |
| 5    | Rainbow  | 65% (19.5)             | 192 KB       | 25%          | 1 from pool A   | —                        |
| 6    | Soul     | 68.6% (24)             | 224 KB       | 25%          | 1 from pool A   | —                        |
| 7    | Marsh    | 72.5% (29)             | 256 KB       | 30%          | 1 from pool A   | —                        |
| 8    | Seafoam  | 76.7% (34.5)           | 288 KB       | 30%          | 2 from pool B   | —                        |
| 9    | Volcano  | 80% (40)               | 320 KB       | 30%          | 2 from pool B   | —                        |
| 10   | Earth    | 83.6% (46)             | 352 KB       | 30%          | 2 from pool B   | —                        |
| 11   | Elite    | 86.7% (52)             | 384 KB       | 35%          | 3 from pool C   | —                        |
| 12   | Champion | 90% (58.5)             | 416 KB       | 35%          | 3 from pool C   | Clearing it wins the run |

<!-- END GENERATED:GATE_LADDER -->

The clear column is what a flawless window pays before build multipliers and before
the streak.

The coverage column is the gate's HEALTHY line, the units in `GATE_RUNGS` over
the slots the run has opened. A
bare build earns at most 25% in a five-poll gate at every gate alike, so the
ladder outruns it by design and multipliers stop being optional around gate 3
(ADR-073). A clear pays the KB in this column times the streak multiplier.

The rivals column is a **capacity**, never a dealt count (ADR-099): a gate carries
only what rivals fired at it, up to that many, never two of one family. The pool is
what a rival's payload is drawn from when they aim at that gate:

<!-- BEGIN GENERATED:AUDIT_POOLS -->

| Pool  | Lands at                   | Holds                                                                               |
| ----- | -------------------------- | ----------------------------------------------------------------------------------- |
| **A** | gates 3 to 7, room for 1   | 207, 404, 405, 424, 429, 451, 500, 502, 507                                         |
| **B** | gates 8 to 10, room for 2  | 207, 300, 402, 404, 405, 408, 409, 413, 424, 425, 426, 429, 451, 500, 502, 503, 507 |
| **C** | gates 11 to 12, room for 3 | 207, 300, 403, 408, 409, 410, 413, 425, 426, 451, 500, 502, 503, 507, 510           |

<!-- END GENERATED:AUDIT_POOLS -->

425 and 510 answer to how hard they hit: 425 costs about a fifth of a window's config
value and waits for pool B, 510 has the highest ceiling of the three and is Elite-tier
only. 500 takes nothing away, so it is drawn from gate 3 on.

409 and 426 read a config's level, so they wait for pool B where upgrades exist; 413
needs a build past 12 slots to bite; 403 and 410 are Elite-tier only; 402 is absent
from pool A so the early gates teach the other rules first.

The coverage column is **cumulative, not per-gate**: it is that gate's HEALTHY units
over every slot the run has opened (`5 × (gate + 1)`), which is why the same banked
score reads lower at each gate you clear ([2.2](#22-gates)). What a single _window_
owes toward it is priced in answers rather than percent. The unlock column names no
width at all: build space is derived from the build, never bought
([5.1](#51-storage-kb)). The peel column is a share, so it already scales with the
build it hits — and a rival's **410 Gone** adds 10 points at Elite and 15 at the
Champion on top of it.

**Pallet is the calibration gate** (ADR-057, amended by ADR-094). It asks the same
60% the early gates all ask — 3 units of its 5 — so it still measures you. What makes
it calibration is that it is the one gate with **no floor beneath it and no peel**: a
miss costs nothing and cannot end a run, so the first failure teaches the loop for
free. You read your answers back, shop, and run the same gate again on 5 fresh polls.
Nothing ends a run at gate 0 — even a bare build only holds the gate. From **Boulder**
on, the peel column applies as written.

The payout column is `GATE_REWARD_KB × (gate + 1)` for a **bare build on a perfect
window**. It scales with correctness, so a 3-of-5 clear pays 60% of the row and a
0-of-5 clear pays nothing at all — an all-skip build can climb without banking a kilobyte.
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
and the build rents the rest by growing into it (ADR-098). Gates hand over nothing and
the shop sells nothing: your build occupies the smallest rung it fits in, and pays that
rung at every gate close.

<!-- BEGIN GENERATED:BUILD_SPACE -->

| Build space | 4    | 6   | 8   | 12  | 16  | 24  | 32  |
| ----------- | ---- | --- | --- | --- | --- | --- | --- |
| KB a gate   | free | 16  | 32  | 64  | 128 | 256 | 512 |

<!-- END GENERATED:BUILD_SPACE -->

**The rung is not a thing you pick.** There is no ladder to shop, because holding room
you have not filled never bought anything — the only thing a wider rung is good for is
installing something, and installing is when you get it. Nothing is refused for room
below 32, the top of the ladder: a build that does not fit its rung rents the one above.

**You still pay for room you have not filled, because the rungs are coarse.** A
9-weight build sits on the 12 rung and bills 64 KB a gate. That gap is the whole
pressure: crossing from 4 to 5 weight costs 16 KB at every gate for the rest of the run,
so the question is never "can I afford this config" but "can I afford it every gate".

**YAGNI is the one config that touches the bill** ([4.3](#43-roster)). It takes **8 KB
a gate off the rent for every slot the build leaves empty**, so the 9-weight build above
pays 40 rather than 64. Eight is deliberately less than a rung is worth: crossing up is
still always a loss and stepping back down is still always a saving, so the pressure
above survives the discount rather than being cancelled by it (ADR-122). While it is
held, every install arms — an install inside the rung you already rent now raises the
bill too, by eating an empty slot, so the press states the new figure before it commits.

**Crossing a rung asks twice.** An install that widens the rung arms instead of
committing: the press opens with `Build space scales 4 → 6` and `Upkeep becomes 16 KB a
gate`, and installs on a second press. An install that fits the rung you already rent is
one press and says nothing. Selling back down narrows the rung again, immediately.

**A bill you cannot pay is not fatal.** The run pays for the widest rung its balance
covers, and is held to that space until the build fits it: the shop will not let you
leave until you sell or drop the difference. It is the only lock on the shop door. The
free rung costs nothing, so there is always a floor.

**Minify.** Halves a config's slots and halves what it gives, one way only. It is how a
16 fits a build that has never been sixteen wide. A 1-slot config cannot be
minified: one slot is the floor.

Every build surface draws the same track: a bar per config as wide as its slots, one
**dashed** box per slot still open, and a **hatched** stub one slot wide at the end for
room the run has not bought. The two treatments are not interchangeable: a dash is a
slot standing open that a config can go into now, hatching is room still for sale.
The **Build** panel carries the bill: its header reads the configs held, the weight
against the rung it rents, the room left before the next rung, and the recurring figure
(`5 configs · 7 of 8 weight · 1 free before the bill becomes 64 KB · ↻ 32 KB a gate`).

That line carries one reading at a time: the room the config under the pointer takes
(".ts takes 1 of 8 weight"), otherwise the invitation to hover.
The room count itself sits in the section's own heading — "5 configs · 7 of 8 weight ·
1 free before the bill becomes 64 KB" — so the totals are readable with no pointer at
all. It reads "over by 2" only where an unpaid bill has capped the run under its own
build ([5.1](#51-storage-kb)), which is the one way a build can sit over its space. On a phone, where there is no hover, a config's own
chip stands in for it: opening a chip's panel lights its box on the track and prices it
on the line. Width carries no swatch: badges come from flawless windows.

**Managing configs.** Click any config chip for its popover: **Install**, **Sell**
(refunds half the draft cost in KB), **Minify**, or **Upgrade**. Anything can be
sold except your last config, since a bare build never clears.

**Starting a run.** The run deals a **hand of five** configs from the starter
pool — seeded per player per day — and picks **nothing** for you. **Two** are
marked as a suggested opening (ADR-057), which is advice and not a selection.
The hand itself never changes while configuring, so the deal reads as one
checkable list. **One config is the only floor**: pick one and you can play, and
spare room is a legal opening. The opening build is hard-capped at the free four — a
card that does not fit is refused rather than rented — so nothing can start
over-capacity, and picking nothing at all is the only thing that holds the button.
Nothing in a build is ever locked or mandatory. The run opens on the free
four and rents nothing before it starts; the ladder opens at the Boulder gate.
Nothing in the opening build is paid for, so taking one back out refunds
nothing, and the screen quotes no refund: the shop is the only place an
uninstall pays ([5.4](#54-the-shop)).

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
512 KB, Freemium at nothing (its whole cost is the bill).

12 and 16 are on the ladder but no config uses them yet — they are there for a config
worth half a maxed build. The Dex's Configs tab orders the roster by size.

### 4.3 Roster

**🟢 Shipped.** All pure effects.

<!-- BEGIN GENERATED:CONFIG_COUNTS -->

**45 configs** ship. **8** are granted at signup and the other **37** unlock individually.

<!-- END GENERATED:CONFIG_COUNTS -->

| Config                                                              | Slots | Effect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.js` `.ts` `.css` `.jsx` `.html` `.git` `.java` `.py` `.rb` `.vue` | 1     | That category's polls reward ×1.25 (Focus, upgradable)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `package.json`                                                      | 1     | General Frontend polls reward ×1.25 (Focus, upgradable)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Build Artifacts                                                     | 1     | +32 KB × level storage on gate clear                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Moore's Law                                                         | 1     | On each gate clear, +2% × level of held storage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| YAGNI                                                               | 1     | Every slot the build leaves **empty** takes **8 KB a gate** off the build space rent, so a 9-weight build on the 12 rung pays 40 rather than 64. The one config that touches the bill. It fills a slot itself, so installing it into a build already flush with its rung tips the build into the next rung and the bill goes **up** — it is worth most to a build sitting low in a wide rung, and nothing at all on the free four. Eight is less than a rung is worth on purpose: crossing up stays a loss and stepping back down stays a saving (ADR-122)                                                                                                                                                                                                      |
| ESLint                                                              | 1     | Cross out one wrong answer on JavaScript / TypeScript polls, fee doubling from 8 KB per gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Stylelint                                                           | 1     | Cross out one wrong answer on CSS polls, fee doubling from 8 KB per gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `.lock`                                                             | 1     | Lock shop offers for 16 KB each ([5.2](#52-the-shop)); a locked offer leads every shop until installed or released, and every lock releases if `.lock` leaves the build                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Planning Poker                                                      | 1     | On the prep screen before every gate, bet how many of its 5 polls you will answer correctly — **the gate will not open until you have**, and no bet can cost you anything. The number is a **floor**: answer at least that many and it pays `k x (gates cleared + 1) x 0.25` coverage units, a constant 5% of the gate's line per point bet; fall short and it pays nothing. The units land inside the window, so a won bet can lift a gate over its own line. Locks the moment you answer, and settles on a missed gate as readily as a cleared one                                                                                                                                                                                                            |
| `strict: true`                                                      | 1     | Armed before you answer: an exact answer pays **+0.5 units**, and a partial, a miss or a timeout takes 0.5 units off the gate window (clamped at 0). It disarms after every answer. The one config that can make an answer cost coverage (ADR-089)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Regression Test                                                     | 2     | A poll this account has answered before without getting it fully right pays ×2. A partial counts as a miss: a regression test covers a case that did not pass. The set is read fresh every time the sequence is loaded and never stored, so it shrinks as you learn — getting a poll right retires its test. It reads on any category, since a miss is not a subject                                                                                                                                                                                                                                                                                                                                                                                            |
| Cold Start                                                          | 2     | The gate's first answer pays nothing; every answer after it rewards ×1.5. The cold one is the slow one, so the config front-loads the cost rather than the payout — it is Overclock read backwards, and averages the same ×1.2 across a full window                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Code Coverage                                                       | 2     | +0.1 units of coverage per correct answer, flat: no multiplier amplifies it (ADR-083)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| IndexedDB                                                           | 2     | +8 KB storage per correct answer, capped at 320 KB                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Database                                                            | 2     | Each exact answer opens an **8 KB transaction** instead of paying it. Clearing the gate — on any band, OK included — commits it at **×2**; SHAKY or DANGER rolls the whole thing back. Shares IndexedDB's 320 KB run cap, metered on what it **commits** rather than what it holds, so a rollback costs no cap room. The only earner a gate can take back, which also means a held gate leaves no faucet KB to pay its peel with (ADR-091)                                                                                                                                                                                                                                                                                                                      |
| Telemetry                                                           | 2     | Paid peek at how everyone ever answered this poll ([4.5](#45-paid-actions-lint-peek-and-buy-back))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| A/B Test                                                            | 2     | Ships one of two arms, switched free at any time — in the shop or mid-poll, where the switch scores the answer you are about to give (ADR-053): A pays ×1.25 on all coverage, B pays +8 KB per correct answer (sharing the faucet's run cap)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `.length`                                                           | 2     | Names how many correct answers the gate's 5 polls hold. It pays no KB: the per-extra-pick payout was taken off deliberately, so that a config bought for a reveal cannot earn its keep on the ledger while the reveal itself is still unbuilt on the screens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Garbage Collection                                                  | 2     | Every config you **drop** to pay a peel refunds its sell value. WTFPL zeroes it and Freemium halves it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Dry Run                                                             | 2     | While an answer is picked, the coverage meter marks where the gate lands if it scores and where it lands if it misses. It reads nothing about the answer itself: both marks come from the per-answer figures the poll already quotes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `Math.ceil()`                                                       | 2     | A partial select-all answer earns the fraction it needs to reach a whole unit: a quarter caught pays 1 and three quarters pays 2. The top-up is flat, so no multiplier amplifies it — which is what keeps a near-miss behind a full answer in any build above a bare one (ADR-086)                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| SLA                                                                 | 2     | On the prep screen before every gate, promise **OK**, **HEALTHY** or **PERFECT** — **the gate will not open until you have**, and no promise can cost you anything. Close in that band or better and the gate's own payout rises **+10%**, **+25%** or **+50%**. The rate is read off the band you _promised_, never the one you landed in, so promising PERFECT and closing HEALTHY pays nothing where a promise of OK would have paid. A floor, like Planning Poker's: beating your own promise still pays, and missing it costs nothing beyond the uplift you did not get. The one thing in the game that makes a better clearing band worth more KB — the base payout is the same at OK as at PERFECT (ADR-096)                                             |
| `&&`                                                                | 4     | Correct answers **chain**. The first link pays **1 KB** and every link after it pays **double** the last (1, 2, 4, 8, 16, 32, 64, 128, 256), so nine in a row empties the run faucet on its own. Any wrong answer short-circuits the chain back to its first link; a partial neither extends nor breaks it. The chain **survives a gate clear**, where the engine's own streak resets — which is what makes it a second number rather than a second reading of the same one. It shares IndexedDB's 320 KB run cap, so it is an opening-game plan the way Freemium is, and its row on the poll screen states what the next link pays before you answer (ADR-121)                                                                                                 |
| Try/Catch                                                           | 4     | A gate that would close in **DANGER** holds instead, owing its peel — the one exception to "no retry, no peel, no choice". The catch is spent doing it and **deletes itself**, and its own 4 weight is the first thing that peel takes, so it settles 4 slots of the debt on its way out. It handles the exception rather than undoing it: you still owe the peel and still have to re-run the gate. A caught gate can never then die to its own peel. Re-drafting it later buys a second catch at full price (ADR-096)                                                                                                                                                                                                                                         |
| vendor lock-in                                                      | 4     | Names one config in the build as the run's vendor. That config keeps its weight and keeps paying its effect, but the build space you rent is measured as though it were not there, so the room it frees is a rung you no longer have to pay for. In exchange it cannot be sold or dropped for the rest of the run. It asks for its target the moment it joins the build — in the opening build or in the shop — and the screen holds until you name one, so the weight can never be spent on nobody. It cannot name itself, and it only pays on a config heavier than its own 4 — the thing worth exempting is the thing you would least like to be stuck with. A peel can still take the locked config, and selling vendor lock-in releases the lock (ADR-087) |
| Intellisense                                                        | 4     | All coverage ×1.5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Deprecated                                                          | 4     | All coverage ×3, fading ×0.5 each gate clear; deleted from the build at ×1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Cache                                                               | 4     | Correct answers warm their category for the rest of the run: each cached hit pays +0.25 units of coverage there, capped at one unit (4 hits). A wrong answer in the category flushes it cold; a partial neither warms nor flushes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Prefetch                                                            | 4     | Shows, for every poll left this gate, its category, how many options it offers (in play order), and how many of the polls take more than one answer, plus all of the next gate's categories. Asking for polls not yet dealt rolls tomorrow's shared seed a day early — the questions stay sealed                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| git rebase -i                                                       | 4     | Before a gate starts, names its 5 polls by **category** and moves any of them up or down the queue. **v2** also names which of them take more than one answer. The order locks the moment the first answer lands. Prefetch stays the richer read (option counts, next gate); rebase owns the order instead, and it is the only config that touches poll sequence — which is what Cold Start, Overclock, Cache and Dependabot all quietly depend on                                                                                                                                                                                                                                                                                                              |
| Overclock                                                           | 4     | The gate's first answer earns ×4 coverage; every answer after it runs hot at ×0.5, cooling off at the clear. Miss the opener and the gate is nearly dead — the buy is variance, not magnitude (×1.2 average, honestly under Intellisense)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| AGENTS.md                                                           | 8     | All coverage ×2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Volkswagen CI                                                       | 8     | Reports the gate's first audit as passing; costs 384 KB to draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Dependabot                                                          | 8     | Counts correct answers: **5 in a row** (4 at L2) upgrades a random installed config, free, then the count restarts. A wrong answer or a failed gate starts it over, so it pays for a clean streak rather than for time. Its row on the poll screen shows the countdown ("bump in 3"). The pick ignores the Focus coverage gate the shop enforces, so a merge lands without review                                                                                                                                                                                                                                                                                                                                                                               |
| WTFPL                                                               | 8     | Every shop offers the entire roster; costs 512 KB, every sell refunds 0 KB while it is installed (its own included), and Rebuild/Lock/Extend retire                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Freemium                                                            | 8     | **Free to draft.** Every config drafts at half price while it is installed, and refunds drop to half of that discounted price. Each gate cleared bills 8 KB × 2^gate (8, 16, 32, 64, 128, 256…), charged after the clear pays; a bill the balance cannot cover lapses the config and frees its eight slots                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

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
| Vite config           | 1     | Not built. +0.25 units of coverage on JavaScript / TypeScript polls answered under 35 s                                                                                                                      |
| `.every()`            | 1     | Not built. +0.1 units of coverage when a category you have 5-streaked appears                                                                                                                                |
| Semver                | 1     | Coverage ×1.2 for each Focus config at L2 or higher                                                                                                                                                          |
| Weekend Project       | 1     | Saturday and Sunday gates pay +50% storage                                                                                                                                                                   |
| Benchmark             | 2     | See your paired ghost's answer before you commit                                                                                                                                                             |
| `.tsx`                | 2     | TypeScript and React polls reward ×1.25                                                                                                                                                                      |
| git stash             | 2     | Once per window, stash the current poll; it returns last                                                                                                                                                     |
| Watch                 | 2     | Pick a category at draft: its polls get double draw weight                                                                                                                                                   |
| `--save-exact`        | 2     | Every future draft costs 20% less                                                                                                                                                                            |
| Snapshot Testing      | 4     | Polls you have already seen reward ×2                                                                                                                                                                        |
| Hotfix                | 4     | A failed gate still opens the shop                                                                                                                                                                           |
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
you buy: **Mirrored Check** is now Marsh's Mirror, **Speed Check** is now Timeout.

Open: General Backend has no Focus config yet, and it should not get a solo one.
`Node.js` (JavaScript + General Backend) in the dual-focus pool above is the
literal fix — the category is server-side _concepts_ (its polls are databases,
HTTP and auth), not a file, so every file-shaped name invented for it has been
wrong twice over: `.be` is not a real extension, and `.env` is read by Vite and
Next as readily as by any server.

### 4.4 Upgrades

Upgrades cap at **level 5** (the 5-poll window is the natural ceiling); Telemetry and
git rebase -i are the exceptions at level 2. Every upgrade costs
`32 KB × the level bought`.

- **Focus configs** answer to two gates (ADR-039): level N to N+1 needs `5% × N` career
  coverage in that category **and** the storage. Coverage is permission, KB is the
  price, and neither substitutes for the other, so an earned level can be unaffordable
  and a funded one unearned. Each level raises the payout (`1 + 0.25 × level`).
- **Build Artifacts** buys +32 KB payout per level on clear. Storage only, no coverage gate.
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
states what rides on top of the base: the Focus multiplier when the poll matches, and
the streak step, which every correct answer takes (one correct answer is already a
streak of one).

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

**Crossing a rung arms the install press.** An offer that would widen the rung states
`Build space scales 4 → 6` and `Upkeep becomes 16 KB a gate` on the first press, and
installs on the second. An install that fits the rung already rented is one press.
Selling narrows the rung again immediately, and refunds half the draft cost.

Weight both earns and bills. A heavier build scores more coverage per answer and so
earns more per gate, while costing more per gate to run; the whole question of a run is
whether the first outruns the second. The rung prices and what a proven slot pays are
tuned against each other and neither moves alone.

**Nothing is refused for room below 32**, the top of the ladder: a build that does not
fit its rung rents the one above rather than being held out of it.

**A bill you cannot pay caps the build.** The run pays for the widest rung its balance
covers and is held to that space: the shop's exit stays shut until the build fits it —
sell or drop the difference. It is the only lock on the door, and it clears when the run
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

| Action      | Cost                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Draft**   | 32 to 512 KB by size                                 | One of 5 offered configs, new ones only. The offer's **Install** press carries the spend on it (`Install · 64 KB`), the same press the opening hand deals with; it greys and refuses while the room or the balance is short, price still showing.                                                                                                                                                                 |
| **Rebuild** | 4, 8, 16, … 512 KB                                   | Re-rolls the offer, doubling per rebuild within the same shop.                                                                                                                                                                                                                                                                                                                                                    |
| **Lock**    | 16 KB a lock                                         | Requires **`.lock`** in the build (ADR-054); without it the registry shows no padlock at all. Pins any number of offers: rebuilds skip them and every later shop leads with them, until each is installed or released. Releasing is free and refunds nothing, and every lock releases if `.lock` leaves the build. A pinned offer occupies one of the registry's slots, so locking the whole registry freezes it. |
| **Minify**  | free                                                 | Halves a config's slots and halves what it gives, one way only. The only way to fit a 16 into a build narrower than sixteen. A 1-slot config cannot be minified.                                                                                                                                                                                                                                                  |
| **Extend**  | 48, then 96 KB                                       | One more config on the table, in this shop and every shop after. Two per run. From gate 3.                                                                                                                                                                                                                                                                                                                        |
| **git tag** | 128 KB at gate 4, +64 KB per gate, 512 KB at gate 10 | A cross-run checkpoint: after a death, your next run checks out there instead of gate 1. One per run, burnt by the run it rescues.                                                                                                                                                                                                                                                                                |
| **kill -9** | free                                                 | Ends the run on a second press, the first arming it; banks nothing. A service earned by clearing gate 5 (ADR-115 D11), then in every shop.                                                                                                                                                                                                                                                                        |
| **Sell**    | refunds half the draft cost                          | Never your last config.                                                                                                                                                                                                                                                                                                                                                                                           |
| **Upgrade** | `32 KB × the level bought`                           | Focus configs also need the coverage ([4.4](#44-upgrades)).                                                                                                                                                                                                                                                                                                                                                       |

A tag-rescued run starts at the pinned gate with a 32 KB-per-gate stipend, everything
else fresh, and its death credit counts only the gates it actually climbed. It opens on
the free four like any other run and rents its space out of the stipend. Gate 10 is
the last that sells a tag:
deeper, a rescue would resume a starter build into stacked audits and a half-build
peel.

An offer is refused for **price**, and for **room** only at the top of the ladder
(ADR-098) — below 32 weight a build that does not fit its rung rents the one above,
so room has nothing to refuse. The badge says which: `Needs 4 slots, 1 free` is a
different problem from `Costs 128 KB, you have 90`.

**Build space is not a shop action any more.** The rung follows the build, so the price
of widening rides the install that widens it: an offer that crosses a rung arms, stating
the scale and the new standing bill, and commits on a second press ([5.1](#51-storage-kb)).

The shop always shows _why_ a locked action is locked: not enough storage against
unmet coverage are different problems and read differently.

---

## 6. Meta-progression

### 6.1 Archived storage

Leftover run storage converts into persistent **archived storage** at the outcome rate
(100% victory, proportional on death, 0% on abandon). It is the account's one
persistent wallet, and it buys two things (ADR-112):

- **Appearance** — profile borders, 256 KB to 32 MB, bought on the profile.
- 🟡 **Run services** — Boot Cache (starting storage), Docker Image (one config from
  your last finished build guaranteed as an offer) and the git tag's deposit
  ([5.2](#52-the-shop)); bought once per run, before it, and consumed with it.
  Decided in ADR-115, not yet built (DVTD-0now).

Nothing inside a run spends it (ADR-112 D4). It **cannot** open a run wider — ADR-082
deleted the start-slot ladder, so every run opens on the same free four and grows by
renting ([5.1](#51-storage-kb)) — and it never buys a config unlock (ADR-050: unlocks
are achievement only). The balance reads on the profile, in the Dex header, and as a
before → after step on the gate and run-over screens.

The archive **carries across the 2.0 cutover at face value**: it was banked by real
play under a rule that already said it persists, so ADR-051's no-backfill line does
not reach it. Accounts that played the calendar game are credited once on top of
what they hold — 256 KB for having played, 1 MB instead for a climb the cutover
ended (ADR-112).

### 6.2 Unlocks

Configs are exposed on the **Reveal / Grant / Stage** model (ADR-050/051). Grant
gates the starting hand only — the shop's registry always offers the whole
roster. The set granted at signup ([4.3](#43-roster) counts the roster against it):

<!-- BEGIN GENERATED:STARTER_POOL -->

`.js`, `.ts`, `.css`, ESLint, Build Artifacts, Code Coverage, IndexedDB, Cold Start

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
reach Cascade and the git tag the first time you reach gate 4, both off a
`reached-gate:N` metric that ticks for every gate a clear reaches. A locked
service reads named in the shop and the Dex, a `?` for its glyph and the line
that earns it where its price would go, and an unlocked one is still sold only
from its gate ([5.2](#52-the-shop)). Nothing is backfilled: a depth reached
before the ledger existed has to be reached again. Hot Reload (rebuild 5 times),
Return Policy (sell 5 configs), kill -9 (clear gate 5), Boot Cache (bank 256 KB
from one run, a one-shot at run end off the archive credit) and Docker Image
(finish a run still holding a config from the dealt hand, likewise) count
already. 🟡 Their presses and purchases are DVTD-r2fg, DVTD-rte1 and DVTD-0now;
until then an earned one reads _not for sale yet_ in the Dex.

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
(it _is_ Indigo Plateau) with a rim so it reads, and the **Champion** alone wears the
Kanto gradient.

**The gate themes the run** (ADR-020): the swatch of the gate being played sets the
whole app's accent colour, so climbing feels like travelling Kanto. Elite's ambient
theme is a lightened indigo and the Champion wears fuchsia, both for readability, and
the celadon/cinnabar pass-fail moods still override the gate theme on reward and strip
screens.

Swatches surface in the run log's clear line, the Configuring stat row, the end-of-run
summary, and the Dex's Swatches tab.

🟡 **Collect Swatches** (DVTD-g8ty): a _per-category_ cosmetic chip earned through
mastery, a separate collection that reuses the name deliberately.

### 6.4 The Dex

The Pokédex of DevVoted, titled **Dex** — the word the navigation already uses.
**Registry** is reserved for the shop's in-run offer list and never names this
screen. Eight tabs, each colouring the whole screen after the collection you
opened.

The Dex is not a page of its own: it is the lower half of **your profile**, at
`/profile/$userId`, under the card that names you ([6.7](#67-your-profile)).
`/dex` redirects there. Six of the eight tabs are the collection — polls,
configs, services, audits, swatches, runs — and the last two, **borders** and
**titles**, are the shelves you equip from; they are drawn on your own page only
(ADR-125).

**Polls** tracks every poll you have been dealt, with its repeats and its
fully-correct record ("answered ×4", "3/4"). A poll you have never been dealt
gives up nothing at all: its category and its question both read `???`. The row
says _answered_, not _seen_: nothing in the session engine writes
`polls_history`, so a dealt-but-unanswered count does not exist yet.

**Configs** is the unlock checklist, read as the same config card the run
screens draw (ADR-119, ADR-120), grouped by weight, heaviest first. Each group
is headed by a labelled bar: the weight block, the weight named ("weight 2"),
how much of it you hold ("4 of 14"), then a rule. Inside a group what you hold
reads before what you owe. The tab arrives collapsed, with one press in the
panel header to open every card.

Shut, a granted card is its weight block, its name and the effect's headline
figure as a badge ("×1.25", "+8 KB"). Open, the effect reads as a sentence in
the card's body, and under it how the config came to you and the rung an install
gives you: "Starter config · v1 of 5", or "Earned: peeked the community split 5
times · v1 of 2" (off `via_metric`). The footer carries the ceiling of the
version ladder as a pennant ("v5") beside the badge. The pennant names how far
the config can climb, never a version you hold: versions are bought with storage
inside a run and lost with it ([5.4](#54-the-shop)), and most of the roster has
no ladder and wears no pennant. A config whose effect has no figure (Telemetry's
peek) wears no badge. What a further version costs and how often the registry
rolls one is stated in the shop, where it is bought, not here (ADR-108).

A locked config is a dashed card showing only its weight and a `???` where the
name goes; the dashed edge reads as an empty socket in the checklist that play
already underway fills. Opening it states both unlock paths with live progress:
the requirement with its count ("Peek the community split 5 times", 3/5) and the
alternative as a bar with its own count ("or", 43/100), naming itself to a
screen reader, which the bar cannot (ADR-051; one-shot objectives carry no
count). The redaction is per-attribute and type-enforced: the weight and the
paths are stated, the name and the effect withheld. ADR-050's middle state, met
but not earned, has a card and no data yet (below).

**Services** lists every service the roster knows in one section (ADR-115
D10), registry services first: Rebuild, Extend, Hot Reload, Return Policy and
kill -9, then the git tag, Boot Cache and Docker Image. Each row names where it
is bought and how long the purchase lasts (`Registry · this visit`, `Run ·
carries into your next run`, `Next run · consumed on start`) and ends in its
price or, for a service the account has not earned, `unlock · …` with a `?`
for its glyph. A service is **unlocked once per account** (ADR-116) and the
same row, named the same way, stands in the shop: Rebuild is a starter, Extend
unlocks the first time you reach Cascade, the git tag the first time you reach
gate 4, kill -9 when you clear gate 5. The unlock says whether; the gate still
says when (Extend from gate 3, the tag in gates 4 to 10), and the Dex no longer
lists the gates. An earned service nobody sells yet reads _not for sale yet_.
Offer locks are not here: locking arrives with the .lock config, so the Configs
tab already reveals it (ADR-054). 🟡 The git tag is still bought in the shop
today; buying run services from the archive before the run is ADR-115,
DVTD-0now, and the Hot Reload and Return Policy presses are DVTD-r2fg and
DVTD-rte1.

**Audits** lists every audit as met or unmet (`???` until met), each with the
gates it can land on. It carries no counts yet, though it now could on one side:
every rival attack is a durable `audit_incidents` row (ADR-099), so audits
**received** are countable per run and per day. Audits **sent** are not — the row
records who fired it but not which of their runs did, so "attacks this climb" has
nothing to read. 🟡 Wiring the received counts to the tab is DVTD-gvc9.

**Swatches** is the gate ladder as a grid — one card per gate, earned ones
filled and marked "swept", the next gate dashed, the rest empty sockets.

**Runs** is the archive of finished climbs, newest first: the date, the ladder
showing the gates that run swept, the gate that held it, and its final coverage
with the band that coverage falls in. Coverage is read as a share of the slots
the run opened, never as the raw units `run_states.coverage` stores.

🟡 Planned: collection stats, per-poll community success rates,
the Configs tab's registry-Reveal "met" state (ADR-050, DVTD-s5vo), storage-plan
rows on the Services tab (blocked: no plan ladder exists yet), and real
audit-firing counts (DVTD-gvc9).

### 6.5 Borders and seasons

Avatar borders are decorative unlockables bought on your profile's borders tab
([6.7](#67-your-profile)) and worn on your card. An equipped border is worn wherever the game draws you, including the
byline crediting a poll you wrote ([8](#8-interface)), which is where other players
meet it; 🟡 rarity-based border unlocks via meta-progression are planned. Runs and
leaderboards live inside **seasons** (upcoming, active, finished, archived), the
temporal container for competitive resets.

### 6.6 Titles

A **title** is earned identity. Where a border is bought and a role is assigned, a
title is the one label that says what you have done (ADR-109).

Titles are **permanent**. Each is a threshold on your own record — `25 correct Git
answers`, `a correct answer in every category`, `clear all thirteen gates` — never a
comparison against other players, which is what the category seat
([7.3](#73-category-leaders)) is for and why the two stay separate. Crossing the bar
writes the title to your account and the check is never run again, so a record that
later stops being true never costs you the title.

You may hold many and **wear up to three at once**, in the order you put them on
(ADR-125). Your card shows every title you wear ([6.7](#67-your-profile)); everywhere
else shows the **first** one — your open build when a rival inspects it
([7.1](#71-the-community-board)), and the byline of a poll you wrote
([8](#8-interface)). Compact climb chips stay avatar-only. Titles are settled when a
run ends, and a title you have not been shown yet is announced in a notice the next
time you open the game — once, and never again.

Three titles are not thresholds. **First Ascent** goes to the first account ever to
clear all thirteen gates and can never be won again. The other two are **granted**:
they belong to the accounts that played the calendar game before the rebuild and
cannot be earned at all (ADR-111). **Legacy Tester** goes to anyone who started a run
back then; **Legacy Climber** goes to the narrower set whose run was still open when
the rebuild landed and closed it. A granted title is invisible to everybody outside
that cohort — it is not listed, locked, or hinted at on their shelf, because there is
no bar they could work towards.

🟡 The title roster is small and is expected to grow.

### 6.7 Your profile

Every player has one page, at `/profile/$userId`, and it opens with one **card**:
the border you wear, your avatar, your name, and the titles you wear. That card is
the same component wherever the game shows a player, so you recognise somebody from
their page before you have read the name (ADR-125).

**Your own page** carries the whole Dex under the card — the six collection tabs
plus **borders** and **titles**, the two shelves you equip from
([6.4](#64-the-dex)). The archive balance rides the collection heading, because
that is what the borders cost. "Edit profile" on the card opens the borders tab:
your name and your photo come from the account you signed in with, so what you
wear is the whole of what you can change.

**Somebody else's page** gives you the card and four counts — polls seen, configs
held, gates cleared, archive. No tabs. The collection is your own record of what
the game has shown you, and a visitor reading your unanswered polls would be
reading ahead; the same line the climber card already draws, where answers,
unanswered polls and prefetch stay private.

You reach another player's page by pressing their **face** — on a poll byline, on
the category seat, on the climb map card, on a rival in the attack panel. The
`@handle` beside the face still goes to GitHub. One is who they are here, the other
is who they are there.

---

## 7. Community

The social layer works because of the shared daily seed: everyone climbs the same
polls on the same day.

### 7.1 The community board

After every shop visit the climb detours through `/run/community`, and a run locked for
the day lands here too, with "Back to your run" disabled until local midnight and the
countdown beside it. The page wears the terminal-theme kit (`CommunityScreen.ui.tsx`),
one panel per section: turnout, the map, the category leaders, then the polls. What
the board has to say about the day (still loading, could not be loaded, nothing to
compare yet) reads as the subtitle under the board's title. Every avatar chip on the
page — leaders, climbers, fallen — wears the player's equipped border over a GitHub
photo or a two-letter-initials fallback.

**Category leaders** ([7.3](#73-category-leaders)) is the board's own section: twelve
rows, one per category.

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
panel under the track on a wider screen. It names them, links their GitHub account and
states the title they wear, then where they stand, how their last gate closed, the
coverage they have banked as a percentage, the weight their build carries against the
space it rents, and their storage. Their whole build is there as config chips, with the
vendor-locked one badged, and three tiles carry their streak, the category they have
been right in most often, and their gate. What a run knows that you do not stays
private, and the card says so (ADR-101 §2, narrowed 2026-09-26). 🟡 Climbers folded
behind `+N` have no chip to press.

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

### 7.3 Category leaders

🟢 **Shipped.** One row per category, twelve in all, held seats first and longest run
at the top. A row states the category, the word "leader", the holder's avatar and
handle, and their record ("21 in a row"); the seat you hold rings the avatar, greens
the figure and themes the row. The panel head carries the scope ("longest run of
correct answers · all-time") and a count of held seats ("9 of 12 seated").

The figure is the same all-time record the poll screen states
([2.4](#24-polls-and-categories)) — the longest unbroken run of correct answers anyone
has strung together in that category, read straight off the answer ledger. Under
**3 in a row** the seat is open and says what claims it; the footer states how a seat
moves: _a seat changes hands when somebody beats it_. It cannot be lost by missing,
because the record is a best and not a live streak.

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

Every audit in the game is interference (ADR-099, [2.3](#23-audits)): a HEALTHY or
PERFECT clear arms one audit, and from gate 3 (ADR-105) prep's **Your audit** panel
offers three rivals at your gate or ahead who last cleared strong. Each rival reads as
a person: their face, the gate the audit would land on, what their build costs to run,
and the build itself (ADR-101). Opening one shows the payload the server rolled, what
it does, and — where the build alone names one — the config it would take out, lit in
their build. One press files the incident against their next gate. The audit is drawn
from that gate's pool, never chosen; it locks when the rival clears the gate they are
in, so their receipt names it and you before they walk in; surviving it pays them 32
KB, and you earn nothing from their death.

Prep's **Audits** panel is the other half of the same exchange: what rivals locked onto
the gate in front of you, each row naming who fired it, with a **respond** press that
opens that player's row on the panel below when they are one of the three you were
offered. It is a shortcut, not a reply mechanic. The community board carries an
**Incidents** panel listing everyone's incidents filed today, queued / locked /
survived / failed, with your own rows ringed.

🟡 A board row for the most wanted and the survivor, and a run-over tally of incidents
faced, are not built. A **Force push** (reorder a rival's gate) would ride the same
queue if it is ever wanted.

### 7.5 Other social plans

🟡 **Custom poll creation**: trusted players author their own polls and are rewarded
for it, because writing a good rhyming poll is genuinely hard work.

🟡 **Loot and fallen runs**: when another player's run ends, their abandoned loot
becomes lootable by players who encounter it. Mechanics undefined.

---

## 8. Interface

The game leans hard into its CI metaphor.

- **Run HUD**: storage as a **balance** — "320 KB" over the word `balance`, and no
  bar. Nothing caps storage ([5.1](#51-storage-kb)), so there is no ceiling to draw
  against: a bar would need a full mark it does not have, and read as a tank emptying
  besides. **The balance names every change it makes** (ADR-124): the figure counts to
  its new reading, tints green on a gain and red on a spend, and a signed pill above it
  says what moved. Several changes landing close together queue and play in order, one
  at a time, so none is overwritten before it can be read. Then the gate, polls
  answered, streak, and total coverage. The gate is
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
  _free_: a starting config costs room, never storage. It prices no band: the
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
  on the clear row is always one the table below it draws, OK at every gate Pallet
  included, and the row also states the two right answers the day itself owes
  (ADR-094): it ticks only once both are in hand. On the right, **the five polls** (sealed unless a
  prefetcher is installed), the gate's **audits** with the bill a clear will settle and
  the player who fired each one, and **Your audit** — the rivals an armed audit may be
  aimed at ([7.4](#74-interference)). Both audit panels draw shut until gate 3,
  naming the gate that opens them (ADR-105). The build is not on it (ADR-078). The footer leaves for the community board or back
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
  _does_ draw its empty segments, unlike the grade cluster, because a level is a
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
- **A gate's three standing facts**: the question leads the poll screen, and what the
  run is scored on stands beside it — a banded bar in a coverage panel of its own
  (ADR-070), in a column to the right of the poll on a wide screen and under it on a
  phone, following the answers down the page rather than scrolling away above them.
  The panel is headed by the reading it draws — "35 of 40 SHAKY", units held against the gate's HEALTHY units
  (ADR-106), so a cleared gate raises the line instead of shrinking the figure — beside
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
  lives in the poll panel's own head, beside the category badge — "wrong costs 0.5".
  None of the three folds: a screen you answer on should not be able to hide the terms.
  The send sits inside the poll panel, between the question and the byline, and is the
  top of a stack of two pinned bars (ADR-114): the build sheet rides the bottom of the
  viewport, the send rides directly on top of it, and each settles into the page as its
  own place in the page scrolls into view — the send above the byline, the sheet at the
  end. The send is seated off the sheet's measured height, so opening the build fold
  lifts it rather than burying it.
- **A poll states its own record** (ADR-094): between the poll panel's head and the
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
- **The answers are one framed box** (ADR-094): the choices rule against each other
  inside a single bordered list rather than floating as separate rows, rounding only
  at the ends so a picked fill stays inside the frame. The keycap still carries the
  answer type in its shape — round for a single, square for a select-all.
- **The poll is one column of panels**: the gate header, then a coverage panel, an
  audits panel, the poll panel and the build, all sharing one width and one left edge,
  the button as wide as the options it commits to. Nothing on the screen is wider than
  the question. The poll panel's head names the step out loud — "Poll 4 out of 5" —
  rather than drawing a row of crumbs for it.
- **A link is white and underlined**: not blue, not the gate's colour. Every hue in
  the kit already means something — a gate's swatch, a figure's sign, an audit's alarm
  — so a coloured link would be saying something it does not mean. White is the one
  tone left that reads as emphasis and nothing else, and it has to out-read prose that
  is almost always muted. The poll's byline is the case that set the rule: the handle
  is the author's GitHub username, so it links there and opens away from the run, while
  "Created by" and the editor's title stay quiet around it.
- **Every figure wears a badge** (ADR-066): a KB amount, a coverage percentage, a
  price or a multiplier is always boxed, never drawn as bare text, so a price can never
  be read as a prize. The words around it stay muted; a sign earns the colour (green
  for what is paid, red for what it costs, saffron for a sub-1 multiplier) and an
  unsigned figure takes the screen's own. One hero readout per screen — the headline
  gain, the balance closing a ledger — is the single exemption, because if every number
  is boxed then none of them is the answer to "what did I just earn". A slot count is
  not a figure: the weight block already owns that (ADR-047, ADR-060). A fatal gate states the whole run as the cost ("The run ends here") instead
  of counting configs. Two vocabularies badge alongside the figures: a band word
  (DANGER…PERFECT) in the ladder's own colour, and a poll category in no colour at
  all. Both are matched case-sensitively, which is what keeps an ordinary word out.
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
  handle, and their account role when they hold one ("@matthijsgroen · Poll editor").
  Roles are **Poll editor** and **Admin**: authority, assigned, never earned; an
  ordinary player has none. Beneath that line sits the **title** they wear, if any
  ([6.6](#66-titles)) — earned through play, so it is a different claim and gets its
  own line. With no photo on file the handle's first letter stands in.
- **The category leader**: under the byline, one line states who leads the poll's
  category ([2.4](#24-polls-and-categories)) — the category badge, the word "leader",
  the leader's avatar and handle, and the record pushed to the far end ("17 in a row").
  Holding it yourself rings the avatar and greens the figure. A seat nobody holds reads
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
  **Start new run**, with the community board beside it.
- 🟡 **Learn Home**: a Duolingo-style path/hub planned as both the start point and the
  "no polls left today" destination (DVTD-jhgg).

---

## 9. Glossary

| Term                    | Meaning                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Run / Climb**         | One playthrough, spanning multiple real days.                                                                                                                                                                                                                                                                                         |
| **Gate**                | A checkpoint auditing a 5-poll window: its coverage demand plus its audits.                                                                                                                                                                                                                                                           |
| **Gate number**         | Counts from 0: a run opens on gate 0 and summits on gate 12.                                                                                                                                                                                                                                                                          |
| **Gate meter**          | The run's coverage, the only score a gate judges. Cumulative: units banked over every slot the run has opened.                                                                                                                                                                                                                        |
| **Audit**               | A rule a gate carries (a mirror, a leak, a clock, a shut shop, a config knocked offline). Every one was fired at you by a rival and locked in before the gate opened; the stake receipt names it and its sender. Gates 3–7 have room for one, 8–10 two, 11–12 three.                                                                  |
| **Incident**            | One rival's attack: queued at your next gate, locked when you clear the one before it, survived when you clear under it. Public on the Incidents page.                                                                                                                                                                                |
| **Attack**              | What a HEALTHY-or-better clear arms: one shot, aimed from prep at one of three offered rivals, held for the run until fired. PERFECT rolls two payloads to choose between.                                                                                                                                                            |
| **410 Gone**            | An audit that deepens the peel by 10 points at Elite and 15 at the Champion, where a rival lands it.                                                                                                                                                                                                                                  |
| **Peel**                | What a missed gate takes: configs of your choosing, before the same gate runs again.                                                                                                                                                                                                                                                  |
| **Build**               | Your active setup: the track of config slots. Shown as **Your Build**. Public: any other player can read yours (ADR-101).                                                                                                                                                                                                             |
| **Slot**                | One unit of room in the build, also called weight. A config takes as many as its size says: 1, 2, 4, 8, 12 or 16. Four are free; the rest are rented by the gate. Opens no gates.                                                                                                                                                     |
| **Minify**              | Halving a config's slots and its bonus, one way.                                                                                                                                                                                                                                                                                      |
| **Config**              | An installable dev-tool item: an effect with a price, demanding nothing.                                                                                                                                                                                                                                                              |
| **Coverage**            | The score: a percentage per category plus a run total (career), and the gate meter (cumulative across the run). In fiction: **knowledge coverage**.                                                                                                                                                                                   |
| **Storage**             | The in-run currency, in KB. Nothing caps what you can hold.                                                                                                                                                                                                                                                                           |
| **Build space**         | The room the run rents, always a rung of the ladder: 4 free, then 6, 8, 12, 16, 24, 32. Derived from the build — the smallest rung its weight fits in — never picked (ADR-098).                                                                                                                                                       |
| **Build space ladder**  | What each rung bills a gate: free, 16, 32, 64, 128, 256, 512 KB, charged on every clear. Crossing a rung arms the install that crosses it. Fall behind and the run is capped at the space its balance covered until the build fits.                                                                                                   |
| **Archived storage**    | Persistent cross-run storage: the meta-progression currency.                                                                                                                                                                                                                                                                          |
| **Faucet**              | Any per-correct-answer storage income (for example IndexedDB).                                                                                                                                                                                                                                                                        |
| **Draft / Rebuild**     | Buying a shop config / re-rolling the offer at a doubling cost.                                                                                                                                                                                                                                                                       |
| **Lint**                | Paying a fee that doubles across the gate to disable one wrong option (needs a linter config).                                                                                                                                                                                                                                        |
| **Peek**                | Paying an escalating fee to see how the community voted (needs Telemetry).                                                                                                                                                                                                                                                            |
| **git tag**             | A shop-bought cross-run checkpoint, priced by the gate it marks, burnt by the run it rescues. 🟡 Becomes a run service: a deposit before the run, placement in the shop (ADR-115).                                                                                                                                                    |
| **kill -9**             | The service that abandons a run: free, two presses, banks nothing, earned by clearing gate 5 (ADR-115 D11).                                                                                                                                                                                                                           |
| **Service**             | What the shop and the archive sell beside configs, unlocked once per account (ADR-116). A registry service is bought in the shop with run storage; a run service is bought once per run from the archive before it starts (ADR-115). Where each is sold is a roster fact, and the Dex lists all of them in one section (ADR-115 D10). |
| **Seed**                | The shared per-day poll sequence every player climbs.                                                                                                                                                                                                                                                                                 |
| **Segment**             | One day's 5-poll chunk appended to a persistent run.                                                                                                                                                                                                                                                                                  |
| **Swatch**              | A gate's collectible badge (Pallet to Champion), earned by answering its 5 polls right and kept across runs. Its colour themes the app while that gate is played.                                                                                                                                                                     |
| **Kanto colours**       | The palette, keyed to gates via their swatches, never to categories.                                                                                                                                                                                                                                                                  |
| **The Dex**             | The collection screen, titled Dex (Polls, Configs, Services, Audits, Swatches, Runs).                                                                                                                                                                                                                                                 |
| **Water-cooler moment** | The design north star: same polls, same day, compare answers.                                                                                                                                                                                                                                                                         |

---

## 10. Numbers reference

Every number above lives in code; this is the constant sheet, grouped by where it
applies. `rules.model.ts` holds most of it.

**The run**

| Constant                      | Value                                                                                                                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SLICE_WINDOW`                | 5 polls per gate window, so per day. A **window** is always these five; the **slots** a score is measured against are cumulative (`scoringSlotsAt`)                                                                              |
| `VICTORY_GATE` / `GATE_COUNT` | 12 / 13 (gates 0 to 12)                                                                                                                                                                                                          |
| `GATE_RUNGS`                  | HEALTHY units / OK drop per gate: 3/1 · 6/1 · 9/1 · 12/1.5 · 15.5/1.5 · 19.5/2 · 24/2 · 29/2 · 34.5/2.5 · 40/2.5 · 46/3 · 52/3 · 58.5/3 (`coverageRatio.model.ts`). The floor is the previous gate's HEALTHY units, 0 at Pallet. |
| `FLOOR_CORRECT`               | 2 right answers a gate asks of its own window, counted before multipliers; fewer holds the gate whatever the band                                                                                                                |
| `failPeelShareFor`            | 0% / 20% × 2 / 25% × 4 / 30% × 4 / 35% × 2 of the occupied slots, plus strip audits; capped at half the build before gate 3                                                                                                      |
| `escalatedPeelShare`          | `share × (1 + 0.5 × attempts)`: each retry at the same gate peels half again as much                                                                                                                                             |
| Audit roster                  | Seventeen rules, all rival-fired: room for 1 from gate 3, 2 from gate 8, 3 from gate 11; a gate nobody attacked is clean                                                                                                         |
| Audit pools                   | A 8 (gates 3-7) · B 15 (gates 8-10) · C 12 (gates 11-12); what a rival's payload is drawn from · surviving one pays 32 KB                                                                                                        |
| Audit dials                   | 402 ×2 · 507 16/32 KB · 408 3×30 s / 3×25 s / 5×20 s · 410 +10/+15 · 429 1 action · 413 8 KB a slot past 12                                                                                                                      |

**Scoring**

| Constant                            | Value                                                                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BASE_UNIT`                         | 1 unit a correct answer, flat at every gate (ADR-073)                                                                                                |
| `SINGLE_CREDIT` / `MULTIPLE_CREDIT` | ×1 / ×2 by poll type, on coverage only (ADR-081)                                                                                                     |
| `scoringSlotsAt`                    | `5 × (gate + 1)`, the denominator: every slot the run has opened, 5 at Pallet to 65 at the Champion                                                  |
| `STREAK_UNIT_STEP`                  | +0.1 units flat on every correct answer after the first in a window. Added after the multipliers and never multiplied by them                        |
| `coverageAdd` / `cacheHitStep`      | Code Coverage +0.1 units a correct answer · Cache +0.25 units a cached hit, capped at 4 hits (one unit). Flat, added after the multipliers (ADR-083) |
| `minifiedUnits`                     | Halves a coverage add when a config is minified. `minifiedAmount` floors and is for whole KB only                                                    |
| `STREAK_COVERAGE_BONUS`             | 0.1 per consecutive correct answer, capped at 10 steps (×2). Multiplies the gate's KB payout, not the meter                                          |
| `gateRewardMultiplier`              | `gatesCleared + 1` (×1 at Pallet to ×13 at the Champion) on the KB reward only, frozen while a gate is redone                                        |
| Focus payout / upgrade gate         | `1 + 0.25 × level` / `5% × level` career coverage                                                                                                    |

**Storage**

| Constant                                        | Value                                                                                                                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `GATE_REWARD_KB` / `GATE_REWARD_MULTIPLIER_CAP` | 32 KB base / ×`GATE_COUNT` = ×13, which the ladder reaches but never passes                                                              |
| `gateClearPayout`                               | `32 × (gate + 1) × reward mults × (correct ÷ 5)`, plus flat clear payouts                                                                |
| `BUILD_SPACE_RUNGS`                             | 4/free · 6/16 · 8/32 · 12/64 · 16/128 · 24/256 · 32/512 KB a gate, billed on clear against the smallest rung the build fits in (ADR-098) |
| `spaceForBuild` / `upkeepForBuild`              | the rung a build occupies and what it bills; both read `billableSlotsOf`, so vendor lock-in lowers the rung it is billed at              |
| `FAUCET_CAP_KB`                                 | 320 per run                                                                                                                              |
| `chainKbFor` / `chainStartKb`                   | `1 KB × 2^(link − 1)`, the link being the run's correct answers since its last wrong one; drawn from `FAUCET_CAP_KB` (ADR-121)           |
| `upkeepAfterCreditOf` / `emptySlotDiscountKb`   | the rung's KB less `8 × freeSlots(build)`, floored at 0; 8 is the largest flat step at which crossing a rung is still a loss (ADR-122)   |
| Archived-storage credit                         | 1 / `gates ÷ 13` / 0 for victory / death / abandon                                                                                       |

**Build and shop**

| Constant                                | Value                                                                                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BASE_SLOTS`                            | 4 — the free width every run opens on, and the budget the opening hand is dealt against                                                                                     |
| `HAND_SIZE` / `RECOMMENDED_SIZE`        | 5 dealt at run start (seeded) · 2 marked as advice, none preselected (ADR-052, amended by ADR-057)                                                                          |
| `FOCUS_BAND` / `PAIRABLE_PICKS`         | 1–2 focus configs per hand, count varying by seed · the smallest 3 dealt configs must fit `BASE_SLOTS` together; nothing above the budget is dealt (ADR-062)                |
| `STARTER_POOL`                          | the 8 configs granted at signup, stand-in for the account's pool until DVTD-p9ah                                                                                            |
| `highestAffordableSpace`                | the widest rung a balance covers; an unpayable bill caps the build there until it fits                                                                                      |
| `CONFIG_SIZES`                          | 1 · 2 · 4 · 8 · 12 · 16 slots, halved by minify (a 1-slot config cannot minify)                                                                                             |
| `DRAFT_SIZE` / draft cost / sell refund | 5 offers / `32 KB × slots` / `floor(cost ÷ 2)`                                                                                                                              |
| Rebuild / `LOCK_COST_KB` / Extend       | 4…512 KB doubling / 16 flat / 48 then 96                                                                                                                                    |
| Service staging                         | Lock requires `.lock` in the build (ADR-054); Extend from gate 3 (`draft.model.ts`); Hot Reload, Return Policy and kill -9 from the first shop (`registryControl.model.ts`) |
| `pinCostFor`                            | 128 KB at gate 4, +64 per gate, 512 at gate 10; stipend 32 KB × gate                                                                                                        |
| Lint / peek fees                        | 8…256 KB per poll / 32…512 KB per gate                                                                                                                                      |
| Max config level / upgrade cost         | 5 (Telemetry and git rebase -i 2) / `32 KB × (level + 1)`                                                                                                                   |
| `UPGRADE_OFFER_ONE_IN`                  | ~1 shop in 8 rolls a newer version of an owned config into the registry, at registry price whatever the version, no coverage gate (ADR-053)                                 |
| `CLIMB_ONE_IN`                          | a rolled upgrade starts one rung up and climbs on a 1-in-2 flip per further rung until the ladder ends; from v1: v2 ½ · v3 ¼ · v4 ⅛ · v5 ⅛ (ADR-097)                        |

---

_Sources: the `.beans/` story corpus, `docs/adr/`, `docs/brainstorm/`, and the
`src/modules/run/` model files, canonical for all numbers._
