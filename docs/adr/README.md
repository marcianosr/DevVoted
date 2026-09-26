# Architecture Decision Records

An ADR records **why** a decision was made. Current rules live in
[the wiki](../wiki.md); live-tuned numbers live in their model file. If you want
to know how the game works today, read the wiki first and come here for the
reasoning.

[rejected.md](rejected.md) lists directions that were tried and dropped. **Check
it before proposing one again.**

## Live

| # | Title | Status |
|---|---|---|
| [001](001-database-indexing-strategy.md) | Database indexing strategy | Accepted |
| [002](002-domain-architecture.md) | Domain architecture | Accepted — living document; owns module structure, naming and the dependency rule |
| [005](005-session-runs.md) | Session runs and the two-loop model | Accepted |
| [006](006-session-run-mechanics.md) | Session-run mechanics | Accepted — amended by 008, 013, 035, 074, 079 |
| [007](007-run-rebuild-conventions.md) | Run rebuild: design system and scope | Accepted |
| [008](008-reward-shop-multibuy-coverage-gated-slots.md) | The reward screen is a multi-buy shop | Accepted — amended by 046, 074 |
| [009](009-session-run-cadence-daily-seeded-shared-run.md) | Cadence: a daily-seeded, shared run | Accepted — amended by 011, 014 |
| [010](010-ui-layer-separation.md) | Two-tier UI separation | Accepted |
| [011](011-persistent-runs-daily-segments.md) | Persistent runs with daily shared segments | Accepted — amended by 014 |
| [012](012-migration-strategy.md) | One migration pipeline: guarded SQL | Accepted |
| [013](013-gate-scaled-coverage.md) | Gate-scaled coverage, gain and loss | Accepted — amended by 035; **the gain no longer scales** (073) |
| [014](014-daily-gate-lock.md) | Daily gate lock: the day hands one gate's polls | Accepted — amended by 076 (a retry costs a day) |
| [019](019-depth-and-width-are-independent.md) | Swatches are gate badges | Accepted — amended by 046, 074; **the clear no longer awards one** (080) |
| [020](020-gate-theme-replaces-category-colors.md) | The gate themes the run; categories carry no colour | Accepted |
| [026](026-staged-onboarding-starter-stacks.md) | Staged onboarding: the payoff-first gate clear | Accepted — amended by 052 |
| [028](028-the-defeat-device.md) | Volkswagen CI, the defeat device | Accepted — amended by 035 |
| [029](029-shop-controls-three-horizons.md) | Shop controls on three horizons | Accepted — amended by 054; 115 overrules the rerolls rejection for run services |
| [032](032-prep-is-the-post-shop-hub.md) | Prep is the post-shop hub | Accepted — whole again under 078 (the shop link is back) |
| [035](035-gates-are-auditors.md) | **Gates are auditors** — the friction moved to the gate | Accepted — amended by 037, 038, 056, 099, 118 |
| [036](036-the-git-tag.md) | The git tag: a cross-run checkpoint | Accepted — D1 amended by 115: the tag is a run service, archive deposit then run-KB placement |
| [037](037-a-missed-gate-peels-a-config.md) | A missed gate peels a config | Accepted — 076 owns what a miss does; the peel has two triggers (076, 074) |
| [038](038-the-audit-roster.md) | The audit roster, staged by count | Accepted — amended by 056 and 099 (the count is a capacity) |
| [039](039-every-upgrade-costs-storage.md) | Every upgrade costs storage | Accepted — amended by 053 |
| [040](040-config-status-online-skipped-offline.md) | A config is online, skipped or offline | Accepted |
| [042](042-design-pillars-and-anti-pillars.md) | **Design pillars and anti-pillars** — the tiebreaker lens | Accepted |
| [044](044-capacity-is-spots-money-is-kb.md) | Capacity is spots (now slots), money is KB | Accepted — amended by 046, 047, 074 |
| [047](047-a-configs-size-is-a-number.md) | A config's size is a number | Accepted — amended by 055 |
| [048](048-the-pipeline-is-your-build.md) | The pipeline is Your Build: four nouns, one job each | Accepted |
| [050](050-config-exposure-is-reveal-grant-stage.md) | Config exposure is Reveal / Grant / Stage | Accepted — amended by 051, 062, 064 |
| [051](051-configs-unlock-on-individual-objectives.md) | Configs unlock on individual objectives | Accepted — amended by 064 |
| [052](052-the-run-opens-on-a-dealt-hand.md) | The run opens on a dealt hand | Accepted — amended by 057, 062 |
| [053](053-upgrades-appear-on-the-shelf-and-arms-switch-mid-poll.md) | Upgrades on the shelf; arms switch mid-poll | Accepted — D4 amended by 097 (the offer climbs) |
| [054](054-offer-locks-ship-with-yarnlock.md) | Offer locks ship with yarn.lock | Accepted |
| [055](055-config-hue-is-keyed-to-slot-size.md) | Config hue is keyed to slot size | Accepted — amended by 060 |
| [056](056-audits-are-drawn-not-scheduled.md) | Audits are drawn from pools, not scheduled | Accepted — D1, D2, D4 superseded by 099; the family rule, rank order and canonical ids stand |
| [057](057-gate-0-is-the-calibration-gate.md) | Gate 0 is the calibration gate | Accepted — amended by 094 (Pallet asks 3 of 5) |
| [058](058-451-redacts-the-answers-and-sells-them-back.md) | 451 redacts the answers and sells them back | Accepted |
| [059](059-text-owns-the-weight-axis.md) | Text owns the weight axis | Accepted |
| [060](060-the-slot-mark-is-a-figure.md) | The slot mark is a figure; version is a dot track | Accepted |
| [061](061-coverage-reads-as-a-gauge-beside-the-answers.md) | Coverage reads as a gauge beside the answers | Accepted |
| [062](062-the-starting-hand-is-dealt-under-guarantees.md) | The starting hand is dealt under guarantees | Accepted — amended by 064 |
| [064](064-a-grant-is-recorded-with-its-provenance.md) | A grant is recorded with its provenance | Accepted |
| [066](066-every-figure-wears-a-badge.md) | Every figure wears a badge | Accepted |
| [068](068-coverage-reads-as-a-ring.md) | Coverage reads as a ring | Accepted — replaces 061's placement for kanto; amended by 070 |
| [069](069-the-build-sits-in-a-folded-footer.md) | The build sits in a folded footer on the poll screen | Accepted — extended by 114 (the send stacks on the pinned sheet) |
| [070](070-coverage-reads-as-a-banded-bar.md) | Coverage reads as a banded bar | Accepted — amends 068; the poll screen takes the bar; amended by 106 (units) and 113 (placement) |
| [073](073-coverage-is-a-flat-gain-reset-every-gate.md) | **Coverage is a flat gain over every slot the run has opened** | Accepted — supersedes 013's decision 1; amended by 081 and 094 (D2); half built |
| [074](074-weight-is-what-the-build-costs-to-run.md) | **Weight is what the build costs to run** | Accepted — built by 082, which amends decisions 2, 3 and 4 |
| [075](075-a-full-bar-pays-a-bonus.md) | A gate closed at full coverage pays a bonus | Accepted — amended by 076 (the swatch is marked); context figures superseded by 094 |
| [076](076-the-closing-band-decides-what-it-costs.md) | **The band a gate closes in decides what it costs** | Accepted — supersedes 071; routed by `gateRulingFor`; amended by 094 (a hold names its reason) |
| [077](077-the-pin-rides-the-fill-it-names.md) | The pin rides the fill it names | Accepted — amends 070; the coverage bar states what it moved to; amended by 106 (the moving pin counts whole units) |
| [078](078-prep-reads-in-two-columns.md) | **Prep and New run read in two columns, and the band table drops its prose** | Accepted — supersedes 072; restores 032's shop link |
| [079](079-a-partial-answer-pays-a-quarter-at-a-time.md) | **A partial answer pays a quarter at a time** | Accepted — amends 006 §11; the ladder 081 doubles |
| [080](080-the-swatch-is-won-by-the-window.md) | **The swatch is won by the window, not by the clear** | Accepted — reverses 019's award rule |
| [081](081-a-multiple-choice-answer-pays-double.md) | **A multiple-choice answer pays double** | Accepted — amends 073's decision 1; credit is a term beside 079's share |
| [082](082-build-space-is-rented-by-the-gate.md) | **Build space is rented by the gate** | Accepted — builds 074, amends its decisions 2, 3 and 4; retires 046 and 049; **D1, D2, D3 and D5 superseded by 098** (the rung is derived, not picked) |
| [083](083-a-coverage-config-multiplies-or-adds-units.md) | **A coverage config either multiplies the answer or adds flat units** | Accepted — amends the earn formula in 073's decision 1 and 081's decision 1; leaves 079 whole |
| [084](084-the-answer-shows-its-own-receipt.md) | **An answer shows its own receipt, and the build flashes what paid** | Accepted — builds on 083; amends 069 by giving the footer the flash; D1 and D2 amended by 095 |
| [085](085-a-prep-time-bet-pays-coverage-on-a-floor.md) | A prep-time bet pays coverage on a floor | Accepted — amended by 118 |
| [086](086-a-config-can-round-a-partial-up.md) | **A config can round a partial up to a whole unit** | Accepted — amends 079's decision 2; sits inside 083 as an add; leaves 081 whole |
| [087](087-a-config-can-be-exempt-from-the-space-it-fills.md) | **A config can be exempt from the space it fills** | Accepted — splits carried weight from billable weight; scraps DVTD-kf93 |
| [088](088-the-run-has-no-id-in-its-url.md) | **The run has no id in its URL** — the status owns the screen | Accepted |
| [089](089-an-armed-wager-pays-or-bills-one-answer.md) | **An armed wager pays or bills one answer** | Accepted — reverses 073's no-loss rule for one config; second wager beside 085; an add under 083 |
| [091](091-a-config-can-put-its-earnings-at-risk.md) | **A config can put its earnings at risk** | Accepted — Database escrows per exact answer; a clear commits at ×2, SHAKY or DANGER rolls it back |
| [092](092-207-multi-status-hides-the-answer-type.md) | **207 Multi-Status hides the answer type and flattens the credit** | Accepted — seventeenth audit; resolves 081 D6; `poll-reading` family keeps it off a 300 gate |
| [093](093-a-poll-states-how-the-room-did.md) | A poll states how the room did on it | Accepted |
| [094](094-the-bands-are-cut-in-answers-and-widen-with-the-climb.md) | **The bands are cut in answers per gate and widen with the climb, and a gate asks two of its own five** | Accepted — amends 073 D2, 057, 076; wires `FLOOR_CORRECT`; the floor is yesterday's HEALTHY line |
| [095](095-a-score-chip-carries-its-own-receipt.md) | **A score chip carries its own receipt, stated in units that sum** | Accepted — amends 084 D1 and D2; every paid chip opens its own breakdown, the column adds up |
| [096](096-a-config-can-promise-a-band-or-catch-one.md) | **A config can promise a band, or catch one** | Accepted — SLA is the first band→KB slope; Try/Catch turns one DANGER close into a hold and is spent doing it |
| [097](097-a-rolled-upgrade-climbs-on-a-coin-flip.md) | **A rolled upgrade climbs on a coin flip** | Accepted — amends 053 D4; one rung up then 1-in-2 per further rung to the cap; odds read as `1 in N rolls`; the registry offer sells through `draft` |
| [098](098-build-space-scales-with-the-build.md) | **Build space scales with the build, and the install press states the bill** | Accepted — supersedes 082 D1, D2, D3 and D5 and restates its D4; the rung is derived from `billableSlotsOf`, never picked; crossing one arms the install press; ladder and prices unchanged |
| [099](099-audits-are-fired-by-rivals.md) | **Audits are fired by rivals, and the gate's count is its capacity** | Accepted — supersedes 056 D1, D2, D4 and 038 D2; no floor, no authored gate, one run-long attack per HEALTHY-or-better clear, lock-time capacity is the law; amended by 105 (you fire only from a gate that can be fired at) |
| [100](100-a-category-has-a-living-record.md) | **A category has a living record** | Accepted — uses ADR-093's `PollView` seam; D2 and D4 collapsed by 103, the rest stands |
| [101](101-builds-are-open.md) | **Builds are open** | Accepted — restates 099 §4 as a rule; configs, versions, weight and the vendor lock are public, the run's answers are not; display only |
| [102](102-copy-has-one-owner.md) | **Copy has one owner** — run state picks it or the view states it | Accepted — generalises 040 D2; `COPY` object per `.ui.tsx`, shared words in `shared/lib/copy.ts`, register is not drift |
| [103](103-the-board-seats-twelve-category-leaders.md) | **The community board seats twelve category leaders** | Accepted — retires 065 and 067; collapses 100 D2 and D4; categories stay colourless (020 D1) |
| [104](104-visits-are-counted-without-a-banner.md) | **Visits are counted without a banner** — a date-keyed hash, no device storage | Accepted |
| [105](105-you-fire-only-from-a-gate-that-can-be-fired-at.md) | You may only fire from a gate that can be fired at | Accepted |
| [106](106-the-poll-screen-reads-coverage-in-units.md) | The poll screen reads coverage in units | Accepted — amends 070 and 077; only the poll screen passes units |
| [107](107-a-bean-states-what-and-why-first.md) | **A bean states what and why first** | Accepted; what/why, then `Done when`, then everything else under Notes |
| [108](108-the-dex-reads-configs-as-chip-rows.md) | The Dex reads configs as chip rows | Accepted — retires the caption rule of 050 D5 and 051 D7, amends 097 D4; the met state is a Story until DVTD-s5vo |
| [109](109-a-title-is-earned-and-worn-one-at-a-time.md) | **A title is earned, permanent, and worn one at a time** | Accepted; frees `title` from the account role, which keeps the handle line |
| [111](111-a-granted-title-is-dealt-and-announced-once.md) | **A granted title is dealt by a migration and announced once** | Accepted; completes 109, which left a granted title unawardable. Corrects 109 D4: the run-over screen never announced anything |
| [112](112-the-archive-carries-and-buys-appearance.md) | **The archive carries, and it buys appearance and licences** | Accepted; names a carve-out to 051's no-backfill line; D1 amended by 115 (the archive buys run services, not licences); keeps the archive out of the run |
| [113](113-the-poll-screen-stands-coverage-beside-the-question.md) | The poll screen stands coverage beside the question | Accepted — amends 068 and 070 on placement only; the poll leads, the bar rails beside it, the phone pin is gone |
| [114](114-the-send-is-the-poll-panels-own-pinned-row.md) | The send is the poll panel's own pinned row | Accepted — extends 069 D1: both bottom bars pin as a stack; D2 and D3 reversed by 117, the send now holds the floor and the sheet is seated on it |
| [115](115-services-have-two-scopes.md) | **Services have two scopes**, the registry's paid by the run and the run's paid by the archive | Accepted — replaces 110; amends 112 D1 and 036 D1; overrules 029's rerolls rejection for run services; D1's availability amended by 116; D10 one catalogue surfaced by context, D11 abandoning is a service |
| [116](116-a-service-is-unlocked-once-per-account.md) | A service is unlocked once, per account | Accepted — amends 115 D1; a locked service is named with the line that earns it (D3 amended); reverses the Reveal-only stance of DVTD-2try and DVTD-8zb3 |
| [117](117-the-primary-press-is-one-wide-bar.md) | **The primary press is one wide bar** that wears its gate | Accepted — reverses 114 D2 and D3 on which bar holds the floor; one CTA per screen, the reading inside the press, `noteAt` and the poll's count heading gone |
| [118](118-a-config-may-require-the-input-it-reads.md) | **A config may require the input it reads** — prep holds the gate for it | Accepted — amends 035, 085 |
| [119](119-a-config-card-flows-by-the-room-it-has.md) | **A config card flows by the room it has**, and never below its own name | Accepted — supersedes DVTD-8byc's wrap-at-own-width; a card with no fold states itself, badges ride whichever half is showing, panels fold all at once |

## Retired

Deleted files. The owner column is where to read instead; git history holds the
original text, and [rejected.md](rejected.md) holds the reasoning worth keeping.

| # | Title | Status |
|---|---|---|
| 003 | Domain restructure | Retired — 002 owns structure |
| 004 | UI styling conventions | Retired — 007 owns the design system |
| 016 | The Config Rule: every config is Effect + Check | Retired — 035 owns it |
| 017 | No baseline check | Retired — 035 owns it |
| 018 | Gate–slot coupling: gate N requires slot N | Retired — 019 owns it |
| 021 | A run dies at the gate that empties its build | Retired — 037 owns it |
| 022 | Every config owes the gate a check | Retired — 035 owns it |
| 015 | Storage-cap policy: grants clip at the cap | Retired — 074 removed the cap, 082 deleted it |
| 023 | Storage capacity is a subscription | Retired — 046 owned it, 082 deleted it |
| 046 | Slots are bought, storage is capped | Retired — 082 deleted the ladder and the cap |
| 049 | The archive opens a run wider | Retired — 082 deleted the start-slot ladder |
| 024 | *(reserved: shop-router)* | Unwritten — never implemented |
| 025 | Width claims itself automatically | Retired — 046 owns it |
| 027 | A gate only admits a build that survives its stake | Retired — 035 owns it |
| 030 | The storage-plan ladder is gate-staged | Retired — 046 owns it |
| 031 | The shop exit blocks an under-width build | Retired — 035 owns it |
| 033 | The correct-answer demand is what you bought | Retired — 035 owns it |
| 034 | The gate is a CI run | Retired — 035 owns it |
| 072 | Prep opens on the stakes, not on the build | Retired — 078 owns it |
| 041 | Slots open on gates, coverage, or either | Retired — 046 owns it |
| 043 | Rarity is a shape, not a hue | Retired — 047 owns it |
| 045 | Spots come from gates, KB rents more on top | Retired — 046 owns it |
| 071 | The band a gate closes in decides what the gate does | Retired — 076 owns it; OK clears and the peel came back |
| 063 | Planning Poker pays on an exact match | Retired — 085 owns it |
| 065 | Standouts are six climb-shaped awards | Retired — 103 replaced the section with category leaders |
| 067 | Standouts are four plain standings | Retired — 103 replaced the section; the four were never built |
| 110 | Registry services are licensed from the archive and equipped one at a time | Retired — 115 replaced licences with run services bought once per run |

## Conventions

- Title `# ADR-NNN: Title`, then `## Status`, `## Context`, `## Decision`,
  `## Consequences`. Status states the acceptance date, what is **live**, and
  what is dead with the ADR that owns it now.
- **An ADR states what is live.** A decision that dies collapses to a one-line
  pointer to the ADR that replaced it, not an inline refutation. Keep original
  decision numbers, since code and beans cite them.
- **A fully superseded ADR is deleted** and keeps a row in Retired above.
  Annotating instead of deleting is what turned this directory into 5,700 lines
  of decision-then-refutation, and it leaves a dead ADR looking like a citable
  authority — which is how two wiki statements ended up sourced to a superseded
  one.
- **Rejected directions go in [rejected.md](rejected.md)**, once, rather than in
  the ADR that rejected them. Rejections span ADRs and outlive them.
- **Live-tuned numbers point to their source-of-truth file** instead of being
  duplicated here. A table copied into an ADR goes stale silently.
- An ADR keeps its dated vocabulary. ADR-048 renamed spots to slots; earlier
  ADRs still say spots, because rewriting them would lose why the word changed.
