# Architecture Decision Records

| # | Title | Status |
|---|---|---|
| [001](001-database-indexing-strategy.md) | Database indexing strategy | Accepted |
| [002](002-domain-architecture.md) | Domain architecture | Accepted — living document, owns module structure/naming. **Rewritten 2026-08-12** to context/aggregate/four-layer DDD; has the "where does my file go?" decision tree |
| 003 | Domain restructure | Retired — removed during the run rebuild; ADR-002 owns structure now |
| 004 | UI styling conventions | Retired — removed during the run rebuild; ADR-007 owns the design system now |
| [005](005-session-runs.md) | Session runs and the two-loop model | Accepted — cadence questions resolved by 009 |
| [006](006-session-run-mechanics.md) | Session-run mechanics | Accepted — Decisions 1/7/10 amended by 008; Decision 11 amended by 013; Decision 10 cap amended by 015; Decisions 3/4/5 amended by 016; Decision 6's death rule superseded by 021 |
| [007](007-run-rebuild-conventions.md) | Run rebuild: design system and scope | Accepted |
| [008](008-reward-shop-multibuy-coverage-gated-slots.md) | Reward shop: multi-buy, coverage-gated slots | Accepted — supersedes 006 Decision 7; Decision 2's slot ladder superseded by 034 |
| [009](009-session-run-cadence-daily-seeded-shared-run.md) | Session-run cadence: daily-seeded shared run | Accepted — Decision 1 superseded by 011 |
| [010](010-ui-layer-separation.md) | Two-tier UI separation (presentational vs composition) | Accepted — extracted from CLAUDE.md |
| [011](011-persistent-runs-daily-segments.md) | Persistent runs with daily shared segments | Accepted — supersedes 009 Decision 1 |
| [012](012-migration-strategy.md) | One migration pipeline: guarded SQL in supabase/migrations | Accepted — retires drizzle generate/migrate |
| [013](013-gate-scaled-coverage.md) | Gate-scaled coverage (gain and loss) | Accepted — amends 006 Decision 11; Decision 2's loss ratio amended by 034 |
| [014](014-daily-gate-lock.md) | Daily gate lock: 5 polls/day, exhaustion is not a terminal | Accepted — amends 011 Decision 2, removes the exhaustion-win; §3's death rule superseded by 021 |
| [015](015-storage-cap-policy-grant-and-cap-extender-configs.md) | Storage-cap policy: one-shot grants and a soft over-cap | Accepted — amends 006 Decision 10 cap; records no-selling; Decision 3 (cap-extender as config) superseded 2026-08-06, DVTD-0h4n |
| [016](016-the-config-rule.md) | The Config Rule: every config is Effect + Check | Superseded by 035 — configs are pure enhancements |
| [017](017-no-baseline-check.md) | No baseline check: checks come only from configs; payout scales with correctness | Superseded by 035 (checks are gone); Decision 3's bare-pipeline guard survives |
| [018](018-gate-slot-coupling-and-slot-swatches.md) | Gate–slot coupling: gate N requires slot N; summit at gate 12; slot swatches | **Superseded by 019** (2026-08-06, one day later) |
| [019](019-depth-and-width-are-independent.md) | Depth and width are independent; swatches are gate badges; summit at gate 12 of 13 | Accepted — supersedes 018; "width never gates the climb" qualified by 027; Decision 2 reversed by 034 (gates grant slots) |
| [020](020-gate-theme-replaces-category-colors.md) | The gate themes the run; categories carry no color | Accepted — retires the per-category palette (wiki §2.4, DVTD-sthm) |
| [021](021-death-at-the-gate-that-empties-the-build.md) | A run dies at the gate that empties its build | Superseded by 035 — death narrowed to strip audits (and the bare-legacy guard) |
| [022](022-every-config-owes-the-gate-a-check.md) | Every config owes the gate a check; the checklist is the whole rulebook | Superseded by 035 — no config owes anything; the friction moved onto the gate |
| [023](023-storage-capacity-is-a-subscription.md) | Storage capacity is a subscription — the plan ladder | Accepted — supersedes the cap-extension voucher (015 Decision 3 via DVTD-0h4n); DVTD-rf5c |
| 024 | *(reserved: shop-router — one shop per gate, locks the other until the next rung)* | Unwritten — not implemented on the live route |
| [025](025-automatic-width-claiming.md) | Width claims itself automatically — no more Unlock slot button | Accepted — amends 008 Decision 2; the ladder it claims from replaced by 034 (gate clears) |
| [026](026-staged-onboarding-starter-stacks.md) | Staged onboarding: starter stacks, plain-language receipt, payoff-first gate clear | Accepted — account-level unlock flags are follow-up work |
| [027](027-gate-width-demand.md) | A gate only admits a build that can survive its own stake (width demand) | Superseded by 035 — the width demand is deleted; only the never-go-bare floor remains |
| [028](028-the-defeat-device.md) | Volkswagen CI: a legendary that reports one failing check as passing | Accepted — amended by 035: the device now reports the gate's first audit as passing |
| [029](029-shop-controls-three-horizons.md) | Shop controls on three horizons: Rebuild (visit), Lock (next shop), Extend (run) | Accepted — extends 008's shop; rejects account-level rerolls (DVTD-5lt6) |
| [030](030-gate-staged-storage-plans.md) | The storage-plan ladder is gate-staged, and climbs to 3MB | Accepted — amends 023 Decision 1 (ladder shape only); wiki §2.10 collects every gate-staged unlock |
| [031](031-shop-exit-blocks-under-width-builds.md) | The shop exit blocks an under-width build; death is an explicit dead-end click | Superseded by 035 — the exit is always open |
| [033](033-demand-is-what-you-bought.md) | The correct-answer demand is what you bought | Superseded by 035 — the demand is deleted with every other check |
| [032](032-prep-is-the-post-shop-hub.md) | Prep is the post-shop hub — the gate starts from prep, the shop stays open until it does | Accepted — moves finish-reward to prep's start button; community stays the mid-gate wait (DVTD-f7hs) |
| [034](034-the-gate-is-a-ci-run.md) | The gate is a CI run: passing demands a coverage total | Accepted — reverses 019 Decision 2, supersedes 008's slot ladder, amends 013's loss ratio and 027 Decision 2; records die-by-score as rejected (DVTD-wlte); Decisions 1/3/6 reversed by 035 |
| [035](035-gates-are-auditors.md) | Gates are auditors: checks off configs, fresh coverage per gate, free redo | Accepted — supersedes 016/017/022/033 (Effect+Check), 021 (death), 027/031 (width demand/exit); reverses 034 Decisions 1/3/6; amends 006 §4, 013, 028; Decision 3 superseded and Decision 4's strip ownership narrowed by 037 (DVTD-zjeq, DVTD-gre4) |
| [036](036-the-git-tag.md) | The git tag: a shop-bought cross-run checkpoint, burn on use | Accepted — depends on 035's death model; amends the run-end storage-credit rule (DVTD-taxo) |
| [037](037-a-missed-gate-peels-a-config.md) | A missed gate peels a config and re-runs the loop | Accepted — supersedes 035 Decision 3 (free redo), narrows 035 Decision 4 (strips are every gate's now); amends 021's death rule (DVTD-rxsk, DVTD-rdr5) |
| [038](038-the-audit-roster.md) | The audit roster: nine rules, staged by count | Accepted — fills out 035 Decision 4 (every gate from 3 carries one, three by the summit); replaces 035's score-inverting Mirror with a poll-inverting one (DVTD-60he, DVTD-lhao) |
| [039](039-every-upgrade-costs-storage.md) | Every upgrade costs storage, Focus included | Accepted — amends 006's upgrade economy; retires the free coverage-gated Focus upgrade and the no-price-on-the-button convention (DVTD-yx92) |
| [040](040-config-status-online-skipped-offline.md) | A config is online, skipped or offline — never passing or failing | Accepted — cleans up presentation left behind by 035 Decision 1; reads 038's offline state (DVTD-8pgn) |

## Conventions

- Title: `# ADR-NNN: Title`, then a `## Status` section stating acceptance date
  and any supersession, then `## Context` / `## Decision` / `## Consequences`.
- Decisions are immutable history. A later ADR changes them **by reference**
  (like ADR-008's Amendments section); the superseded spot gets an inline
  `> ⚠ Amended/Superseded by ADR-NNN` marker so no reader acts on stale text.
- Live-tuned numbers (thresholds, caps, costs) point to their source-of-truth
  code file instead of being duplicated in the ADR.
