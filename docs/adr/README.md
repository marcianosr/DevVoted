# Architecture Decision Records

| # | Title | Status |
|---|---|---|
| [001](001-database-indexing-strategy.md) | Database indexing strategy | Accepted |
| [002](002-domain-architecture.md) | Domain architecture | Accepted — living document, owns module structure/naming |
| 003 | Domain restructure | Retired — removed during the run rebuild; ADR-002 owns structure now |
| 004 | UI styling conventions | Retired — removed during the run rebuild; ADR-007 owns the design system now |
| [005](005-session-runs.md) | Session runs and the two-loop model | Accepted — cadence questions resolved by 009 |
| [006](006-session-run-mechanics.md) | Session-run mechanics | Accepted — Decisions 1/7/10 amended by 008; Decision 11 amended by 013; Decision 10 cap amended by 015 |
| [007](007-run-rebuild-conventions.md) | Run rebuild: design system and scope | Accepted |
| [008](008-reward-shop-multibuy-coverage-gated-slots.md) | Reward shop: multi-buy, coverage-gated slots | Accepted — supersedes 006 Decision 7 |
| [009](009-session-run-cadence-daily-seeded-shared-run.md) | Session-run cadence: daily-seeded shared run | Accepted — Decision 1 superseded by 011 |
| [010](010-ui-layer-separation.md) | Two-tier UI separation (presentational vs composition) | Accepted — extracted from CLAUDE.md |
| [011](011-persistent-runs-daily-segments.md) | Persistent runs with daily shared segments | Accepted — supersedes 009 Decision 1 |
| [012](012-migration-strategy.md) | One migration pipeline: guarded SQL in supabase/migrations | Accepted — retires drizzle generate/migrate |
| [013](013-gate-scaled-coverage.md) | Gate-scaled coverage (gain and loss) | Accepted — amends 006 Decision 11 |
| [014](014-daily-gate-lock.md) | Daily gate lock: 5 polls/day, exhaustion is not a terminal | Accepted — amends 011 Decision 2, removes the exhaustion-win |
| [015](015-storage-cap-policy-grant-and-cap-extender-configs.md) | Storage-cap policy: one-shot grants and a soft over-cap | Accepted — amends 006 Decision 10 cap; records no-selling |

## Conventions

- Title: `# ADR-NNN: Title`, then a `## Status` section stating acceptance date
  and any supersession, then `## Context` / `## Decision` / `## Consequences`.
- Decisions are immutable history. A later ADR changes them **by reference**
  (like ADR-008's Amendments section); the superseded spot gets an inline
  `> ⚠ Amended/Superseded by ADR-NNN` marker so no reader acts on stale text.
- Live-tuned numbers (thresholds, caps, costs) point to their source-of-truth
  code file instead of being duplicated in the ADR.
