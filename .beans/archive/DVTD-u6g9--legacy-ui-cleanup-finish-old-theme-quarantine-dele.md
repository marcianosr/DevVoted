---
# DVTD-u6g9
title: 'Legacy UI cleanup: finish old-theme quarantine, delete consumer-free files'
status: completed
type: task
priority: normal
created_at: 2026-09-07T14:29:28Z
updated_at: 2026-09-07T14:46:23Z
---

Follow-up to the old-theme rename Marciano started by hand. Scope (decided 2026-09-07): safe deletions only. Fix rename stragglers; move sizes.ts to terminal-theme and capLabel into terminal format.ts; delete ~130 consumer-free files (112 modern-theme, ClimbToday set, ConfigFacts, RevealScore, old DataTable/Tabs/useCountUp, 7 dead domains components). Blocked remainder beaned: /dex (DVTD-e15y), run loop (DVTD-tduu), old-theme wholesale + proto-run community step (new beans).

## Summary of Changes

- Finished the old-theme rename: fixed the last stragglers (TerminalPanel/StatusLine stories, FooterUI spec+story relative paths); tsc clean.
- Moves: `sizes.ts` -> `src/ui/terminal-theme/sizes.ts` (7 importers repointed; it was blocking old-theme via 4 live terminal primitives); `capLabel` folded into `terminal-theme/format.ts` and the 4 external modern-format importers repointed (modern format.ts survives for internal use).
- Deleted ~139 files, all verified zero-consumer at deletion time:
  118 modern-theme (112 planned + Figure/Delta sets freed by ConfigFacts' removal; audits.ts case-trap avoided via exact git rm), ConfigFacts.{ui,spec}, ClimbToday.{ui,spec,stories}, RevealScore.ui + ScoringReveal.stories + old-theme/hooks/useCountUp (one story-only cluster), old-theme DataTable + Tabs sets, 7 dead domains components (ShopContainer cluster, ExposedConfigDeckDisplay, CategoryWeightsDisplay, FallenPlayerModal).
- One of the two exempted src/domains depcruise cycles dissolved; the exemption comment now names the one survivor (progress.service <-> turn.service, DVTD-wj1t). Rule itself untouched.
- Verified: lint + depcruise clean (823 modules, down from 963), `npm test` FULLY GREEN for the first time (3371 passed / 0 failed — the 3 chronic modern RewardScreen.spec failures died with the file), build clean.
- Follow-ups: DVTD-4awc (proto-run community step -> terminal, then delete modern community UI), DVTD-6crx (old-theme wholesale, blocked by DVTD-tduu). /dex remains DVTD-e15y.
- Nothing committed (house rule); suggest: rename as its own refactor commit, deletions as a separate chore commit (skin/ precedent).

## Addendum: Storybook Old/ grouping (2026-09-07, same session)

Executed the planner-relayed grouping: 76 legacy story titles prefixed Old/ (Modern|UI|Layout|Design System|Run|Runs|Polls), GateThemes retitled to Terminal/Gate Themes (it documents the LIVE palette), and preview.tsx gained options.storySort order [Terminal, *, Old]. Anchored single-line regex; story ARGS named title (e.g. TerminalPanel's 'Shop') verified untouched. Lint + depcruise clean, terminal smoke 676/676.
