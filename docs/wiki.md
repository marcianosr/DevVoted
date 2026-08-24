# DevVoted Wiki

The player-facing reference for **DevVoted**, the daily trivia game for developers.
Answer coding polls, build a pipeline of configs, and clear gates without breaking
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
3. [The pipeline](#3-the-pipeline)
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
real programming polls; your **pipeline** of installed **configs** (dev tools like
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

🟡 Spending storage to keep climbing past the daily lock is a designed monetization
lever; the cost curve is undefined.

### 2.2 Gates

A gate deals a window of 5 polls and audits the score earned inside it (ADR-035). Its
one demand is the **coverage meter**: the window's coverage, net of wrong-answer
losses and floored at 0, must reach the gate's threshold
([2.8](#28-what-unlocks-when)). Every gate is a fresh score, the meter resets on every
attempt, and the run's career total never counts.

Configs demand nothing ([4.1](#41-what-a-config-is)): all friction lives on the gate.
A bare pipeline never clears, which is why sell and drop refuse your last config.

**Gates count from 0.** A run opens on gate 0 and summits at gate 12. Each clear from
gate 1 grants a **slot** (ADR-034), so width arrives with depth and never before it,
and each clear awards that gate's **swatch** ([6.3](#63-swatches)).

Exactly one of two things happens when the window's 5th poll is answered; nothing is
decided before that:

| | Condition | Outcome |
| --- | --- | --- |
| **Advance** | the meter meets the demand | paid, swatch earned, `gatesCleared + 1` (slot from gate 1), shop opens |
| **Miss** | the meter fell short | the gate **peels configs** (you pick), then the same gate runs again: strip, review, shop, prep, 5 fresh polls |

**Farming is priced out, not forbidden.** The payout scales with window correctness
(`32 KB × gate number × correct ÷ 5`), so a low-effort clear banks little, and a
low-effort attempt rarely meets the meter at all.

⚪ **Boss gates** (every 5th gate, two requirements AND-ed, no reroll) are parked.

### 2.3 Audits

An audit is a fixed rule a gate carries, stated on the stake receipt before you walk
in. **The count is the escalation**: gates 0 to 2 are clean, one audit runs from gate
3, two from gate 8, three from gate 11, the same shape the peel curve has.

| Audit | What it does |
| --- | --- |
| **Cost Overrun** | Every paid action costs ×2, linting and peeking both. |
| **Feature Freeze** | No paid actions at all: the linter and the peek are gone. |
| **Read-only** | The shop *before* this gate is shut: nothing bought, sold, upgraded or switched. |
| **Memory Leak** | Storage leaks every poll: −16 KB, −32 KB on a miss. |
| **Timeout** | The window's first polls are on a clock; an answer over the limit scores as a miss whatever you picked. |
| **Mirror** | Every poll asks for the **incorrect** options and wants all of them, so a single-answer poll with four options becomes a three-option select-all. Graded normally after that, so streaks and partials work and the gate charges full price. |
| **Dependency Outage** | One config is offline for the whole attempt. |
| **Flaky Build** | One config fails to trigger on every poll, rolled fresh each time. |
| **Rolling Outage** | A different config is down for each poll of the window. |
| **Breaking Change** | Your highest-level config is switched off for the attempt. |
| **Strip** | Deepens the peel: Elite takes 5 configs on a miss, Champion 6. |

The four offline audits differ only in which config they take and for how long. Three
roll at random (seeded, so a reload never re-rolls one); Breaking Change aims at whatever
you levelled furthest. Whatever is down is marked on the pipeline rail while you
answer (dimmed, badged `offline`, effect struck through) and nowhere else, since shop
and prep sit before the gate and naming a casualty early would be a spoiler.

Schedule in [2.8](#28-what-unlocks-when), roster in `audit.model.ts`, reasoning in
ADR-035/038.

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
totals** (a percentage per category plus a run total, which feed the leaderboard and
Focus upgrades and gate nothing).

A correct answer earns `share × (1 + adds) × mults × streak × gate × difficulty`:

| Term | Value |
| --- | --- |
| `share` | The poll's coverage weight. 1 for a single-answer poll answered correctly. |
| `adds` | Flat additions (Code Coverage: +0.5% per correct). |
| `mults` | Product of config multipliers (AGENTS.md ×2, Intellisense ×1.5, Focus ×1.25 at L1). |
| `streak` | `1 + 0.1 × streak` of consecutive correct answers. |
| `gate` | `gatesCleared + 1`. Gate 1 pays ×1, gate 5 pays ×5. |
| `difficulty` | `1 + 0.1 × (options − 3)`, plus `0.5` if multiple-choice. Never below ×1. |

**Multi-answer share** is `(correct picks − wrong picks) ÷ total correct`, clamped to
0..1, so shotgunning every option earns nothing. Only coverage reads this share;
streak and storage stay binary on the exact-set rule.

**A wrong answer bleeds** `0.25 × build multiplier × gate multiplier` from the poll's
category, the gate meter and the run total alike, each floored at 0.

Example, gate 2, a 5-option single-answer CSS poll with `.css` installed and one
correct answer already banked: `1.0 × 1.25 mults × 1.1 streak × 2 gate × 1.2
difficulty` = **+3.3% CSS coverage**. The post-answer **equation reveal** breaks that
into Balatro-style chips: base, one per contributing config, streak bonus.

Category coverage past 100% rolls over into **levels**: 110% in JavaScript reads as
"L2". Mastery keeps counting instead of capping.

### 2.6 Missing a gate

A miss **peels configs** and hands the run back to the same gate (ADR-037). You choose
which go, on the strip screen; then the normal post-gate loop runs (review, shop, prep,
5 fresh polls). The meter starts over. Coverage and storage survive.

| Cost | Detail |
| --- | --- |
| **Configs** | 1 at the early gates rising to 4 at the summit, +1 at Elite, +2 at Champion. Your pick, so a miss also sheds the config that was not earning its slot. |
| **The payout** | Nothing: no gate reward, no interest, no extra-pick KB. The faucet KB earned inside the failed window is the retry's whole budget. |
| **The storage bill** | A paid plan bills on every closed window, pass or fail. |
| **The day's polls** | Every attempt burns 5 of the day's finite sequence, so a retry costs real time. |
| **Audit damage** | Audits charge again: Volcano leaks every attempt, a Timeout re-clocks, an outage re-rolls. |

The peel escalates with depth because width does: one config is a third of an opening
build and a fourteenth of a summit build. Each row sits at roughly a quarter of the
pipeline the gate expects, which keeps a run three or four misses from death the whole
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
audits, the shop's controls and the width; **category coverage** stages Focus
upgrades ([4.4](#44-upgrades)).

Every row states what you hold **while facing that gate** — which is also what the
shop before it sells, since a shop runs on the clear that precedes its gate.

| Gate | Swatch | Coverage in its window | A clear pays | A miss peels | Audit | Also unlocks |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Pallet | 3% | 32 KB | 1 | (clean) | Shop, **Rebuild**, the free 512 KB plan and the 640 KB rung |
| 1 | Boulder | 10% | 64 KB | 1 | (clean) | — |
| 2 | Cascade | 25% | 96 KB | 1 | (clean) | **Lock**, 768 KB rung, slot 4 |
| 3 | Thunder | 40% | 128 KB | 2 | Cost Overrun | **Extend**, slot 5 |
| 4 | Lavender | 60% | 160 KB | 2 | Dependency Outage | 1 MB rung, slot 6 |
| 5 | Rainbow | 85% | 192 KB | 2 | Read-only | Slot 7 |
| 6 | Soul | 110% | 224 KB | 2 | Feature Freeze | 1.5 MB rung, slot 8 |
| 7 | Marsh | 140% | 256 KB | 3 | Mirror | Slot 9 |
| 8 | Seafoam | 175% | 288 KB | 3 | Timeout (3 polls, 30 s) + Flaky Build | 2 MB rung, slot 10 |
| 9 | Volcano | 210% | 320 KB | 3 | Memory Leak + Rolling Outage | Slot 11 |
| 10 | Earth | 250% | 352 KB | 3 | Breaking Change + Timeout (4 polls, 25 s) | 3 MB rung (top), slot 12 |
| 11 | Elite | 290% | 384 KB | **5** | Strip + Mirror + Flaky Build | Slot 13 |
| 12 | Champion | 340% | 416 KB | **6** | Memory Leak + Strip + Timeout (5 polls, 20 s) | Slot 14 (width cap); clearing it wins the run |

The coverage column is per-gate and fresh: each row is a score to hit inside 5 polls,
never a running total. The peel column tracks the slot column, since a peel only
threatens in proportion to the build it hits.

The payout column is `GATE_REWARD_KB × (gate + 1)` for a **bare build on a perfect
window**. It scales with correctness, so a 3-of-5 clear pays 60% of the row and a
0-of-5 clear pays nothing at all — an all-skip build can climb without banking a byte.
Reward multipliers and flat clear payouts (Unit Tests' +32) apply on top.

Deliberately **not** on this axis: Focus levels (staged by category coverage), Unit
Tests and Moore's Law levels (storage), lint and peek fees (uses), rebuild price
(rebuilds this shop), and everything account-level (swatches, Dex, borders).

Authoritative over this table: `coverageDemandFor`, `STORAGE_PLANS`, `failStripsFor`
(`rules.model.ts`), `gateClearPayout` and `slotsForGatesCleared` (`pipeline.model.ts`),
`LOCK_FROM_GATE`/`EXTEND_FROM_GATE` (`draft.model.ts`), `GATE_SWATCHES`
(`swatch.model.ts`), `GATE_AUDITS` (`audit.model.ts`).

---

## 3. The pipeline

Your pipeline holds every installed config, one per **slot**. You start with **3** and
can reach **14**. Slots are granted by gate clears and claim themselves automatically
(ADR-025/034): there is no purchase step and no coverage price. Width opens no gates;
it only ever arrives with them.

The shop draws the next slot as a full-width dashed row, numbered like every other
slot ("Opens when Gate 2 clears"), replaced by a green "Unlocked Nth slot" row for
whichever slots arrived since your last visit. It carries no swatch: badges come from
clearing gates.

**Managing configs.** Click any config chip for its popover: **Install**, **Sell**
(refunds half the draft cost), or **Upgrade**. Anything can be sold except your last
config, since a bare pipeline never clears.

**Starting a run.** The **Configuring** screen offers **starter stacks** (ADR-026):
curated three-config pipelines picked in one click, the stack's one-liner carrying the
choice and the picked row expanding into a trimmed preview of each config's payoff.
Picking is atomic, and all 3 starting slots must be filled before the climb begins. A
"Build your own" row opens the bench-drafting screen for self-assembly, which becomes
the default again once account-level intro flags land. 🟡 A random rarity-weighted
starting hand is planned (DVTD-30k6).

---

## 4. Configs

### 4.1 What a config is

Every config represents a real CI configuration, and every config is one thing
(ADR-035): **an effect with a price**. The price is the draft cost plus the slot; the
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

### 4.2 Rarity

Four tiers, **common / uncommon / rare / legendary**, shown as border and glow (gray,
green, blue, gold), never as fill. Rarity bites through the **draft cost**: 32 / 64 /
128 / 256 KB. 🟡 Rarity-weighted draw odds (proposed 60/25/12/3) and drop rates on
hover are planned; today the draft cycles deterministically through the pool.

### 4.3 Roster

**🟢 Shipped.** Thirty configs, all pure effects.

| Config | Rarity | Effect |
| --- | --- | --- |
| `.js` `.ts` `.css` `.jsx` `.html` `.git` `.java` `.py` `.rb` `.vue` | common | That category's polls reward ×1.25 (Focus, upgradable) |
| `package.json` | common | General Frontend polls reward ×1.25 (Focus, upgradable) |
| Unit Tests | common | +32 KB × level storage on gate clear |
| Moore's Law | common | On each gate clear, +2% × level of held storage |
| ESLint | common | Cross out one wrong answer on JS/TS polls, escalating fee from 8 KB |
| Stylelint | common | Cross out one wrong answer on CSS polls, escalating fee from 8 KB |
| Cold Start | uncommon | First answer of the gate rewards ×2 |
| Coverage | uncommon | Coverage gains ×2 |
| Code Coverage | uncommon | +0.5% flat coverage per correct answer |
| IndexedDB | uncommon | +8 KB storage per correct answer, capped at 320 KB |
| Telemetry | uncommon | Paid peek at how everyone ever answered this poll ([4.5](#45-paid-actions-lint-and-peek)) |
| `.length` | uncommon | Names how many correct answers the gate's 5 polls hold, and pays +16 KB per correct answer beyond one per poll |
| Intellisense | rare | All coverage ×1.5 |
| Deprecated | rare | All coverage ×3, fading ×0.5 each gate clear; deleted from the pipeline at ×1 |
| Prefetch | rare | Shows the category of every poll left this gate and all of the next gate's. Asking for polls not yet dealt rolls tomorrow's shared seed a day early — categories only, the questions stay sealed |
| Overclock | rare | The gate's first answer earns ×4 coverage; every answer after it runs hot at ×0.5, cooling off at the clear. Miss the opener and the gate is nearly dead — the buy is variance, not magnitude (×1.2 average, honestly under Intellisense) |
| AGENTS.md | legendary | All coverage ×2 |
| Volkswagen CI | legendary | Reports the gate's first audit as passing; costs 384 KB to draft |
| Dependabot | legendary | 1 in 3 gate clears (1 in 2 at L2): a random pipeline config upgrades, free |
| WTFPL | legendary | Every shop offers the entire roster; costs 512 KB, every sell refunds 0 KB while it is installed (its own included), and Rebuild/Lock/Extend retire |
| Freemium | legendary | **Free to draft.** Every config drafts at half price while it is installed, and refunds drop to half of that discounted price. Each gate cleared bills 8 KB × 2^gate (8, 16, 32, 64, 128, 256…), charged after the clear pays; a bill the balance cannot cover lapses the config and frees its slot |

`.length` deliberately pays on *shape* rather than magnitude, since four configs
already sell coverage magnitude: it pays most in multi-answer-heavy windows and nothing
at all in a window of five single-answer polls, a dead spot stated on the row rather
than hidden in the rules. **Moore's Law** ramps instead of gating, because 2% of a small
balance is worthless and the balance is only large late; on the free tier its interest is
shop budget rather than principal, since the cap burns the surplus at *Climb on*.

**Freemium is the roster's one recurring price** — everything else is bought once and
then free — and it is metered on the run's *depth* rather than on how long it has been
held, so dropping it and re-drafting later pays the deep rate instead of restarting the
ladder. It bills on clears only, like Deprecated's fade: a failed attempt already costs
a peel. Practically it is an opening-game plan you cancel around gate 4, when the bill
starts eating a whole gate's reward.

🟡 **Designed, not built.** These were written when configs still carried checks, so
each needs a redesign pass (a bounded condition, a fee, or a gate audit) before it can
ship; the original check designs stay in the beans.

| Config | Rarity | Effect |
| --- | --- | --- |
| Vite config | common | +3% coverage on JS/TS polls answered under 35 s |
| `.every()` | common | +1% when a category you have 5-streaked appears |
| Semver | common | Coverage ×1.2 for each Focus config at L2 or higher |
| Rate limiter | common | Wrong answers do not bleed coverage |
| Weekend Project | common | Saturday and Sunday gates pay +50% storage |
| Benchmark | uncommon | See your paired ghost's answer before you commit |
| Cold cache | uncommon | The gate's first poll pays nothing; every poll after pays ×1.5 |
| `.tsx` | uncommon | TypeScript and React polls reward ×1.25 |
| git stash | uncommon | Once per window, stash the current poll; it returns last |
| Garbage Collection | uncommon | A peeled config pays you its sell value |
| Watch | uncommon | Pick a category at draft: its polls get double draw weight |
| `--save-exact` | uncommon | Every future draft costs 20% less |
| Overclock | rare | 4× coverage on one poll, then −128 KB across the next two |
| Snapshot Testing | rare | Polls you have already seen reward ×2 |
| Rebase | rare | See the gate's remaining polls and reorder them |
| Hotfix | rare | A failed gate still opens the shop |
| Replication | rare | All storage gains ×2, locked to the free plan while installed |
| Continuous Deployment | rare | +64 KB every gate clear, but you never enter the shop again |

Bundle Analyzer (see the next gate's category mix in the shop) is gone from this list:
the shipped **Prefetch** covers it and more. Rebase reveals and reorders inside the
*gate*, so it informs how you answer; it stays local to your own run, since reordering a
shared seed would break other players' position-based configs, and the social version
belongs in [7.4 Interference](#74-interference).

🟡 **Dual-focus configs** replace the old hidden synergy table: one slot focusing two
categories is the themed-build bonus turned into a visible, draftable item, and only
recognizably real intersections qualify. The pool: `.tsx`, `.jsx` reworked,
`styled-components`, `JSDoc`, `<script>`, `<style>`, `Tailwind`, `.erb`, `.jsp`, `Jinja`,
plus the runtime family (`Node.js`, `Deno`, `Rails`, `Django`, `Spring`, `Next.js`,
`Nuxt`), each pairing a language with General Backend, which finally gives that category
coverage. Ship `.tsx` and `Node.js` first and pool the rest.

⚪ **Parked**: **yarn.lock** (immunity to requirement raises), **rm -rf** (strip-all with
2× refund), **localStorage** (storage burst). Two former configs became gate audits
instead, since a clock or a mirror is something a gate does to you rather than something
you buy: **Mirrored Check** is now Marsh's Mirror, **Speed Check** is now Timeout.

Open: Coverage collides with coverage-the-score and is slated for a rename; General
Backend has no Focus config yet.

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

The shop's Upgrade button carries the price and previews the next level on hover;
while gated, the tooltip names whichever requirement is in the way. The stake receipt
states what rides on top of the base: the Focus multiplier when the poll matches, and
the streak step, which every correct answer takes (one correct answer is already a
streak of one).

⚠ Unreconciled: the stories also propose archived-storage-funded, 10-level cross-run
upgrades (DVTD-z94q), so the upgrade currency question is open.

### 4.5 Paid actions: lint and peek

Two configs sell an action rather than a passive, and both meter it with a doubling
fee. Both hang off the selling config's own pipeline row, so a build's powers read in
one place.

**Lint.** With a linter covering the poll's category equipped, pay to gray out one
wrong option: 8, 16, 32, 64, 128, 256 KB, doubling per use within a poll and resetting
each poll, which stops lint-spam. Linted polls never reveal their correct answer in
community views and may reappear in a later seed.

**Peek** (Telemetry). Pay to see how the community voted on the poll in front of you,
drawn as a gray bar per option: 32, 64, 128, 256, 512 KB, doubling per use and
resetting **each gate** rather than each poll, because a peek buys the whole poll where
a lint buys one option. One peek per poll. The pool is every answer that poll has ever
taken across both loops, minus anyone who answered it at a Mirror gate, since they were
asked for the incorrect options and would invert the signal you are buying.

Correctness never travels with a peek: the server hands over option ids and
percentages for polls the run has already paid on, and nothing else.

---

## 5. Economy

### 5.1 Storage (KB)

**Storage** is the in-run currency, measured in kilobytes and capped by your **storage
plan** (512 KB on the free tier every run starts on).

- **Faucets**: clearing a gate pays `32 KB × gate number × correct ÷ 5` (capped at gate
  12's ×12, so endless runs stop scaling); IndexedDB adds +8 KB per correct answer,
  capped at 320 KB per run.
- **Sinks**: drafting configs (32 to 256 KB by rarity), lint and peek fees, draft
  rebuilds, and the storage plan's bill.

**Storage plans** (ADR-023). Capacity is a subscription: a bigger cap carries a
recurring bill, collected every time a window closes, **pass or fail**, before the
payout. An unpayable bill collects nothing and **auto-downgrades the run to the free
tier**; a voluntary downgrade clamps on the spot, burning anything above the new cap.

| Tier | Cap | Bill / gate | Opens after |
| --- | --- | --- | --- |
| 1 (free) | 512 KB | free | start |
| 2 | 640 KB | 8 KB | start |
| 3 | 768 KB | 16 KB | gate 2 |
| 4 | 1 MB | 32 KB | gate 4 |
| 5 | 1.5 MB | 48 KB | gate 6 |
| 6 | 2 MB | 72 KB | gate 8 |
| 7 | 3 MB | 112 KB | gate 10 |

The ladder is gate-staged (ADR-030) because a clear pays roughly `32 KB × gate`: sold
at gate 0, a 3 MB cap is a bill against storage the run cannot yet earn. The shop draws
the rungs you have plus the next one, greyed. The cliff scales with the rung: an
unpayable bill at 3 MB drops you to free, and everything above 512 KB burns.

**The Subscriptions section** lists every recurring KB cost in one place on the gate
receipt, so the whole bill is readable before you commit to a gate rather than only
after it settles. It carries the storage plan's tier and every subscribed config
(Freemium), each priced at the gate ahead. The two bill on different triggers and the
rows say so: the plan charges **pass or fail**, a config charges **on clear** only, so
the section quotes a separate total for a miss. When the balance cannot cover the whole
bill it names the shortfall and warns that what you cannot pay lapses.

**Overflow is spend-it-or-lose-it.** A gate reward can push storage past the cap, and
that overflow rides uncapped into the shop that follows, so a rich gate buys a genuine
spree above the usual ceiling. The cap clamps only at *Climb on* (prep's **Start gate**
button), so overflow survives shop, prep and community detours and is forfeit only when
the climb resumes.

### 5.2 The Shop

Clearing a non-final gate opens a Balatro-style **multi-buy shop** bounded only by
storage, and so does missing one, once the peel is paid: the retry shops with what it
has, which is the only thing making the second attempt different from the first. Take
as many actions as you can afford, in any order. The exit leads to the **prep page**
and the shop stays open behind it until the next gate starts, so shop, prep, community,
shop is a legal loop while waiting on tomorrow's polls. Nothing grades the exit.

| Action | Cost | Notes |
| --- | --- | --- |
| **Draft** | 32 to 256 KB by rarity | One of 5 offered configs, new ones only. Two taps: the corner badge reads the price, turns green and reads **install**, then settles into **owned**. |
| **Rebuild** | 4, 8, 16, … 512 KB | Re-rolls the offer, doubling per rebuild within the same shop. |
| **Lock** | 16 KB flat | Pins one offer so rebuilds skip it and it returns next shop. One at a time, spent by installing. From gate 2. |
| **Extend** | 48, then 96 KB | One more config on the table, in this shop and every shop after. Two per run. From gate 3. |
| **git tag** | 128 KB at gate 4, +64 KB per gate, 512 KB at gate 10 | A cross-run checkpoint: after a death, your next run checks out there instead of gate 1. One per run, burnt by the run it rescues. |
| **Sell** | refunds half the draft cost | Never your last config. |
| **Upgrade** | `32 KB × the level bought` | Focus configs also need the coverage ([4.4](#44-upgrades)). |
| **Change storage plan** | free to switch, then the rung's bill | Both directions; a downgrade names the burn it would cause first. |

A tag-rescued run starts at the pinned gate with the width its clears would have
granted plus a 32 KB-per-gate stipend, everything else fresh, and its death credit
counts only the gates it actually climbed. Gate 10 is the last that sells a tag: deeper,
a rescue would resume a starter build into stacked audits and a 4-config peel.

Two things the shop always shows: *why* a locked action is locked (not enough storage
vs unmet coverage), and, when a reward carried storage over the cap, a warning that the
overflow is forfeit at *Climb on*, sitting next to the actions that spend it down.

---

## 6. Meta-progression

### 6.1 Archived storage

Leftover run storage converts into persistent **archived storage** at the outcome rate
(100% victory, proportional on death, 0% on abandon). It is the meta-progression
currency: buy cosmetics, inject it into your next run, or fund config unlocks. 🟡 More
spending options are planned, including mid-run coverage, config, cap and streak
injections (DVTD-xbri).

### 6.2 Unlocks

🟡 Two unlock systems are designed and not yet reconciled: **milestone unlocks** (clear
gate N or hit a category coverage threshold, and a config unlocks permanently
account-wide; DVTD-2try) and **archived-storage pulls** (spend 50 to 500 KB by rarity
on a random unlock, with pity; DVTD-9d7o). Today every shipped config is simply
available. Also planned: unlockable starter-slot tiers, and bonus awards for
re-answering mastered polls correctly.

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
summary, and the Dex's Swatches tab.

🟡 **Collect Swatches** (DVTD-g8ty): a *per-category* cosmetic chip earned through
mastery, a separate collection that reuses the name deliberately.

### 6.4 The Dex

The Pokédex of DevVoted, at `/dex`. The **Polls** tab tracks every poll you have seen
with lifetime accuracy (unseen polls redact to `???`); **Configs** catalogs the roster
grouped by rarity; **Swatches** shows the gate swatches collected across every run,
unearned ones redacted. 🟡 Planned: upgrade levels, collection stats, per-poll
community success rates, and named collection states (**???**, **Encountered**,
**Mastered**).

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
and **widest pipeline**.

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

- **Run HUD**: storage as **headroom**, a big "328 KB free" over a bar of what is
  committed and a "184 of 512 used" caption, because free space is the number you spend
  against. Then the gate, polls answered, streak, and total coverage. The gate reads
  **"gate 0 / 12"** over a **pip bar** that doubles as the badge collection: one pip per
  gate in that gate's swatch colour, gates behind you solid, the gate underway filling
  with polls answered, the rest dimmed. A pewter rim marks the gate you stand on and
  nothing else. Every pip is a control: hover or tap it to name that gate's badge and
  standing ("clear gate 7 to earn it"). It carries no coverage; the total is the gate's
  own stake, on the Build Summary's "To pass" line.
- **Pipeline rail**: configs hang off a rail on every pipeline surface, carrying each
  config's paid actions and its `offline` badge during an audit. The next slot closes
  the list as a dashed row numbered in the gutter ("Opens when Gate 2 clears"), replaced
  by a green "Unlocked Nth slot" acknowledgment in the shop, retired at the slot cap.
  There is no unlock button anywhere.
- **Reward report**: gate results as a CI build log. One passed/failed/skipped row per
  config, a steps summary, and a winnings footer ("you won +KB · +%") over a storage bar
  drawn from pre-gate storage to the new total, plus coverage badges per answered
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
| **Audit** | A gate's fixed rule (a mirror, a leak, a clock, a shut shop, a config knocked offline). Stated on the stake receipt; the count grows with depth. |
| **Strip audit** | An audit that deepens the peel: Elite takes 5 configs on a miss, Champion 6. |
| **Peel** | What a missed gate takes: configs of your choosing, before the same gate runs again. |
| **Pipeline** | Your build: the stack of config slots. |
| **Slot** | One pipeline position (3 to 14, granted by gate clears). Opens no gates. |
| **Config** | An installable dev-tool item: an effect with a price, demanding nothing. |
| **Coverage** | The score: a percentage per category plus a run total (career), and the gate meter (per attempt). In fiction: **knowledge coverage**. |
| **Storage** | The in-run currency, in KB, capped by the storage plan. Overflow forfeits at *Climb on*, not when earned. |
| **Storage plan** | The subscription setting the cap: free 512 KB, or a bigger cap for a per-gate bill collected pass or fail. Unpaid bills auto-downgrade to free. |
| **Archived storage** | Persistent cross-run storage: the meta-progression currency. |
| **Faucet** | Any per-correct-answer storage income (for example IndexedDB). |
| **Draft / Rebuild** | Buying a shop config / re-rolling the offer at a doubling cost. |
| **Lint** | Paying an escalating fee to disable one wrong option (needs a linter config). |
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
| `coverageDemandFor` | 3 / 10 / 25 / 40 / 60 / 85 / 110 / 140 / 175 / 210 / 250 / 290 / 340 |
| `failStripsFor` | 1 / 1 / 1 / 2 / 2 / 2 / 2 / 3 / 3 / 3 / 3 / 4 / 4, plus strip audits |
| `GATE_AUDITS` | Eleven rules: 1 audit from gate 3, 2 from gate 8, 3 from gate 11 |
| Audit dials | Cost Overrun ×2 · Memory Leak 16/32 KB · Timeout 30/25/20 s |

**Scoring**

| Constant | Value |
| --- | --- |
| Gate multiplier | `gatesCleared + 1` (×1 to ×12), frozen while a gate is redone |
| `WRONG_COVERAGE_LOSS` | 0.25, floored at 0 on every ledger |
| `STREAK_COVERAGE_BONUS` | 0.1 per consecutive correct answer |
| Difficulty bonus | +0.1 per option beyond 3, +0.5 multi, never below ×1 |
| Focus payout / upgrade gate | `1 + 0.25 × level` / `5% × level` career coverage |

**Storage**

| Constant | Value |
| --- | --- |
| `GATE_REWARD_KB` / `GATE_REWARD_MULTIPLIER_CAP` | 32 KB base / stops scaling past ×12 |
| `gateClearPayout` | `32 × (gate + 1) × reward mults × (correct ÷ 5)`, plus flat clear payouts |
| `STORAGE_CAP_KB` | 512, clamped at *Climb on* |
| `STORAGE_PLANS` | 512/0 · 640/8 · 768/16 · 1MB/32 · 1.5MB/48 · 2MB/72 · 3MB/112, staged 0/0/2/4/6/8/10 |
| `FAUCET_CAP_KB` | 320 per run |
| Archived-storage credit | 1 / `gates ÷ 13` / 0 for victory / death / abandon |

**Pipeline and shop**

| Constant | Value |
| --- | --- |
| `BASE_SLOTS` to `MAX_SLOTS` | 3 to 14, `slotsForGatesCleared` grants slots 4 to 14 on the clears of gates 1 to 11 |
| `DRAFT_SIZE` / draft cost / sell refund | 5 offers / 32-64-128-256 KB by rarity / `floor(cost ÷ 2)` |
| Rebuild / `LOCK_COST_KB` / Extend | 4…512 KB doubling / 16 flat / 48 then 96 |
| Control staging | Lock from gate 2, Extend from gate 3 (`draft.model.ts`) |
| `pinCostFor` | 128 KB at gate 4, +64 per gate, 512 at gate 10; stipend 32 KB × gate |
| Lint / peek fees | 8…256 KB per poll / 32…512 KB per gate |
| Max config level / upgrade cost | 5 (Telemetry 2) / `32 KB × (level + 1)` |

---

*Sources: the `.beans/` story corpus, `docs/adr/`, `docs/brainstorm/`, and the
`src/modules/run/` model files, canonical for all numbers.*
