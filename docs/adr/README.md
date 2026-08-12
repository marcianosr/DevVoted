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
| [008](008-reward-shop-multibuy-coverage-gated-slots.md) | Reward shop: multi-buy, coverage-gated slots | Accepted — supersedes 006 Decision 7 |
| [009](009-session-run-cadence-daily-seeded-shared-run.md) | Session-run cadence: daily-seeded shared run | Accepted — Decision 1 superseded by 011 |
| [010](010-ui-layer-separation.md) | Two-tier UI separation (presentational vs composition) | Accepted — extracted from CLAUDE.md |
| [011](011-persistent-runs-daily-segments.md) | Persistent runs with daily shared segments | Accepted — supersedes 009 Decision 1 |
| [012](012-migration-strategy.md) | One migration pipeline: guarded SQL in supabase/migrations | Accepted — retires drizzle generate/migrate |
| [013](013-gate-scaled-coverage.md) | Gate-scaled coverage (gain and loss) | Accepted — amends 006 Decision 11 |
| [014](014-daily-gate-lock.md) | Daily gate lock: 5 polls/day, exhaustion is not a terminal | Accepted — amends 011 Decision 2, removes the exhaustion-win; §3's death rule superseded by 021 |
| [015](015-storage-cap-policy-grant-and-cap-extender-configs.md) | Storage-cap policy: one-shot grants and a soft over-cap | Accepted — amends 006 Decision 10 cap; records no-selling; Decision 3 (cap-extender as config) superseded 2026-08-06, DVTD-0h4n |
| [016](016-the-config-rule.md) | The Config Rule: every config is Effect + Check | Accepted — amends 006 Decisions 3/4/5; §1–2 amended by 017 |
| [017](017-no-baseline-check.md) | No baseline check: checks come only from configs; payout scales with correctness | Accepted — amends 016 §1–2; §3 amended by 027 |
| [018](018-gate-slot-coupling-and-slot-swatches.md) | Gate–slot coupling: gate N requires slot N; summit at gate 12; slot swatches | **Superseded by 019** (2026-08-06, one day later) |
| [019](019-depth-and-width-are-independent.md) | Depth and width are independent; swatches are gate badges; summit at gate 12 of 13 | Accepted — supersedes 018; "width never gates the climb" qualified by 027 |
| [020](020-gate-theme-replaces-category-colors.md) | The gate themes the run; categories carry no color | Accepted — retires the per-category palette (wiki §2.4, DVTD-sthm) |
| [021](021-death-at-the-gate-that-empties-the-build.md) | A run dies at the gate that empties its build | Accepted — supersedes the death rule of 006 Decision 6 and 014 §3 (DVTD-1ys6); §3 generalized by 027 |
| 022 | *(reserved: the checklist-is-the-rulebook / declined-lint-pledge rule the code already cites)* | Unwritten — `run.model.ts`/`effect.model.ts` reference it |
| [023](023-storage-capacity-is-a-subscription.md) | Storage capacity is a subscription — the plan ladder | Accepted — supersedes the cap-extension voucher (015 Decision 3 via DVTD-0h4n); DVTD-rf5c |
| 024 | *(reserved: shop-router — one shop per gate, locks the other until the next rung)* | Unwritten — not implemented on the live route |
| [025](025-automatic-width-claiming.md) | Width claims itself automatically — no more Unlock slot button | Accepted — amends 008 Decision 2 |
| [026](026-staged-onboarding-starter-stacks.md) | Staged onboarding: starter stacks, plain-language receipt, payoff-first gate clear | Accepted — account-level unlock flags are follow-up work |
| [027](027-gate-width-demand.md) | A gate only admits a build that can survive its own stake (width demand) | Accepted — amends 017 §3 and 021 §3, qualifies 019 (DVTD-kokk); Decision 2's kill-at-door amended by 031 |
| [028](028-the-defeat-device.md) | Volkswagen CI: a legendary that reports one failing check as passing | Accepted — the one waiver of the 022 rule the code cites; retires wiki §4.1's "legendary carries no check" (DVTD-dbuw) |
| [029](029-shop-controls-three-horizons.md) | Shop controls on three horizons: Rebuild (visit), Lock (next shop), Extend (run) | Accepted — extends 008's shop; rejects account-level rerolls (DVTD-5lt6) |
| [030](030-gate-staged-storage-plans.md) | The storage-plan ladder is gate-staged, and climbs to 3MB | Accepted — amends 023 Decision 1 (ladder shape only); wiki §2.10 collects every gate-staged unlock |
| [031](031-shop-exit-blocks-under-width-builds.md) | The shop exit blocks an under-width build; death is an explicit dead-end click | Accepted — amends 027 Decision 2, reverses its rejected exit-blocking option (DVTD-jnlj) |
| [033](033-demand-is-what-you-bought.md) | The correct-answer demand is what you bought | Accepted — reverses ADR-017's escalation term; depth no longer raises the Unit Tests check |
| [032](032-prep-is-the-post-shop-hub.md) | Prep is the post-shop hub — the gate starts from prep, the shop stays open until it does | Accepted — moves finish-reward to prep's start button; community stays the mid-gate wait (DVTD-f7hs) |

## Conventions

- Title: `# ADR-NNN: Title`, then a `## Status` section stating acceptance date
  and any supersession, then `## Context` / `## Decision` / `## Consequences`.
- Decisions are immutable history. A later ADR changes them **by reference**
  (like ADR-008's Amendments section); the superseded spot gets an inline
  `> ⚠ Amended/Superseded by ADR-NNN` marker so no reader acts on stale text.
- Live-tuned numbers (thresholds, caps, costs) point to their source-of-truth
  code file instead of being duplicated in the ADR.
