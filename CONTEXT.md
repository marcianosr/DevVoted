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
| Run / Climb | `run/domain` | `RunState`, `RunStatus`, `createRun`, and the primitives every transition edits state through: `withLog`, `withBuild`, `addStorage`, `freshWindow`, `shopDraft`, plus the audit lens `auditsOf` / `liveConfigsOf` / `offlineConfigsOf` / `offlinePairsOf` (`run.model.ts`). Holds no transitions and no reducer: it is the bottom of the run-domain graph |
| Run action | `run/domain` | `RunAction`, `runReducer`, `isShopLocked`, and the configuring transitions `install` / `uninstall` / `pick-stack` / `start` (`runAction.model.ts`); the top of the graph, so it is the one file that may import every other |
| Answer / Scoring | `run/domain` | `answer`, `closeWindow` (`answer.model.ts`); one poll scored, and the gate verdict, payout and settle when the window fills |
| Shop action | `run/domain` | `draft`, `upgrade`, `sell`, `drop`, `setBuildSpace`, `plantPin`, `finishReward`, the ADR-029 controls `rebuildDraft` / `lockOffer` / `extendOffers` and their `can*` / `*Available` predicates (`shopAction.model.ts`); pricing and rolling stay in `shop/domain/draft.model.ts` |
| Paid action | `run/domain` | lint and peek: `lintFeeFor`, `peekFeeFor`, `lintApplies`, `canRunLinter`, `spendLint`, `peekApplies`, `canBuyPeek`, `spendPeek` (`paidAction.model.ts`) |
| Strip / Peel | `run/domain` | `strip`, `minifyForPeel`, `peelRefundIn`, `resumeClimb` (`strip.model.ts`); the ADR-037 way out of a missed gate |
| Run fixtures | `run/domain` | `started`, `answerWith`, `clearGate`, `failGate`, `payPeel`, `handed`, `poll`, `pool` (`run.factory.ts`); the shared spec fixtures for the run engine |
| Run status | `run/domain` | `RunStatus` = `configuring \| answering \| awaiting-strip \| rewarding \| won \| dead` |
| Run poll / Grading | `run/domain` | `RunPoll`, `RunOption`, `AnswerType`, `AnswerOutcome`, `AnsweredPoll`, `answerOutcome`, `coverageShare`, `mirrorPoll`, `mirrorGrading`, `nextStreak` (`runPoll.model.ts`); the run's own projection of a poll plus the one grading rule, shared with the community board. The authored `Poll` stays with the `polls` context (ADR-002 §2) |
| Run snapshot | `run/domain` | `RunSnapshot`, `toRunSnapshot`, `hydrateRunState` (`runSnapshot.model.ts`); what persists to `run_states.state` |
| Run rules | `run/domain` | `SLICE_WINDOW`, `VICTORY_GATE`, `BASE_SLOTS`, `failPeelShareFor`, `peelQuotaSlotsFor`, `isPeelFatal`, `atMinimumWidth` (`rules.model.ts`) |
| Build space | `run/domain` | `BUILD_SPACE_RUNGS`, `buildSpaceFor`, `rungIndexFitting`, `spaceFitting`, `upkeepFitting`, `rungAfterFitting`, `upkeepForSpace`, `highestAffordableSpace` (`rules.model.ts`) — the ladder. The rung a build occupies is derived in `build/domain` (`spaceForBuild`, `upkeepForBuild`), never stored or picked (ADR-098) |
| Seed / Segment | `run/domain` | `rollDailySeedSequence` (`seed.model.ts`); pure, so it is a model not a service |
| Run view | `run/application` | `RunView`, `toRunView` (`runView.viewmodel.ts`); the single projection every screen reads, composed from the slices below. Also the trust boundary (DVTD-ay5e): the client receives this and never `RunState` |
| Gate stake | `run/application` | `GateStake`, `AuditView`, `auditViewsFor` (`gateStake.viewmodel.ts`); what the coming gate demands and pays, as one object — the subject of `GateStakeReceipt` |
| Poll view | `run/application` | `PollView`, `redactPoll` (`pollView.viewmodel.ts`); the redaction that strips `correct` flags before a poll reaches the client |
| Paid actions | `run/application` | `PaidActions`, `paidActionsFor` (`paidActions.viewmodel.ts`); lint and peek as the answering screen sees them |
| Shop controls | `run/application` | `ShopControls`, `shopControlsFor` (`shopControls.viewmodel.ts`); ADR-029's rebuild / lock / extend plus the git tag |
| Gate payout | `run/application` | `GatePayout`, `gatePayoutFor` (`gatePayout.viewmodel.ts`); what the cleared gate paid and took back |
| Run orchestration | `run/application` | `run.service.ts` (was `handlers.ts`), `run.serverfn.ts` (was `api/run.ts`), `run.validation.ts` |
| Run write path | `run/infrastructure` | `applyActionToRun` in `run.repository.ts`; one `SELECT ... FOR UPDATE` on `run_states`, one reducer, one write. Never split across aggregates |
| Poll sequence | `run/infrastructure` | `runPolls.repository.ts` owns every statement against `daily_run_seeds` / `daily_run_polls` / `run_polls`: `getOrCreateDailyRunSeed`, `fetchRunPollsForRun`, `rollSegmentForward`. Takes the caller's `tx`, so the write path stays one transaction |
| Run screens | `run/presentation` | `RunLayout` plus one Tier-2 component per route (`RunNew`, `RunPrep`, `RunPoll`, `RunGate`, `RunReview`, `RunShop`, `RunOver`, `RunStart`, `RunRecap`) and the kanto adapters they mount (`StartView`, `PrepView`, `PollView`, `GateOutcomeView`, `ReviewView`, `ShopView`, `RunOverView`). No HUD: each kanto screen carries its own header and footer (ADR-088) |
| Build | `build/domain` | `Build` = `{ id, configs, vendorLockedConfigId? }` (`build.model.ts`); carries no space of its own — `spaceForBuild` derives it (ADR-098) |
| Public build | `build/domain` | `PublicBuild`, `publicBuildOf`, `publicWeightOf` (`publicBuild.model.ts`); a build as any other player may read it — configs, versions, weight, the vendor lock — refreshed from the roster (ADR-101). Display only: no check reads it |
| Slot | `build/domain` | `occupiedSlots`, `billableSlotsOf`, `freeSlots`, `hasRoomFor`, `overflowSlots`, `isOverCapacity`, `MAX_BUILD_WEIGHT` (`build.model.ts`); the space a run rents is **derived** from its weight (`spaceForBuild`), and the ladder lives in `run/domain/rules.model.ts`. `hasRoomFor` measures against the top rung only (ADR-098); `slotsOf` / `canMinify` / `minify` live on the config (`config.model.ts`) |
| Answer payout | `build/domain` | `answerPayoutFor`, `AnswerPayout`, `previewContextFor`, `perAnswerPreviewFor`, `PerAnswerPreview` (`answerPayout.model.ts`) and `PayoutContext` (`config/domain/effect.model.ts`); the one walk that prices a right answer and attributes it, and the preview is that same walk with no category, so a quote can never disagree with a payout. Run totals held on `RunState.coverage` / `coverageByCategory` |
| Lint | `build/domain` | `linterFor`, `canLint`; the fee is `lintCost` in `run/domain/paidAction.model.ts` |
| Build screen | `build/presentation` | `RunNew`, `StartView` |
| Gate | `gate/domain` | `currentRequirement`, `checkStatuses`, `gatePassed` (`gate.model.ts`) |
| Gate reward | `gate/domain` | `gateRewardRows`, `gateStorageGained` (`gateReward.model.ts`) |
| Gate ladder | `gate/domain` | `gateLadder.model.ts`; what unlocks at which gate |
| Swatch | `gate/domain` | `GateSwatch`, `SwatchTheme`, `swatchForGate` (`swatch.model.ts`); app theming is the `[data-swatch-theme]` / `[data-gate-theme]` palette in `src/styles/app.css` (ADR-020) |
| Config role | `gate/domain` | `roleOf`, `roleRows` (`configRole.model.ts`); how a config reads on a gate report |
| Gate screens | `gate/presentation` | `RunGate`, `GateOutcomeView`; one screen, two verdicts (ADR-076), so one route (ADR-088) |
| Config | `config/domain` | `Config`, `ConfigSize`, `CONFIG_SIZES` (`config.model.ts`) |
| Config roster | `config/domain` | `CONFIGS`, `CONFIG_LIST` (`configRoster.model.ts`); the content catalogue |
| Effect | `config/domain` | `Effect`, `effectOf` (`effect.model.ts`); the benefit half of a config |
| Config status | `config/domain` | `ConfigStatus`, `SkipReason`, `configStatusFor` (`effect.model.ts`); online / skipped / offline on the poll on deck (ADR-040) |
| Gate window | `config/domain` | `GateWindow`, `EMPTY_WINDOW` (`effect.model.ts`); the 5-answer tally a gate judges |
| Stack | `config/domain` | `STARTER_STACKS`, `starterStackFor` (`stack.model.ts`); the staged opening loadouts |
| Config visuals | `src/ui/kanto-theme` | `ConfigChip` and friends; the module's own `presentation/` folder is gone with old-theme |
| Draft / Rebuild / Lock / Extend | `shop/domain` | `rollDraft`, `rebuildCost`, `extendCost`, `offerCount`, and the rolled upgrade's climb `upgradeOfferFor` / `CLIMB_ONE_IN` / `versionOddsFor` (`draft.model.ts`) |
| Registry control roster | `shop/domain` | `REGISTRY_CONTROLS`, `REGISTRY_CONTROL_LIST`, `openingGateOf`, `closingGateOf`, `isSoldInShop`, `ShopSoldId` (`registryControl.model.ts`) — the one table naming the eight services (the player's word since ADR-115; the code says control), each with its scope, registry or run, where it is sold, shop or archive (ADR-115 D10), its unlock objective (`servicesUnlockedBy`, `isServiceUnlocked`, ADR-116) and, for a shop service, the gate it opens on; the shop and the Dex both read it |
| Service unlocks | `shop/infrastructure` + `shop/application` | `fetchUnlockedServiceIds` (`serviceUnlock.repository.ts`), `getServiceUnlocks` (`serviceUnlock.serverfn.ts`) — the account's earned services (`user_service_unlocks`), read by the run view and the Dex; granted at the objective seam in `run.repository.ts` |
| Shop screen | `shop/presentation` | `RunShop`, `ShopView`; the Registry is a panel on it, and on New run |
| Category leader / Seat | `run/domain` | `CategoryLeader`, `CategorySeat`, `seatsFor`, `MIN_LEADER_STREAK` (`categoryLeader.model.ts`); one seat per category, read by the poll screen and by the community board. The row both surfaces draw is `categoryLeaderRowFor` (`run/application`) |
| Voter | `community/domain` | `CommunityVoter` (`voter.model.ts`); a player as the board draws them |
| Climb map | `community/domain` | `ClimbMarker`, `trackPosition` (`climbMap.model.ts`); the shared per-day position track, read only by the community board |
| Climb ladder | `community/application` | `ladderFor`, `LadderGate`, `LadderClimber`, `LadderFallen`, `ClimberMark` (`climbLadder.viewmodel.ts`); the map's gates with everyone standing under them, the fallen keyed by run, each chip's rival ring, close mark and rescue tag, and the `ClimberCard` a chip opens |
| Community board | `community/application` | `getRunCommunityService` and its view types (`community.service.ts`), `community.serverfn.ts` |
| Climb standing | `community/application` | `ClimbStanding` (`community.service.ts`); how a run is doing as anyone may read it — handle, worn title, coverage percent, streak, storage, best category. ADR-101 §2 says what is never on it |
| Community reads | `community/infrastructure` | `community.repository.ts`, `climbers.repository.ts` |
| Community screen | `community/presentation` | `RunCommunity`, `CommunityView`, `useNextPollsCountdown` |
| Incident / Attack | `incident/domain` | `RivalCandidate`, `AttackOffer`, `QueuedIncident`, `eligibleRivals`, `offersFor`, `lockIncidents` (`incident.model.ts`); the run-side vocabulary `Attack`, `LastClose`, `LockedIncident` lives on `RunState` (`run.model.ts`) with `armAttack` / `fireAudit` in `attack.model.ts`, so nothing in `run/domain` imports the aggregate |
| Incident settlement | `incident/application` | `settleIncidents` (`incidentSettlement.service.ts`), the one writer of a gate's audits, handed to `applyActionToRun` as its `settle` seam; `attackTargets.service.ts`, `fireAudit.service.ts`, `incidentsFeed.service.ts`, `incident.serverfn.ts`, `incident.viewmodel.ts`, the three hooks |
| Incident queue | `incident/infrastructure` | `incident.repository.ts` owns every statement against `audit_incidents` |
| Incidents feed | `src/ui/kanto-theme` | `AttackPanel` (prep) and `IncidentsPanel`, which the community board composes. The aggregate has no `presentation/` layer: the feed has no screen of its own |
| Public build chips | `build/application` | `publicBuildChipsFor`, `publicConfigChipFor` (`publicBuild.viewmodel.ts`); the one way another player's build becomes chips, drawn by the prep attack rows and by the climb map |
| Public build space | `build/domain` | `publicSpaceOf` (`publicBuild.model.ts`); the rung another player's build rents, vendor lock exempt, mirroring `spaceForBuild` |
| Poll answering visuals | `poll/presentation` | `PollMarkdown`, `PollQuestionHeading`; the rest moved into the kanto `PollScreen` |

A screen belongs to the aggregate whose concept it is about, which is why
`ShopScreen` is shop's and `RewardScreen` is gate's. `poll` has presentation only:
the Poll concept itself belongs to the `polls` context, and these files are the
run's way of drawing one.

### Context `polls`

| Concept | Aggregate | Key symbols | Today |
|---|---|---|---|
| Poll | `poll` | `Poll`, `PollOption`, `evaluatePollAnswer` (`poll.model.ts`, `pollOption.model.ts`, `pollAnswer.model.ts`) | `modules/polls/poll/` |
| Poll authoring | `authoring` | Admin CRUD plus the four `/polls/*` screens (`PollList`, `PollDetail`, `PollForm`, `PollEdit`) | `modules/polls/authoring/` |

### Context `collection`

| Concept | Lives in | Key symbols |
|---|---|---|
| Polldex | `dex/domain` | `PolldexEntry`, `filterPolldexEntries`, `polldexCoverage` (`polldex.model.ts`) |
| Dex reads | `dex/application` + `dex/infrastructure` | `getPolldexService` (`polldex.service.ts`), `getPolldex` (`polldex.serverfn.ts`), `polldex.repository.ts` |
| The Dex | `dex/presentation` + `dex/application` | Tab shell plus the six tabs (`Dex.component`, `dexScreen.viewmodel`, `DexScreen`, `DexPolls`, `DexConfigs`, `DexControls`, `DexAudits`, `DexSwatches`, `DexRuns`); the services tab is one section listing every service, named locked or not |
| Controldex | `dex/domain` | `ControldexEntry`, `controldex` (`controldex.model.ts`) — every roster service with whether the account has unlocked it, read from the service grants (ADR-116) |
| Unlockables | `unlockables` | Planned (`DVTD-2try`, `DVTD-g8ty`). The reason `collection` is its own context — not built |

### Context `account`

| Concept | Aggregate | Today |
|---|---|---|
| Login, signup, session | `auth` | `modules/account/auth/` |
| User, dev card, awards | `profile` | `modules/account/profile/`, `routes/_authed/profile.$userId.tsx` |
| Archive + borders | `profile` | `border.model.ts` (catalogue + `findBorderById`), `archive.service.ts`, `useArchiveState.hook.ts`, `BorderShop`, `ArchiveSummary`. All three columns (`archived_storage`, `owned_border_ids`, `equipped_border_id`) sit on `users`, so one aggregate owns one table |
| Title | `profile` | `title.model.ts` (`Title`, `TitleEarn`, `TITLES`, `findTitleById`, `isExclusive`, `TITLE_METRICS`, `titlesEarnedBy`), `title.repository.ts`, `title.service.ts`, `useTitleState.hook.ts`, `TitleShelf`. Earned identity, permanent, one worn (ADR-109). Owned titles are rows in `user_titles`; `users.equipped_title_id` is only which one is on show. Not to be confused with an account **role** (`Poll editor`, `Admin`), which is authority and lives on `users.role` |

### Context `ops`

Running the product, not playing it — the one context that is about DevVoted as
a service. Named `ops` because `Analytics`, `Telemetry` and `Uptime` are all
taken by configs in the roster.

| Concept | Lives in | Key symbols |
|---|---|---|
| Visit | `pulse/domain` | `Visit`, `DeviceClass`, `KNOWN_ROUTE_IDS`, `isKnownRouteId`, `deviceClassOf`, `referrerHostOf`, `countryOf` (`visit.model.ts`); one visitor's day on one screen, never a page view |
| Visitor identity | `pulse/infrastructure` | `visitorHashOf`, `readVisitorContext`, `isSameOriginRequest` (`visitor.repository.ts`); the only reader of the incoming request. The hash is keyed to the date, so it rotates at midnight and nothing links a visitor across days — which is why the app shows no consent banner |
| Visit write path | `pulse/application` + `pulse/infrastructure` | `recordVisit` / `recordScreen` (`visit.serverfn.ts`), `recordVisitService` (`visit.service.ts`), `upsertVisit` (`visit.repository.ts`) |

### `src/domains/` is gone

Retired 2026-09-23 (DVTD-wj1t). The last two slices landed as
`modules/polls/{poll,authoring}/` and `modules/account/profile/`; the name
`economy` went with them, since the archive and the borders are both columns on
`users` and belong to `profile`. The three `legacy-*` dependency-cruiser rules
that guarded the old tree are deleted, so ADR-002 now has one rule set and no
legacy carve-out.

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
| Storage plan | `StoragePlan`, `STORAGE_PLANS`, `storagePlanFor` — a rung rents the KB cap and nothing else (ADR-046) |
| Build space ladder | `BUILD_SPACE_RUNGS`, `spaceForBuild`, `upkeepForBuild` — room is rented by the gate and the rung follows the build, never picked (ADR-098) |
| Version | `Config.level`, `maxLevelOf`, `levelUp`, `ShopOffer.heldLevel`; the kit says version (`Version.ui`, `VersionState`, `version` props). An unreconciled pair, recorded here rather than renamed (ADR-060, ADR-097) |

---

## Retired terms

Do not reintroduce these. Each was replaced because the code moved or the word
meant two things at once.

| Retired | Why | Use instead |
|---|---|---|
| `ladderSummaryFor` / `trackBuildFor` / `rivalChipFor` | The map stated a one-line count while it was a placeholder, and a public build became chips in two places | `ladderFor` for the map; `publicBuildChipsFor` for the chips |
| Pipeline | Retired as the container word (ADR-048): it read as the thing judging you, which is the gate | **Build** for the player's setup; **Gate** for the judgement |
| Board | Never the container word | **Build** |
| Spot | ADR-044 renamed slots to spots to keep width clear of money; ADR-048 reversed it | **Slot** |
| Rarity / bit / crumb / nibble / byte | ADR-047 deleted the grade ladder; a config carries a plain size. A version's odds of being rolled read as `1 in N rolls`, never as a tier word (ADR-097) | **Slots** (`Config.slots`, one of 1/2/4/8/12/16); **odds** for a version |
| Package Manager | Legacy in-fiction name for the shop; survives only in one `GameLoopExplainer` string | **Shop** |
| Dex Registry | Two words only because plain "Registry" was taken; the navigation already said Dex, so the screen says Dex. **Registry** stays the shop's in-run offer list | **Dex** (`DEX_TITLE` in `DexScreen.ui.tsx`) |
| Shelf | Renamed 2026-09-10: the offer list is an npm registry, which is what the player downloads and installs from. The **shop** is still the screen | **Registry** (`Registry.ui.tsx`, `RegistryControl.ui.tsx`, `ShopScreenProps.registry`) |
| Control | Renamed for the player 2026-09-25 (ADR-115): the shop sells **services** in two scopes, registry and run. The code keeps the word, because ADR-002 reserves `.service.ts` | **Service** in copy; `RegistryControl*`, `controldex`, `shopControls` in code |
| Turn | No such symbol anywhere; the legacy `turn.service.ts` was deleted with `src/domains/runs/` | **Answer** (`RunAction` `answer`, `AnsweredPoll`) |
| Score / ScoreBlock | No score system and no such component; scoring *is* coverage | **Coverage** |
| Config Trigger | Never built as a distinct concept | **Check** and **Effect** |
| Config Effects Engine | The engine is one function | `effectOf` in `config/domain/effect.model.ts` |
| Config Discovery | Not built; tracked in DVTD-2try | Say "config unlocks" and link the bean |
| `session-run` | Renamed to `run` in 2026-07; the orphan folder was deleted 2026-08-12 | `src/modules/run/`; the DB value `mode: "session"` keeps the old name |
| `coverageForAnswer` / `coverageProfileFor` / `coveragePerCorrectRaw` / `gainPerCorrectFor` / `coverageMultiplierFor` | Four formulas priced one right answer, and the one the prep and shop quoted skipped focus, missed-poll and cache and folded the throttle in, so the quote and the payout could disagree (deleted 2026-09-25) | `answerPayoutFor`; the preview is `perAnswerPreviewFor`, the same walk with no category |
| `answerScore.viewmodel` | Documented as a run concept with no production caller; the receipt reads `AnsweredPoll.coverageBreakdown` directly (deleted 2026-09-25) | `CoverageBreakdown` on the answered poll |

Retired **folder and file** names, per the ADR-002 rewrite of 2026-08-12:

| Retired | Why | Use instead |
|---|---|---|
| `ladderSummaryFor` / `trackBuildFor` / `rivalChipFor` | The map stated a one-line count while it was a placeholder, and a public build became chips in two places | `ladderFor` for the map; `publicBuildChipsFor` for the chips |
| `presentation/{concept}/` beside concept folders | Split the same concept across two folders | `{aggregate}/presentation/` |
| `queries.ts` | Names the SQL verb, not the role; reads and writes share table knowledge | `{name}.repository.ts` in `infrastructure/` |
| `handlers.ts` | Orchestration is a service. (`.handlers.ts` means MSW in the ADR-083 lineage; DevVoted has no MSW) | `{name}.service.ts` in `application/` |
| `view/`, `services/`, `validation/` as module-level folders | Layer folders holding one or two files that belonged to a concept | `{aggregate}/application/` |
| `models/` as a flat folder | Same | `{aggregate}/domain/` |
| `{name}.mock.ts` | One suffix per role | `{name}.factory.ts` |

---

## Naming rules

- Name an aggregate after the concept, never after its layer or its shape.
  `gate/`, not `gateUtils/`; `categoryLeader.model.ts`, not `leaderHelper.ts`.
- Reuse a term from this file or the wiki glossary before coining a new one. A
  new word needs an entry here in the same commit.
- Where a file goes is not a judgement call: walk the decision tree in
  [ADR-002 §5](docs/adr/002-domain-architecture.md#5-decision-tree-where-does-my-file-go).
  Suffixes come from the closed allowlist in §4.1, and each one is pinned to a
  single layer.
- Content and identity labels name the real thing (React, TypeScript), not an
  invented punchy phrase.

