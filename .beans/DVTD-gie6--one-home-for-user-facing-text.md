---
# DVTD-gie6
title: One home for user-facing text
status: completed
type: task
priority: normal
created_at: 2026-09-23T08:39:30Z
updated_at: 2026-09-23T08:56:55Z
---

Copy is authored in five conventions with no rule saying which wins. Inside a .ui.tsx, `const TITLE = "Build"` (copy) and `const TITLE_ROW = "flex items-center gap-2"` (Tailwind) are lexically identical.

Plan: /Users/marciano/.claude-work/plans/i-find-the-text-quirky-hartmanis.md

Scope: surgical. Rule + 10 verified duplicate groups + shared plural(). Everything else boy-scout.

Decisions: English only but shaped for a future catalog; old-theme/modern-theme out of scope (dead, breaking it is fine); one COPY object per file.

## Todo
- [x] wiki-sync blocker was phantom LSP diagnostics; docs:check and tsc both green. No action.
- [x] ADR-102: Copy has one owner (+ README index row, CLAUDE.md pointer)
- [x] src/shared/lib/copy.ts (named copy.ts, not terms.ts: holds sentences too) with 8 groups
- [x] Coverage/coverage and you/You are deliberate register, NOT drift - left alone. Apostrophe: curly is house glyph.
- [x] One plural() in displayValue.ts; 5 others deleted, 6th (old-theme) left as out of scope
- [x] COPY object in 11 kanto .ui.tsx; Tier 2 components skipped (no Tailwind, no collision)
- [x] CommunityScreen exports COPY; NewRunScreen viewmodel exports its two labels
- [x] kantoCommunity + kantoPoll factories forward production copy
- [x] lint clean, tsc 0, 3780/3780 tests in 201 files

## Summary of Changes

31 files changed (+193/-138), 2 new: `src/shared/lib/copy.ts`, `docs/adr/102-copy-has-one-owner.md`.

**ADR-102** states the rule: run state picks the string then the viewmodel owns it; otherwise the component that renders it owns it, in a `COPY` object.

**Deduped 8 terms** across 21 declarations into `shared/lib/copy.ts` (BUILD, REGISTRY, AUDITS, WEIGHT, NEEDED, LOCKED_CONFIG, WHAT_EACH_POLL_PAID, NOTHING_TO_COMPARE_YET). Landed in `shared/lib/` rather than a theme folder because AUDITS and NEEDED are shared with application-layer viewmodels, and `domain-into-shared-lib-only` makes that the one reachable path.

**One `plural()`** in `displayValue.ts`, replacing 6 definitions under 2 signatures, with a spec.

**COPY objects** in 11 kanto `.ui.tsx`. Three name collisions with Tailwind consts resolved: `ConfigInfo.WEIGHT` and `PollScreen.AUDITS` took the `_ROW` suffix, and `CoverageRing`'s class const literally named `COPY` became `TEXT_COLUMN`.

**Factories now forward production copy** instead of restating it, so a copy change can no longer leave a green test asserting the old string.

### Two claims retracted during the work

1. The `> 1` pluralisation sites do NOT render "0 slot" — all three are guarded (`remaining > 0`, the `owed === 0` else-branch, and `canMinify` requiring `baseSlotsOf >= 2`). The shared plural is a DRY win, not a bug fix.
2. Coverage/coverage and you/You are NOT drift. RunOverScreen is lowercase by design across all its titles; `Climber` renders `you` into a name slot while `PollResult` renders `You` on a badge. Left alone, and the distinction is written into ADR-102 section 4.

### Deferred

- `src/routes/` and `src/domains/` anonymous inline literals (admin.tsx has 39; `__root.tsx` duplicates its nav labels between desktop and mobile)
- The ~200 viewmodel constants, which migrate boy-scout under the ADR-102 rule
- terminal-theme keeps its own `WEIGHT_WORD`; old-theme/modern-theme untouched (dead)
