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
| [006](006-session-run-mechanics.md) | Session-run mechanics | Accepted — amended by 008, 013, 035, 074 |
| [007](007-run-rebuild-conventions.md) | Run rebuild: design system and scope | Accepted |
| [008](008-reward-shop-multibuy-coverage-gated-slots.md) | The reward screen is a multi-buy shop | Accepted — amended by 046, 074 |
| [009](009-session-run-cadence-daily-seeded-shared-run.md) | Cadence: a daily-seeded, shared run | Accepted — amended by 011, 014 |
| [010](010-ui-layer-separation.md) | Two-tier UI separation | Accepted |
| [011](011-persistent-runs-daily-segments.md) | Persistent runs with daily shared segments | Accepted — amended by 014 |
| [012](012-migration-strategy.md) | One migration pipeline: guarded SQL | Accepted |
| [013](013-gate-scaled-coverage.md) | Gate-scaled coverage, gain and loss | Accepted — amended by 035; **the gain no longer scales** (073) |
| [014](014-daily-gate-lock.md) | Daily gate lock: the day hands one gate's polls | Accepted — amended by 076 (a retry costs a day) |
| [015](015-storage-cap-policy-grant-and-cap-extender-configs.md) | Storage-cap policy: grants clip at the cap | Accepted — **nothing live**; 074 removed the cap |
| [019](019-depth-and-width-are-independent.md) | Swatches are gate badges | Accepted — amended by 046, 074 |
| [020](020-gate-theme-replaces-category-colors.md) | The gate themes the run; categories carry no colour | Accepted |
| [026](026-staged-onboarding-starter-stacks.md) | Staged onboarding: the payoff-first gate clear | Accepted — amended by 052 |
| [028](028-the-defeat-device.md) | Volkswagen CI, the defeat device | Accepted — amended by 035 |
| [029](029-shop-controls-three-horizons.md) | Shop controls on three horizons | Accepted — amended by 054 |
| [032](032-prep-is-the-post-shop-hub.md) | Prep is the post-shop hub | Accepted — whole again under 078 (the shop link is back) |
| [035](035-gates-are-auditors.md) | **Gates are auditors** — the friction moved to the gate | Accepted — amended by 037, 038, 056 |
| [036](036-the-git-tag.md) | The git tag: a cross-run checkpoint | Accepted |
| [037](037-a-missed-gate-peels-a-config.md) | A missed gate peels a config | Accepted — 076 owns what a miss does; the peel has two triggers (076, 074) |
| [038](038-the-audit-roster.md) | The audit roster, staged by count | Accepted — amended by 056 |
| [039](039-every-upgrade-costs-storage.md) | Every upgrade costs storage | Accepted — amended by 053 |
| [040](040-config-status-online-skipped-offline.md) | A config is online, skipped or offline | Accepted |
| [042](042-design-pillars-and-anti-pillars.md) | **Design pillars and anti-pillars** — the tiebreaker lens | Accepted |
| [044](044-capacity-is-spots-money-is-kb.md) | Capacity is spots (now slots), money is KB | Accepted — amended by 046, 047, 074 |
| [046](046-slots-are-bought-storage-is-capped-again.md) | Slots are bought, storage is capped | **Superseded by 074** — kept while its code runs |
| [047](047-a-configs-size-is-a-number.md) | A config's size is a number | Accepted — amended by 055 |
| [048](048-the-pipeline-is-your-build.md) | The pipeline is Your Build: four nouns, one job each | Accepted |
| [049](049-the-archive-opens-a-run-wider.md) | The archive opens a run wider | **Superseded by 074** — kept while its code runs |
| [050](050-config-exposure-is-reveal-grant-stage.md) | Config exposure is Reveal / Grant / Stage | Accepted — amended by 051, 062, 064 |
| [051](051-configs-unlock-on-individual-objectives.md) | Configs unlock on individual objectives | Accepted — amended by 064 |
| [052](052-the-run-opens-on-a-dealt-hand.md) | The run opens on a dealt hand | Accepted — amended by 057, 062 |
| [053](053-upgrades-appear-on-the-shelf-and-arms-switch-mid-poll.md) | Upgrades on the shelf; arms switch mid-poll | Accepted |
| [054](054-offer-locks-ship-with-yarnlock.md) | Offer locks ship with yarn.lock | Accepted |
| [055](055-config-hue-is-keyed-to-slot-size.md) | Config hue is keyed to slot size | Accepted — amended by 060 |
| [056](056-audits-are-drawn-not-scheduled.md) | Audits are drawn from pools, not scheduled | Accepted |
| [057](057-gate-0-is-the-calibration-gate.md) | Gate 0 is the calibration gate | Accepted |
| [058](058-451-redacts-the-answers-and-sells-them-back.md) | 451 redacts the answers and sells them back | Accepted |
| [059](059-text-owns-the-weight-axis.md) | Text owns the weight axis | Accepted |
| [060](060-the-slot-mark-is-a-figure.md) | The slot mark is a figure; version is a dot track | Accepted |
| [061](061-coverage-reads-as-a-gauge-beside-the-answers.md) | Coverage reads as a gauge beside the answers | Accepted |
| [062](062-the-starting-hand-is-dealt-under-guarantees.md) | The starting hand is dealt under guarantees | Accepted — amended by 064 |
| [063](063-a-config-can-be-paid-for-a-prediction.md) | A config can be paid for a prediction | Accepted |
| [064](064-a-grant-is-recorded-with-its-provenance.md) | A grant is recorded with its provenance | Accepted |
| [065](065-standouts-are-six-climb-shaped-awards.md) | Standouts are six climb-shaped awards | Accepted — reversed by 067 |
| [066](066-every-figure-wears-a-badge.md) | Every figure wears a badge | Accepted |
| [067](067-standouts-are-four-plain-standings.md) | Standouts are four plain standings | Accepted — reverses 065; model not yet rewritten |
| [068](068-coverage-reads-as-a-ring.md) | Coverage reads as a ring | Accepted — replaces 061's placement for kanto; amended by 070 |
| [069](069-the-build-sits-in-a-folded-footer.md) | The build sits in a folded footer on the poll screen | Accepted |
| [070](070-coverage-reads-as-a-banded-bar.md) | Coverage reads as a banded bar | Accepted — amends 068; the poll screen takes the bar |
| [073](073-coverage-is-a-flat-gain-reset-every-gate.md) | **Coverage is a flat gain, reset every gate** | Accepted — supersedes 013's decision 1; half built |
| [074](074-weight-is-what-the-build-costs-to-run.md) | **Weight is what the build costs to run** | Accepted — supersedes 046 and 049; **not built** |
| [075](075-a-full-bar-pays-a-bonus.md) | A gate closed at full coverage pays a bonus | Accepted — amended by 076 (the swatch is marked) |
| [076](076-the-closing-band-decides-what-it-costs.md) | **The band a gate closes in decides what it costs** | Accepted — supersedes 071; drawn in the kanto kit, not routed |
| [077](077-the-pin-rides-the-fill-it-names.md) | The pin rides the fill it names | Accepted — amends 070; the coverage bar states what it moved to |
| [078](078-prep-reads-in-two-columns.md) | **Prep and New run read in two columns, and the band table drops its prose** | Accepted — supersedes 072; restores 032's shop link |

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
| 023 | Storage capacity is a subscription | Retired — 046 owns it |
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
