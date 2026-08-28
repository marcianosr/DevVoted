# DevVoted Domain Context

Ubiquitous language for DevVoted, written for one purpose: naming modules,
folders, and files. When a concept is missing here, add it before you name the
module.

Two pointers, so nothing is stated twice:

- **What a term means in the game** lives in the [wiki glossary](docs/wiki.md#9-glossary).
  That is the source of truth for meaning. Do not restate it here.
- **How code is structured and layered** lives in [ADR-002](docs/adr/002-domain-architecture.md).
  That is the source of truth for the layer table and the dependency rule.

This file owns the join between them: which module and concept folder owns each
term, and which words we no longer use.

---

## Where each concept lives

[ADR-002](docs/adr/002-domain-architecture.md) organises code as
`src/modules/{context}/{aggregate}/{layer}`. The **aggregate** is the domain
boundary, so this table is the map an architecture review reads first.

> **`run` and `collection` have migrated** (2026-08-12, `DVTD-36ct`); their
> paths below are real. `polls` and `account` have not: their Today column is
> where the files actually sit. Drop the column per context as each one lands.

### Context `run`

| Concept | Lives in | Key symbols |
|---|---|---|
| Run / Climb | `run/domain` | `RunState`, `RunStatus`, `createRun`, and the primitives every transition edits state through: `withLog`, `withPipeline`, `addStorage`, `freshWindow`, `shopDraft`, plus the audit lens `auditsOf` / `liveConfigsOf` / `offlineConfigsOf` / `offlinePairsOf` (`run.model.ts`). Holds no transitions and no reducer: it is the bottom of the run-domain graph |
| Run action | `run/domain` | `RunAction`, `runReducer`, `isShopLocked`, and the configuring transitions `slot` / `unslot` / `pick-stack` / `start` (`runAction.model.ts`); the top of the graph, so it is the one file that may import every other |
| Answer / Scoring | `run/domain` | `answer`, `closeWindow` (`answer.model.ts`); one poll scored, and the gate verdict, payout and settle when the window fills |
| Shop action | `run/domain` | `draft`, `upgrade`, `sell`, `drop`, `changePlan`, `plantPin`, `finishReward`, the ADR-029 controls `rebuildDraft` / `lockOffer` / `extendOffers` and their `can*` / `*Available` predicates (`shopAction.model.ts`); pricing and rolling stay in `shop/domain/draft.model.ts` |
| Paid action | `run/domain` | lint and peek: `lintFeeFor`, `peekFeeFor`, `lintApplies`, `canRunLinter`, `spendLint`, `peekApplies`, `canBuyPeek`, `spendPeek` (`paidAction.model.ts`) |
| Strip / Peel | `run/domain` | `strip`, `resumeClimb` (`strip.model.ts`); the ADR-037 way out of a missed gate |
| Run fixtures | `run/domain` | `started`, `answerWith`, `clearGate`, `failGate`, `payPeel`, `handed`, `poll`, `pool` (`run.factory.ts`); the shared spec fixtures for the run engine |
| Run status | `run/domain` | `RunStatus` = `configuring \| answering \| awaiting-strip \| rewarding \| won \| dead` |
| Run poll / Grading | `run/domain` | `RunPoll`, `RunOption`, `AnswerType`, `AnswerOutcome`, `AnsweredPoll`, `answerOutcome`, `coverageShare`, `mirrorPoll`, `mirrorGrading`, `nextStreak` (`runPoll.model.ts`); the run's own projection of a poll plus the one grading rule, shared with the community board. The authored `Poll` stays with the `polls` context (ADR-002 §2) |
| Run snapshot | `run/domain` | `RunSnapshot`, `toRunSnapshot`, `hydrateRunState` (`runSnapshot.model.ts`); what persists to `run_states.state` |
| Run rules | `run/domain` | `SLICE_WINDOW`, `VICTORY_GATE`, `STORAGE_PLANS`, `failPeelShareFor`, `peelQuotaSpotsFor`, `isPeelFatal`, `atMinimumWidth` (`rules.model.ts`) |
| Seed / Segment | `run/domain` | `rollDailySeedSequence` (`seed.model.ts`); pure, so it is a model not a service |
| Run view | `run/application` | `RunView`, `toRunView` (`runView.viewmodel.ts`); the single projection every screen reads, composed from the slices below. Also the trust boundary (DVTD-ay5e): the client receives this and never `RunState` |
| Gate stake | `run/application` | `GateStake`, `AuditView`, `auditViewsFor` (`gateStake.viewmodel.ts`); what the coming gate demands and pays, as one object — the subject of `GateStakeReceipt` |
| Poll view | `run/application` | `PollView`, `redactPoll` (`pollView.viewmodel.ts`); the redaction that strips `correct` flags before a poll reaches the client |
| Paid actions | `run/application` | `PaidActions`, `paidActionsFor` (`paidActions.viewmodel.ts`); lint and peek as the answering screen sees them |
| Shop controls | `run/application` | `ShopControls`, `shopControlsFor` (`shopControls.viewmodel.ts`); ADR-029's rebuild / lock / extend plus the git tag |
| Gate payout | `run/application` | `GatePayout`, `gatePayoutFor` (`gatePayout.viewmodel.ts`); what the cleared gate paid and took back |
| Answer score | `run/application` | `AnswerScore`, `latestAnswerScore`, `correctOptionIdsFor` (`answerScore.viewmodel.ts`); selectors over a built `RunView`, not part of `toRunView` |
| Run orchestration | `run/application` | `run.service.ts` (was `handlers.ts`), `run.serverfn.ts` (was `api/run.ts`), `run.validation.ts` |
| Run write path | `run/infrastructure` | `applyActionToRun` in `run.repository.ts`; one `SELECT ... FOR UPDATE` on `run_states`, one reducer, one write. Never split across aggregates |
| Poll sequence | `run/infrastructure` | `runPolls.repository.ts` owns every statement against `daily_run_seeds` / `daily_run_polls` / `run_polls`: `getOrCreateDailyRunSeed`, `fetchRunPollsForRun`, `rollSegmentForward`. Takes the caller's `tx`, so the write path stays one transaction |
| Run screens and HUD | `run/presentation` | Prep / Answering / GameOver screens, `RunLayout`, `RunHud`, `StorageGauge`, `RunSummary` |
| Pipeline | `pipeline/domain` | `Pipeline` = `{ id, slots, configs }` (`pipeline.model.ts`) |
| Spot | `pipeline/domain` | `BASE_SPOTS` (4), `OWNED_SPOTS_CAP` (8), `ownedSpotsFor`, `nextSpotGrantFor`, `occupiedSpots`, `freeSpots`, `hasRoomFor`, `overflowSpots` (`pipeline.model.ts`); `spotsOf` / `canMinify` / `minify` live on the config (`config.model.ts`) |
| Coverage | `pipeline/domain` | `coverageForAnswer`, `coverageBreakdownForAnswer`; run totals held on `RunState.coverage` / `coverageByCategory` |
| Lint | `pipeline/domain` | `linterFor`, `canLint`; the fee is `lintCost` in `run/domain/paidAction.model.ts` |
| Build screen | `pipeline/presentation` | `ConfiguringScreen`, `PipelineTable`, `PipelineReportRow`, `SpotGrantRow`, `CoverageByCategory` |
| Gate | `gate/domain` | `currentRequirement`, `checkStatuses`, `gatePassed` (`gate.model.ts`) |
| Gate reward | `gate/domain` | `gateRewardRows`, `gateStorageGained` (`gateReward.model.ts`) |
| Gate ladder | `gate/domain` | `gateLadder.model.ts`; what unlocks at which gate |
| Swatch | `gate/domain` | `GateSwatch`, `SwatchTheme`, `swatchForGate` (`swatch.model.ts`); app theming via `src/ui/theme/swatchTheme.ts` |
| Config role | `gate/domain` | `roleOf`, `roleRows` (`configRole.model.ts`); how a config reads on a gate report |
| Gate screens | `gate/presentation` | `RewardScreen`, `StripScreen`, `GateRewardReport`, `GateStakeReceipt`, `RoleList`, `SwatchChips`, `GateSegmentBar` |
| Config | `config/domain` | `Config`, `ConfigFamily`, `Rarity` (`config.model.ts`) |
| Config roster | `config/domain` | `CONFIG_ROSTER` (`configRoster.model.ts`); the content catalogue |
| Effect | `config/domain` | `Effect`, `effectOf` (`effect.model.ts`); the benefit half of a config |
| Config status | `config/domain` | `ConfigStatus`, `SkipReason`, `configStatusFor` (`effect.model.ts`); online / skipped / offline on the poll on deck (ADR-040) |
| Gate window | `config/domain` | `GateWindow`, `EMPTY_WINDOW` (`effect.model.ts`); the 5-answer tally a gate judges |
| Stack | `config/domain` | `STARTER_STACKS`, `starterStackFor` (`stack.model.ts`); the staged opening loadouts |
| Config visuals | `config/presentation` | `ConfigChip`, `ConfigActions`, `StackPicker`, `StackPreviewList` |
| Draft / Rebuild / Lock / Extend | `shop/domain` | `rollDraft`, `rebuildCost`, `extendCost`, `offerCount` (`draft.model.ts`) |
| Shop screen | `shop/presentation` | `ShopScreen`, `RunShop` |
| Standouts / Awards | `community/domain` | `standoutsFor` (`standouts.model.ts`) |
| Climb map | `community/domain` | `ClimbMarker`, `trackPosition` (`climbMap.model.ts`); the shared per-day position track, read only by the community board |
| Community board | `community/application` | `getRunCommunityService` and its view types (`community.service.ts`), `community.serverfn.ts` |
| Community reads | `community/infrastructure` | `community.repository.ts`, `climbers.repository.ts` |
| Community screen | `community/presentation` | `RunCommunity`, `Standouts`, `Voter`, `ClimbToday`, `useNextPollsCountdown` |
| Poll answering visuals | `poll/presentation` | `PollCard`, `PollOptionList`, `PollOptionReview`, `OutcomeTile`, `RevealScore`, `PracticeBank` |

A screen belongs to the aggregate whose concept it is about, which is why
`ShopScreen` is shop's and `RewardScreen` is gate's. `poll` has presentation only:
the Poll concept itself belongs to the `polls` context, and these files are the
run's way of drawing one.

### Context `polls`

| Concept | Aggregate | Key symbols | Today |
|---|---|---|---|
| Poll | `poll` | Poll reads and answer evaluation | `domains/polls/` |
| Poll authoring | `authoring` | Admin CRUD, `PollForm` | `domains/polls/components/`, `domains/polls/api/admin.handlers.ts` |

### Context `collection`

| Concept | Lives in | Key symbols |
|---|---|---|
| Polldex | `dex/domain` | `PolldexEntry`, `filterPolldexEntries`, `polldexCoverage` (`polldex.model.ts`) |
| Dex reads | `dex/application` + `dex/infrastructure` | `getPolldexService` (`polldex.service.ts`), `getPolldex` (`polldex.serverfn.ts`), `polldex.repository.ts` |
| The Dex | `dex/presentation` | Tab shell plus the Configs, Swatches and Polls panels (`Dex.component`, `DexScreen`, `PolldexPanel`, `ConfigdexPanel`, `SwatchdexPanel`) |
| Unlockables | `unlockables` | Planned (`DVTD-2try`, `DVTD-g8ty`). The reason `collection` is its own context — not built |

### Context `account`

| Concept | Aggregate | Today |
|---|---|---|
| Login, signup, session | `auth` | `domains/users/` |
| User, dev card, awards | `profile` | `domains/users/`, `routes/_authed/profile.$userId.tsx` |

### Legacy: `src/domains/`

`economy/`, `polls/`, `runs/`, `shared/`, `users/`. Live but being migrated per
ADR-002. `shared/queryKeys.ts` and `shared/categories` are still cross-cutting
and used by `src/modules/`; they belong in `src/shared/`. Do not add new
concepts here.

---

## Code name vs player-facing name

Where the two differ, use the code name in code and the player name in copy.

| Player-facing (wiki) | Code |
|---|---|
| Climb | `Run` / `RunState`; the aggregate folder is `run/`. "Climb" survives in `climbMap`, `ClimbToday`, `climbers.repository`, and the `resume-climb` action |
| Window | `GateWindow`, sized by `SLICE_WINDOW` |
| Demand | `minConfigsForGate`, `focusDemand`, `Effect.demand` |
| Strip | `RunAction` `strip`, `RunState.stripsRemaining` |
| Faucet | `Config.storagePerCorrect`, `RunState.faucetEarnedKb`, `FAUCET_CAP_KB` |
| Storage plan | `StoragePlan`, `STORAGE_PLANS`, `storagePlanFor` — a rung rents spots AND a KB cap (ADR-044) |

---

## Retired terms

Do not reintroduce these. Each was replaced because the code moved or the word
meant two things at once.

| Retired | Why | Use instead |
|---|---|---|
| CI Pipeline (as "the evaluator") | `Pipeline` means the player's build of config slots, not the thing that judges it | **Pipeline** for the build; **Gate** for the judgement |
| Board | Never the container word | **Pipeline** |
| Package Manager | Legacy in-fiction name for the shop; survives only in one `GameLoopExplainer` string | **Shop** |
| Turn | No such symbol in `src/modules/`; `turn.service.ts` is legacy `src/domains/runs/` | **Answer** (`RunAction` `answer`, `AnsweredPoll`) |
| Score / ScoreBlock | No score system and no such component; scoring *is* coverage | **Coverage** |
| Config Trigger | Never built as a distinct concept | **Check** and **Effect** |
| Config Effects Engine | The engine is one function | `effectOf` in `config/domain/effect.model.ts` |
| Config Discovery | Not built; tracked in DVTD-2try | Say "config unlocks" and link the bean |
| `session-run` | Renamed to `run` in 2026-07; the orphan folder was deleted 2026-08-12 | `src/modules/run/`; the DB value `mode: "session"` keeps the old name |

Retired **folder and file** names, per the ADR-002 rewrite of 2026-08-12:

| Retired | Why | Use instead |
|---|---|---|
| `presentation/{concept}/` beside concept folders | Split the same concept across two folders | `{aggregate}/presentation/` |
| `queries.ts` | Names the SQL verb, not the role; reads and writes share table knowledge | `{name}.repository.ts` in `infrastructure/` |
| `handlers.ts` | Orchestration is a service. (`.handlers.ts` means MSW in the ADR-083 lineage; DevVoted has no MSW) | `{name}.service.ts` in `application/` |
| `view/`, `services/`, `validation/` as module-level folders | Layer folders holding one or two files that belonged to a concept | `{aggregate}/application/` |
| `models/` as a flat folder | Same | `{aggregate}/domain/` |
| `{name}.mock.ts` | One suffix per role | `{name}.factory.ts` |

---

## Naming rules

- Name an aggregate after the concept, never after its layer or its shape.
  `gate/`, not `gateUtils/`; `standouts.model.ts`, not `awardsHelper.ts`.
- Reuse a term from this file or the wiki glossary before coining a new one. A
  new word needs an entry here in the same commit.
- Where a file goes is not a judgement call: walk the decision tree in
  [ADR-002 §5](docs/adr/002-domain-architecture.md#5-decision-tree-where-does-my-file-go).
  Suffixes come from the closed allowlist in §4.1, and each one is pinned to a
  single layer.
- Content and identity labels name the real thing (React, TypeScript), not an
  invented punchy phrase.
