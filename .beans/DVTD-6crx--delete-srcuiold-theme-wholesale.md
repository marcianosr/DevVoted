---
# DVTD-6crx
title: Delete src/ui/old-theme wholesale
status: completed
type: task
priority: normal
created_at: 2026-09-07T14:36:53Z
updated_at: 2026-09-23T12:16:03Z
blocked_by:
    - DVTD-tduu
---

The quarantined legacy kit (91 files renamed from src/ui root, 2026-09-07). Blockers, per the dependency sweep: __root global chrome (PageLayoutUI/Dropdown/ConfirmDialog/Footer/NotFound/CatchBoundary), login+sign-up (Button/typography), all /run/* routes (Screen.ui + module screens - DVTD-tduu), /polls (ErrorComponent), /profile (BorderShop->Button), /stats, /presentation (GameLoopExplainer/rarityColors), /dex (Stack/typography via ConfigdexPanel), typography/ with 40+ importers. sizes.ts already moved to terminal-theme; DataTable/Tabs/useCountUp already deleted. Precedent: skin/ died in one pure-deletion commit only after external importers hit zero (51b6237) - migrate first, delete last.

## Progress (DVTD-53bp, 2026-09-13)

/proto-run no longer imports `~/ui/old-theme` at all — Screen, Stack and screenNavDirection left with the kanto rewrite. One fewer blocker.

DVTD-tduu, which this bean was blocked by, is scrapped (superseded by DVTD-53bp).

## Summary of Changes (2026-09-23)

Done. `src/ui/old-theme/` is deleted — 95 files — and `src/ui/` is now `kanto-theme/` alone. All 16 `~/ui/old-theme` imports across 14 files are gone, and `~/ui/old-theme/*` is now an oxlint `no-restricted-imports` error so it cannot come back.

**Unbroke the tree first.** A find/replace in the staged `terminal-theme -> old-theme/terminal-theme` rename had eaten an import in `RunCommunity.component.tsx:8`, leaving a syntax error. It was the only thing failing tsc and the only failing test file.

**Migrated, kit by kit:**
- `ErrorComponent`, `Button`, `Paragraph`/`Title` -> kanto `Typography` / `Button`. Kanto `Button` is `type=button` with `label`/`onPress`, so the auth form submits via `form.requestSubmit()`.
- `Auth.ui.tsx` rewritten to own all the auth markup; `Login` and `SignUp` are now HTML-free Tier 2 (ADR-010), and `(e.target as HTMLButtonElement).form!` is gone with them.
- Community board -> kanto `CommunityScreen`. Ladder logic moved intact to `community/application/climbLadder.viewmodel.ts` with module-owned `Ladder*` types; its seven behaviours moved to `climbLadder.viewmodel.spec.ts`.
- `/run` hub -> new module-local `run/presentation/TodayScreen.ui.tsx` (+ spec, + story). Module-local on purpose: in `src/ui/` it would trip `ui-stays-presentational`.
- Global chrome -> `AppFooter.ui.tsx`, `NotFound.ui.tsx`, `CatchBoundary.ui.tsx`, `NavDisclosure.ui.tsx`. The 99-line `Dropdown` became a native `<details>` disclosure (~45 lines, two call sites).
- `PageLayoutUI` inlined into `__root.tsx` (it was one `<main>`).
- `GameLoopExplainer` moved to `src/presentation/demo/` beside its siblings — a talk deck is not a game surface.

**Deleted as dead code:** `SpecialThanksPanel` + `CreditList` (zero importers). See the caveat below.

**Fallout handled:** `class-variance-authority` became unused (only old-theme `Button` used `cva`) and was removed from dependencies; `.fallowrc.json` lost its three stale `src/ui/old-theme/**` ignores.

**Docs:** CLAUDE.md, CONTEXT.md:66 (dead `swatchTheme.ts` citation), ADR-007 (typography primitives), ADR-010 (the kit list), `app.css` (the `bg-hatched` comment justified the split by the two dead kits), CHANGELOG.md.

**Verification:** tsc 0 errors (from 3); 180 files / 3534 tests passing (was 200/3769 plus 1 failing file — the drop is the 24 deleted old-theme specs); `npm run lint` clean, depcruise 0 violations, docs:check in sync; fallow back to its one pre-existing `nitro` finding; build passes; prettier clean.

**Carried forward:** DVTD-4km2 (climb map — the reference render is now only at `git show 3df71fde:src/ui/terminal-theme/ClimbTrack.ui.tsx`), DVTD-6poh (turnout/conversation data), DVTD-jx9l (multiple-choice marker lost), DVTD-6yug (the stories smoke spec died with old-theme, so ~120 kanto stories are rendered by nothing in CI).

**Needs a decision:** the deleted `SpecialThanksPanel` credited three named people and had no importers — it looks like it fell out of the app by accident rather than by decision. Its server function `getUsersByDisplayNames` is now orphaned too.

**Follow-up filed:** DVTD-t5g8 rebuilds the Special thanks credits (deleted here as dead code) and finds them a home.
