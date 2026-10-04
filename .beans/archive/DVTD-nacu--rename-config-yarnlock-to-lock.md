---
# DVTD-nacu
title: Rename config yarn.lock to .lock
status: completed
type: task
priority: normal
created_at: 2026-09-20T14:24:40Z
updated_at: 2026-09-20T14:30:08Z
---

Vendor-neutral rename of the offer-locking config, label only (id `yarn-lock` stays, no migration). Follows the DVTD-z1z2 precedent (Unit Tests -> Build Artifacts, .prettierrc -> Math.ceil()) and applies ADR-028's naming preference, which currently lists yarn.lock as an exception.

## Summary of Changes

Label-only rename, `yarn-lock` id untouched — no migration, no persisted row moves.

**Code**
- `configRoster.model.ts` — `label: ".lock"`, and the `costs` line now reads "every lock releases if .lock leaves the build".
- `YarnLock.stories.tsx` — story title `Kanto/Configs/.lock`. File name and `CONFIGS.yarnLock` key left as-is (the DVTD-z1z2 precedent).
- `shopControls.viewmodel.ts` — comment naming the grant.
- Test descriptions in `gatedex.model.spec.ts`, `runView.viewmodel.spec.ts`, `shopAction.model.spec.ts`.

**Docs**
- ADR-028 naming rule: `yarn.lock` removed from the product-name exception list, with the reason it no longer needs to be there.
- ADR-054 amendment (2026-09-20). Title and body keep the old name as history.
- Wiki 4.3 roster row, 5.2 Lock control row, 9.x control staging row.
- `roadmap.md` broken-config note; CHANGELOG entry under Unreleased.

**Deferred (not done)**
- `src/domains/economy/data/configs.ts` still carries the legacy `yarn.lock` (id `yarn.lock-config`) for the legacy run flow. Left alone per the migrate-when-you-touch-it rule.
- ADR-029 / ADR-051 bodies keep `yarn.lock` as history, same as ADR-054.

**Verification**
- `npm run lint` — clean (2 pre-existing story warnings), depcruise 0 violations across 767 modules.
- `tsc --noEmit` — 0 errors.
- Specs covering every touched file: 252 passed / 5 files.
- Full suite: 22 failed / 3754 passed. All 22 are pre-existing on this branch (`run.repository.spec.ts`, `configUnlock.model.spec.ts`, the two known gate-floor specs) and none mention the label; reverting the rename does not fix any of them.
