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
| [036](036-the-git-tag.md) | The git tag: a cross-run checkpoint | Accepted — D1 amended by 115 and 153: the tag is carried in at new run, then placed for run KB |
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
| [055](055-config-hue-is-keyed-to-slot-size.md) | Config hue is keyed to slot size | Accepted — amended by 060; D1's "no replacement grouping axis" amended by 127 |
| [056](056-audits-are-drawn-not-scheduled.md) | Audits are drawn from pools, not scheduled | Accepted — D1 and D4 superseded by 099; **D2, the date-seeded draw, is reinstated by 138**; the family rule, rank order and canonical ids stand |
| [057](057-gate-0-is-the-calibration-gate.md) | Gate 0 is the calibration gate | Accepted — amended by 094 (Pallet asks 3 of 5) |
| [058](058-451-redacts-the-answers-and-sells-them-back.md) | 451 redacts the answers and sells them back | Accepted |
| [059](059-text-owns-the-weight-axis.md) | Text owns the weight axis | Accepted |
| [060](060-the-slot-mark-is-a-figure.md) | The slot mark is a figure; version is a dot track | Accepted |
| [061](061-coverage-reads-as-a-gauge-beside-the-answers.md) | Coverage reads as a gauge beside the answers | Accepted |
| [062](062-the-starting-hand-is-dealt-under-guarantees.md) | The starting hand is dealt under guarantees | Accepted — amended by 064 |
| [064](064-a-grant-is-recorded-with-its-provenance.md) | A grant is recorded with its provenance | Accepted |
| [066](066-every-figure-wears-a-badge.md) | Every figure wears a badge | Accepted — amended by 148: a count the screen states badges too |
| [068](068-coverage-reads-as-a-ring.md) | Coverage reads as a ring | Accepted — replaces 061's placement for kanto; amended by 070 |
| [069](069-the-build-sits-in-a-folded-footer.md) | The build sits in a folded footer on the poll screen | Accepted — extended by 114 (the send stacks on the pinned sheet) |
| [070](070-coverage-reads-as-a-banded-bar.md) | Coverage reads as a banded bar | Accepted — amends 068; the poll screen takes the bar; amended by 113 (placement) and 149 (prep's ladder caps PERFECT) |
| [073](073-coverage-is-a-flat-gain-reset-every-gate.md) | **Coverage is a flat gain over every slot the run has opened** | Accepted — supersedes 013's decision 1; amended by 081 and 094 (D2); half built |
| [074](074-weight-is-what-the-build-costs-to-run.md) | **Weight is what the build costs to run** | Accepted — built by 082, which amends decisions 2, 3 and 4 |
| [075](075-a-full-bar-pays-a-bonus.md) | A gate closed at full coverage pays a bonus | Accepted — amended by 076 (the swatch is marked); context figures superseded by 094 |
| [076](076-the-closing-band-decides-what-it-costs.md) | **The band a gate closes in decides what it costs** | Accepted — supersedes 071; routed by `gateRulingFor`; amended by 094 (a hold names its reason) |
| [077](077-the-pin-rides-the-fill-it-names.md) | The pin rides the fill it names | Accepted — amends 070; the coverage bar states what it moved to |
| [078](078-prep-reads-in-two-columns.md) | **Prep and New run read in two columns, and the band table drops its prose** | Accepted — supersedes 072; restores 032's shop link; D2 and D5 superseded by 149, D10 by 139 |
| [079](079-a-partial-answer-pays-a-quarter-at-a-time.md) | **A partial answer pays a quarter at a time** | Accepted — amends 006 §11; the ladder 081 doubles |
| [080](080-the-swatch-is-won-by-the-window.md) | **The swatch is won by the window, not by the clear** | Accepted — reverses 019's award rule; D1–D2 superseded by 170 |
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
| [099](099-audits-are-fired-by-rivals.md) | Audits are fired by rivals, and the gate's count is its capacity | Accepted — **D1 and D3 superseded by 138** (the gate draws again, and an incident is bought rather than earned); D2, D4 and D5 stand as amended by 138; amended by 105 |
| [100](100-a-category-has-a-living-record.md) | **A category has a living record** | Accepted — uses ADR-093's `PollView` seam; D2 and D4 collapsed by 103, the rest stands |
| [101](101-builds-are-open.md) | **Builds are open** | Accepted — restates 099 §4 as a rule; configs, versions, weight and the vendor lock are public, the run's answers are not; display only |
| [102](102-copy-has-one-owner.md) | **Copy has one owner** — run state picks it or the view states it | Accepted — generalises 040 D2; `COPY` object per `.ui.tsx`, shared words in `shared/lib/copy.ts`, register is not drift |
| [103](103-the-board-seats-twelve-category-leaders.md) | **The community board seats twelve category leaders** | Accepted — retires 065 and 067; collapses 100 D2 and D4; categories stay colourless (020 D1) |
| [104](104-visits-are-counted-without-a-banner.md) | **Visits are counted without a banner** — a date-keyed hash, no device storage | Accepted |
| [105](105-you-fire-only-from-a-gate-that-can-be-fired-at.md) | You may only fire from a gate that can be fired at | Accepted — D2 amended by 138: prep keeps only the inbound panel |
| [107](107-a-bean-states-what-and-why-first.md) | **A bean states what and why first** | Accepted; what/why, then `Done when`, then everything else under Notes |
| [108](108-the-dex-reads-configs-as-chip-rows.md) | The Dex reads configs as chip rows | Accepted — amends 097 D4; D1, D2, D3 and D5 superseded by 120, the weight grouping by 151; D4 (the pennant names the ceiling) stands; the met state is a Story until DVTD-s5vo |
| [109](109-a-title-is-earned-and-worn-one-at-a-time.md) | **A title is earned, permanent, and worn one at a time** | Accepted; frees `title` from the account role, which keeps the handle line |
| [111](111-a-granted-title-is-dealt-and-announced-once.md) | **A granted title is dealt by a migration and announced once** | Accepted; completes 109, which left a granted title unawardable. Corrects 109 D4: the run-over screen never announced anything. D5 amended: the modal announces granted titles only |
| [112](112-the-archive-carries-and-buys-appearance.md) | **The archive carries, and it buys appearance and licences** | Accepted; names a carve-out to 051's no-backfill line; D1 amended by 115 (the archive buys run services, not licences) and 153 (the warm boot); D4 restated by 153 (nothing past the start action) |
| [113](113-the-poll-screen-stands-coverage-beside-the-question.md) | The poll screen stands coverage beside the question | Accepted — amends 068 and 070 on placement only; the poll leads, the bar rails beside it, the phone pin is gone |
| [114](114-the-send-is-the-poll-panels-own-pinned-row.md) | The send is the poll panel's own pinned row | Accepted — extends 069 D1: both bottom bars pin as a stack; D2 and D3 reversed by 117, the send now holds the floor and the sheet is seated on it |
| [115](115-services-have-two-scopes.md) | **Services have two scopes**, the registry's paid by the run and the run's paid by the archive | Accepted — replaces 110; amends 112 D1 and 036 D1; overrules 029's rerolls rejection for run services; D1's availability amended by 116; D1, D3 and D10 amended by 153 (one shape, carried at new run then pressed); D11 abandoning is a service |
| [116](116-a-service-is-unlocked-once-per-account.md) | A service is unlocked once, per account | Accepted — amends 115 D1; a locked service is named with the line that earns it (D3 amended); reverses the Reveal-only stance of DVTD-2try and DVTD-8zb3 |
| [117](117-the-primary-press-is-one-wide-bar.md) | **The primary press is one wide bar** that wears its gate | Accepted — reverses 114 D2 and D3 on which bar holds the floor; one CTA per screen, the reading inside the press, `noteAt` and the poll's count heading gone |
| [118](118-a-config-may-require-the-input-it-reads.md) | **A config may require the input it reads** — prep holds the gate for it | Accepted — amends 035, 085 |
| [119](119-a-config-card-flows-by-the-room-it-has.md) | **A config card flows by the room it has**, and never below its own name | Accepted — supersedes DVTD-8byc's wrap-at-own-width; a card with no fold states itself, badges ride whichever half is showing, panels fold all at once |
| [120](120-the-dex-draws-the-one-config-card.md) | **The Dex draws the one config card** | Accepted — replaces 108 D1, D2, D3, D5; D1, D5 and D6 replaced by 151; the weight and the unlock paths are not the secret, the name and the effect are; an empty footer is not drawn |
| [121](121-a-config-can-pay-the-faucet-on-a-ramp.md) | **A config can pay the faucet on a ramp**, if it states its next rung | Accepted — ships `&&`; storage not coverage, the chain counts the run not the window, and `nextLinkKb` is the condition |
| [122](122-an-audit-may-dial-the-build-down.md) | **An audit may dial the build down**, not only switch it off | Accepted — ships 425 and 510; the whole build for one poll, every version flattened for an attempt, both in the offline-config family |
| [123](123-the-meter-can-go-dark-the-panel-cannot.md) | **The coverage meter can go dark, the panel cannot** | Accepted — ships 500; amends 106's rejection of a gate-wide hide, keeps 113's rail, and takes every restatement of the figure with it |
| [122](122-a-config-can-discount-the-build-space-bill.md) | **A config can discount the build space bill**, by less than a rung is worth | Accepted — ships YAGNI; amends 087's "a per-config term cannot reach the bill"; 8 KB is the largest step that keeps a rung crossing a loss; extends 098 D2 to arm on the bill |
| [123](123-a-card-states-a-figure-only-where-it-is-paid.md) | **A card states a figure only where it is paid**, and prose only in its body | Accepted — the new run build promises no refund it cannot give; `detail` is a short mark, never a sentence, so the Dex states provenance in the note |
| [124](124-the-balance-names-every-change-one-at-a-time.md) | **The balance names every change, one at a time** | Accepted, extends 077 to the balance; a burst queues instead of overwriting, the figure steps through each reading, and the queue belongs to the readout |
| [125](125-a-player-has-one-page-and-one-card.md) | **A player has one page and one card** | Accepted — the Dex merges into `/profile/$userId`; amends 109 D1 (several worn titles, ordered) and D6 (the three surfaces link to the page); D4 narrowed by 129, but a visitor still never gets a tab |
| [126](126-storage-settles-what-the-drops-cannot.md) | **Storage settles what the drops cannot** on a held gate | Accepted — reverses DVTD-ow1y's drop-only peel and its rejection of a checkbox; the settlement leads the screen, the debrief collapses under it, and 117's two-aside row narrows to three |
| [127](127-a-config-may-ask-for-an-input-it-can-decline.md) | **A config may ask for an input it can decline** | Accepted — bounds 118: an input is required only when declining it is dominated, which LGTM's is not; the approval threshold is stated but never counted, and LGTM resolves in its own service rather than a reducer action |
| [127](127-the-registry-groups-the-hand-by-what-it-gives.md) | The registry groups the hand by what it gives | Accepted — amends 055 D1; the advised opening is deleted |
| [128](128-the-hub-leads-with-its-press.md) | **The hub leads with its press** | Accepted — extends 117 D1 with a third renderer; the hub drops `ScreenFooter`, its two rows become one card, and the shop stands refused rather than absent |
| [129](129-a-visitor-reads-the-record-not-the-collection.md) | **A visitor reads the record, not the collection** | Accepted, D1 and D5 superseded by 180 — narrows 125 D4 to the poll collection; a visited page carries the record, the open run's standing and build under 101 §2, and counts only; depth and swatches are stated once each |
| [130](130-the-bar-carries-what-every-screen-needs.md) | **The bar carries what every screen needs** | Accepted — the bar is a switcher, not a readout: the clock goes back to 128 D2's press alone, the three destinations share one shape with only the one you stand on filled, the badge is a bare count that says nothing at nought, the mark stands outside the bar, and the bar pins pewter. **D9 reversed by 133:** the bar wears the screen's theme, pewter only where no screen is mounted |
| [131](131-a-record-belongs-to-one-run.md) | **A category record belongs to one run, and there are two of them** | Accepted — supersedes 100 D1 and 103 D1: a record is the best a single run reached, on two boards of twelve (streak and correct); a gate close does not break it, each board has its own floor, and the poll screen still states the streak alone |
| [132](132-the-screens-you-spend-on-pin-their-header.md) | **The screens you spend on pin their header** | Accepted — extends 130, narrows 113 D4 to the poll screen. **Amended:** every run screen but the hub (shop, new run, prep, poll, gate result, review, run over) pins from `md`, and pins one row — mark, name, readout and an inline balance — while the track scrolls; D3's `--nav-seat` never shipped, the header hangs from `md:top-0` |
| [133](133-the-chrome-wears-the-screen-under-it.md) | **The chrome wears the screen under it** | Accepted — reverses 130 D9 and builds 020 D2's unshipped page theme: `Screen` publishes its theme through React state on the root, which renders it on `<body>`, so the bar and footer follow the gate; one attribute at a time, pewter where no screen is mounted, and the bar paints on theme grounds rather than the zinc roles |
| [134](134-a-category-title-is-named-not-derived.md) | **A category title is named, not derived** | Accepted — extends 109: each category carries two written titles, one for answering polls in it and one for getting them right (thresholds replaced by 145), replacing twelve generated `X Maintainer` names; a second roster of twenty-nine names how you play, six of them unflattering, off metrics the engine already counted; the rank ladder is derived (replaced by 140); the mastery ids are frozen because an orphan in `equipped_title_ids` blocks equip and unequip alike, and 103 D3 stands — the comparative reading stays with the seat |
| [135](135-a-fallen-run-is-looted-once.md) | **A fallen run is looted once, by a run that is still climbing** | Accepted — narrows 101 D3: the take is the unbanked remainder the archive credit leaves behind, only a live run may loot and it loots into its own balance, first claim wins with no cap on the taker, the claim rides the run's own transaction, and `loot` is minted by the server rather than accepted off the wire |
| [136](136-the-stakes-column-leads-with-the-reward.md) | **The prep stakes column leads with the reward** | Accepted — supersedes 080 D4 and 078 D3: the panel is titled *At stake*, each objective states its demand and then what it earns, the clear names the next gate and quotes its own table row, the swatch is asked for as a flawless window rather than PERFECT coverage, met/lost marks are deleted, the band row the run stands in is edged from the bar's own numbers (D5 superseded by 149: the ladder rings the zone), and audits leave the column |
| [137](137-the-question-is-the-one-source-of-code.md) | **The question is the one source of code** | Accepted — backticks and fenced blocks typed into a question render as code on the poll screen and in the form preview, split on backticks alone rather than parsed as markdown; the `code_block` column stays as a read-only legacy value the form never sends; the form previews through the run's own `Question` |
| [138](138-the-gate-draws-its-audits-and-a-rival-buys-one.md) | **The gate draws its audits, and a rival buys one to replace them** | Accepted — supersedes 099 D1 and D3 and reinstates 056 D2: gates draw their capacity date-seeded, an incident bought at the shop's Incident desk replaces one draw instead of adding to it, a target must be able to draw the audit you carry, you buy in the shop and file from the climber card |
| [139](139-prep-prices-a-poll-and-draws-the-codebase.md) | **Prep prices a poll and draws the codebase** | Accepted — D1 stands: the slots a run has opened are the codebase; D2–D5 (the pay panel, the bar in it, the pricing rows, the strictness fold) superseded by 149 |
| [140](140-the-shelf-holds-the-rank-ladder.md) | **The shelf holds the rank ladder** | Accepted — replaces 134 D6: each rank rung is a threshold title on polls answered, its name hidden until earned; the shelf splits into poll count, category and other, derived from the metric; twenty-five titles and the race and every-category kinds are retired, with a migration that clears worn ids before deleting rows |
| [141](141-a-face-shows-the-player-and-leads-to-them.md) | **A face shows the player and leads to them** | Accepted — replaces 125 D6, reverses DVTD-4nkm's no-popup call for hover only: hovering or focusing any face shows that player's card as a read-only tooltip rendered at the root, a click on the face or name goes to the in-game profile and never to GitHub, the climb map keeps press-to-open because Loot and File live there, and one fold draws the standing for the map, the hover and the profile page |
| [142](142-the-profile-shows-what-others-see.md) | **The profile shows what others see** | Accepted, amends 125: borders and titles share one appearance tab that leads with a preview of your card, byline and climber card; a border is tried on in the preview before it is bought |
| [143](143-the-shelf-reads-as-a-ladder-a-table-and-a-grid.md) | **The shelf reads as a ladder, a table and a grid** | Accepted, amends 140: three worn slots lead; poll count is a log-scaled ladder with its next threshold, category a table of answered and correct, special a card grid; "other" becomes "special" and hides unearned names but states conditions; all, earned and closest filters |
| [144](144-a-look-is-one-face-saved-in-one-press.md) | **A look is one face, saved in one press** | Accepted, amends 142 and 143: the appearance panel draws one face, owned borders and earned titles are a draft saved together by Save look; borders and titles get their own owner tabs, the shop tries a locked border on before the buy press, and the title shelf no longer wears titles |
| [145](145-a-category-title-counts-distinct-polls.md) | **A category title counts distinct polls** | Accepted, replaces 134 D2: the entry rung is 50 distinct polls answered in the category, the mastery rung 50 distinct polls answered correctly; derived from responses, not counters; a flat 50 leaves thin categories unearnable until the bank grows |
| [146](146-the-special-roster-names-moments-of-a-run.md) | **The special roster names moments of a run** | Accepted, replaces 134 D5: eleven one-shot special titles from Hello, World! to WONTFIX replace the eight counters; exactly OK, 10 units, a run's first poll; the reused Ship It and Stack Overflow ids are cleared by migration; five more titles wait on data beyond the run (DVTD-vdxt) |
| [147](147-the-hub-shows-the-run-so-far.md) | **The hub shows the run so far** | Accepted, amends 128: the hub is a strip (gate squares, run number, gate, balance), the press and shop, Run so far (grade and KB per closed gate plus the next gate), Build and a community strip; ready and waiting press states; closes are recorded in the run state |
| [148](148-every-number-wears-a-badge.md) | **Every number wears a badge** | Accepted, amends 066 D1 and D3: a count the screen states is badged like a figure; `Figures` is unchanged, the viewmodel badges a count through a `Lead` figure part; the hero readout and the build's slot counts stay bare |
| [149](149-prep-reads-the-stakes-as-a-ladder-and-seals-the-gates-ahead.md) | **Prep reads the stakes as a ladder and seals the gates ahead** | Accepted, supersedes 139 D2–D5, 078 D2 and D5, 136 D5, amends 070 D3 and 106 D3: At stake draws a band ladder with a minimum zone width and PERFECT as a cap, one standing line to the next band up, Scoring folds first on the right with unit ladders and a gate table sealed past the current gate, the five polls count their reveal |
| [150](150-the-player-card-wears-the-players-look.md) | **The player card wears the player's look** | Accepted, amends 141 D1 and D5: the head fades from the worn swatch (pallet by default) and only the head wears it; every worn title shows, the first in the swatch colour; one standing shape everywhere with a gate row, a pointer bar, `used / space` and badged tiles; close stays on the map card |
| [151](151-the-dex-reads-a-list-beside-a-panel.md) | **The Dex reads a list beside a panel** | Accepted, replaces 120 D1, D5, D6 and 108's weight grouping: every tab is a complete list beside a panel reading the picked entry; nothing is truncated; the grouping axis becomes an exclusive filter with an `all` chip; the panel is headed by the thing's own name and states how an entry you do not hold is earned; a row is a press and the run permalink moves to the panel |
| [152](152-every-price-previews-the-balance-it-leaves.md) | **Every price previews the balance it leaves** | Accepted, extends 124 D3 and closes 123's open consequence: the price press is the trigger rather than the card, a pointed price is a signed delta the header resolves (vermillion for a spend, viridian for a refund), and a build card quotes `sellRefundIn` — the refund the reducer pays — stating no refund at all where that is zero |
| [153](153-the-new-run-screen-is-the-warm-boot.md) | The new run screen is the warm boot | Accepted — amends 115 D1/D3/D10, 112 D1/D4, 036 |
| [154](154-the-debrief-states-what-you-earned-and-why-the-build-moved.md) | **The debrief states what you earned and why the build moved** | Accepted, amends 134 (titles granted at every gate close) and 080's badge: an Earned panel lists unlocks, titles and the swatch; the swatch header line and badge go; Build changes rows carry a reason (expiring, upgraded, removed); folds with news open |
| [155](155-the-shop-reads-one-panel-at-a-time-on-a-phone.md) | **The shop reads one panel at a time on a phone** | Accepted: from `md` the build, desk and services stand left of the registry; below `md` a scrolling tab strip opens on Registry and shows one panel; a collapsed config card peeks its description; the balance rides the phone footer; services count ready and fold locked |
| [156](156-the-poll-screen-reads-coverage-in-percent.md) | The poll screen reads coverage in percent | Accepted — supersedes 106; the bar speaks percent on every screen, the lead line keeps the units |
| [157](157-a-gate-asks-the-window-for-a-minimum.md) | A gate asks the window for a minimum, then asks the bands | **Superseded by 161 §6** — the minimum is removed; it superseded 076's `FLOOR_CORRECT`, and `floorAt` stays the only floor |
| [158](158-four-configs-earn-their-versions.md) | **Four configs earn their versions** | Accepted, amends 083 D5, 038 D5, 006 D8 and 085: Code Coverage's add scales by version; Prefetch v1 names the polls and v2 their shape; one Linter replaces ESLint and Stylelint with a ladder that carries at v1, resets at v2 and halves at v3; npm audit names an outage's target at prep |
| [159](159-the-champion-takes-no-thin-clear.md) | **The Champion takes no thin clear** | Accepted, amends 076 at one gate: only HEALTHY or PERFECT wins the run, an OK close at the Champion is held on the band; `clearsAt` owns the rule |
| [160](160-the-gate-close-is-recorded-once.md) | **The gate close is recorded once** | Accepted — amends 076 (the clamp is deleted), 094 §6 and 147; one band classifier in the domain and the bar takes its band |
| [161](161-accuracy-multiplies-the-gate.md) | **Accuracy multiplies the gate, and each gate asks its own demand** | Accepted — supersedes the cumulative meter of 094 (D1, D3) and 157; keeps 159; D1 amended 2026-10-01 (accuracy weighed by credit, mix hidden); §6 coverage alone decides, Pallet ships 5, engine balance guard; D1 superseded and rungs retuned by 181 |
| [162](162-prose-is-one-component-and-one-register.md) | **Prose is one component and one register** | Accepted — amends 066 D1: `Prose` wraps `Figures` in `Typography`, `Lead` renders its string parts through `Figures`, and every explanatory sentence reads muted at `leading-relaxed` |
| [163](163-a-service-states-its-own-lasts-and-price.md) | **A service states its own lasts and price** | Accepted — `RegistryControlSpec` carries `lasts` and `price` as data; the Dex viewmodel owns the words (ADR-102) |
| [164](164-poll-access-is-one-rule-in-the-domain.md) | **Poll access is one rule in the domain** | Accepted — `pollAccess.model` decides what a session sees and edits; services apply it, `canAdminister` travels inside the poll data, one `usePollAuthoring` hook saves |
| [165](165-a-run-screen-asks-the-route-map-where-it-goes.md) | **A run screen asks the route map where it goes** | Accepted — `runRoutes` owns every forward and back press, one dispatch carries the crowd pick, mutations read refusals through `useApiMutation` |
| [166](166-a-player-face-and-a-collection-count-have-one-owner.md) | **A player's face and a collection count each have one owner** | Accepted — `profileFaceOf` builds identity for the profile, the card and your own page; `standingOf` once; `tally.model` owns held of total; a poll is seen once dealt or answered, in a listed category |
| [167](167-build-space-is-one-module.md) | **Build space is one module** | Accepted — `buildSpace.model` answers room, cap, upkeep, settlement and fit; the draft action obeys the covered-space cap the shop screen already showed; the ladder rounds up only |
| [168](168-a-gate-close-is-previewed-by-the-rules-it-runs.md) | **A gate close is previewed by the rules it runs** | Accepted — `gateClose.model` holds the close; the stake's peel counts retries, credit mirrors first; Dry Run left the roster |
| [169](169-a-poll-can-be-skipped-and-speed-is-a-config.md) | **A poll can be skipped, and speed is a config** | Accepted, press withdrawn 2026-10-03 — a skip covers nothing and is left out of the multiplier; Vite pays ×1.5 within 15s and ×0.75 after; the +0.1 streak step is gone |
| [170](170-a-swatch-is-earned-by-covering-every-change.md) | **A swatch is earned by covering every change** | Accepted — supersedes 080 D1–D2 and 136's flawless-window ask: the swatch is the full bar (head start and configs count); At stake opens on the changes the gate ships with a box per change; D3–D4 superseded by 171 |
| [170](170-an-answer-lands-and-the-next-poll-follows.md) | **An answer lands, and the next poll follows** | Accepted — right pulses and flies its gain into a two-layer bar, wrong shakes, the poll advances after 650/900ms; the accuracy track replaces the payout row on the poll screen |
| [171](171-the-player-sees-coverage-never-the-codebase.md) | **The player sees coverage, never the codebase** | Accepted — supersedes 139's player-facing codebase count and 170 (swatch) D3–D4: coverage in %, gains in per-gate pts, no change counts or box per change anywhere |
| [172](172-all-coverage-bonuses-add-they-do-not-compound.md) | **All-coverage bonuses add, they do not compound** | Accepted — AGENTS.md, Intellisense, Deprecated and A/B arm A pool as 1 + Σ(N − 1); focus, opener, Regression Test and Vite still compound; ×3 build .47/.77 → .24/.57 |
| [173](173-hidden-until-it-matters-new-until-met.md) | **Hidden until it matters, new until met** | Accepted — prep draws no Audits panel before gate 3, the shop lists no locked service; "new" is first time for the account, derived from swatches and unlock timestamps, no seen flag; supersedes 155 D5; D4 redacts a locked service in the Dex (reverses 116 D3) |
| [174](174-the-worn-swatch-is-part-of-the-look.md) | **The worn swatch is part of the look** | Accepted — amends 144: `Look` carries `swatchId`, saved with border and titles in one press; the draft themes your own page; pallet stored as null |
| [175](175-a-single-answer-is-one-tap.md) | **A single answer is one tap** | Accepted — amends 170/117: single answers on the tap, multi keeps Lock in; poll number leads the meta row; keyboard tip `pointer-fine` only; answered row flashes its verdict |
| [176](176-who-cleared-what-reads-the-gate-outcome.md) | **Who cleared what reads the gate outcome** | Accepted — turnout panel: five outcome rows from the latest close (held = SHAKY, fell = DANGER), day records below; KB figures derived, no ledger |
| [177](177-the-catch-is-peeled-by-hand.md) | **The catch is peeled by hand** | Accepted — amends 096 D2: a caught close keeps Try/Catch in the build, it is the only drop until dropped, the bill floors at its weight; same arithmetic |
| [178](178-a-guest-plays-the-whole-day.md) | **A guest plays the whole day** | Accepted — anonymous session plays today's five daily, one run, no reroll; the account buys permanence and identity; no localStorage run |
| [179](179-the-peel-names-the-move-that-pays-it.md) | **The peel names the move that pays it** | Accepted — amends 126's screen: one press names the move, radio when storage or one config pays alone (storage first), the ADR-126 mix only as fallback, End the run in the same panel |
| [180](180-the-profile-is-a-trophy-page-the-owner-sees-too.md) | **The profile is a trophy page the owner sees too** | Accepted — supersedes 129 D1 and D5: a hero leads (face, three trophies, swatch track), then best run, climbing (only while open, no build) and seats (only when held); the owner sees the same showcase above the Dex |
| [181](181-accuracy-is-a-bonus-the-run-carries.md) | **Accuracy is a bonus the run carries** | Accepted — supersedes 161 D1 and retunes its §6 rungs: a bonus carried through the run (+0.08 × share − 0.04 × missed share per cleared gate, no cap), codebase follows a flawless carry (5 to 10), lines 40% toward 100 |
| [182](182-every-gate-is-named-after-its-kanto-city.md) | **Every gate is named after its Kanto city** | Accepted — gates and swatches carry one name, the city (Pewter, Cerulean, Vermilion, …, Indigo Elite); badges are flavour only; ids follow as `swatch-<place>` and `gate-<place>` |
| [183](183-the-nav-carries-the-run.md) | **The nav carries the run, the page carries its title** | Accepted — swatch track and KB balance move to the nav (screens publish theirs, previews included); headers are a headline title over one line of subtext; no lead swatch, no readout, nothing pinned |
| [184](184-a-summit-is-entered-in-the-hall-of-fame.md) | **A summit is entered in the Hall of Fame** | Accepted — only a win from Pallet counts; the community page holds the reigning champion's card and every win since; the Champion border is earned or bought for 10 TB; the Champion gate is prismatic in its accents |
| [185](185-an-approved-poll-pays-its-author-once.md) | **An approved poll pays its author once** | Accepted — the first publish banks the author 16 KB of archive, stamped on the poll so a republish pays nothing; not retroactive; the nav and Your suggested polls state it |

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
| 106 | The poll screen reads coverage in units | Retired — 156 put the bar back in percent |

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
