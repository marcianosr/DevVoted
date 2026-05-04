# DevVoted Domain Context

Ubiquitous language for DevVoted. Use these terms in code, ADRs, and conversations.
When a concept doesn't appear here, add it before naming the module.

---

## Core Concepts

**Poll**
A quiz question with one or more answer options and a category. The atomic unit of gameplay content. Admins create polls; players answer them.

**Daily Poll**
The single poll selected for all players on a given date. Chosen via a weighted category selection at midnight. The weights are snapshotted in advance based on active configs.

**Run**
A game session. A player starts a run, answers polls sequentially, and either completes or fails it. Runs have configuration, coverage state, pipeline state, and a status (active / finished / failed).

**Turn**
A single poll answer within a run. Each turn awards coverage, may trigger pipeline evaluation, and may end the run. The core game loop unit.
_(Code: `runs/services/turn.service.ts`)_

**CI Pipeline**
The evaluation structure inside a run. Divided into windows. At each window boundary, the CI pipeline checks whether the player's knowledge coverage meets the requirement. Failing ends the run. Players choose their own CI pipeline difficulty after each clear.

**Window**
A fixed-size group of consecutive turns evaluated together by the CI pipeline. When a window closes, the pipeline determines whether the player advances or fails.

**Gate**
The pass/fail requirement at the end of a pipeline window. Defined by the run's CI pipeline configuration.

**Knowledge Coverage** _(Coverage)_
A player's accumulated performance score per category within a run. Awarded each turn. Drives CI gate evaluation and determines run outcome. Informally called "coverage" in code.

**Config**
A game modifier — DevC-themed name for a modifier that alters run mechanics (coverage multipliers, category weights, storage capacity, etc.). Configs are the purchasable and (future) unlockable power-ups of the game. A config has an effect definition that the config effects engine applies. Configs have a rarity (Common, Uncommon, Rare, Legendary) that determines how often they appear in the shop.

**Config Trigger**
The event that activates a config's effect — e.g. answering a poll, opening the shop, clearing a CI pipeline window. Each config declares its trigger; the effects engine fires it at the right moment.

**Config Discovery**
How configs are unlocked for a player. Some configs are available from the start; others are discovered by meeting in-run criteria (e.g. "beat 8 CI pipeline windows"). Undiscovered configs appear as "???" in the shop.

**Config Effects Engine**
The module that applies a set of active configs to produce modified game parameters. Called during turn processing and daily poll selection.
_(Code: currently embedded in `configs/data/configs.ts`)_

**Package Manager** _(Shop)_
The in-run acquisition channel for configs, presented between turns. DevC-themed name for the shop. Players install and deinstall configs using their available storage.

**Rebuild** _(Reroll)_
The shop action that refreshes the current shop offerings at a storage cost. Cost increases on each rebuild (Fibonacci scale), resets after each CI pipeline window.

**Storage**
The KB/MB/GB capacity a run has for holding configs. Configs consume storage when installed; deinstalling frees it (minus junk). Can be expanded via configs or by skipping the shop.

**Score**
The points awarded for a correct turn. Computed from correctness, coverage delta, streak, and config bonuses. Has its own display component (ScoreBlock).

**Community Stats**
Social data about the daily poll: who answered first, who was fastest, who was first to answer correctly. Scoped to a single daily poll. Part of the post-turn daily poll experience.

**Leaderboard**
Season-scoped rankings of players by score or coverage. Distinct from community stats — leaderboards are persistent and competitive; community stats are ephemeral and social.

**Season**
A time-bounded competition period. Leaderboard rankings reset between seasons.

**Player**
A registered user participating in runs. Has a profile, run history, and season stats.

---

## Ownership Rules

| Concept | Domain | Notes |
|---|---|---|
| Poll questions + options | `polls/` | Admin CRUD + fetch |
| Daily poll selection | `polls/daily/` | Weights snapshot, O(1) lookup |
| Community stats | `polls/daily/` | Scoped to a daily poll |
| Run lifecycle | `runs/` | Start, finish, fail |
| Turn processing | `runs/` | Was `processPollAnswer.service.ts` |
| Answer recording | `runs/` | `createPollResponse` and tracking |
| CI pipeline + window evaluation | `runs/` | `getWindowResults`, CI pipeline services |
| Coverage calculation | `runs/` | Consolidated here, not split across polls |
| Config definitions + effects engine | `configs/` | Not an economy concern — game mechanic |
| Shop offerings + purchases | `economy/shop/` | Acquisition channel for configs |
| Storage management | `economy/storage/` | Capacity rules |
| Scoring rules + ScoreBlock | `score/` | Pure domain with logic + UI |
| Season lifecycle | `seasons/` | |
| Rankings | `leaderboards/` | Season-scoped |
